/**
 * Migration script to fix the status column ENUM
 * The status column needs to include 'booked' in its ENUM values
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

async function runMigration() {
    let connection;

    try {
        console.log('🔧 Starting fourth migration...');
        console.log('Fixing status column ENUM to include "booked"...');

        // Connect to the tenant database
        const dbConfig = {
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'restpoint_user',
            password: process.env.DB_PASSWORD,
            database: 'embenezar-feuneral-nairobi'
        };

        console.log(`📊 Connecting to database: ${dbConfig.database}`);
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Check current status column definition
        console.log('\n📋 Checking current status column...');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ?
                AND TABLE_NAME = 'hearse_bookings'
                AND COLUMN_NAME = 'status'
        `, [dbConfig.database]);

        if (columns.length > 0) {
            console.log(`Current status column: ${columns[0].COLUMN_TYPE}`);
        }

        // Modify the status column to include 'booked' in the ENUM
        console.log('\n🔧 Updating status column ENUM...');
        try {
            await connection.query(`
                ALTER TABLE hearse_bookings
                MODIFY COLUMN status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'booked') DEFAULT 'pending'
            `);
            console.log('✅ Updated status column ENUM to include "booked"');
        } catch (e) {
            console.log(`  ⚠️  Could not update status column: ${e.message}`);
            // Try alternative: make it VARCHAR instead
            try {
                await connection.query(`
                    ALTER TABLE hearse_bookings
                    MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending'
                `);
                console.log('✅ Changed status column to VARCHAR(50)');
            } catch (e2) {
                console.log(`  ❌ Could not change status column: ${e2.message}`);
                throw e2;
            }
        }

        // Verify the change
        console.log('\n✅ Verifying status column...');
        const [updatedColumns] = await connection.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ?
                AND TABLE_NAME = 'hearse_bookings'
                AND COLUMN_NAME = 'status'
        `, [dbConfig.database]);

        if (updatedColumns.length > 0) {
            console.log(`Updated status column: ${updatedColumns[0].COLUMN_TYPE}`);
        }

        console.log('\n✅ Migration 4 completed successfully!');
        console.log('The status column now accepts "booked" as a valid value.');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the migration
runMigration();