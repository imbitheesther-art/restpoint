import { masterDB, masterExecute, masterQueryOne } from '../config/masterDatabase';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2';
import slugify from 'slugify';

export interface RegisterTenantData {
  tenant_name: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  location?: string;
}

export interface Tenant {
  tenant_id: number;
  tenant_name: string;
  tenant_slug: string;
  db_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  logo_url: string | null;
  status: 'active' | 'suspended' | 'deleted';
  subscription_status: 'active' | 'trial' | 'suspended' | 'cancelled';
  subscription_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function generateSlug(tenantName: string): string {
  return slugify(tenantName, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
    trim: true
  });
}

async function createTenantDatabase(tenantName: string, subdomain: string): Promise<{ dbName: string; connection: mysql.Pool }> {
  const dbName = `mortuary_${subdomain}_${Date.now()}`.replace(/-/g, '_');
  
  console.log(`📦 Creating database: ${dbName}`);
  
  await masterDB.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`✅ Database created: ${dbName}`);
  
  const connection = mysql.createPool({
    host: process.env.MASTER_DB_HOST || 'localhost',
    port: parseInt(process.env.MASTER_DB_PORT || '3306'),
    user: process.env.MASTER_DB_USER || 'root',
    password: process.env.MASTER_DB_PASSWORD || 'root',
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      user_id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
      is_active BOOLEAN DEFAULT TRUE,
      is_verified BOOLEAN DEFAULT FALSE,
      last_login_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email)
    )`,
    `CREATE TABLE IF NOT EXISTS refresh_tokens (
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
    )`,
    `CREATE TABLE IF NOT EXISTS mortuary_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  ];

  for (const query of queries) {
    await connection.promise().execute(query);
  }
  
  await connection.promise().execute(
    `INSERT INTO mortuary_settings (setting_key, setting_value) VALUES 
     ('mortuary_name', ?),
     ('subdomain', ?),
     ('timezone', 'Africa/Nairobi'),
     ('currency', 'KES')`,
    [tenantName, subdomain]
  );
  
  console.log('✅ Tenant tables created');
  
  return { dbName, connection };
}

export class TenantModel {
  static async registerTenant(data: RegisterTenantData): Promise<{ tenant: Tenant; token: string }> {
    const { tenant_name, email, password, full_name, phone, location } = data;
    
    const subdomain = generateSlug(tenant_name);
    
    // Check if tenant_slug exists - remove the generic type
    const existing = await masterQueryOne(
      'SELECT tenant_id FROM tenants WHERE tenant_slug = ?',
      [subdomain]
    );
    
    if (existing) {
      throw new Error('Tenant slug already exists');
    }
    
    const password_hash = await bcrypt.hash(password, 10);
    const { dbName, connection } = await createTenantDatabase(tenant_name, subdomain);
    
    const result = await masterExecute(
      `INSERT INTO tenants (tenant_name, tenant_slug, db_name, email, phone, location, status, subscription_status)
       VALUES (?, ?, ?, ?, ?, ?, 'active', 'trial')`,
      [tenant_name, subdomain, dbName, email, phone || null, location || null]
    );
    
    const tenantId = result.insertId;
    
    await connection.promise().execute(
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_verified)
       VALUES (?, ?, ?, ?, 'admin', 1)`,
      [email, password_hash, full_name, phone || null]
    );
    
    await connection.end();
    
    // Get the created tenant - remove the generic type
    const tenant = await masterQueryOne(
      'SELECT * FROM tenants WHERE tenant_id = ?',
      [tenantId]
    );
    
    if (!tenant) {
      throw new Error('Failed to create tenant');
    }
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        userId: 1, // Will be populated from tenant DB
        tenantId: tenant.tenant_id,
        tenantSlug: tenant.tenant_slug,
        email: email,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log(`✅ Tenant registered: ${tenant_name} (${tenant.tenant_slug})`);
    console.log(`📁 Database: ${dbName}`);
    console.log(`🔐 Tenant ID: ${tenant.tenant_id}`);
    
    return { tenant: tenant as Tenant, token };
  }
  
  static async findBySubdomain(slug: string): Promise<Tenant | null> {
    const result = await masterQueryOne(
      'SELECT * FROM tenants WHERE tenant_slug = ? AND status = "active"',
      [slug]
    );
    return result as Tenant | null;
  }
  
  static async findById(tenantId: number): Promise<Tenant | null> {
    const result = await masterQueryOne(
      'SELECT * FROM tenants WHERE tenant_id = ?',
      [tenantId]
    );
    return result as Tenant | null;
  }
  
  static async findByEmail(email: string): Promise<Tenant | null> {
    const result = await masterQueryOne(
      'SELECT * FROM tenants WHERE email = ? AND status = "active"',
      [email]
    );
    return result as Tenant | null;
  }
  
  static async updateStatus(tenantId: number, status: 'active' | 'suspended' | 'deleted'): Promise<void> {
    await masterExecute(
      'UPDATE tenants SET status = ?, updated_at = NOW() WHERE tenant_id = ?',
      [status, tenantId]
    );
  }
  
  static async getAllTenants(): Promise<Tenant[]> {
    const result = await masterDB.query(
      'SELECT tenant_id, tenant_name, tenant_slug, email, status, created_at FROM tenants ORDER BY created_at DESC'
    );
    return result as Tenant[];
  }
}