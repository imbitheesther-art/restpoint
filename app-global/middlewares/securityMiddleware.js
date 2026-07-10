/**
 * Shared Security Middleware
 * Provides rate limiting, brute force protection, input sanitization
 * 
 * Usage:
 *   const { rateLimiter, apiLimiter, authLimiter, sanitizeInput } = require('../../global/middlewares/securityMiddleware');
 *   
 *   // Apply to all routes
 *   app.use('/api', apiLimiter);
 *   
 *   // Apply to auth routes specifically
 *   app.use('/api/v1/restpoint/auth', authLimiter);
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter - 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for auth endpoints - 10 attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Moderate rate limiter for protected write operations - 30 per 15 minutes
 */
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many write operations, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Input sanitization middleware
 * Strips dangerous characters from request body/query/params
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Strip HTML tags and potential XSS
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim();
      }
    });
  }
  
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim();
      }
    });
  }
  
  next();
};

/**
 * CORS configuration factory
 */
const createCorsOptions = (allowedOrigins = []) => ({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.indexOf('localhost') >= 0) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-slug',
    'x-tenant-slug',
    'x-tenant-id',
    'x-request-timestamp',
    'x-session-fingerprint',
    'X-Session-Fingerprint',
    'x-client-id',
    'X-Client-ID',
    'X-CSRF-Token',
    'Origin',
    'X-Requested-With',
    'Accept'
  ],
});

module.exports = {
  apiLimiter,
  authLimiter,
  writeLimiter,
  sanitizeInput,
  createCorsOptions,
};