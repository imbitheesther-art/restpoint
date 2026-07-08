/**
 * Fix Hearse Migration Script
 * 
 * This script ensures:
 * 1. `hearse_code` column exists in the `hearses` table
 * 2. `branch_code` column exists in the `branches` table
 * 
 * Run: node fix-hearse-migration.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
};

async function ensureColumn(conn, dbName, table, column, definition) {
    const [cols] = await conn.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [dbName, table, column]
    );
    if (cols.length === 0) {
        console.log(`  ⚠️  ${table}.${column} column MISSING in ${dbName} - adding it now...`);
        await conn.query(`ALTER TABLE \`${dbName}\`.\`${table}\` ${definition}`);
        console.log(`  ✅ ${table}.${column} column added successfully`);
        return true;
    }
    return false;
}

async function fixHearseIssues() {
    const conn = await mysql.createConnection(dbConfig);
    let updated = false;

    try {
        const [tenants] = await conn.query(
            "SELECT db_name FROM tenant_tracking.tenants WHERE status = 'active'"
        );

        console.log(`Found ${tenants.length} active tenant(s)`);

        for (const tenant of tenants) {
            const dbName = tenant.db_name;
            console.log(`\n--- Checking tenant: ${dbName} ---`);

            try {
                // Check if hearses table exists
                const [hearsesTable] = await conn.query(
                    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'hearses'",
                    [dbName]
                );

                if (hearsesTable.length === 0) {
                    console.log(`  ⏭️  No hearses table found, skipping`);
                } else {
                    // Ensure hearse_code column in hearses
                    const hcAdded = await ensureColumn(
                        conn, dbName, 'hearses', 'hearse_code',
                        `ADD COLUMN hearse_code VARCHAR(20) NULL AFTER id`
                    );
                    if (hcAdded) updated = true;

                    // Ensure branch_code column in hearses
                    const bcInHearses = await ensureColumn(
                        conn, dbName, 'hearses', 'branch_code',
                        `ADD COLUMN branch_code VARCHAR(50) NULL AFTER branch_id`
                    );
                    if (bcInHearses) updated = true;
                }

                // Check if branches table exists
                const [branchesTable] = await conn.query(
                    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'branches'",
                    [dbName]
                );

                if (branchesTable.length === 0) {
                    console.log(`  ⏭️  No branches table found, skipping`);
                } else {
                    // Ensure branch_code column in branches
                    const bcInBranches = await ensureColumn(
                        conn, dbName, 'branches', 'branch_code',
                        `ADD COLUMN branch_code VARCHAR(50) NULL AFTER branch_slug, ADD INDEX idx_branch_code (branch_code)`
                    );
                    if (bcInBranches) updated = true;
                }

            } catch (err) {
                console.error(`  ❌ Error processing ${dbName}: ${err.message}`);
            }
        }

        if (updated) {
            console.log('\n✅ Fix complete - columns were added.');
        } else {
            console.log('\n✅ All columns already exist - no changes needed.');
        }
    } catch (err) {
        console.error('❌ Fatal error:', err.message);
    } finally {
        await conn.end();
    }
}

fixHearseIssues();