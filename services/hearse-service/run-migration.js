/**
 * Migration script to add missing columns to hearse_bookings table
 * Run this script to fix the booking_code column error
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

async function runMigration() {
    let connection;

    try {
        console.log('🔧 Starting migration...');

        // Connect to the tenant database
        const dbConfig = {
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'restpoint_user',
            password: process.env.DB_PASSWORD || 'RestPointUser2024',
            database: 'embenezar-feuneral-nairobi' // The tenant database from the error log
        };

        console.log(`📊 Connecting to database: ${dbConfig.database}`);
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Check current columns
        console.log('\n📋 Checking current table structure...');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ?
                AND TABLE_NAME = 'hearse_bookings'
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);

        console.log('Current columns in hearse_bookings:');
        columns.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });

        // Check if booking_code exists
        const hasBookingCode = columns.some(col => col.COLUMN_NAME === 'booking_code');
        const hasDeceasedId = columns.some(col => col.COLUMN_NAME === 'deceased_id');
        const hasTenantDbName = columns.some(col => col.COLUMN_NAME === 'tenant_db_name');
        const hasBranchCode = columns.some(col => col.COLUMN_NAME === 'branch_code');

        console.log('\n🔍 Missing columns check:');
        console.log(`  - booking_code: ${hasBookingCode ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`  - deceased_id: ${hasDeceasedId ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`  - tenant_db_name: ${hasTenantDbName ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`  - branch_code: ${hasBranchCode ? '✅ EXISTS' : '❌ MISSING'}`);

        // Add missing columns
        if (!hasBookingCode) {
            console.log('\n➕ Adding booking_code column...');
            await connection.query(`
                ALTER TABLE hearse_bookings 
                ADD COLUMN booking_code VARCHAR(50) UNIQUE AFTER id
            `);
            console.log('✅ Added booking_code column');
        }

        if (!hasDeceasedId) {
            console.log('➕ Adding deceased_id column...');
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD COLUMN deceased_id INT AFTER hearse_id
            `);
            console.log('✅ Added deceased_id column');
        }

        if (!hasTenantDbName) {
            console.log('➕ Adding tenant_db_name column...');
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD COLUMN tenant_db_name VARCHAR(255) AFTER deceased_id
            `);
            console.log('✅ Added tenant_db_name column');
        }

        if (!hasBranchCode) {
            console.log('➕ Adding branch_code column...');
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD COLUMN branch_code VARCHAR(50) AFTER updated_at
            `);
            console.log('✅ Added branch_code column');
        }

        // Add indexes
        console.log('\n📇 Adding indexes...');
        try {
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD INDEX idx_booking_code (booking_code)
            `);
            console.log('✅ Added index on booking_code');
        } catch (e) {
            console.log('⚠️  Index on booking_code may already exist');
        }

        try {
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD INDEX idx_tenant_db_name (tenant_db_name)
            `);
            console.log('✅ Added index on tenant_db_name');
        } catch (e) {
            console.log('⚠️  Index on tenant_db_name may already exist');
        }

        try {
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD INDEX idx_branch_code (branch_code)
            `);
            console.log('✅ Added index on branch_code');
        } catch (e) {
            console.log('⚠️  Index on branch_code may already exist');
        }

        // Verify final structure
        console.log('\n✅ Verifying final table structure...');
        const [finalColumns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ?
                AND TABLE_NAME = 'hearse_bookings'
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);

        console.log('\nFinal columns in hearse_bookings:');
        finalColumns.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });

        console.log('\n✅ Migration completed successfully!');
        console.log('You can now create bookings without the "Unknown column booking_code" error.');

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