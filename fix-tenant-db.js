const mysql = require('mysql2/promise');

async function fixTenantDB() {
    let rootConnection;

    try {
        // Connect as root user
        console.log('Connecting to MariaDB as root...');
        rootConnection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: 'RestPoint2024!'
        });

        console.log('✓ Connected to MariaDB as root');

        // Create user for localhost as well (not just %)
        console.log('\nCreating user for localhost...');
        await rootConnection.query("CREATE USER IF NOT EXISTS 'restpoint_user'@'localhost' IDENTIFIED BY 'RestPointUser2024'");
        console.log('✓ User restpoint_user@localhost created');

        // Grant ALL PRIVILEGES for localhost
        console.log('\nGranting privileges for localhost...');
        await rootConnection.query("GRANT ALL PRIVILEGES ON *.* TO 'restpoint_user'@'localhost' WITH GRANT OPTION");
        await rootConnection.query('FLUSH PRIVILEGES');
        console.log('✓ Privileges granted for localhost');

        console.log('\n========================================');
        console.log('✓ Tenant database setup completed!');
        console.log('========================================');
        console.log('\nYou can now register new tenants without database errors');

    } catch (error) {
        console.error('\n✗ Error:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        if (rootConnection) {
            await rootConnection.end();
            console.log('\n✓ Database connection closed');
        }
    }
}

fixTenantDB();