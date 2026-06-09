/**
 * @file shared/tenantMiddleware.ts
 * PRODUCTION-READY: Tenant identification and validation middleware
 *
 * KEY FEATURES:
 * - Extracts tenant info from JWT token
 * - Validates tenant is active
 * - Adds tenantId and tenantSlug to request
 * - Automatically connects to tenant database
 * - Handles missing/invalid tenant gracefully
 *
 * USAGE IN SERVICES:
 * import { tenantMiddleware } from '../shared/tenantMiddleware';
 * app.use(tenantMiddleware);
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, ErrorCode, asyncHandler } from './errorHandling';
import { safeMasterQueryOne, getTenantDB } from './dbConfig';

// ============================================================
// TYPES
// ============================================================

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      tenantId?: number;
      tenantSlug?: string;
      email?: string;
      role?: string;
      tenantDbName?: string;
    }
  }
}

interface JWTPayload {
  userId: number;
  tenantId: number;
  tenantSlug: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface TenantRecord {
  tenant_id: number;
  tenant_slug: string;
  db_name: string;
  status: 'active' | 'suspended' | 'deleted';
}

// ============================================================
// MIDDLEWARE
// ============================================================

/**
 * Extract and validate JWT token
 */
function extractToken(req: Request): string | null {
  // Try Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
}

/**
 * Verify JWT and extract tenant info
 */
function verifyJWT(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET not configured');
      return null;
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('⚠️  JWT token expired');
      return null;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.warn('⚠️  Invalid JWT token:', (error as any).message);
      return null;
    }
    console.error('❌ JWT verification error:', error);
    return null;
  }
}

/**
 * Main tenant middleware - attach to all protected routes
 */
export const tenantMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract token
      const token = extractToken(req);
      if (!token) {
        throw new AppError(
          'Missing authentication token',
          401,
          ErrorCode.UNAUTHORIZED
        );
      }

      // Verify JWT
      const payload = verifyJWT(token);
      if (!payload) {
        throw new AppError(
          'Invalid or expired token',
          401,
          ErrorCode.TOKEN_INVALID
        );
      }

      // Attach to request
      req.userId = payload.userId;
      req.tenantId = payload.tenantId;
      req.tenantSlug = payload.tenantSlug;
      req.email = payload.email;
      req.role = payload.role;

      // Validate tenant exists and is active
      const tenant = await safeMasterQueryOne<TenantRecord>('SELECT * FROM tenants WHERE tenant_id = ?', [\n        payload.tenantId,
      ]);

      if (!tenant) {
        throw new AppError(
          'Tenant not found',
          404,
          ErrorCode.TENANT_NOT_FOUND
        );
      }

      if (tenant.status !== 'active') {
        throw new AppError(
          `Tenant is ${tenant.status}`,
          403,
          ErrorCode.FORBIDDEN
        );
      }

      // Verify tenant_slug matches (security check)
      if (tenant.tenant_slug !== payload.tenantSlug) {
        console.warn(
          `⚠️  Tenant slug mismatch: token=${payload.tenantSlug}, db=${tenant.tenant_slug}`
        );
        throw new AppError(
          'Tenant slug mismatch',
          401,
          ErrorCode.UNAUTHORIZED
        );
      }

      // Attach tenant database name
      req.tenantDbName = tenant.db_name;

      // Pre-connect to tenant database (fail gracefully)
      try {
        const pool = await getTenantDB(tenant.db_name);
        const conn = await pool.getConnection();
        conn.release();
      } catch (error) {
        console.error(`⚠️  Cannot connect to tenant DB ${tenant.db_name}:`, error);
        throw new AppError(
          'Tenant database unavailable',
          503,
          ErrorCode.SERVICE_UNAVAILABLE
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'Tenant validation failed',
        500,
        ErrorCode.INTERNAL_ERROR
      );
    }
  }
);

/**
 * Optional tenant middleware - doesn't throw on missing token
 * Used for public routes that can work with or without auth
 */
