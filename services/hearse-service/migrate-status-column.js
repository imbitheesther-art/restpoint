const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// Get tenant database name from command line argument
const tenantDbName = process.argv[2];

if (!tenantDbName) {

    process.exit(1);
}

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'restpoint_user',
        password: process.env.DB_PASSWORD || '',
        database: tenantDbName,
    });

    try {

        console.log(' Checking hearses table...');

        // Check if status column exists
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'hearses' 
            AND COLUMN_NAME = 'status'
        `, [process.env.DB_NAME || 'tenant_tracking']);

        if (columns.length === 0) {
            console.log('❌ status column not found. Adding it now...');

            // Add status column with default value
            await connection.query(`
                ALTER TABLE hearses 
                ADD COLUMN status VARCHAR(50) DEFAULT 'available' 
                AFTER capacity
            `);

            console.log('✅ status column added successfully');

            // Update all existing hearses to 'available'
            await connection.query(`
                UPDATE hearses SET status = 'available' WHERE status IS NULL
            `);

            console.log('✅ All hearses set to available status');
        } else {
            console.log('✅ status column already exists');
        }

        // Check if is_active column exists
        try {
            const [isActiveColumn] = await connection.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = 'hearses' 
                AND COLUMN_NAME = 'is_active'
            `, [tenantDbName]);

            if (isActiveColumn.length === 0) {
                console.log('❌ is_active column not found. Adding it now...');
                await connection.query(`
                    ALTER TABLE hearses 
                    ADD COLUMN is_active BOOLEAN DEFAULT TRUE 
                    AFTER status
                `);
                console.log('✅ is_active column added successfully');
            } else {
                console.log('✅ is_active column already exists');
            }
        } catch (e) {
            console.log('⚠️ is_active column check failed (may already exist):', e.message);
        }

        // Check if hearse_code column exists
        const [hearseCodeColumn] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'hearses' 
            AND COLUMN_NAME = 'hearse_code'
        `, [process.env.DB_NAME || 'tenant_tracking']);

        if (hearseCodeColumn.length === 0) {
            console.log('❌ hearse_code column not found. Adding it now...');
            await connection.query(`
                ALTER TABLE hearses 
                ADD COLUMN hearse_code VARCHAR(50) NULL 
                AFTER id
            `);
            console.log('✅ hearse_code column added successfully');
        } else {
            console.log('✅ hearse_code column already exists');
        }

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration error:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

migrate()
    .then(() => {
        console.log('\n🎉 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });