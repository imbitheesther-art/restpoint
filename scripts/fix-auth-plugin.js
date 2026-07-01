/**
 * Script to diagnose and fix MariaDB authentication plugin issues.
 * Run: node scripts/fix-auth-plugin.js
 */
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function main() {
    console.log('🔍 Diagnosing MariaDB authentication plugin...\n');

    // Try connecting as root with no password first (common on local installs)
    const attempts = [
        { user: 'root', password: '', label: 'root with no password' },
        { user: 'root', password: 'RestPoint2024!', label: 'root with RestPoint2024!' },
        { user: 'root', password: 'root', label: 'root with root' },
        { user: 'restpoint_user', password: 'RestPointUser2024', label: 'restpoint_user' },
    ];

    let conn = null;
    let successAttempt = null;

    for (const attempt of attempts) {
        try {
            console.log(`Trying ${attempt.label}...`);
            conn = await mysql.createConnection({
                host: '127.0.0.1',
                port: 3306,
                user: attempt.user,
                password: attempt.password,
                authPlugins: {
                    mysql_native_password: () => Buffer.from('mysql_native_password')
                }
            });
            console.log(`✅ Connected as ${attempt.label}`);
            successAttempt = attempt;
            break;
        } catch (err) {
            console.log(`❌ ${attempt.label}: ${err.message}`);
        }
    }

    if (!conn) {
        console.log('\n❌ Could not connect to MariaDB with any credentials.');
        console.log('Please check if MariaDB is running and try different credentials.');
        process.exit(1);
    }

    try {
        // Check all users and their plugins
        const [users] = await conn.query('SELECT user, host, plugin FROM mysql.user');
        console.log('\n📋 Current users and their authentication plugins:');
        console.table(users);

        // Check if restpoint_user exists
        const restpointUser = users.find(u => u.user === 'restpoint_user');
        if (restpointUser) {
            console.log(`\n⚠️ restpoint_user uses plugin: ${restpointUser.plugin}`);

            if (restpointUser.plugin !== 'mysql_native_password') {
                console.log('\n🔧 Fixing: Changing restpoint_user to mysql_native_password...');
                await conn.query(
                    `ALTER USER 'restpoint_user'@'${restpointUser.host}' IDENTIFIED WITH mysql_native_password BY 'RestPointUser2024'`
                );
                await conn.query('FLUSH PRIVILEGES');
                console.log('✅ User plugin changed to mysql_native_password');

                // Verify
                const [verify] = await conn.query(
                    "SELECT user, host, plugin FROM mysql.user WHERE user = 'restpoint_user'"
                );
                console.log('✅ Verified:', verify[0]);
            } else {
                console.log('✅ restpoint_user already uses mysql_native_password');
            }
        } else {
            console.log('\n⚠️ restpoint_user does not exist. Creating it...');
            // MariaDB 11+ uses IDENTIFIED VIA instead of IDENTIFIED WITH
            await conn.query(
                "CREATE USER IF NOT EXISTS 'restpoint_user'@'%' IDENTIFIED BY 'RestPointUser2024'"
            );
            await conn.query("GRANT ALL PRIVILEGES ON *.* TO 'restpoint_user'@'%' WITH GRANT OPTION");
            await conn.query('FLUSH PRIVILEGES');
            console.log('✅ restpoint_user created with mysql_native_password');
        }

        // Test connection as restpoint_user
        console.log('\n🔧 Testing connection as restpoint_user...');
        const testConn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'restpoint_user',
            password: 'RestPointUser2024',
            authPlugins: {
                mysql_native_password: () => Buffer.from('mysql_native_password')
            }
        });
        const [result] = await testConn.query('SELECT 1 as test');
        console.log('✅ restpoint_user connection successful:', result[0]);
        await testConn.end();

    } catch (err) {
        console.error('\n❌ Error:', err.message);
    } finally {
        if (conn) await conn.end();
    }
}

main().catch(console.error);