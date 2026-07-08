/**
 * Second migration script to add additional missing columns
 * The controller expects more columns than currently exist
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

async function runMigration() {
    let connection;

    try {
        console.log('🔧 Starting second migration...');

        // Connect to the tenant database
        const dbConfig = {
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'restpoint_user',
            password: process.env.DB_PASSWORD || 'RestPointUser2024',
            database: 'embenezar-feuneral-nairobi'
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

        // Check which columns the controller needs
        const neededColumns = [
            'client_name',
            'client_phone',
            'client_email',
            'from_timestamp',
            'to_timestamp',
            'from_location',
            'to_location',
            'created_by',
            'created_at',
            'updated_at'
        ];

        console.log('\n🔍 Checking for needed columns:');
        neededColumns.forEach(col => {
            const exists = columns.some(c => c.COLUMN_NAME === col);
            console.log(`  - ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        });

        // Add missing columns
        const missingColumns = [];

        if (!columns.some(col => col.COLUMN_NAME === 'client_name')) {
            console.log('\n➕ Adding client_name column...');
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD COLUMN client_name VARCHAR(255) AFTER tenant_db_name
            `);
            console.log('✅ Added client_name column');
            missingColumns.push('client_name');
        }

        if (!columns.some(col => col.COLUMN_NAME === 'client_phone')) {
            console.log('➕ Adding client_phone column...');
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD COLUMN client_phone VARCHAR(20) AFTER client_name
            `);
            console.log('✅ Added client_phone column');
            missingColumns.push('client_phone');
        }

        if (!columns.some(col => col.COLUMN_NAME === 'client_email')) {
            console.log('➕ Adding client_email column...');
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD COLUMN client_email VARCHAR(255) AFTER client_phone
            `);
            console.log('✅ Added client_email column');
            missingColumns.push('client_email');
        }

        if (!columns.some(col => col.COLUMN_NAME === 'from_timestamp')) {
            console.log('➕ Adding from_timestamp column...');
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD COLUMN from_timestamp DATETIME AFTER client_email
            `);
            console.log('✅ Added from_timestamp column');
            missingColumns.push('from_timestamp');
        }

        if (!columns.some(col => col.COLUMN_NAME === 'to_timestamp')) {
            console.log('➕ Adding to_timestamp column...');
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD COLUMN to_timestamp DATETIME AFTER from_timestamp
            `);
            console.log('✅ Added to_timestamp column');
            missingColumns.push('to_timestamp');
        }

        if (!columns.some(col => col.COLUMN_NAME === 'from_location')) {
            console.log('➕ Adding from_location column...');
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD COLUMN from_location VARCHAR(255) AFTER to_timestamp
            `);
            console.log('✅ Added from_location column');
            missingColumns.push('from_location');
        }

        if (!columns.some(col => col.COLUMN_NAME === 'to_location')) {
            console.log('➕ Adding to_location column...');
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD COLUMN to_location VARCHAR(255) AFTER from_location
            `);
            console.log('✅ Added to_location column');
            missingColumns.push('to_location');
        }

        if (!columns.some(col => col.COLUMN_NAME === 'created_by')) {
            console.log('➕ Adding created_by column...');
            await connection.query(`
                ALTER TABLE hearse_bookings
                ADD COLUMN created_by INT AFTER branch_code
            `);
            console.log('✅ Added created_by column');
            missingColumns.push('created_by');
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

        if (missingColumns.length > 0) {
            console.log(`\n✅ Added ${missingColumns.length} missing columns: ${missingColumns.join(', ')}`);
        } else {
            console.log('\n✅ All required columns already exist!');
        }

        console.log('\n✅ Migration 2 completed successfully!');
        console.log('The hearse_bookings table now matches the controller schema.');

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