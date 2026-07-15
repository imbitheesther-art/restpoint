#!/usr/bin/env node
/**
 * Bootstrap DB and create system admin user.
 * Usage: set env DB_ADMIN_USER and DB_ADMIN_PASSWORD (or ROOT_DB_USER/ROOT_DB_PASSWORD), then run:
 *   node scripts/bootstrap-db.js
 * Or pass args: --adminUser=root --adminPass=secret
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const { SYSTEM_ADMIN } = require('./auto-init-system-admin');

// Load .env from the auth-service directory
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Log the loaded configuration for debugging
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);

async function main() {
  const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

  // Try to use existing user credentials first (no root needed!)
  const configuredUser = process.env.DB_USER || 'restpoint_user';
  const configuredPass = process.env.DB_PASSWORD || 'RestPointUser2024';

  // Fallback to admin credentials if provided
  const adminUser = argv.adminUser || process.env.DB_ADMIN_USER || process.env.ROOT_DB_USER || configuredUser;
  const adminPass = argv.adminPass || process.env.DB_ADMIN_PASSWORD || process.env.ROOT_DB_PASSWORD || configuredPass;

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const mainDb = process.env.DB_NAME || 'restpoint_main';

  let adminConn;
  try {
    // First, try to connect as the configured user directly
    console.log(`Attempting to connect as ${configuredUser}...`);
    try {
      adminConn = await mysql.createConnection({ host, port, user: configuredUser, password: configuredPass });
      console.log('✅ Connected as existing user:', configuredUser);
      console.log('   Skipping user creation - using existing user');
    } catch (userErr) {
      // If configured user doesn't work, try admin credentials
      console.log(`⚠️  Could not connect as ${configuredUser}, trying admin user...`);
      adminConn = await mysql.createConnection({ host, port, user: adminUser, password: adminPass });
      console.log('✅ Connected as admin:', adminUser);
    }

    // Create databases
    await adminConn.query('CREATE DATABASE IF NOT EXISTS tenant_tracking');
    console.log('✅ Ensured database: tenant_tracking');
    await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${mainDb}\``);
    console.log('✅ Ensured database:', mainDb);

    // Only try to create user if we connected as admin (not as the configured user)
    if (adminUser !== configuredUser || adminPass !== configuredPass) {
      console.log('📝 Creating/updating database user...');

      // Drop localhost user to avoid socket authentication issues
      try {
        await adminConn.query(`DROP USER IF EXISTS \`${configuredUser}\`@'localhost'`);
        console.log(`   Dropped user ${configuredUser}@localhost (to avoid socket auth issues)`);
      } catch (e) {
        console.warn(`   ⚠️  Could not drop user ${configuredUser}@localhost:`, e.message);
      }

      // Only create for 127.0.0.1 and % to avoid localhost socket auth issues
      const hosts = ['127.0.0.1', '%'];
      for (const h of hosts) {
        try {
          await adminConn.query(`CREATE USER IF NOT EXISTS \`${configuredUser}\`@'${h}' IDENTIFIED BY '${configuredPass}'`);
          console.log(`   Created/ensured user ${configuredUser}@${h}`);
        } catch (e) {
          // User might already exist, try to update password
          try {
            await adminConn.query(`ALTER USER \`${configuredUser}\`@'${h}' IDENTIFIED BY '${configuredPass}'`);
            console.log(`   Updated password for ${configuredUser}@${h}`);
          } catch (er) {
            console.warn(`   ⚠️  Could not create/update user ${configuredUser}@${h}:`, er.message);
          }
        }
        try {
          await adminConn.query(`GRANT ALL PRIVILEGES ON tenant_tracking.* TO \`${configuredUser}\`@'${h}'`);
          await adminConn.query(`GRANT ALL PRIVILEGES ON \`${mainDb}\`.* TO \`${configuredUser}\`@'${h}'`);
          console.log(`   Granted privileges to ${configuredUser}@${h}`);
        } catch (grantErr) {
          console.warn(`   ⚠️  Grant warning for ${configuredUser}@${h}:`, grantErr.message || grantErr);
        }
      }

      await adminConn.query('FLUSH PRIVILEGES');
      console.log('   Flushed privileges');
    } else {
      console.log('✅ Using existing user credentials - skipping user creation');
    }

    // Now connect as configured user and create tenant_tracking tables and system admin
    // Use the same host as configured in .env to ensure user@host matches
    console.log('Connecting to tenant_tracking database...');

    // Add a small delay to ensure MySQL has processed the GRANT statements
    await new Promise(resolve => setTimeout(resolve, 1000));

    let userConn;
    try {
      // Connect using the same host as in .env (not 127.0.0.1)
      userConn = await mysql.createConnection({ host, port, user: configuredUser, password: configuredPass, database: 'tenant_tracking' });
      console.log('✅ Connected as configured user to tenant_tracking');
    } catch (connErr) {
      console.error('❌ Failed to connect as configured user:', connErr.message);
      console.error('   This usually means the user was not created or privileges were not granted correctly');
      console.error('   Try running: mysql -u root -p -e "FLUSH PRIVILEGES;"');
      throw connErr;
    }

    // Drop and recreate tenants table to ensure correct schema
    await userConn.query('DROP TABLE IF EXISTS tenants');
    console.log('Dropped old tenants table (if existed)');

    await userConn.query(`
      CREATE TABLE tenants (
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
    console.log('✅ Created tenants table with correct schema');

    await userConn.query(`
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

    // Insert tenant record
    await userConn.query(`
      INSERT INTO tenants (tenant_name, tenant_slug, db_name, email, phone, location, country, status, subscription_status, deployment_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'active', 'single')
      ON DUPLICATE KEY UPDATE tenant_name = VALUES(tenant_name)
    `, [SYSTEM_ADMIN.tenantName, SYSTEM_ADMIN.tenantSlug, SYSTEM_ADMIN.dbName, SYSTEM_ADMIN.email, SYSTEM_ADMIN.phone, SYSTEM_ADMIN.location, SYSTEM_ADMIN.country]);
    console.log('Ensured system tenant record');

    // Get tenant id
    const [tenants] = await userConn.query('SELECT id FROM tenants WHERE email = ?', [SYSTEM_ADMIN.email]);
    const tenantId = tenants[0] && tenants[0].id;

    if (!tenantId) {
      console.error('Failed to get tenant id after insertion');
      process.exit(1);
    }

    const passwordHash = bcrypt.hashSync(SYSTEM_ADMIN.password, 10);

    await userConn.query(`
      INSERT INTO users (email, password_hash, full_name, phone, role, tenant_id, is_verified, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1, 1)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role), is_active = 1, is_verified = 1
    `, [SYSTEM_ADMIN.email, passwordHash, SYSTEM_ADMIN.fullName, SYSTEM_ADMIN.phone, SYSTEM_ADMIN.role, tenantId]);

    console.log('System admin user created/ensured:', SYSTEM_ADMIN.email);

    await userConn.end();
    await adminConn.end();

    console.log('\nBootstrap complete. You can now start auth-service normally.');
    process.exit(0);

  } catch (err) {
    console.error('Bootstrap failed:', err && err.message ? err.message : err);
    if (adminConn) await adminConn.end().catch(() => { });
    process.exit(1);
  }
}

main();
