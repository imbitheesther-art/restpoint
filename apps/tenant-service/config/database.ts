import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool: mysql.Pool | null = null;

export const getPool = async (): Promise<mysql.Pool> => {
  if (!pool) {
    pool = await mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'montezuma',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
    console.log('✅ Database pool created');
  }
  return pool;
};

export const initDatabase = async (): Promise<void> => {
  const db = await getPool();
  
  // Create organizations table
  await db.query(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organizationName VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      location VARCHAR(255),
      logoUrl VARCHAR(500),
      isActive BOOLEAN DEFAULT TRUE,
      subscriptionPlan ENUM('basic', 'premium', 'enterprise') DEFAULT 'basic',
      subscriptionStatus ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
      termsAccepted BOOLEAN DEFAULT FALSE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_slug (slug)
    )
  `);

  // Create users table
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organizationId INT NOT NULL,
      email VARCHAR(255) NOT NULL,
      passwordHash VARCHAR(255) NOT NULL,
      fullName VARCHAR(255),
      role ENUM('admin', 'user', 'viewer') DEFAULT 'user',
      isActive BOOLEAN DEFAULT TRUE,
      isVerified BOOLEAN DEFAULT FALSE,
      lastLogin DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
      UNIQUE KEY unique_email_per_org (organizationId, email),
      INDEX idx_email (email)
    )
  `);

  // Create sessions table
  await db.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      token VARCHAR(500) NOT NULL,
      ipAddress VARCHAR(45),
      userAgent TEXT,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_token (token(255)),
      INDEX idx_expiresAt (expiresAt)
    )
  `);

  console.log('✅ Database tables initialized');
};

export default { getPool, initDatabase };
