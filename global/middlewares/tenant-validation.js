/**
 * @file global/middlewares/tenant-validation.js
 * Universal tenant validation middleware for all services (JS version)
 * 
 * Usage in any Express service:
 *   const { tenantMiddleware, requireTenant } = require('../../global/middlewares/tenant-validation');
 *   app.use('/api', tenantMiddleware);
 *   app.use('/api/v1/mpesa/mpesa-callback', requireTenant(false)); // optional tenant
 *   app.use('/api/v1/protected', requireTenant(true)); // required tenant
 */

const TENANT_HEADER = 'x-tenant-slug';

/**
 * Validates that x-tenant-slug header is present.
 * Use for all routes that require tenant context.
 */
function requireTenant(required = true) {
  return (req, res, next) => {
    const tenantSlug = req.headers[TENANT_HEADER] || req.headers[TENANT_HEADER.toLowerCase()];

    if (required && !tenantSlug) {
      return res.status(400).json({
        success: false,
        message: 'Missing x-tenant-slug header. This endpoint requires a tenant context.'
      });
    }

    if (tenantSlug && tenantSlug === 'system_shared') {
      return res.status(403).json({
        success: false,
        message: 'Invalid tenant: system_shared is reserved for internal use.'
      });
    }

    req.tenantSlug = tenantSlug || 'system_shared';
    next();
  };
}

/**
 * Full tenant validation middleware that also logs the tenant.
 */
function tenantMiddleware(req, res, next) {
  const tenantSlug = req.headers[TENANT_HEADER] || req.headers[TENANT_HEADER.toLowerCase()];

  if (!tenantSlug) {
    return res.status(400).json({
      success: false,
      message: 'Missing x-tenant-slug header. All API requests require a tenant context.'
    });
  }

  if (tenantSlug === 'system_shared') {
    return res.status(403).json({
      success: false,
      message: 'Invalid tenant: system_shared is reserved for internal use.'
    });
  }

  req.tenantSlug = tenantSlug;
  
  // Log the tenant for request tracking
  console.log(`[${req.method} ${req.path}] Tenant: ${tenantSlug}`);
  
  next();
}

/**
 * Auth validation: requires Bearer token in Authorization header.
 * Use for all protected routes.
 */
function requireAuth(allowedRoles = null) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide Bearer token in Authorization header.'
      });
    }

    try {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET;
      
      if (!JWT_SECRET) {
        console.error('FATAL: JWT_SECRET environment variable is required');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error'
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      req.user = decoded;

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${decoded.role}`
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  };
}

/**
 * Combined: Auth + Tenant validation in one call.
 */
function requireAuthAndTenant(allowedRoles = null) {
  return [requireAuth(allowedRoles), tenantMiddleware];
}

/**
 * Auth validation: requires only x-api-key header (simpler alternative).
 * Useful for service-to-service communication.
 */
function requireApiKey(required = true) {
  return (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (required && !apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required. Provide x-api-key header or api_key query parameter.'
      });
    }

    if (required && apiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    next();
  };
}

module.exports = {
  tenantMiddleware,
  requireTenant,
  requireAuth,
  requireAuthAndTenant,
  requireApiKey,
};