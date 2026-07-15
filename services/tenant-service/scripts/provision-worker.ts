#!/usr/bin/env ts-node
import { Worker, QueueEvents, Job } from 'bullmq';
import * as mysql from 'mysql2/promise';
import { TenantModel } from '../models/Tenant.model';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');
const redisPassword = process.env.REDIS_PASSWORD || undefined;
const connection = { host: redisHost, port: redisPort, ...(redisPassword ? { password: redisPassword } : {}) };

async function updateProvisioningStatus(tenantSlug: string, status: string, progress: number, details?: string, errorMessage?: string) {
  try {
    const tenantTrackingDbHost = process.env.TENANT_TRACKING_DB_HOST || process.env.DB_HOST || '127.0.0.1';
    const tenantTrackingDbPort = parseInt(process.env.TENANT_TRACKING_DB_PORT || process.env.DB_PORT || '3306');
    const tenantTrackingDbUser = process.env.TENANT_TRACKING_DB_USER || process.env.DB_USER;
    const tenantTrackingDbPassword = process.env.TENANT_TRACKING_DB_PASSWORD || process.env.DB_PASSWORD;

    // First connect without database to create it if it doesn't exist
    const rootConn = await mysql.createConnection({
      host: tenantTrackingDbHost,
      port: tenantTrackingDbPort,
      user: tenantTrackingDbUser,
      password: tenantTrackingDbPassword,
      multipleStatements: true
    });

    try {
      await rootConn.query('CREATE DATABASE IF NOT EXISTS tenant_tracking');
      await rootConn.query("GRANT ALL PRIVILEGES ON tenant_tracking.* TO 'restpoint_user'@'%'");
      await rootConn.query('FLUSH PRIVILEGES');
    } finally {
      await rootConn.end();
    }

    const conn = await mysql.createConnection({
      host: tenantTrackingDbHost,
      port: tenantTrackingDbPort,
      user: tenantTrackingDbUser,
      password: tenantTrackingDbPassword,
      database: 'tenant_tracking'
    });

    try {
      // Ensure provisioning_status table exists
      await conn.query(`
        CREATE TABLE IF NOT EXISTS provisioning_status (
          tenant_slug VARCHAR(255) PRIMARY KEY,
          status VARCHAR(50) DEFAULT 'pending',
          progress INT DEFAULT 0,
          details TEXT,
          error_message TEXT,
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_started_at (started_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      await conn.query(`INSERT INTO provisioning_status (tenant_slug, status, progress, details, error_message) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), progress = VALUES(progress), details = VALUES(details), error_message = VALUES(error_message), updated_at = CURRENT_TIMESTAMP`, [tenantSlug, status, progress, details || null, errorMessage || null]);
    } finally { await conn.end(); }
  } catch (err) {
    console.warn('Failed to update provisioning_status:', err && (err as any).message ? (err as any).message : String(err));
  }
}

console.log('Provision worker starting, connecting to BullMQ...');

const worker = new Worker('provision-tenant', async (job: Job) => {
  const data = job.data || {};
  const tenantSlug = data.tenant_slug || (data.tenant_name || 'tenant').replace(/\s+/g, '-').toLowerCase();

  await updateProvisioningStatus(tenantSlug, 'running', 5, 'Worker started');

  try {
    await TenantModel.registerTenant({
      tenant_name: data.tenant_name,
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone,
      location: data.location,
      country: data.country,
      deployment_type: data.deployment_type,
      branches: data.branches
    });

    await updateProvisioningStatus(tenantSlug, 'completed', 100, 'Provisioning completed');
    return { success: true };
  } catch (err: any) {
    console.error('Provision worker failed job:', err && err.message ? err.message : String(err));
    await updateProvisioningStatus(tenantSlug, 'failed', 0, 'Provisioning failed', err && err.message ? err.message : String(err));
    throw err;
  }
}, { connection });

const queueEvents = new QueueEvents('provision-tenant', { connection });

worker.on('completed', (job: Job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job: Job | undefined, err: Error) => {
  console.warn(`Job ${job ? job.id : '<unknown>'} failed: ${err && err.message ? err.message : String(err)}`);
});

queueEvents.on('waiting', ({ jobId }) => { console.log(`Job ${jobId} is waiting`); });
queueEvents.on('active', ({ jobId }) => { console.log(`Job ${jobId} is active`); });
queueEvents.on('failed', ({ jobId, failedReason }) => { console.warn(`Job ${jobId} failed: ${failedReason}`); });
queueEvents.on('completed', ({ jobId }) => { console.log(`Job ${jobId} completed (events)`); });

console.log('Provision worker is listening for jobs.');
