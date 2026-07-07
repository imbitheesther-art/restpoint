const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const mysql = require('mysql2/promise');

// Global fallback secrets
const GLOBAL_JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const GLOBAL_REFRESH_SECRET = process.env.REFRESH_SECRET || 'supersecretrefreshkey';

// ============================================
// CONNECTION POOL (CRITICAL FOR PERFORMANCE)
// ============================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// ============================================
// DATABASE HELPERS (USING POOL)
// ============================================

/**
 * Execute a query on the server (no database selected)
 */
const queryServer = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

/**
 * Execute a query on a specific tenant database
 */
const queryTenantDB = async (dbName, sql, params = []) => {
  const escapedDbName = `\`${dbName}\``;
  const qualifiedSQL = sql.replace(/FROM\s+users/gi, `FROM ${escapedDbName}.users`)
    .replace(/INTO\s+users/gi, `INTO ${escapedDbName}.users`)
    .replace(/UPDATE\s+users/gi, `UPDATE ${escapedDbName}.users`);
  const [rows] = await pool.query(qualifiedSQL, params);
  return rows;
};

// ============================================
// PER-TENANT JWT SECRETS
// ============================================

/**
 * Get tenant-specific JWT secrets from database
 */
const getTenantJwtSecret = async (tenantId) => {
  try {
    const [tenants] = await pool.query(
      'SELECT jwt_secret, refresh_secret FROM tenant_tracking.tenants WHERE tenant_id = ?',
      [tenantId]
    );

    if (tenants.length > 0 && tenants[0].jwt_secret) {
      return {
        jwtSecret: tenants[0].jwt_secret,
        refreshSecret: tenants[0].refresh_secret || tenants[0].jwt_secret
      };
    }
  } catch (error) {
    console.error('Error fetching tenant JWT secret:', error.message);
  }

  return {
    jwtSecret: GLOBAL_JWT_SECRET,
    refreshSecret: GLOBAL_REFRESH_SECRET
  };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Find tenant by email from tenant_tracking database
 */
const findTenantByEmail = async (email) => {
  console.log('🔍 Searching for tenant with email:', email);

  try {
    const [databases] = await pool.query(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'tenant_tracking'"
    );

    if (databases.length === 0) {
      console.log('tenant_tracking database not found');
      return null;
    }

    const [tenants] = await pool.query(
      `SELECT * FROM tenant_tracking.tenants 
       WHERE email = ? AND status = 'active'`,
      [email.toLowerCase()]
    );

    if (tenants.length > 0) {
      console.log('Tenant found:', tenants[0].tenant_name);
      return tenants[0];
    }

    console.log(' No tenant found for email:', email);
    return null;

  } catch (error) {
    console.error(' Error finding tenant:', error.message);
    return null;
  }
};

/**
 * NEW: Find tenant by searching for user email across ALL tenant databases
 */
const findTenantByUserEmail = async (email) => {
  console.log('Searching ALL tenants for user:', email);
  try {
    const [dbs] = await pool.query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'tenant_tracking'");
    if (dbs.length === 0) return null;
    const [tenants] = await pool.query("SELECT * FROM tenant_tracking.tenants WHERE status = 'active'");
    console.log('Checking ' + tenants.length + ' tenants for user: ' + email);
    for (const t of tenants) {
      try {
        const [users] = await pool.query('SELECT user_id FROM `' + t.db_name + '`.users WHERE email = ? AND is_active = 1 LIMIT 1', [email.toLowerCase()]);
        if (users.length > 0) {
          console.log('Found user in tenant:', t.tenant_name);
          return t;
        }
      } catch (e) { continue; }
    }
    return null;
  } catch (e) { return null; }
};

/**
 * Find user in tenant database
 */
const findUserInTenantDB = async (dbName, email) => {
  try {
    const rows = await queryTenantDB(dbName,
      `SELECT * FROM users WHERE email = ?`,
      [email.toLowerCase()]
    );

    if (rows.length > 0) {
      return rows[0];
    }
    return null;
  } catch (error) {
    console.error('Error finding user in tenant DB:', error.message);
    return null;
  }
};

/**
 * Generate JWT tokens with per-tenant secrets
 * @param {Object} user - User object from database
 * @param {Object} tenant - Tenant object from tenant_tracking
 * @param {string|null} [branchSlug=null] - Branch slug to use as tenantSlug if user belongs to a branch
 */
const generateTokens = async (user, tenant, branchSlug = null) => {
  const effectiveSlug = branchSlug || tenant.tenant_slug;

  const payload = {
    userId: user.user_id,
    email: user.email,
    tenantId: tenant.tenant_id,
    tenantName: tenant.tenant_name,
    tenantSlug: effectiveSlug,
    dbName: tenant.db_name,
    role: user.role || 'admin',
    branchSlug: branchSlug // Store branch slug separately for middleware use
  };

  const { jwtSecret, refreshSecret } = await getTenantJwtSecret(tenant.tenant_id);

  const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '30d' });

  return { accessToken, refreshToken };
};

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * @route POST /login
 * @desc Login user - accepts both 'email' and 'identifier' fields
 * @body { email or identifier, password }
 */
