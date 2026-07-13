const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'RestPoint2024!'
    });

    try {
        // Create support_db if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS support_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('✅ Database support_db created or already exists');

        // Create user if not exists
        await connection.query("CREATE USER IF NOT EXISTS 'restpoint_user'@'localhost' IDENTIFIED BY 'RestPointUser2024'");
        await connection.query("CREATE USER IF NOT EXISTS 'restpoint_user'@'127.0.0.1' IDENTIFIED BY 'RestPointUser2024'");
        await connection.query("CREATE USER IF NOT EXISTS 'restpoint_user'@'%' IDENTIFIED BY 'RestPointUser2024'");

        // Grant privileges to restpoint_user
        await connection.query("GRANT ALL PRIVILEGES ON support_db.* TO 'restpoint_user'@'localhost'");
        await connection.query("GRANT ALL PRIVILEGES ON support_db.* TO 'restpoint_user'@'127.0.0.1'");
        await connection.query("GRANT ALL PRIVILEGES ON support_db.* TO 'restpoint_user'@'%'");
        await connection.query('FLUSH PRIVILEGES');
        console.log('✅ User created and privileges granted to restpoint_user');

        // Now connect to support_db and run migrations
        const dbConnection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'restpoint_user',
            password: 'RestPointUser2024',
            database: 'support_db'
        });

        // Read migration SQL from centralized location
        const migrationPath = path.join(__dirname, '..', 'tenant-service', 'migrations', 'support', '001_create_support_tables.sql');

        // Fallback to local migration if centralized one not found
        const localMigrationPath = path.join(__dirname, 'migrations', '001_create_support_tables.sql');

        let migrationSql;
        if (fs.existsSync(migrationPath)) {
            migrationSql = fs.readFileSync(migrationPath, 'utf8');
            console.log('✅ Using centralized migration from tenant-service/migrations/support/');
        } else if (fs.existsSync(localMigrationPath)) {
            migrationSql = fs.readFileSync(localMigrationPath, 'utf8');
            console.log('✅ Using local migration');
        } else {
            // Inline fallback
            console.log('⚠️ No migration file found, using inline schema...');
            migrationSql = `
                CREATE TABLE IF NOT EXISTS support_tickets (
                    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
                    tenant_slug VARCHAR(100) NOT NULL,
                    tenant_name VARCHAR(255),
                    user_email VARCHAR(255),
                    user_name VARCHAR(255),
                    type VARCHAR(50) DEFAULT 'help',
                    subject VARCHAR(500) NOT NULL,
                    message TEXT NOT NULL,
                    status VARCHAR(50) DEFAULT 'open',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_tenant (tenant_slug),
                    INDEX idx_status (status),
                    INDEX idx_created (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                CREATE TABLE IF NOT EXISTS ticket_replies (
                    reply_id INT AUTO_INCREMENT PRIMARY KEY,
                    ticket_id INT NOT NULL,
                    user_type VARCHAR(50) NOT NULL,
                    message TEXT NOT NULL,
                    tenant_slug VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
                    INDEX idx_ticket (ticket_id),
                    INDEX idx_tenant (tenant_slug)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `;
        }

        // Execute migration SQL (split by semicolons for multi-statement execution)
        const statements = migrationSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const stmt of statements) {
            if (stmt) {
                await dbConnection.query(stmt);
            }
        }
        console.log('✅ Support tables created via centralized migration');

        await dbConnection.end();
        console.log('✅ Support database initialization complete');
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

initDatabase()
    .then(() => {
        console.log('Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });