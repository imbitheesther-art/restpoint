/**
 * Auth Middleware - TypeScript
 * JWT verification with per-tenant secrets + role-based authorization
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

const GLOBAL_JWT_SECRET: string = process.env.JWT_SECRET || '';
const GLOBAL_REFRESH_SECRET: string = process.env.REFRESH_TOKEN_SECRET || '';

if (!GLOBAL_JWT_SECRET || !GLOBAL_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and REFRESH_TOKEN_SECRET must be set in environment variables');
}

// Reuse the pool from authController
let pool: mysql.Pool;
try {
  const { pool: sharedPool } = require('../controllers/authController');
  pool = sharedPool;
} catch {
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
const getTenantJwtSecret = async (
  tenantId: number
): Promise<{ jwtSecret: string; refreshSecret: string }> => {
  try {
    const [tenants]: any = await pool.query(
      'SELECT jwt_secret, refresh_secret FROM tenant_tracking.tenants WHERE tenant_id = ?',
      [tenantId]
    );
    if (tenants.length > 0 && tenants[0].jwt_secret) {
      return {
        jwtSecret: tenants[0].jwt_secret,
        refreshSecret: tenants[0].refresh_secret || tenants[0].jwt_secret,
      };
    }
  } catch (error: any) {
    console.error('Error fetching tenant JWT secret:', error.message);
  }
  return { jwtSecret: GLOBAL_JWT_SECRET, refreshSecret: GLOBAL_REFRESH_SECRET };
};

/**
 * Protect middleware - verifies JWT from Authorization header or cookie
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // Extract token: Authorization header first, then cookie
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
    return;
  }

  try {
    // Decode to get tenantId
    const decoded: any = jwt.decode(token);
    if (!decoded) {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    // Verify with tenant-specific secret
    const { jwtSecret } = await getTenantJwtSecret(decoded.tenantId);
    const verified: any = jwt.verify(token, jwtSecret);

    // Attach user info
    req.user = {
      ...verified,
      dbName: decoded.dbName,
      tenantId: decoded.tenantId,
      tenantSlug: decoded.tenantSlug,
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

/**
 * Authorize middleware - restricts access to certain roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};