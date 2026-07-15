/**
 * Migration script to make unnecessary columns nullable
 * The frontend sends minimal booking data, so we need to make columns optional
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

async function runMigration() {
    let connection;

    try {
        console.log('🔧 Starting third migration...');
        console.log('Making unnecessary columns nullable to match frontend data...');

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

        // Make columns nullable that aren't required by the frontend
        const columnsToMakeNullable = [
            'pickup_location',
            'deceased_id',
            'client_email',
            'from_location',
            'to_location',
            'driver_id',
            'notes',
            'completed_at',
            'booking_reference'
        ];

        console.log('\n🔧 Making columns nullable...');
        for (const column of columnsToMakeNullable) {
            try {
                await connection.query(`
                    ALTER TABLE hearse_bookings
                    MODIFY COLUMN ${column} VARCHAR(255) NULL
                `);
                console.log(`  ✅ Made ${column} nullable`);
            } catch (e) {
                console.log(`  ⚠️  Could not modify ${column}: ${e.message}`);
            }
        }

        // Also make pickup_location nullable (it's currently NOT NULL)
        try {
            await connection.query(`
                ALTER TABLE hearse_bookings
                MODIFY COLUMN pickup_location TEXT NULL
            `);
            console.log('  ✅ Made pickup_location nullable');
        } catch (e) {
            console.log(`  ⚠️  Could not modify pickup_location: ${e.message}`);
        }

        // Verify the changes
        console.log('\n✅ Verifying table structure...');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ?
                AND TABLE_NAME = 'hearse_bookings'
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);

        console.log('\nCurrent table structure:');
        columns.forEach(col => {
            const nullable = col.IS_NULLABLE === 'YES' ? '✅ NULL' : '❌ NOT NULL';
            console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${nullable}`);
        });

        console.log('\n✅ Migration 3 completed successfully!');
        console.log('The hearse_bookings table now accepts minimal booking data from the frontend.');

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