/**
 * Migration script to add coffin_images table to existing tenant databases
 * Run this script to fix the "Table 'tenant.coffin_images' doesn't exist" error
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    let connection;

    try {
        // Connect to MySQL server (not to a specific database)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('✅ Connected to MySQL server\n');

        // Get all tenant databases
        const [databases] = await connection.query(
            "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME LIKE 'restpoint_tenant_%' OR SCHEMA_NAME LIKE 'embenezar%'"
        );

        console.log(`📊 Found ${databases.length} tenant databases\n`);

        // SQL to create coffin_images table
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS coffin_images (
        image_id INT NOT NULL AUTO_INCREMENT,
        coffin_id INT NOT NULL,
        tenant_id VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_name VARCHAR(255),
        display_order INT DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        PRIMARY KEY (image_id),
        INDEX idx_coffin_id (coffin_id),
        INDEX idx_tenant_id (tenant_id),
        INDEX idx_created_at (created_at),
        
        FOREIGN KEY (coffin_id) REFERENCES coffins(coffin_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Coffin images with tenant isolation'
    `;

        let successCount = 0;
        let errorCount = 0;

        // Create table in each tenant database
        for (const db of databases) {
            const dbName = db.SCHEMA_NAME;
            try {
                await connection.query(`USE \`${dbName}\``);
                await connection.query(createTableSQL);
                console.log(`✅ Created coffin_images table in: ${dbName}`);
                successCount++;
            } catch (error) {
                // Table might already exist, which is fine
                if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`⚠️  Table already exists in: ${dbName}`);
                    successCount++;
                } else {
                    console.error(`❌ Error in ${dbName}:`, error.message);
                    errorCount++;
                }
            }
        }

        console.log(`\n📊 Migration Summary:`);
        console.log(`   ✅ Success: ${successCount} databases`);
        console.log(`   ❌ Errors: ${errorCount} databases`);
        console.log(`\n✨ Migration completed!`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run migration
migrate();