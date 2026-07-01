const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
    try {
        const c = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: 'RestPoint2024!'
        });

        // Get current hash
        const [users] = await c.query('SELECT user_id, email, password_hash FROM tenant_lee_feuneral_home.users WHERE email = ?', ['info@gmail.com']);
        const user = users[0];
        console.log('Current user:', { user_id: user.user_id, email: user.email });
        console.log('Current hash:', user.password_hash.substring(0, 20) + '...');

        // Test if password matches
        const match = await bcrypt.compare('40045355', user.password_hash);
        console.log('Password matches:', match);

        if (!match) {
            console.log('Updating password...');
            const newHash = await bcrypt.hash('40045355', 10);
            await c.query('UPDATE tenant_lee_feuneral_home.users SET password_hash = ? WHERE user_id = ?', [newHash, user.user_id]);
            console.log('✓ Password updated');

            // Verify
            const verify = await bcrypt.compare('40045355', newHash);
            console.log('Verification:', verify);
        }

        await c.end();
    } catch (e) {
        console.log('Error:', e.message);
    }
}

main();