const dotenv = require('dotenv');
const path = require('path');

// Load .env from deceased-service directory
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
// Also load global .env as fallback
dotenv.config({ path: path.join(__dirname, '../../.env'), override: false });

const { safeTenantQuery } = require('../../shared/dbConfig');

const DECEASED_TABLES_SQL = `
-- Deceased table migration (add missing columns)
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS age INT DEFAULT 0 AFTER gender;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS date_of_birth DATE NULL AFTER age;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS date_of_death DATE NULL AFTER date_of_birth;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS date_admitted DATETIME NULL AFTER date_of_death;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS time_received TIME NULL AFTER date_admitted;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS cause_of_death TEXT NULL AFTER time_received;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS place_of_death VARCHAR(255) NULL AFTER cause_of_death;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS physician VARCHAR(255) NULL AFTER place_of_death;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS identifying_marks TEXT NULL AFTER physician;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS body_status VARCHAR(100) DEFAULT 'In Morgue' AFTER identifying_marks;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS national_id VARCHAR(100) NULL AFTER body_status;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS id_type ENUM('national-id', 'passport', 'voters-card', 'other') NULL AFTER national_id;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL AFTER id_type;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) NULL AFTER email;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS alternative_phone VARCHAR(20) NULL AFTER phone_number;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS received_from VARCHAR(255) NULL AFTER alternative_phone;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS receiving_officer VARCHAR(255) NULL AFTER received_from;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS signature TEXT NULL AFTER receiving_officer;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS verified_by VARCHAR(255) NULL AFTER signature;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS relationship VARCHAR(100) NULL AFTER verified_by;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS county VARCHAR(100) NULL AFTER relationship;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS location TEXT NULL AFTER county;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS portal_slug VARCHAR(255) UNIQUE NULL AFTER location;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS admission_status ENUM('admitted', 'embalmed', 'released', 'buried') DEFAULT 'admitted' AFTER portal_slug;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS release_status ENUM('pending', 'approved', 'released') DEFAULT 'pending' AFTER admission_status;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS chamber_assigned VARCHAR(100) NULL AFTER release_status;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS total_mortuary_charge DECIMAL(10, 2) DEFAULT 0 AFTER chamber_assigned;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS coffin_status VARCHAR(50) NULL AFTER total_mortuary_charge;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS dispatch_date TIMESTAMP NULL AFTER coffin_status;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) NULL AFTER dispatch_date;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER created_by;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
ALTER TABLE deceased ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER updated_at;

-- Next of Kin table migration
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS tenant_slug VARCHAR(255) NOT NULL AFTER deceased_id;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL AFTER contact;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS alternative_phone VARCHAR(20) NULL AFTER email;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS id_number VARCHAR(100) NULL AFTER alternative_phone;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS id_type ENUM('national-id', 'passport', 'voters-card', 'other') NULL AFTER id_number;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS address TEXT NULL AFTER id_type;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT TRUE AFTER address;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS is_notified BOOLEAN DEFAULT FALSE AFTER is_primary;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS notified_at TIMESTAMP NULL AFTER is_notified;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) NULL AFTER notified_at;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER created_by;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER updated_at;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER is_deleted;
ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255) NULL AFTER deleted_at;

-- Create indexes if they don't exist
CREATE INDEX idx_deceased_tenant_slug ON deceased(tenant_slug);
CREATE INDEX idx_deceased_status ON deceased(admission_status);
CREATE INDEX idx_deceased_created_at ON deceased(created_at);
CREATE INDEX idx_deceased_admission_number ON deceased(admission_number);
CREATE INDEX idx_deceased_date_of_death ON deceased(date_of_death);
CREATE INDEX idx_deceased_deceased_id ON deceased(deceased_id);

CREATE INDEX idx_next_of_kin_deceased_id ON next_of_kin(deceased_id);
CREATE INDEX idx_next_of_kin_relationship ON next_of_kin(relationship);
CREATE INDEX idx_next_of_kin_tenant_slug ON next_of_kin(tenant_slug);
`;

async function migrateTenantTables(dbName) {
    try {
        console.log(`[DECEASED] Migrating tables for: ${dbName}`);

        const statements = DECEASED_TABLES_SQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            try {
                await safeTenantQuery(dbName, statement + ';');
                const tableMatch = statement.match(/ALTER TABLE (\w+)/);
                const indexMatch = statement.match(/CREATE INDEX (\w+)/);
                if (tableMatch) {
                    console.log(`[DECEASED] Altered table: ${tableMatch[1]}`);
                } else if (indexMatch) {
                    console.log(`[DECEASED] Created index: ${indexMatch[1]}`);
                }
            } catch (err) {
                // Ignore duplicate column/index errors
                if (!err.message.includes('Duplicate') &&
                    !err.message.includes('already exists') &&
                    !err.code.includes('ER_DUP_FIELDNAME') &&
                    !err.code.includes('ER_DUP_KEYNAME')) {
                    console.warn(`[DECEASED] Migration warning: ${err.message}`);
                }
            }
        }

        console.log(`[DECEASED] Migration completed for: ${dbName}`);
        return true;
    } catch (error) {
        console.error(`[DECEASED] Migration failed for ${dbName}:`, error.message);
        return false;
    }
}

async function runMigration() {
    const dbName = process.env.DB_NAME || 'restpoint_main';
    console.log(`[DECEASED] Running migration for: ${dbName}`);
    await migrateTenantTables(dbName);
    console.log('[DECEASED] Migration complete');
    process.exit(0);
}

// Run if called directly
if (require.main === module) {
    runMigration();
}

module.exports = { migrateTenantTables, DECEASED_TABLES_SQL };