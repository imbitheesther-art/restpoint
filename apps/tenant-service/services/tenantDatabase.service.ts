import mysql, { Pool, PoolConnection } from 'mysql2';
import { masterDB } from '../config/masterDatabase';
import slugify from 'slugify';
import { Tenant, User } from '../types/database.types';

export interface TenantDatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export class TenantDatabaseService {
  private static instance: TenantDatabaseService;

  private constructor() {}

  public static getInstance(): TenantDatabaseService {
    if (!TenantDatabaseService.instance) {
      TenantDatabaseService.instance = new TenantDatabaseService();
    }
    return TenantDatabaseService.instance;
  }

  public generateSlug(tenantName: string): string {
    return slugify(tenantName, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }

  public async createTenantDatabase(tenantName: string, subdomain: string): Promise<{ dbName: string; connection: Pool }> {
    const dbName = `tenant_${subdomain}_${Date.now()}`.replace(/-/g, '_');
    
    // Create database
    await masterDB.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Created database: ${dbName}`);
    
    // Create connection pool for tenant database
    const connection = mysql.createPool({
      host: process.env.MASTER_DB_HOST || 'localhost',
      port: parseInt(process.env.MASTER_DB_PORT) || 3306,
      user: process.env.MASTER_DB_USER || 'root',
      password: process.env.MASTER_DB_PASSWORD || 'root',
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Create tables
    await this.createTenantTables(connection);
    
    return { dbName, connection };
  }

  private async createTenantTables(connection: Pool): Promise<void> {
    const queries = [
      // Users table
      `
        CREATE TABLE IF NOT EXISTS users (
          user_id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          role ENUM('super_admin', 'admin', 'manager', 'user') DEFAULT 'user',
          is_active BOOLEAN DEFAULT TRUE,
          is_verified BOOLEAN DEFAULT FALSE,
          last_login_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_role (role)
        )
      `,
      // Refresh tokens table
      `
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          token VARCHAR(500) NOT NULL,
          user_agent TEXT,
          ip_address VARCHAR(45),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          revoked_at TIMESTAMP NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_token (token(255))
        )
      `,
      // Login logs table
      `
        CREATE TABLE IF NOT EXISTS login_logs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT,
          identifier VARCHAR(255),
          success BOOLEAN DEFAULT FALSE,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_created_at (created_at)
        )
      `,
      // Settings table
      `
        CREATE TABLE IF NOT EXISTS settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `
    ];

    for (const query of queries) {
      await connection.promise().execute(query);
    }
    
    console.log('✅ Tenant tables created');
  }

  public async getTenantConnection(subdomain: string): Promise<{ connection: Pool; tenant: Tenant }> {
    const tenant = await masterDB.queryOne<Tenant>(
      'SELECT * FROM tenants WHERE tenant_slug = ? AND status = "active"',
      [subdomain]
    );
    
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    
    const connection = mysql.createPool({
      host: process.env.MASTER_DB_HOST || 'localhost',
      port: parseInt(process.env.MASTER_DB_PORT) || 3306,
      user: process.env.MASTER_DB_USER || 'root',
      password: process.env.MASTER_DB_PASSWORD || 'root',
      database: tenant.db_name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    return { connection, tenant };
  }
}

export const tenantDB = TenantDatabaseService.getInstance();