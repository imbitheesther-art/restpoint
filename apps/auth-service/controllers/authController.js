const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const mysql = require('mysql2/promise');
const Tenant = require('../models/tenantModel');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'supersecretrefreshkey';

// ============================================
// DATABASE CONNECTIONS
// ============================================

// Get master DB connection
const getMasterConnection = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'master_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 20,
  });
  return connection;
};

// Get tenant DB connection
const getTenantConnection = async (dbName) => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 20,
  });
  return connection;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Find tenant by email across all tenant databases
 * Returns: { tenant_info, user_info, dbName }
 */
const findTenantAndUserByEmail = async (email) => {
  console.log('🔍 Searching for tenant with email:', email);
  
  try {
    // Step 1: Query master_db.tenants to get all active tenants
    const masterConn = await getMasterConnection();
    const [tenants] = await masterConn.execute(
      `SELECT * FROM tenants WHERE status = 'active'`
    );
    await masterConn.end();
    
    console.log(`📊 Checking ${tenants.length} active tenants...`);
    
    // Step 2: For each tenant, check their database for the user
    for (const tenant of tenants) {
      try {
        const tenantConn = await getTenantConnection(tenant.db_name);
        const [users] = await tenantConn.execute(
          `SELECT * FROM users WHERE email = ? AND is_active = 1`,
          [email.toLowerCase()]
        );
        
        if (users.length > 0) {
          const user = users[0];
          console.log('✅ Found user in tenant:', tenant.tenant_name);
          await tenantConn.end();
          
          return {
            tenant: tenant,
            user: user,
            dbName: tenant.db_name
          };
        }
        
        await tenantConn.end();
      } catch (error) {
        console.error(`⚠️  Error checking tenant ${tenant.tenant_name}:`, error.message);
        // Continue to next tenant
        continue;
      }
    }
    
    console.log('❌ No tenant found for email:', email);
    return null;
    
  } catch (error) {
    console.error('❌ Error finding tenant by email:', error.message);
    throw error;
  }
};

/**
 * Generate JWT token
 */
const generateTokens = (user, tenant) => {
  const payload = {
    userId: user.user_id,
    email: user.email,
    tenantId: tenant.tenant_id,
    tenantName: tenant.tenant_name,
    dbName: tenant.db_name,
    role: user.role || 'staff'
  };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
  
  return { accessToken, refreshToken };
};

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * @route POST /login
 * @desc Login user
 * @body { email or identifier, password }
 */