export const optionalTenantMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);
      if (!token) {
        // No token is OK
        return next();
      }

      const payload = verifyJWT(token);
      if (!payload) {
        // Invalid token, just continue without tenant context
        return next();
      }

      // Attach to request
      req.userId = payload.userId;
      req.tenantId = payload.tenantId;
      req.tenantSlug = payload.tenantSlug;
      req.email = payload.email;
      req.role = payload.role;

      // Validate tenant (but don't fail the request)
      try {
        const tenant = await safeMasterQueryOne<TenantRecord>(
          'SELECT * FROM tenants WHERE tenant_id = ?',
          [payload.tenantId]
        );

        if (tenant && tenant.status === 'active') {
          req.tenantDbName = tenant.db_name;
        }
      } catch (error) {
        console.warn('⚠️  Optional tenant validation failed, continuing without tenant context');
      }

      next();
    } catch (error) {
      // Don't fail on optional middleware errors
      console.warn('⚠️  Optional tenant middleware error:', error);
      next();
    }
  }
);

/**
 * Verify tenant ID matches request
 * Use in route handlers to ensure data isolation
 */
export function verifyTenantOwnership(
  requestTenantId: number | undefined,
  resourceTenantId: number | undefined
): void {
  if (!requestTenantId || !resourceTenantId) {
    throw new AppError(
      'Missing tenant context',
      400,
      ErrorCode.INVALID_INPUT
    );
  }

  if (requestTenantId !== resourceTenantId) {
    throw new AppError(
      'Access denied: you cannot access this resource',
      403,
      ErrorCode.TENANT_MISMATCH,
      { requestTenantId, resourceTenantId }
    );
  }
}

/**
 * Query scoping helper
 * Automatically adds WHERE tenant_id = ? to queries
 */
export function scopeTenantQuery(
  sql: string,
  tenantId: number | undefined
): { sql: string; params: unknown[] } {
  if (!tenantId) {
    throw new AppError(
      'Tenant ID required for scoped query',
      400,
      ErrorCode.INVALID_INPUT
    );
  }

  // Check if query already has WHERE clause
  const hasWhere = /\bWHERE\b/i.test(sql);
  const scopedSql = hasWhere
    ? sql.replace(/\bWHERE\b/i, `WHERE tenant_id = ? AND`)
    : `${sql} WHERE tenant_id = ?`;

  return {
    sql: scopedSql,
    params: [tenantId],
  };
}

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new AppError(
        `Requires role: ${allowedRoles.join(' or ')}`,
        403,
        ErrorCode.INSUFFICIENT_PERMISSIONS,
        { required: allowedRoles, current: userRole }
      );
    }

    next();
  };
}

/**
 * Verify user is authenticated and has tenant context
 */
export function isAuthenticated(req: Request): boolean {
  return !!(req.userId && req.tenantId && req.tenantSlug);
}

/**
 * Get tenant ID from request (throws if missing)
 */
export function getTenantId(req: Request): number {
  if (!req.tenantId) {
    throw new AppError(
      'Tenant context required',
      400,
      ErrorCode.INVALID_INPUT
    );
  }
  return req.tenantId;
}

/**
 * Get tenant slug from request (throws if missing)
 */
export function getTenantSlug(req: Request): string {
  if (!req.tenantSlug) {
    throw new AppError(
      'Tenant slug required',
      400,
      ErrorCode.INVALID_INPUT
    );
  }
  return req.tenantSlug;
}

/**
 * Get tenant DB name from request (throws if missing)
 */
export function getTenantDBName(req: Request): string {
  if (!req.tenantDbName) {
    throw new AppError(
      'Tenant database name required',
      400,
      ErrorCode.INVALID_INPUT
    );
  }
  return req.tenantDbName;
}

export default {
  tenantMiddleware,
  optionalTenantMiddleware,
  verifyTenantOwnership,
  scopeTenantQuery,
  requireRole,
  isAuthenticated,
  getTenantId,
  getTenantSlug,
  getTenantDBName,
};
