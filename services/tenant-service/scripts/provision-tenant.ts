#!/usr/bin/env ts-node
/* Detached provisioning worker
 * Usage: npx ts-node services/tenant-service/scripts/provision-tenant.ts --payload <base64json>
 */

import * as process from 'process';
import * as mysql from 'mysql2/promise';
import { TenantModel } from '../../models/Tenant.model';

async function updateProvisioningStatus(tenantSlug: string, status: string, progress: number, details?: string, errorMessage?: string) {
  try {
    const tenantTrackingDbHost = process.env.TENANT_TRACKING_DB_HOST || process.env.DB_HOST || '127.0.0.1';
    const tenantTrackingDbPort = parseInt(process.env.TENANT_TRACKING_DB_PORT || process.env.DB_PORT || '3306');
    const tenantTrackingDbUser = process.env.TENANT_TRACKING_DB_USER || process.env.DB_USER;
    const tenantTrackingDbPassword = process.env.TENANT_TRACKING_DB_PASSWORD || process.env.DB_PASSWORD;

    const conn = await mysql.createConnection({
      host: tenantTrackingDbHost,
      port: tenantTrackingDbPort,
      user: tenantTrackingDbUser,
      password: tenantTrackingDbPassword,
      database: 'tenant_tracking'
    });
    try {
      await conn.query(`INSERT INTO provisioning_status (tenant_slug, status, progress, details, error_message) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), progress = VALUES(progress), details = VALUES(details), error_message = VALUES(error_message), updated_at = CURRENT_TIMESTAMP`, [tenantSlug, status, progress, details || null, errorMessage || null]);
    } finally { await conn.end(); }
  } catch (err) {
    // best-effort
    console.warn('Failed to update provisioning_status:', err && (err as any).message ? (err as any).message : String(err));
  }
}

async function main() {
  const argv = require('minimist')(process.argv.slice(2));
  const payloadB64 = argv.payload as string;
  if (!payloadB64) {
    console.error('Missing --payload argument');
    process.exit(2);
  }

  const raw = Buffer.from(payloadB64, 'base64').toString('utf8');
  const payload = JSON.parse(raw);
  const tenantSlug = payload.tenant_slug || (payload.tenant_name || 'tenant').replace(/\s+/g, '-').toLowerCase();

  await updateProvisioningStatus(tenantSlug, 'running', 5, 'Worker started');

  try {
    // Call the registered tenant creation flow
    await TenantModel.registerTenant({
      tenant_name: payload.tenant_name,
      email: payload.email,
      password: payload.password,
      full_name: payload.full_name,
      phone: payload.phone,
      location: payload.location,
      country: payload.country,
      deployment_type: payload.deployment_type,
      branches: payload.branches
    });

    await updateProvisioningStatus(tenantSlug, 'completed', 100, 'Provisioning completed');
    process.exit(0);
  } catch (err: any) {
    console.error('Provisioning worker failed:', err && err.message ? err.message : String(err));
    await updateProvisioningStatus(tenantSlug, 'failed', 0, 'Provisioning failed', err && err.message ? err.message : String(err));
    process.exit(1);
  }
}

main().catch(err => { console.error('Fatal worker error:', err); process.exit(1); });