

const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const GLOBAL_JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
if (!GLOBAL_JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required');
}

const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Create a root pool for tenant secret lookups (lazy init)
let rootPool = null;
const getRootPool = () => {
  if (!rootPool) {
    rootPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  }
  return rootPool;
};

/**
 * Try to verify a JWT token, falling back through multiple secrets
 * @param {string} token - The JWT token to verify
 * @returns {{ decoded: Object|null, error: string|null }}
 */
const verifyTokenWithFallback = async (token) => {
  // First try: global JWT_SECRET
  try {
    const decoded = jwt.verify(token, GLOBAL_JWT_SECRET);
    return { decoded, error: null };
  } catch (e) {
    // Continue to try tenant-specific secrets
  }

  // Second try: decode without verification to get tenantId, then look up tenant secret
  try {
    const payload = jwt.decode(token);
    if (payload && payload.tenantId) {
      const pool = getRootPool();
      const [columns] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = 'tenant_tracking' AND TABLE_NAME = 'tenants' AND COLUMN_NAME = 'jwt_secret'`
      );

      if (columns && columns.length > 0) {
        const [tenants] = await pool.query(
          'SELECT jwt_secret FROM tenant_tracking.tenants WHERE id = ?',
          [payload.tenantId]
        );
        if (tenants.length > 0 && tenants[0].jwt_secret) {
          try {
            const decoded = jwt.verify(token, tenants[0].jwt_secret);
            return { decoded, error: null };
          } catch (e) {
            // Tenant secret also failed
          }
        }
      }
    }
  } catch (e) {
    // Could not decode token
  }

  return { decoded: null, error: 'Token invalid or expired' };
};

/**
 * Protect middleware - verifies JWT token from Authorization header or cookie
 * Tries global JWT_SECRET first, then per-tenant secrets
 * Attaches user payload to req.user
 */
const protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Get token from cookies
  else if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  try {
    const { decoded, error } = await verifyTokenWithFallback(token);
    if (decoded) {
      req.user = decoded;
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized, token is invalid or expired'
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token verification failed'
    });
  }
};

/**
 * Authorize middleware - checks if user has required role
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'superadmin', 'tenant')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no user context'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
        requiredRoles: roles
      });
    }

    next();
  };
};

/**
 * Optional auth - attaches user if token present, but doesn't block if missing
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid, but we continue anyway (optional auth)
    }
  }

  next();
};

/**
 * List of all valid roles in the system
 */
const ALL_ROLES = [
  'admin',
  'superadmin',
  'systemadmin',
  'staff',
  'user',
  'manager',
  'director',
  'mortician',
  'driver',
  'tenant'
];

/**
 * Authorize any authenticated user (any role) - fastest for broad access
 */
const authorizeAny = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no user context'
    });
  }
  next();
};

module.exports = {
  protect,
  authorize,
  authorizeAny,
  optionalAuth,
  ALL_ROLES
};
