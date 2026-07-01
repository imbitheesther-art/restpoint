const mysql = require('mysql2/promise');

async function fixDatabase() {
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

        // Create database
        console.log('\nCreating database...');
        await rootConnection.query('CREATE DATABASE IF NOT EXISTS restpoint_main CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('✓ Database restpoint_main created');

        // Create tenant tracking database
        await rootConnection.query('CREATE DATABASE IF NOT EXISTS tenant_tracking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('✓ Database tenant_tracking created');

        // Create user if not exists
        console.log('\nCreating user...');
        await rootConnection.query("CREATE USER IF NOT EXISTS 'restpoint_user'@'%' IDENTIFIED BY 'RestPointUser2024'");
        console.log('✓ User restpoint_user created');

        // Grant ALL PRIVILEGES
        console.log('\nGranting privileges...');
        await rootConnection.query("GRANT ALL PRIVILEGES ON *.* TO 'restpoint_user'@'%' WITH GRANT OPTION");
        await rootConnection.query('FLUSH PRIVILEGES');
        console.log('✓ Privileges granted');

        // Create tables
        console.log('\nCreating tables...');

        // Users table
        await rootConnection.query(`
      CREATE TABLE IF NOT EXISTS restpoint_main.users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('admin', 'manager', 'staff', 'user') DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT TRUE,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✓ Users table created');

        // Tenants table
        await rootConnection.query(`
      CREATE TABLE IF NOT EXISTS tenant_tracking.tenants (
        tenant_id INT PRIMARY KEY AUTO_INCREMENT,
        tenant_name VARCHAR(255) NOT NULL,
        tenant_slug VARCHAR(255) UNIQUE NOT NULL,
        db_name VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        location TEXT,
        country VARCHAR(100),
        logo_url VARCHAR(500),
        jwt_secret VARCHAR(500),
        refresh_secret VARCHAR(500),
        status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
        subscription_status ENUM('active', 'trial', 'suspended', 'cancelled') DEFAULT 'trial',
        subscription_expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tenant_slug (tenant_slug),
        INDEX idx_email (email),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✓ Tenants table created');

        // Insert default admin user
        console.log('\nInserting default admin user...');
        await rootConnection.query(`
      INSERT IGNORE INTO restpoint_main.users (email, password_hash, full_name, phone, role, is_active, is_verified) 
      VALUES ('admin@example.com', '$2b$10$8VzvLhU9W3vQOYZl7JLgzuOgVFp.TBv.80cCpjklKZ5pLkK.LNnXW', 'System Admin', '+254700000000', 'admin', 1, 1)
    `);
        console.log('✓ Default admin user created (email: admin@example.com, password: admin123)');

        // Insert default tenant
        await rootConnection.query(`
      INSERT IGNORE INTO tenant_tracking.tenants (tenant_name, tenant_slug, db_name, email, phone, location, country, status, subscription_status)
      VALUES ('Default Tenant', 'default', 'restpoint_main', 'admin@example.com', '+254700000000', 'Nairobi', 'Kenya', 'active', 'active')
    `);
        console.log('✓ Default tenant created');

        console.log('\n========================================');
        console.log('✓ Database setup completed successfully!');
        console.log('========================================');
        console.log('\nYou can now:');
        console.log('1. Login with: admin@example.com / admin123');
        console.log('2. Register new tenants');
        console.log('3. Create new users');

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

fixDatabase();