exports.login = asyncHandler(async (req, res) => {
  const emailInput = req.body.email || req.body.identifier;
  const { password } = req.body;

  // Validation
  if (!emailInput || !validator.isEmail(emailInput)) {
    console.log(' Invalid email format:', emailInput);
    return res.status(400).json({
      success: false,
      message: 'Valid email is required'
    });
  }

  if (!password || password.length < 6) {
    console.log('Invalid password length');
    return res.status(400).json({
      success: false,
      message: 'Password is required and must be at least 6 characters'
    });
  }

  try {
    // Step 1: Find tenant by email from tracking database
    let tenant = await findTenantByEmail(emailInput);

    // If tenant not found by tenant email, search for user across all tenants
    if (!tenant) {
      console.log('Not found as tenant email, searching ALL tenant databases...');
      tenant = await findTenantByUserEmail(emailInput);
    }

    if (!tenant) {
      console.log('No tenant found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Step 2: Find user in tenant's database
    const user = await findUserInTenantDB(tenant.db_name, emailInput);

    if (!user) {
      console.log(' No user found in tenant database');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log(`User found: ${user.full_name}`);
    console.log(` Verifying password...`);

    // Step 3: Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log(' Password verified');

    // Step 4: Update last login
    try {
      await queryTenantDB(tenant.db_name,
        `UPDATE users SET last_login_at = NOW() WHERE user_id = ?`,
        [user.user_id]
      );
      console.log(' Last login updated');
    } catch (error) {
      console.warn('Could not update last login:', error.message);
    }

    // Step 5: Get branch information and validate branch assignment
    let branchId = user.branch_id || null;
    let branchSlug = null;
    let dbName = tenant.db_name; // Default to primary DB

    if (branchId) {
      try {
        const escapedDbName = `\`${tenant.db_name}\``;
        const [branches] = await pool.query(
          `SELECT branch_slug, branch_db_name FROM ${escapedDbName}.branches WHERE branch_id = ? AND is_active = 1`,
          [branchId]
        );
        if (branches.length > 0) {
          branchSlug = branches[0].branch_slug;
          dbName = branches[0].branch_db_name || tenant.db_name;
        } else {
          console.warn(`User ${user.user_id} assigned to invalid/inactive branch ${branchId}`);
          branchId = null;
          branchSlug = null;
          dbName = tenant.db_name;
        }
      } catch (branchErr) {
        console.warn('Could not fetch branch info:', branchErr.message);
      }
    }

    // Step 5.5: Get deployment type from tenant (Ensure it checks the runtime state value or fallback)
    let deploymentType = tenant.deployment_type || 'single';
    try {
      const [tenantRows] = await pool.query(
        `SELECT deployment_type FROM tenant_tracking.tenants WHERE tenant_id = ?`,
        [tenant.tenant_id]
      );
      if (tenantRows.length > 0 && tenantRows[0].deployment_type) {
        deploymentType = tenantRows[0].deployment_type;
      }
    } catch (err) {
      console.warn('Could not fetch deployment type:', err.message);
    }

    // Step 6: Generate tokens with per-tenant secrets
    // Pass branchSlug so JWT payload uses the branch slug as effective tenant slug
    const { accessToken, refreshToken } = await generateTokens(user, tenant, branchSlug);

    // Step 7: Determine effective slug for navigation
    // If user belongs to a branch, use branchSlug as the primary slug
    const effectiveSlug = branchSlug || tenant.tenant_slug;

    // Step 8: Return response
    console.log(' Login successful!\n');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      deploymentType,
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone || "",
        role: user.role,
        branchId: branchId,
        branchSlug: branchSlug,
        dbName: dbName,
        isActive: user.is_active === 1,
        isVerified: user.is_verified === 1
      },
      tenant: {
        tenantId: tenant.tenant_id,
        tenantName: tenant.tenant_name,
        tenantSlug: effectiveSlug,
        dbName: tenant.db_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /register
 */
exports.register = asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Please use /api/onboarding/organization endpoint for registration'
  });
});

/**
 * @route POST /users
 */
exports.createUser = asyncHandler(async (req, res) => {
  const { email, password, full_name, phone, role } = req.body;
  const tenantDbName = req.user.dbName;
  const tenantId = req.user.tenantId;

  if (!tenantDbName) {
    return res.status(400).json({
      success: false,
      message: 'Tenant database not found in token'
    });
  }

  if (!email || !password || !full_name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and full name are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  try {
    const existingUser = await findUserInTenantDB(tenantDbName, email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await queryTenantDB(tenantDbName,
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_active, is_verified) 
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [email.toLowerCase(), password_hash, full_name, phone || null, role || 'staff']
    );

    const newUser = await findUserInTenantDB(tenantDbName, email);

    console.log(`✅ User created: ${email} in tenant ${tenantDbName}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        userId: newUser.user_id,
        email: newUser.email,
        fullName: newUser.full_name,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.is_active === 1,
        isVerified: newUser.is_verified === 1
      }
    });

  } catch (error) {
    console.error(' Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /refresh
 */
exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, GLOBAL_REFRESH_SECRET);
    const { jwtSecret, refreshSecret } = await getTenantJwtSecret(decoded.tenantId);
    const verified = jwt.verify(refreshToken, refreshSecret);

    const [tenants] = await pool.query(
      `SELECT * FROM tenant_tracking.tenants WHERE tenant_id = ? AND status = 'active'`,
      [verified.tenantId]
    );

    if (tenants.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tenant not found or inactive'
      });
    }

    const tenant = tenants[0];

    const rows = await queryTenantDB(tenant.db_name,
      `SELECT * FROM users WHERE user_id = ? AND is_active = 1`,
      [verified.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    const user = rows[0];

    // Fetch branch slug if user belongs to a branch
    let branchSlug = null;
    if (user.branch_id) {
      try {
        const escapedDbName = `\`${tenant.db_name}\``;
        const [branches] = await pool.query(
          `SELECT branch_slug FROM ${escapedDbName}.branches WHERE branch_id = ? AND is_active = 1`,
          [user.branch_id]
        );
        if (branches.length > 0) {
          branchSlug = branches[0].branch_slug;
        }
      } catch (branchErr) {
        console.warn('Could not fetch branch info during refresh:', branchErr.message);
      }
    }

    const { accessToken } = await generateTokens(user, tenant, branchSlug);

    console.log(' Token refreshed');

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken
    });

  } catch (error) {
    console.error(' Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
});

/**
 * @route POST /logout
 */
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @route GET /me
 */
exports.getMe = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const { jwtSecret } = await getTenantJwtSecret(decoded.tenantId);
    const verified = jwt.verify(token, jwtSecret);

    res.status(200).json({
      success: true,
      user: {
        userId: verified.userId,
        email: verified.email,
        tenantId: verified.tenantId,
        tenantName: verified.tenantName,
        role: verified.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});