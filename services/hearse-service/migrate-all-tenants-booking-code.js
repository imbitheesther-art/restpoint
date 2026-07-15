const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function migrateAllTenants() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'restpoint_user',
        password: process.env.DB_PASSWORD || '',
        database: 'tenant_tracking',
    });

    try {
        console.log('🔍 Starting hearse_bookings migration for ALL tenants...\n');

        // Get all active tenants
        const [tenants] = await connection.query(`
            SELECT tenant_id, tenant_name, db_name, tenant_slug 
            FROM tenant_tracking.tenants 
            WHERE status = 'active'
            ORDER BY tenant_id ASC
        `);

        console.log(`📊 Found ${tenants.length} active tenant(s)\n`);

        let totalSuccess = 0;
        let totalFailed = 0;

        // Process each tenant
        for (const tenant of tenants) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`Processing: ${tenant.tenant_name} (${tenant.tenant_slug})`);
            console.log(`Database: ${tenant.db_name}`);
            console.log('='.repeat(60));

            try {
                await migrateTenant(connection, tenant.db_name, tenant.tenant_slug);
                console.log(`✅ Successfully migrated: ${tenant.tenant_name}`);
                totalSuccess++;
            } catch (error) {
                console.error(`❌ Failed to migrate ${tenant.tenant_name}:`, error.message);
                totalFailed++;
            }
        }

        // Summary
        console.log(`\n${'='.repeat(60)}`);
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Successfully migrated: ${totalSuccess} tenant(s)`);
        console.log(`❌ Failed: ${totalFailed} tenant(s)`);
        console.log(`📝 Total processed: ${tenants.length} tenant(s)`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

async function migrateTenant(serverConnection, dbName, tenantSlug) {
    // Connect to tenant database
    const tenantConn = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'restpoint_user',
        password: process.env.DB_PASSWORD || '',
        database: dbName,
    });

    try {
        // Check if hearse_bookings table exists
        const [tables] = await tenantConn.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'hearse_bookings'
        `, [dbName]);

        if (tables.length === 0) {
            console.log(`  ⚠️  hearse_bookings table not found in ${dbName}, skipping...`);
            return;
        }

        console.log(`  📋 hearse_bookings table found`);

        // Check if booking_code column exists
        const [columns] = await tenantConn.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'hearse_bookings' 
            AND COLUMN_NAME = 'booking_code'
        `, [dbName]);

        if (columns.length === 0) {
            console.log(`  ➕ Adding booking_code column...`);

            // Add booking_code column
            await tenantConn.query(`
                ALTER TABLE hearse_bookings 
                ADD COLUMN booking_code VARCHAR(50) NULL 
                AFTER id
            `);

            console.log(`  ✅ booking_code column added`);

            // Generate booking codes for existing bookings
            const [bookings] = await tenantConn.query(`
                SELECT id FROM hearse_bookings 
                WHERE booking_code IS NULL 
                ORDER BY id ASC
            `);

            if (bookings.length > 0) {
                console.log(`  🔢 Generating booking codes for ${bookings.length} existing bookings...`);

                for (let i = 0; i < bookings.length; i++) {
                    const bookingCode = `BK-${String(i + 1).padStart(3, '0')}`;
                    await tenantConn.query(
                        'UPDATE hearse_bookings SET booking_code = ? WHERE id = ?',
                        [bookingCode, bookings[i].id]
                    );
                }

                console.log(`  ✅ Generated booking codes for ${bookings.length} bookings`);
            } else {
                console.log(`  ℹ️  No existing bookings to process`);
            }

            // Make booking_code NOT NULL after populating
            await tenantConn.query(`
                ALTER TABLE hearse_bookings 
                MODIFY COLUMN booking_code VARCHAR(50) NOT NULL
            `);

            console.log(`  ✅ booking_code column set to NOT NULL`);

            // Add unique index
            await tenantConn.query(`
                CREATE UNIQUE INDEX idx_booking_code ON hearse_bookings(booking_code)
            `);

            console.log(`  ✅ Unique index created on booking_code`);
        } else {
            console.log(`  ✓ booking_code column already exists`);
        }

        // Check if client_email column exists
        const [emailColumn] = await tenantConn.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'hearse_bookings' 
            AND COLUMN_NAME = 'client_email'
        `, [dbName]);

        if (emailColumn.length === 0) {
            console.log(`  ➕ Adding client_email column...`);
            await tenantConn.query(`
                ALTER TABLE hearse_bookings 
                ADD COLUMN client_email VARCHAR(255) NULL 
                AFTER client_phone
            `);
            console.log(`  ✅ client_email column added`);
        } else {
            console.log(`  ✓ client_email column already exists`);
        }

        // Check if status column needs to be updated to VARCHAR(50)
        const [statusColumn] = await tenantConn.query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'hearse_bookings' 
            AND COLUMN_NAME = 'status'
        `, [dbName]);

        if (statusColumn.length > 0 && statusColumn[0].DATA_TYPE === 'varchar' && statusColumn[0].CHARACTER_MAXIMUM_LENGTH < 50) {
            console.log(`  🔄 Updating status column to VARCHAR(50)...`);
            await tenantConn.query(`
                ALTER TABLE hearse_bookings 
                MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending'
            `);
            console.log(`  ✅ status column updated to VARCHAR(50)`);
        } else if (statusColumn.length > 0) {
            console.log(`  ✓ status column is already VARCHAR(50) or larger`);
        }

    } finally {
        await tenantConn.end();
    }
}

// Run migration
migrateAllTenants()
    .then(() => {
        console.log('\n✅ All migrations completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    });