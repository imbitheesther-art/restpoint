const mysql = require('mysql2/promise');

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

        // Now connect to support_db and create tables
        const dbConnection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'restpoint_user',
            password: 'RestPointUser2024',
            database: 'support_db'
        });

        // Create support_tickets table (matching the name in supportController.js)
        await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_slug VARCHAR(255) NOT NULL,
        tenant_name VARCHAR(255) DEFAULT 'Unknown',
        user_id INT NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'help',
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
        assigned_to INT,
        resolved_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tenant (tenant_slug),
        INDEX idx_user (user_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✅ support_tickets table created');

        // Create ticket_responses table
        await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS ticket_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        user_id INT NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        response TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
        INDEX idx_ticket (ticket_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✅ ticket_responses table created');

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