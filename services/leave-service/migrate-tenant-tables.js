const { safeTenantQuery } = require('../../shared/dbConfig');

const LEAVE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days DECIMAL(5,2) NOT NULL,
  reason TEXT,
  supporting_document VARCHAR(500),
  is_half_day BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by INT NULL,
  approved_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_leave_user (user_id),
  INDEX idx_leave_status (status),
  INDEX idx_leave_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE users ADD COLUMN IF NOT EXISTS annual_leave_balance DECIMAL(5,2) DEFAULT 21.00;
`;

async function migrateTenantTables(dbName) {
    try {
        console.log(`[LEAVE] Migrating tables for: ${dbName}`);

        const statements = LEAVE_TABLES_SQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && s.toUpperCase().startsWith('CREATE'));

        for (const statement of statements) {
            try {
                await safeTenantQuery(dbName, statement + ';');
                console.log(`[LEAVE] Created table: ${statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'unknown'}`);
            } catch (err) {
                console.warn(`[LEAVE] Migration warning: ${err.message}`);
            }
        }

        // Add annual_leave_balance column if it doesn't exist
        try {
            await safeTenantQuery(dbName,
                'ALTER TABLE users ADD COLUMN IF NOT EXISTS annual_leave_balance DECIMAL(5,2) DEFAULT 21.00'
            );
            console.log(`[LEAVE] Added annual_leave_balance column to users table`);
        } catch (err) {
            // Column might already exist
            console.log(`[LEAVE] annual_leave_balance column check: ${err.message}`);
        }

        console.log(`[LEAVE] Migration completed for: ${dbName}`);
        return true;
    } catch (error) {
        console.error(`[LEAVE] Migration failed for ${dbName}:`, error.message);
        return false;
    }
}

async function runMigration() {
    const dbName = process.env.DB_NAME || 'restpoint_main';
    console.log(`[LEAVE] Running migration for: ${dbName}`);
    await migrateTenantTables(dbName);
    console.log('[LEAVE] Migration complete');
    process.exit(0);
}

// Run if called directly
if (require.main === module) {
    runMigration();
}

module.exports = { migrateTenantTables, LEAVE_TABLES_SQL };