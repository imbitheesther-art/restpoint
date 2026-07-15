#!/usr/bin/env node
// Run pending migrations for tenants. Supports modes: core | optional | all
// Usage: node run-pending-migrations.js --mode optional [--tenant tenant_db_name]

const mysql = require('mysql2/promise');
const { MigrationService } = require('../../../shared/services/migration-service');
const { getCoreMigrations, getOptionalMigrations, getAllTenantMigrations } = require('../../../shared/services/all-service-migrations');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

async function main() {
  const argv = require('minimist')(process.argv.slice(2));
  const mode = (argv.mode || 'optional').toString(); // default: optional
  const tenantFilter = argv.tenant || null;

  const dbHost = process.env.DB_HOST || '127.0.0.1';
  const dbPort = parseInt(process.env.DB_PORT || '3306');
  const dbUser = process.env.DB_USER || 'restpoint_user';
  const dbPassword = process.env.DB_PASSWORD;

  const connectionConfig = { host: dbHost, port: dbPort, user: dbUser, password: dbPassword };

  const migrationService = new MigrationService();
  try {
    await migrationService.initializeMasterConnection({ ...connectionConfig, database: 'tenant_tracking' });
  } catch (err) {
    console.error('Failed to initialize master connection:', err.message);
    process.exit(2);
  }

  // Create a temporary pool to list tenants
  const pool = await mysql.createPool({ host: dbHost, port: dbPort, user: dbUser, password: dbPassword, database: 'tenant_tracking', waitForConnections: true });

  try {
    const [rows] = await pool.query('SELECT db_name, tenant_slug FROM tenants WHERE status = "active"');
    const tenants = rows.map(r => ({ db: r.db_name, slug: r.tenant_slug }));

    let migrationsToRun;
    if (mode === 'core') migrationsToRun = getCoreMigrations();
    else if (mode === 'all') migrationsToRun = getAllTenantMigrations();
    else migrationsToRun = getOptionalMigrations();

    console.log(`Migration runner mode=${mode}. Migrations to run: ${migrationsToRun.length}`);

    for (const t of tenants) {
      if (tenantFilter && tenantFilter !== t.db) continue;
      console.log(`\n=== Tenant: ${t.slug} (${t.db}) ===`);
      const res = await migrationService.runTenantMigrations(t.db, migrationsToRun, connectionConfig, (name) => {
        process.stdout.write(` . ${name}`);
      });
      console.log('\nMigrations run:', res.migrationsRun.length);
      if (res.errors.length) {
        console.error('Errors:', res.errors.join('\n'));
      } else {
        console.log('No errors.');
      }
    }
  } catch (err) {
    console.error('Failed to list tenants or run migrations:', err.message);
    process.exit(2);
  } finally {
    await pool.end().catch(() => {});
    await migrationService.close().catch(() => {});
  }
}

main().catch(err => { console.error(err); process.exit(1); });
