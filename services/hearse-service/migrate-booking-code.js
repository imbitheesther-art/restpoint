const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'restpoint_user',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tenant_tracking',
    });

    try {
        console.log(' Checking hearse_bookings table...');

        // Check if booking_code column exists
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'hearse_bookings' 
            AND COLUMN_NAME = 'booking_code'
        `, [process.env.DB_NAME || 'tenant_tracking']);

        if (columns.length === 0) {
            console.log(' booking_code column not found. Adding it now...');

            // Add booking_code column
            await connection.query(`
                ALTER TABLE hearse_bookings 
                ADD COLUMN booking_code VARCHAR(50) NULL 
                AFTER id
            `);

            console.log(' booking_code column added successfully');

            // Generate booking codes for existing bookings
            const [bookings] = await connection.query(`
                SELECT id FROM hearse_bookings 
                WHERE booking_code IS NULL 
                ORDER BY id ASC
            `);

            console.log(` Generating booking codes for ${bookings.length} existing bookings...`);

            for (let i = 0; i < bookings.length; i++) {
                const bookingCode = `BK-${String(i + 1).padStart(3, '0')}`;
                await connection.query(
                    'UPDATE hearse_bookings SET booking_code = ? WHERE id = ?',
                    [bookingCode, bookings[i].id]
                );
            }

            console.log(` Generated booking codes for ${bookings.length} bookings`);

            // Make booking_code NOT NULL after populating
            await connection.query(`
                ALTER TABLE hearse_bookings 
                MODIFY COLUMN booking_code VARCHAR(50) NOT NULL
            `);

            console.log(' booking_code column set to NOT NULL');

            // Add unique index
            await connection.query(`
                CREATE UNIQUE INDEX idx_booking_code ON hearse_bookings(booking_code)
            `);

            console.log(' Unique index created on booking_code');
        } else {
            console.log(' booking_code column already exists');
        }

        // Also check if client_email column exists
        const [emailColumn] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'hearse_bookings' 
            AND COLUMN_NAME = 'client_email'
        `, [process.env.DB_NAME || 'tenant_tracking']);

        if (emailColumn.length === 0) {
            console.log(' client_email column not found. Adding it now...');
            await connection.query(`
                ALTER TABLE hearse_bookings 
                ADD COLUMN client_email VARCHAR(255) NULL 
                AFTER client_phone
            `);
            console.log(' client_email column added successfully');
        } else {
            console.log(' client_email column already exists');
        }

        console.log('\n Migration completed successfully!');

    } catch (error) {
        console.error(' Migration error:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

migrate()
    .then(() => {
        console.log('\n Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });