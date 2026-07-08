/**
 * Workshop Service - Tenant Database Migration Script
 * 
 * Creates all workshop management tables in a tenant's database.
 * Run this for existing tenants that were created before the workshop service existed.
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

// Individual CREATE TABLE statements
const CREATE_COFFIN_ORDERS = `CREATE TABLE IF NOT EXISTS coffin_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  deceased_name VARCHAR(255),
  coffin_type VARCHAR(50) DEFAULT 'standard',
  dimensions TEXT,
  color VARCHAR(100),
  interior_fabric VARCHAR(100),
  notes TEXT,
  selling_price DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  profit DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  hold_reason TEXT,
  delivery_date DATE,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_status (status),
  INDEX idx_orders_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const CREATE_MATERIALS = `CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'pieces',
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) DEFAULT 0,
  min_stock_level DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_materials_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const CREATE_MATERIAL_USAGE = `CREATE TABLE IF NOT EXISTS material_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coffin_order_id INT NOT NULL,
  material_id INT NOT NULL,
  quantity_used DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coffin_order_id) REFERENCES coffin_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
  INDEX idx_usage_order (coffin_order_id),
  INDEX idx_usage_material (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const CREATE_PRODUCTION_STAGES = `CREATE TABLE IF NOT EXISTS production_stages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coffin_order_id INT NOT NULL,
  stage VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  notes TEXT,
  FOREIGN KEY (coffin_order_id) REFERENCES coffin_orders(id) ON DELETE CASCADE,
  UNIQUE KEY uk_order_stage (coffin_order_id, stage),
  INDEX idx_stages_order (coffin_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const CREATE_WORKER_ASSIGNMENTS = `CREATE TABLE IF NOT EXISTS worker_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coffin_order_id INT NOT NULL,
  user_id INT NOT NULL,
  stage VARCHAR(50) NOT NULL,
  hours_worked DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  FOREIGN KEY (coffin_order_id) REFERENCES coffin_orders(id) ON DELETE CASCADE,
  INDEX idx_assignments_order (coffin_order_id),
  INDEX idx_assignments_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const CREATE_COSTING = `CREATE TABLE IF NOT EXISTS costing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coffin_order_id INT NOT NULL UNIQUE,
  materials_cost DECIMAL(10,2) DEFAULT 0,
  labor_cost DECIMAL(10,2) DEFAULT 0,
  overhead_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  profit DECIMAL(10,2) DEFAULT 0,
  profit_margin DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (coffin_order_id) REFERENCES coffin_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

const ALL_STATEMENTS = [
    { name: 'coffin_orders', sql: CREATE_COFFIN_ORDERS },
    { name: 'materials', sql: CREATE_MATERIALS },
    { name: 'material_usage', sql: CREATE_MATERIAL_USAGE },
    { name: 'production_stages', sql: CREATE_PRODUCTION_STAGES },
    { name: 'worker_assignments', sql: CREATE_WORKER_ASSIGNMENTS },
    { name: 'costing', sql: CREATE_COSTING },
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