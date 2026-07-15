/**
 * Auto-Initialize System Admin
 * 
 * This script automatically creates the system admin user on system startup.
 * It runs as part of the auth-service initialization process.
 * 
 * To enable: Add this to your auth-service startup sequence
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// System Admin Configuration
const SYSTEM_ADMIN = {
    email: 'infowelttallis@gmail.com',
    password: '40045355@Peter',
    fullName: 'System Administrator',
    phone: '+254700000000',
    role: 'systemadmin',
    tenantName: 'Welt Tallis Technologies',
    tenantSlug: 'welt-tallis',
    dbName: 'welt_tallis_main',
    location: 'Nairobi',
    country: 'Kenya'
};

async function autoInitSystemAdmin() {
    let connection;
    try {
        console.log('🔧 Checking system admin initialization...');

        // Retry logic for DB connection (useful when DB is still starting)
        const maxAttempts = parseInt(process.env.DB_INIT_RETRY_ATTEMPTS || '5', 10);
        const baseDelayMs = parseInt(process.env.DB_INIT_RETRY_DELAY_MS || '5000', 10);
        let attempt = 0;
        let connected = false;

        while (attempt < maxAttempts && !connected) {
            attempt += 1;
            try {
                console.log(`Attempt ${attempt}/${maxAttempts} connecting to DB...`);
                connection = await mysql.createConnection({
                    host: process.env.DB_HOST || 'localhost',
                    port: parseInt(process.env.DB_PORT || '3306'),
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASSWORD || '',
                    database: 'tenant_tracking'
                });
                connected = true;
                console.log('✅ Connected to database');
            } catch (connErr) {
                // If access denied, do not attempt auto-provisioning during startup in production.
                // Instead, instruct operator to run the bootstrap tool with admin credentials.
                if (connErr && (connErr.code === 'ER_ACCESS_DENIED_ERROR' || (connErr.message && connErr.message.includes('Access denied')))) {
                    console.error('❌ Database access denied for configured DB user. Auto-provisioning is disabled at startup to avoid unexpected privilege escalations.');
                    console.error('To provision the database and user, run the provided bootstrap script with administrator credentials (DB_ADMIN_USER / DB_ADMIN_PASSWORD).');
                    console.error(`Configured DB_USER=${process.env.DB_USER}, DB_HOST=${process.env.DB_HOST}, DB_PORT=${process.env.DB_PORT}`);
                    throw connErr; // bubble to outer catch and return appropriate failure
                }

                console.warn(`DB connection attempt ${attempt} failed: ${connErr.message || connErr}. Retrying in ${baseDelayMs}ms...`);
                if (attempt < maxAttempts) {
                    await new Promise(res => setTimeout(res, baseDelayMs));
                }
            }
        }

        if (!connected) {
            throw new Error('Could not connect to database after multiple attempts');
        }

        // Create tenant_tracking database and tables FIRST
        console.log('🔨 Creating system admin user...');
        await connection.query('CREATE DATABASE IF NOT EXISTS tenant_tracking');
        await connection.query('USE tenant_tracking');
        console.log('Using tenant_tracking database');

        // Create tenants table if it doesn't exist
        await connection.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_name VARCHAR(255) NOT NULL,
        tenant_slug VARCHAR(255) UNIQUE NOT NULL,
        db_name VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        location TEXT,
        country VARCHAR(100),
        logo_url VARCHAR(500),
        status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
        subscription_status ENUM('active', 'trial', 'suspended', 'cancelled') DEFAULT 'trial',
        subscription_expires_at TIMESTAMP NULL,
        deployment_type ENUM('single', 'multi') DEFAULT 'single',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_deployment_type (deployment_type),
        INDEX idx_tenant_slug (tenant_slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('Ensured tenants table');

        // Create users table if it doesn't exist
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'admin',
        tenant_id INT NOT NULL,
        branch_id INT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT TRUE,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_tenant_id (tenant_id),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('Ensured users table');

        // NOW check if system admin already exists
        const [existingUsers] = await connection.query(
            'SELECT user_id, role FROM users WHERE email = ?',
            [SYSTEM_ADMIN.email]
        );

        if (existingUsers.length > 0) {
            const user = existingUsers[0];
            if (user.role === 'systemadmin') {
                console.log('✅ System admin already exists and has correct role');
                return { success: true, message: 'System admin already initialized', userId: user.user_id };
            } else {
                // Update role to systemadmin if it's different
                await connection.query(
                    'UPDATE users SET role = ? WHERE email = ?',
                    ['systemadmin', SYSTEM_ADMIN.email]
                );
                console.log('✅ Updated system admin role to systemadmin');
                return { success: true, message: 'System admin role updated', userId: user.user_id };
            }
        }

        // Create or update tenant
        await connection.query(`
            INSERT INTO tenants (
                tenant_name, tenant_slug, db_name, email, phone, 
                location, country, status, subscription_status, deployment_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'active', 'single')
            ON DUPLICATE KEY UPDATE tenant_name = VALUES(tenant_name)
        `, [
            SYSTEM_ADMIN.tenantName,
            SYSTEM_ADMIN.tenantSlug,
            SYSTEM_ADMIN.dbName,
            SYSTEM_ADMIN.email,
            SYSTEM_ADMIN.phone,
            SYSTEM_ADMIN.location,
            SYSTEM_ADMIN.country
        ]);

        // Get tenant id
        const [tenantsResult] = await connection.query(
            'SELECT id FROM tenants WHERE email = ?',
            [SYSTEM_ADMIN.email]
        );
        const tenantId = tenantsResult[0]?.id;

        if (!tenantId) {
            throw new Error('Failed to get tenant_id');
        }

        // Hash password
        const passwordHash = bcrypt.hashSync(SYSTEM_ADMIN.password, 10);

        // Create system admin user
        await connection.query(`
            INSERT INTO users (
                email, password_hash, full_name, phone, 
                role, tenant_id, is_verified, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, 1, 1)
            ON DUPLICATE KEY UPDATE 
                password_hash = VALUES(password_hash),
                role = VALUES(role),
                is_active = 1,
                is_verified = 1
        `, [
            SYSTEM_ADMIN.email,
            passwordHash,
            SYSTEM_ADMIN.fullName,
            SYSTEM_ADMIN.phone,
            SYSTEM_ADMIN.role,
            tenantId
        ]);

        // Get the user_id
        const [usersResult] = await connection.query(
            'SELECT user_id FROM users WHERE email = ?',
            [SYSTEM_ADMIN.email]
        );
        const userId = usersResult[0]?.user_id;

        console.log('✅ System admin user created successfully!');
        console.log(`   Email: ${SYSTEM_ADMIN.email}`);
        console.log(`   Role: ${SYSTEM_ADMIN.role}`);
        console.log(`   User ID: ${userId}`);
        console.log(`   Tenant ID: ${tenantId}`);

        return {
            success: true,
            message: 'System admin initialized successfully',
            userId,
            tenantId,
            email: SYSTEM_ADMIN.email,
            role: SYSTEM_ADMIN.role
        };

    } catch (error) {
        console.error('❌ Error initializing system admin:', error.message);
        return {
            success: false,
            message: error.message,
            error: error
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run if called directly
if (require.main === module) {
    autoInitSystemAdmin()
        .then(result => {
            console.log('\n📊 Initialization Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Fatal error:', error && error.message ? error.message : error);
            process.exit(1);
        });
}

module.exports = { autoInitSystemAdmin, SYSTEM_ADMIN };
