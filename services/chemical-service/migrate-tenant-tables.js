/**
 * Chemical Service - Tenant Database Migration Script
 * 
 * Creates all chemical management tables in a tenant's database.
 * Run this for existing tenants that were created before the chemical service existed.
 * 
 * Usage: node migrate-tenant-tables.js <tenant_db_name>
 *   or:  node migrate-tenant-tables.js --all  (migrates all active tenants)
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });
dotenv.config({ path: path.join(__dirname, '../../.env'), override: false });

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
};

// Individual CREATE TABLE statements (no comments between them for reliable parsing)
const CREATE_CHEMICALS = `CREATE TABLE IF NOT EXISTS chemicals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'embalming',
  unit VARCHAR(50) NOT NULL DEFAULT 'liters',
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_stock_level DECIMAL(10,2) DEFAULT 0,
  reorder_level DECIMAL(10,2) DEFAULT 0,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  hazard_level ENUM('low', 'medium', 'high') DEFAULT 'low',
  supplier VARCHAR(255) DEFAULT NULL,
  batch_number VARCHAR(100) DEFAULT NULL,
  expiry_date DATE DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_chemicals_category (category),
  INDEX idx_chemicals_active (is_active),
  INDEX idx_chemicals_hazard (hazard_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const CREATE_TRANSACTIONS = `CREATE TABLE IF NOT EXISTS chemical_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chemical_id INT NOT NULL,
  transaction_type ENUM('received', 'consumed', 'adjusted', 'wasted', 'transferred') NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'liters',
  previous_stock DECIMAL(10,2) NOT NULL,
  new_stock DECIMAL(10,2) NOT NULL,
  reference_type VARCHAR(50) DEFAULT NULL,
  reference_id INT DEFAULT NULL,
  performed_by INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE,
  INDEX idx_transactions_chemical (chemical_id),
  INDEX idx_transactions_type (transaction_type),
  INDEX idx_transactions_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const CREATE_USAGE = `CREATE TABLE IF NOT EXISTS deceased_chemical_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deceased_id INT NOT NULL,
  chemical_id INT NOT NULL,
  quantity_used DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'liters',
  transaction_id INT DEFAULT NULL,
  used_by INT DEFAULT NULL,
  usage_notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES chemical_transactions(id) ON DELETE SET NULL,
  INDEX idx_usage_deceased (deceased_id),
  INDEX idx_usage_chemical (chemical_id),
  INDEX idx_usage_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const CREATE_ALERTS = `CREATE TABLE IF NOT EXISTS chemical_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chemical_id INT NOT NULL,
  alert_threshold DECIMAL(10,2) DEFAULT NULL,
  is_triggered TINYINT(1) DEFAULT 0,
  resolved_at TIMESTAMP NULL DEFAULT NULL,
  resolved_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE,
  UNIQUE KEY uk_chemical_alert (chemical_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const CREATE_PPE = `CREATE TABLE IF NOT EXISTS ppe_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  quantity_requested INT NOT NULL DEFAULT 1,
  quantity_approved INT DEFAULT NULL,
  status ENUM('pending', 'approved', 'rejected', 'fulfilled') DEFAULT 'pending',
  requested_by VARCHAR(255) NOT NULL,
  approved_by INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ppe_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const CREATE_TRANSFERS = `CREATE TABLE IF NOT EXISTS chemical_transfers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chemical_id INT NOT NULL,
  to_branch_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'liters',
  status ENUM('pending', 'approved', 'completed', 'cancelled') DEFAULT 'pending',
  requested_by INT DEFAULT NULL,
  approved_by INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE,
  INDEX idx_transfer_to (to_branch_id),
  INDEX idx_transfer_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const ALL_STATEMENTS = [
    { name: 'chemicals', sql: CREATE_CHEMICALS },
    { name: 'chemical_transactions', sql: CREATE_TRANSACTIONS },
    { name: 'deceased_chemical_usage', sql: CREATE_USAGE },
    { name: 'chemical_alerts', sql: CREATE_ALERTS },
    { name: 'ppe_requests', sql: CREATE_PPE },
    { name: 'chemical_transfers', sql: CREATE_TRANSFERS },
];

async function migrateTenantDatabase(tenantDbName) {
    console.log(`\n🔧 Migrating tenant database: ${tenantDbName}`);

    const connection = await mysql.createConnection({
        ...DB_CONFIG,
        database: tenantDbName,
    });

    try {
        for (const stmt of ALL_STATEMENTS) {
            try {
                await connection.query(stmt.sql);
                console.log(`  ✅ Table '${stmt.name}' ready`);
            } catch (err) {
                console.error(`  ❌ Error creating table '${stmt.name}': ${err.message}`);
            }
        }

        console.log(`✅ Migration complete for: ${tenantDbName}`);
        return { success: true, database: tenantDbName };
    } catch (error) {
        console.error(`❌ Migration failed for ${tenantDbName}:`, error.message);
        return { success: false, database: tenantDbName, error: error.message };
    } finally {
        await connection.end();
    }
}

async function getAllActiveTenants() {
    const connection = await mysql.createConnection({
        ...DB_CONFIG,
        database: 'tenant_tracking',
    });

    try {
        const [rows] = await connection.query(
            `SELECT tenant_slug, db_name FROM tenants WHERE status = 'active'`
        );
        return rows;
    } catch (error) {
        console.error('❌ Error fetching tenants:', error.message);
        return [];
    } finally {
        await connection.end();
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage:');
        console.log('  node migrate-tenant-tables.js <tenant_db_name>    - Migrate a specific tenant database');
        console.log('  node migrate-tenant-tables.js --all               - Migrate all active tenant databases');
        console.log('');
        console.log('Example:');
        console.log('  node migrate-tenant-tables.js tenant_lee_feuneral_home');
        process.exit(1);
    }

    if (args[0] === '--all') {
        console.log('📋 Fetching all active tenants...');
        const tenants = await getAllActiveTenants();

        if (tenants.length === 0) {
            console.log('No active tenants found.');
            process.exit(0);
        }

        console.log(`Found ${tenants.length} active tenant(s).\n`);

        let successCount = 0;
        let failCount = 0;

        for (const tenant of tenants) {
            const result = await migrateTenantDatabase(tenant.db_name);
            if (result.success) {
                successCount++;
            } else {
                failCount++;
            }
        }

        console.log(`\n📊 Summary: ${successCount} succeeded, ${failCount} failed out of ${tenants.length} tenants`);
    } else {
        // Migrate specific tenant database
        const tenantDbName = args[0];
        const result = await migrateTenantDatabase(tenantDbName);

        if (result.success) {
            console.log(`\n🎉 Successfully migrated: ${tenantDbName}`);
        } else {
            console.error(`\n❌ Failed to migrate: ${tenantDbName}`);
            process.exit(1);
        }
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});