exports.login = asyncHandler(async (req, res) => {
  // Accept both 'email' and 'identifier' fields
  const emailInput = req.body.email || req.body.identifier;
  const { password } = req.body;
  
  console.log('\n========== LOGIN REQUEST ==========');
  console.log(`📧 Email/Identifier: ${emailInput}`);
  
  // Validation
  if (!emailInput || !validator.isEmail(emailInput)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Valid email is required' 
    });
  }
  
  if (!password || password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password is required' 
    });
  }
  
  try {
    // Step 1: Find tenant and user by email
    const result = await findTenantAndUserByEmail(emailInput);
    
    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const { tenant, user, dbName } = result;
    
    // Step 2: Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Step 3: Update last login
    try {
      const tenantConn = await getTenantConnection(dbName);
      await tenantConn.execute(
        `UPDATE users SET last_login_at = NOW() WHERE user_id = ?`,
        [user.user_id]
      );
      await tenantConn.end();
    } catch (error) {
      console.warn('⚠️  Could not update last_login_at:', error.message);
    }
    
    // Step 4: Generate tokens
    const { accessToken, refreshToken } = generateTokens(user, tenant);
    
    // Step 5: Return response
    console.log('✅ Login successful');
    console.log(`🎫 Tenant: ${tenant.tenant_name}`);
    console.log(`👤 User: ${user.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      tenantId: tenant.tenant_id,
      tenantSlug: tenant.slug,
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      tenant: {
        tenantId: tenant.tenant_id,
        tenantName: tenant.tenant_name,
        slug: tenant.slug,
        dbName: tenant.db_name
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /register
 * @desc Register new tenant and admin user
 * @body { organizationName, email, password, fullName }
 */
exports.register = asyncHandler(async (req, res) => {
  const { organizationName, email, password, fullName } = req.body;
  
  console.log('\n========== REGISTRATION REQUEST ==========');
  console.log(`🏢 Organization: ${organizationName}`);
  console.log(`📧 Email: ${email}`);
  
  // Validation
  if (!organizationName || organizationName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Organization name is required'
    });
  }
  
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Valid email is required'
    });
  }
  
  if (!password || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters'
    });
  }
  
  try {
    // Step 1: Create tenant in master_db
    const masterConn = await getMasterConnection();
    
    // Generate slug
    const slug = organizationName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const dbName = `mortuary_${slug}_${Date.now()}`;
    
    console.log(`📁 Database name: ${dbName}`);
    console.log(`🏷️  Slug: ${slug}`);
    
    // Insert into master_db.tenants
    const [tenantResult] = await masterConn.execute(
      `INSERT INTO tenants (tenant_name, slug, db_name, email, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [organizationName, slug, dbName, email.toLowerCase()]
    );
    
    const tenantId = tenantResult.insertId;
    console.log(`✅ Tenant created with ID: ${tenantId}`);
    
    // Step 2: Create tenant database
    console.log(`🛠️  Creating database...`);
    await masterConn.execute(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Database created`);
    
    // Step 3: Create tables in tenant database
    console.log(`📋 Creating tables...`);
    const tenantConn = await getTenantConnection(dbName);
    
    // Create users table
    await tenantConn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        phone VARCHAR(20),
        role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
        is_active TINYINT(1) DEFAULT 1,
        is_verified TINYINT(1) DEFAULT 0,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create refresh_tokens table
    await tenantConn.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        token_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create mortuary_settings table
    await tenantConn.execute(`
      CREATE TABLE IF NOT EXISTS mortuary_settings (
        setting_id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL,
        setting_value LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_setting_key (setting_key),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log(`✅ Tables created`);
    
    // Step 4: Create admin user
    console.log(`🔐 Creating admin user...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await tenantConn.execute(
      `INSERT INTO users (email, password_hash, full_name, role, is_active, is_verified)
       VALUES (?, ?, ?, 'admin', 1, 1)`,
      [email.toLowerCase(), hashedPassword, fullName || organizationName]
    );
    
    console.log(`✅ Admin user created`);
    
    await tenantConn.end();
    await masterConn.end();
    
    // Step 5: Return success
    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      tenant: {
        tenantId,
        tenantName: organizationName,
        slug,
        dbName,
        email
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /refresh
 * @desc Refresh access token
 * @body { refreshToken }
 */
exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  console.log('\n========== REFRESH TOKEN REQUEST ==========');
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    
    // Find user in tenant database
    const tenantConn = await getTenantConnection(decoded.dbName);
    const [users] = await tenantConn.execute(
      `SELECT * FROM users WHERE user_id = ? AND is_active = 1 AND deleted_at IS NULL`,
      [decoded.userId]
    );
    await tenantConn.end();
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }
    
    const user = users[0];
    
    // Find tenant
    const masterConn = await getMasterConnection();
    const [tenants] = await masterConn.execute(
      `SELECT * FROM tenants WHERE tenant_id = ?`,
      [decoded.tenantId]
    );
    await masterConn.end();
    
    if (tenants.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tenant not found'
      });
    }
    
    const tenant = tenants[0];
    
    // Generate new token
    const { accessToken } = generateTokens(user, tenant);
    
    console.log('✅ Token refreshed');
    
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken
    });
    
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
});

/**
 * @route POST /logout
 * @desc Logout user
 * @body { refreshToken }
 */
exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  console.log('\n========== LOGOUT REQUEST ==========');
  
  // In a real app, you'd invalidate the refresh token in DB
  // For now, just return success
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});
