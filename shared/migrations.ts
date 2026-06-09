/**
 * @file shared/migrations.ts
 * PRODUCTION-READY: Automatic database migration system
 *
 * KEY FEATURES:
 * - Automatically creates tables in master DB on server startup
 * - Automatically creates tables in all tenant DBs
 * - Tracks migration history (no duplicate runs)
 * - Handles schema versioning
 * - Graceful error handling
 *
 * USAGE:
 * import { runMigrations } from '../shared/migrations';
 * await runMigrations(); // Run on app startup
 */

import { Pool } from 'mysql2/promise';
import { safeMasterExecute, safeMasterQueryOne, safeTenantExecute, safeTenantQueryOne } from './dbConfig';

// ============================================================
// TYPES
// ============================================================

interface Migration {
  id: string;
  name: string;
  up: (connection: any) => Promise<void>;
  down?: (connection: any) => Promise<void>;
}

interface MigrationRecord {
  migration_id: string;
  migration_name: string;
  executed_at: string;
}

// ============================================================
// MASTER DB MIGRATIONS
// ============================================================

/**
 * Master DB migration: Create tenants table
 */
const masterMigration_001_CreateTenantsTable: Migration = {
  id: '001',
  name: 'Create tenants table',
  up: async (connection) => {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        tenant_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        tenant_name VARCHAR(255) NOT NULL UNIQUE,
        tenant_slug VARCHAR(100) NOT NULL UNIQUE,
        db_name VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        location VARCHAR(255),
        status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
        subscription_status ENUM('trial', 'active', 'suspended', 'expired') DEFAULT 'trial',
        subscription_expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_tenant_slug (tenant_slug),
        INDEX idx_db_name (db_name),
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created tenants table');
  },
  down: async (connection) => {
    await connection.query('DROP TABLE IF EXISTS tenants;');
  },
};

/**
 * Master DB migration: Create migrations tracking table
 */
const masterMigration_002_CreateMigrationsTable: Migration = {
  id: '002',
  name: 'Create migrations table',
  up: async (connection) => {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        migration_id VARCHAR(50) NOT NULL,
        migration_name VARCHAR(255) NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        PRIMARY KEY (migration_id),
        INDEX idx_executed_at (executed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created migrations table');
  },
};

/**
 * All master DB migrations
 */
const masterMigrations: Migration[] = [
  masterMigration_001_CreateTenantsTable,
  masterMigration_002_CreateMigrationsTable,
];

// ============================================================
// TENANT DB MIGRATIONS
// ============================================================

/**
 * Tenant DB migration: Create users table
 */
const tenantMigration_001_CreateUsersTable: Migration = {
  id: '001',
  name: 'Create users table',
  up: async (connection) => {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        role ENUM('admin', 'staff', 'viewer') DEFAULT 'viewer',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created users table');
  },
};

/**
 * Tenant DB migration: Create deceased table
 */
const tenantMigration_002_CreateDeceasedTable: Migration = {
  id: '002',
  name: 'Create deceased table',
  up: async (connection) => {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS deceased (
        deceased_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100),
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE,
        date_of_death DATE NOT NULL,
        age_at_death INT,
        gender ENUM('male', 'female', 'other'),
        cause_of_death VARCHAR(255),
        phone_contact VARCHAR(20),
        email_contact VARCHAR(255),
        next_of_kin VARCHAR(255),
        next_of_kin_phone VARCHAR(20),
        status ENUM('received', 'embalmed', 'coldroom', 'chapel', 'departed', 'archived') DEFAULT 'received',
        location_coldroom INT UNSIGNED,
        notes LONGTEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        UNIQUE KEY unique_deceased (first_name, last_name, date_of_death),
        INDEX idx_status (status),
        INDEX idx_date_of_death (date_of_death),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created deceased table');
  },
};

/**
 * Tenant DB migration: Create migrations tracking table
 */
const tenantMigration_003_CreateMigrationsTable: Migration = {
  id: '003',
  name: 'Create migrations table',
  up: async (connection) => {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        migration_id VARCHAR(50) NOT NULL,
        migration_name VARCHAR(255) NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        PRIMARY KEY (migration_id),
        INDEX idx_executed_at (executed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created migrations table');
  },
};

/**
 * All tenant DB migrations
 */
const tenantMigrations: Migration[] = [
  tenantMigration_001_CreateUsersTable,
  tenantMigration_002_CreateDeceasedTable,
  tenantMigration_003_CreateMigrationsTable,
];

// ============================================================
// MIGRATION EXECUTION
// ============================================================

/**
 * Run migrations on master database
 */
export async function runMasterMigrations(): Promise<void> {
  console.log('\n🔄 Running Master DB migrations...');

  try {
    const pool = require('./dbConfig').getMasterDB();
    const connection = await (await pool).getConnection();

    // Ensure migrations table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        migration_id VARCHAR(50) NOT NULL,
        migration_name VARCHAR(255) NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (migration_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Run each migration
    for (const migration of masterMigrations) {
      // Check if already executed
      const [existingRows] = await connection.query(
        'SELECT * FROM migrations WHERE migration_id = ?',
        [migration.id]
      );

      if ((existingRows as any[]).length > 0) {
        console.log(`⏭️  Skipping migration ${migration.id}: ${migration.name} (already executed)`);
        continue;
      }

      try {
        console.log(`📝 Executing migration ${migration.id}: ${migration.name}`);
        await migration.up(connection);

        // Record migration
        await connection.query(
          'INSERT INTO migrations (migration_id, migration_name) VALUES (?, ?)',
          [migration.id, migration.name]
        );

        console.log(`✅ Migration ${migration.id} completed`);
      } catch (error) {
        console.error(`❌ Migration ${migration.id} failed:`, error);
        throw error;
      }
    }

    connection.release();
    console.log('✅ Master DB migrations completed\n');
  } catch (error) {
    console.error('❌ Master DB migrations failed:', error);
    throw error;
  }
}

/**
 * Run migrations on a specific tenant database
 */
export async function runTenantMigrations(tenantDbName: string): Promise<void> {
  console.log(`\n🔄 Running Tenant DB migrations for: ${tenantDbName}`);

  try {
    const pool = require('./dbConfig').getTenantDB(tenantDbName);
    const connection = await (await pool).getConnection();

    // Ensure migrations table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        migration_id VARCHAR(50) NOT NULL,
        migration_name VARCHAR(255) NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (migration_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Run each migration
    for (const migration of tenantMigrations) {
      // Check if already executed
      const [existingRows] = await connection.query(
        'SELECT * FROM migrations WHERE migration_id = ?',
        [migration.id]
      );

      if ((existingRows as any[]).length > 0) {
        console.log(`⏭️  Skipping migration ${migration.id}: ${migration.name}`);
        continue;
      }

      try {
        console.log(`📝 Executing migration ${migration.id}: ${migration.name}`);
        await migration.up(connection);

        // Record migration
        await connection.query(
          'INSERT INTO migrations (migration_id, migration_name) VALUES (?, ?)',
          [migration.id, migration.name]
        );

        console.log(`✅ Migration ${migration.id} completed`);
      } catch (error) {
        console.error(`❌ Migration ${migration.id} failed:`, error);
        throw error;
      }
    }

    connection.release();
    console.log(`✅ Tenant DB migrations completed for: ${tenantDbName}\n`);
  } catch (error) {
    console.error(`❌ Tenant DB migrations failed for ${tenantDbName}:`, error);
    throw error;
  }
}

/**
 * Run migrations on master DB and all existing tenant DBs
 */
export async function runAllMigrations(): Promise<void> {
  console.log('\n========================================');
  console.log('🚀 STARTING AUTOMATIC MIGRATIONS');
  console.log('========================================');

  try {
    // 1. Run master DB migrations
    await runMasterMigrations();

    // 2. Get all tenant databases
    const tenants = await safeMasterQueryOne<any>(
      'SELECT GROUP_CONCAT(db_name) as db_names FROM tenants WHERE status = "active"',
      []
    );

    if (tenants && tenants.db_names) {
      const dbNames = tenants.db_names.split(',');
      console.log(`\n📊 Found ${dbNames.length} active tenants\n`);

      // 3. Run migrations for each tenant
      for (const dbName of dbNames) {
        try {
          await runTenantMigrations(dbName.trim());
        } catch (error) {
          console.error(`⚠️  Failed to migrate tenant ${dbName}:`, error);
          // Continue with other tenants
        }
      }
    } else {
      console.log('ℹ️  No active tenants found, skipping tenant migrations');
    }

    console.log('\n========================================');
    console.log('✅ ALL MIGRATIONS COMPLETED');
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Migrations failed:', error);
    throw error;
  }
}

export default {
  runMasterMigrations,
  runTenantMigrations,
  runAllMigrations,
};
