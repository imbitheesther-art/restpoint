/**
 * Automatic MySQL User Initialization Script
 * This script runs on auth-service startup to ensure the database user exists
 * and has proper permissions.
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

async function initializeDatabaseUser() {
    const {
        DB_HOST = 'localhost',
        DB_PORT = '3306',
        DB_ROOT_USER = 'root',
        DB_ROOT_PASSWORD = '',
        DB_USER = 'restpoint_user',
        DB_PASSWORD = 'RestPointUser2024',
        DB_NAME = 'restpoint_main'
    } = process.env;

    console.log('🔧 Checking database user initialization...');
    console.log(`   DB_USER: ${DB_USER}`);
    console.log(`   DB_HOST: ${DB_HOST}:${DB_PORT}`);

    let rootConnection;
    let retries = 5;
    let lastError;

    // Retry connection logic
    while (retries > 0) {
        try {
            rootConnection = await mysql.createConnection({
                host: DB_HOST,
                port: parseInt(DB_PORT),
                user: DB_ROOT_USER || 'root',
                password: DB_ROOT_PASSWORD || undefined,
                connectTimeout: 10000
            });

            console.log('✅ Connected to MySQL as root');
            break;
        } catch (error) {
            lastError = error;
            retries--;
            console.warn(`⚠️  Attempt ${6 - retries}/5: Could not connect to MySQL as root`);
            console.warn(`   Error: ${error.message}`);

            if (retries > 0) {
                console.log(`   Retrying in 3 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    }

    if (!rootConnection) {
        console.error('❌ Failed to connect to MySQL after 5 attempts');
        console.error('   Please ensure MySQL is running and root credentials are correct');
        console.error('   Last error:', lastError?.message);
        throw new Error('Cannot connect to MySQL as root');
    }

    try {
        // Create user if not exists
        console.log(`📝 Creating/verifying database user: ${DB_USER}`);

        await rootConnection.query(
            'CREATE USER IF NOT EXISTS ? IDENTIFIED BY ?',
            [DB_USER, DB_PASSWORD]
        );

        console.log(`✅ User '${DB_USER}' created or already exists`);

        // Grant privileges
        console.log(`🔑 Granting privileges to '${DB_USER}'...`);

        await rootConnection.query(
            'GRANT ALL PRIVILEGES ON *.* TO ?@\'%\' WITH GRANT OPTION',
            [DB_USER]
        );

        await rootConnection.query(
            'GRANT ALL PRIVILEGES ON *.* TO ?@\'localhost\' WITH GRANT OPTION',
            [DB_USER]
        );

        // Apply changes
        await rootConnection.query('FLUSH PRIVILEGES');

        console.log(`✅ Privileges granted to '${DB_USER}'`);

        // Create database if not exists
        console.log(`📦 Creating database if not exists: ${DB_NAME}`);
        await rootConnection.query(
            `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
        console.log(`✅ Database '${DB_NAME}' ready`);

        // Verify user
        const [users] = await rootConnection.query(
            'SELECT User, Host FROM mysql.user WHERE User = ?',
            [DB_USER]
        );

        if (users.length > 0) {
            console.log(`✅ User verification successful:`);
            users.forEach(user => {
                console.log(`   - ${user.User}@${user.Host}`);
            });
        }

        console.log('✅ Database user initialization complete');

    } catch (error) {
        console.error('❌ Error during database user initialization:', error.message);
        throw error;
    } finally {
        if (rootConnection) {
            await rootConnection.end();
            console.log('🔌 MySQL connection closed');
        }
    }
}

module.exports = { initializeDatabaseUser };