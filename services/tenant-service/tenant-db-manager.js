/**
 * Multi-Tenant Database Manager
 * Creates and manages isolated databases for each tenant
 * Ensures complete data isolation between tenants
 */

const mysql = require('mysql2/promise');

class TenantDatabaseManager {
  constructor(masterConfig) {
    this.masterConfig = masterConfig;
  }

  /**
   * Create a new tenant database
   * Called when a new tenant is registered
   */
  async createTenantDatabase(tenantId, tenantName) {
    const connection = await mysql.createConnection(this.masterConfig);
    
    try {
      const dbName = `restpoint_tenant_${tenantId}`;
      const dbUser = `tenant_${tenantId}`;
      const dbPassword = this.generateSecurePassword();

      // Create database
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);

      // Create dedicated user with limited permissions
      await connection.query(
        `CREATE USER IF NOT EXISTS '${dbUser}'@'%' IDENTIFIED BY '${dbPassword}'`
      );

      // Grant privileges only to this tenant's database
      await connection.query(
        `GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'%'`
      );

      await connection.query('FLUSH PRIVILEGES');

      // Initialize schema
      await this.initializeTenantSchema(dbName, connection);

      return {
        success: true,
        tenantId,
        database: dbName,
        user: dbUser,
        password: dbPassword,
        host: this.masterConfig.host,
        port: this.masterConfig.port
      };
    } finally {
      await connection.end();
    }
  }

  /**
   * Initialize tenant database schema
   */
  async initializeTenantSchema(dbName, connection) {
    const schema = `
      USE \`${dbName}\`;

      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tenant_id VARCHAR(255) NOT NULL,
        operation_start_time TIME DEFAULT '08:00:00',
        operation_end_time TIME DEFAULT '17:00:00',
        max_daily_deceased INT DEFAULT 10,
        enable_embalming BOOLEAN DEFAULT TRUE,
        enable_cremation BOOLEAN DEFAULT FALSE,
        enable_chapel BOOLEAN DEFAULT TRUE,
        custom_branding JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mortuary_operations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        operation_name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS deceased_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        date_of_death DATETIME NOT NULL,
        mortuary_operation_id INT,
        status ENUM('received', 'processed', 'released') DEFAULT 'received',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mortuary_operation_id) REFERENCES mortuary_operations(id)
      );
    `;

    // Execute schema creation
    for (const statement of schema.split(';')) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
  }

  /**
   * Get tenant connection details (without exposing password)
   */
  async getTenantConnection(tenantId) {
    // In production, fetch from secure vault
    // For now, reconstruct from stored credentials
    return {
      host: this.masterConfig.host,
      port: this.masterConfig.port,
      database: `restpoint_tenant_${tenantId}`,
      user: `tenant_${tenantId}`,
      // Password should come from secure vault, NOT here
    };
  }

  /**
   * Delete tenant database (irreversible - requires confirmation)
   */
  async deleteTenantDatabase(tenantId, confirmationCode) {
    if (confirmationCode !== this.generateDeletionCode(tenantId)) {
      throw new Error('Invalid deletion confirmation code');
    }

    const connection = await mysql.createConnection(this.masterConfig);
    
    try {
      const dbName = `restpoint_tenant_${tenantId}`;
      const dbUser = `tenant_${tenantId}`;

      // Drop user first
      await connection.query(`DROP USER IF EXISTS '${dbUser}'@'%'`);

      // Drop database
      await connection.query(`DROP DATABASE IF NOT EXISTS \`${dbName}\``);

      await connection.query('FLUSH PRIVILEGES');

      return { success: true, message: `Tenant ${tenantId} database deleted` };
    } finally {
      await connection.end();
    }
  }

  /**
   * Generate secure password
   */
  generateSecurePassword() {
    const length = 32;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Generate deletion confirmation code
   */
  generateDeletionCode(tenantId) {
    // In production, use proper confirmation flow with email verification
    const crypto = require('crypto');
    return crypto
      .createHash('sha256')
      .update(`${tenantId}-deletion-${process.env.DELETION_SECRET}`)
      .digest('hex');
  }
}

module.exports = TenantDatabaseManager;
