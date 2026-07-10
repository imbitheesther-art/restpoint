const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const GLOBAL_JWT_SECRET = process.env.JWT_SECRET;
const GLOBAL_REFRESH_SECRET = process.env.REFRESH_SECRET;

// Validate that secrets are configured
if (!GLOBAL_JWT_SECRET || !GLOBAL_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and REFRESH_SECRET must be set in environment variables');
}

// ============================================
// SHARED CONNECTION POOL (imported from authController)
// ============================================
// Import the shared pool from authController to avoid duplicate connections
let pool;
try {
  const authController = require('../controllers/authController');
  pool = authController.pool;
} catch (e) {
  // Fallback: create pool if import fails (should not happen in normal operation)
  console.warn('Could not import shared pool from authController, creating new pool');
  pool = mysql.createPool({
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
}

/**
 * Get tenant-specific JWT secret from database
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

  // Fallback to global secret if tenant-specific not found
  return {
    jwtSecret: GLOBAL_JWT_SECRET,
    refreshSecret: GLOBAL_REFRESH_SECRET
  };
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }

  try {
    // Step 1: Decode token to get tenantId (using global secret for initial decode)
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Step 2: Get tenant-specific JWT secret
    const { jwtSecret } = await getTenantJwtSecret(decoded.tenantId);

    // Step 3: Verify token with tenant-specific secret
    const verified = jwt.verify(token, jwtSecret);

    // Step 4: Attach user info to request (including tenant info)
    req.user = {
      ...verified,
      // Ensure dbName is available for user creation
      dbName: decoded.dbName,
      tenantId: decoded.tenantId,
      tenantSlug: decoded.tenantSlug
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };