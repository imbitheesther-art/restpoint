/**
 * Run coffin_images table migration
 * This script creates the missing coffin_images and deceased_coffin tables
 */

const mysql = require('mysql2/promise');

async function runMigration() {
    let connection;

    try {
        // Connect to the tenant database directly
        connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'restpoint_user',
            password: 'RestPointUser2024',
            database: 'embenezar-feuneral-nairobi'
        });

        console.log('✅ Connected to database: embenezar-feuneral-nairobi');

        // Create coffin_images table
        console.log('\n📝 Creating coffin_images table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`coffin_images\` (
              \`image_id\` INT NOT NULL AUTO_INCREMENT,
              \`coffin_id\` VARCHAR(255) NOT NULL,
              \`tenant_id\` VARCHAR(255) NOT NULL,
              \`image_url\` VARCHAR(500) NOT NULL,
              \`image_name\` VARCHAR(255),
              \`display_order\` INT DEFAULT 0,
              \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              
              PRIMARY KEY (\`image_id\`),
              INDEX \`idx_coffin_id\` (\`coffin_id\`),
              INDEX \`idx_tenant_id\` (\`tenant_id\`),
              INDEX \`idx_created_at\` (\`created_at\`),
              
              FOREIGN KEY (\`coffin_id\`) REFERENCES \`coffins\`(\`coffin_id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Coffin images'
        `);
        console.log('✅ coffin_images table created successfully');

        // Create deceased_coffin table
        console.log('\n📝 Creating deceased_coffin table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`deceased_coffin\` (
              \`id\` INT NOT NULL AUTO_INCREMENT,
              \`deceased_id\` VARCHAR(100) NOT NULL,
              \`coffin_id\` VARCHAR(255) NOT NULL,
              \`tenant_id\` VARCHAR(255) NOT NULL,
              \`assigned_by_username\` VARCHAR(100) DEFAULT NULL,
              \`assigned_date\` DATE NOT NULL,
              \`rfid\` VARCHAR(100) UNIQUE COMMENT 'RFID tag for tracking',
              \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
              
              PRIMARY KEY (\`id\`),
              INDEX \`idx_deceased_id\` (\`deceased_id\`),
              INDEX \`idx_coffin_id\` (\`coffin_id\`),
              INDEX \`idx_tenant_id\` (\`tenant_id\`),
              INDEX \`idx_assigned_date\` (\`assigned_date\`),
              UNIQUE KEY \`unique_deceased_coffin\` (\`deceased_id\`, \`coffin_id\`),
              FOREIGN KEY (\`coffin_id\`) REFERENCES \`coffins\`(\`coffin_id\`) ON DELETE RESTRICT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ deceased_coffin table created successfully');

        // Verify tables exist
        console.log('\n🔍 Verifying tables...');
        const [tables] = await connection.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'embenezar-feuneral-nairobi'
            AND TABLE_NAME IN ('coffin_images', 'deceased_coffin')
        `);

        console.log('✅ Found tables:', tables.map(t => t.TABLE_NAME).join(', '));

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

runMigration();