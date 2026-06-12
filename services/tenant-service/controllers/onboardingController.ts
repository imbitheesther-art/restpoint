import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export class TenantModel {
  
  static async registerTenant(data: {
    tenant_name: string;
    email: string;
    password: string;
    full_name: string;
    phone: string | null;
    location: string;
  }) {
    // Create database connection to master
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
    });

    try {
      // Generate slug and database name
      const slug = data.tenant_name.toLowerCase().replace(/\s+/g, '-');
      const dbName = `tenant_${slug}_${Date.now()}`;
      
      // Create database
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      
      // Insert into tenants table
      const [result] = await connection.execute(
        `INSERT INTO tenants (tenant_name, slug, db_name, email, location, status) 
         VALUES (?, ?, ?, ?, ?, 'active')`,
        [data.tenant_name, slug, dbName, data.email, data.location]
      );
      
      const tenantId = (result as any).insertId;
      
      // Create tenant database tables
      const tenantConn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: dbName
      });
      
      // Create users table
      await tenantConn.execute(`
        CREATE TABLE IF NOT EXISTS users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255),
          phone VARCHAR(20),
          role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
          is_active BOOLEAN DEFAULT TRUE,
          is_verified BOOLEAN DEFAULT FALSE,
          last_login_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Hash password and create admin user
      const hashedPassword = await bcrypt.hash(data.password, 10);
      await tenantConn.execute(
        `INSERT INTO users (email, password_hash, full_name, role, is_active, is_verified) 
         VALUES (?, ?, ?, 'admin', TRUE, TRUE)`,
        [data.email, hashedPassword, data.full_name]
      );
      
      await tenantConn.end();
      
      // Generate token
      const token = jwt.sign(
        { email: data.email, tenantId, tenantSlug: slug, role: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      return {
        tenant: {
          tenant_id: tenantId,
          tenant_name: data.tenant_name,
          tenant_slug: slug,
          db_name: dbName,
          email: data.email,
          location: data.location
        },
        token
      };
      
    } finally {
      await connection.end();
    }
  }
  
  static async findByEmail(email: string): Promise<any> {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'master_db'
    });
    
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM tenants WHERE email = ?',
        [email]
      );
      return (rows as any[])[0] || null;
    } finally {
      await connection.end();
    }
  }
  
  static async findById(id: number): Promise<any> {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'master_db'
    });
    
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM tenants WHERE tenant_id = ?',
        [id]
      );
      return (rows as any[])[0] || null;
    } finally {
      await connection.end();
    }
  }
  
  static async getTenantDatabase(tenantId: number): Promise<mysql.Connection | null> {
    const tenant = await this.findById(tenantId);
    if (!tenant) return null;
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: tenant.db_name
    });
    
    return connection;
  }
}