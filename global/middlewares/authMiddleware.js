/**
 * Shared Authentication Middleware
 * Use this in ALL microservices to protect routes
 * 
 * Usage:
 *   const { protect, authorize } = require('../../global/middlewares/authMiddleware');
 *   
 *   // Protect a route (requires valid JWT)
 *   router.get('/profile', protect, getProfile);
 *   
 *   // Authorize specific roles
 *   router.delete('/user/:id', protect, authorize('admin', 'superadmin'), deleteUser);
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required');
}

const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

/**
 * Protect middleware - verifies JWT token from Authorization header or cookie
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
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token is invalid or expired'
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

module.exports = {
  protect,
  authorize,
  optionalAuth
};