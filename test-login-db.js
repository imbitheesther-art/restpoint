const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testLogin() {
    let connection;

    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'restpoint_user',
            password: 'RestPointUser2024',
            database: 'restpoint_main'
        });

        console.log('✓ Connected to database\n');

        // Check if user exists
        console.log('Checking for admin user...');
        const [users] = await connection.query(
            'SELECT user_id, email, full_name, password_hash, is_active FROM users WHERE email = ?',
            ['admin@example.com']
        );

        if (users.length === 0) {
            console.log('✗ User not found in database');
            return;
        }

        const user = users[0];
        console.log('✓ User found:');
        console.log('  - Email:', user.email);
        console.log('  - Name:', user.full_name);
        console.log('  - Active:', user.is_active);
        console.log('  - Password hash:', user.password_hash);

        // Test password
        console.log('\nTesting password "admin123"...');
        const isValid = bcrypt.compareSync('admin123', user.password_hash);
        console.log('  - Password valid:', isValid);

        if (!isValid) {
            console.log('\n✗ Password mismatch! The hash in database does not match "admin123"');
            console.log('\nFixing password...');

            // Hash the correct password
            const newHash = bcrypt.hashSync('admin123', 10);
            console.log('  - New hash:', newHash);

            await connection.query(
                'UPDATE users SET password_hash = ? WHERE email = ?',
                [newHash, 'admin@example.com']
            );

            console.log('✓ Password updated successfully');

            // Verify
            const verifyValid = bcrypt.compareSync('admin123', newHash);
            console.log('  - Verification:', verifyValid);
        } else {
            console.log('✓ Password is correct');
        }

        console.log('\n========================================');
        console.log('✓ Login test completed');
        console.log('========================================');
        console.log('\nYou can now login with:');
        console.log('  Email: admin@example.com');
        console.log('  Password: admin123');

    } catch (error) {
        console.error('\n✗ Error:', error.message);
        console.error('\nFull error:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✓ Database connection closed');
        }
    }
}

testLogin();