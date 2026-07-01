// Workaround: Use mysql2 with authPlugins API for MariaDB 12.3 on Windows
const mysql = require('mysql2/promise');

async function fixDatabase() {
    console.log('Connecting to MariaDB as root...');

    // The auth_gssapi_client plugin for MariaDB on Windows
    // When pluginData is empty/undefined, return empty buffer to bypass SSPI
    const rootAuthPlugins = {
        auth_gssapi_client: () => {
            return (pluginData) => {
                console.log('auth_gssapi_client called with data length:', pluginData ? pluginData.length : 0);
                return Buffer.from([]);
            }
        },
        mysql_native_password: (password) => {
            return (pluginData) => {
                console.log('mysql_native_password: performing auth');
                // Let mysql2 handle it - return undefined/null to use default
                return undefined;
            }
        }
    };

    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: 'RestPoint2024!',
            multipleStatements: true,
            authPlugins: rootAuthPlugins
        });

        console.log('Connected as root');

        // Show current root auth
        const [rows] = await conn.query("SELECT user, host, plugin FROM mysql.user WHERE user='root'");
        console.log('Root users:', JSON.stringify(rows));

        // Create the app user with mysql_native_password
        await conn.query("DROP USER IF EXISTS 'restpoint_user'@'%'");
        await conn.query("DROP USER IF EXISTS 'restpoint_user'@'localhost'");
        await conn.query("CREATE USER 'restpoint_user'@'%' IDENTIFIED BY 'RestPointUser2024'");
        await conn.query("CREATE USER 'restpoint_user'@'localhost' IDENTIFIED BY 'RestPointUser2024'");
        await conn.query("GRANT ALL PRIVILEGES ON *.* TO 'restpoint_user'@'%' WITH GRANT OPTION");
        await conn.query("GRANT ALL PRIVILEGES ON *.* TO 'restpoint_user'@'localhost' WITH GRANT OPTION");
        await conn.query('FLUSH PRIVILEGES');
        console.log('User restpoint_user created');

        await conn.end();
        console.log('Done');
    } catch (err) {
        console.error('Error:', err.message);
        console.error('Code:', err.code);
        process.exit(1);
    }
}

fixDatabase();