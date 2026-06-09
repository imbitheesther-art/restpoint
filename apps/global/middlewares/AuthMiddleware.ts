/**
 * @file apps/global/middlewares/AuthMiddleware.ts
 * Core authentication & authorization middleware for all services.
 *
 * SECURITY:
 * - Verifies JWT access tokens (algorithm hardcoded — no 'none' allowed)
 * - Validates user ID prefix format for identity integrity
 * - Detects session desync between token and cookie
 * - Role hierarchy enforcement via ROLE_HIERARCHY map
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { UserPayload, UserRole, AuthenticatedUser } from '../types/index';
import { AuthenticationError, AuthorizationError } from '../types/errors';

const { verifyAccessToken } = require('../auth/tokens') as {
  verifyAccessToken: (token: string) => UserPayload | null;
};
const { getTokenFromRequest, getUserFromCookies } = require('../auth/cookies') as {
  getTokenFromRequest: (req: Request) => string | null;
  getUserFromCookies: (req: Request) => Partial<UserPayload> | null;
};
const Logger = require('../logger/logger') as {
  info: (m: string, ...a: unknown[]) => void;
  warn: (m: string, ...a: unknown[]) => void;
  error: (m: string, ...a: unknown[]) => void;
};

// ============================================================
// ROLE HIERARCHY
// ============================================================

const ROLE_HIERARCHY: Record<string, number> = {
  user: 1,
  aspirant: 2,
  leader: 2,
  market_admin: 3,
  admin: 4,
  super_admin: 5,
  ceo: 6,
} as const;

/** Valid user ID prefixes — admin/ceo are exempt */
const EXEMPT_ROLES_FROM_PREFIX_CHECK = new Set<string>(['admin', 'super_admin', 'ceo']);
const VALID_ID_PREFIXES = ['USR-', 'USR_', 'LDR-', 'LDR_'] as const;

function hasValidIdPrefix(userId: string): boolean {
  return VALID_ID_PREFIXES.some((prefix) => userId.startsWith(prefix));
}

// ============================================================
// MAIN AUTHENTICATION MIDDLEWARE
// ============================================================

/**
 * authenticate — verifies the JWT access token on the request.
 * Sets req.user, req.userId, req.role on success.
 * Returns 401 if no token, 401 if token invalid/expired.
 */
export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = getTokenFromRequest(req);
    const source = req.headers.authorization
      ? 'header'
      : req.cookies?.access_token
        ? 'cookie'
        : 'none';

    if (!token) {
      Logger.warn(
        `[AUTH] Authentication failed: No token found. Source: ${source}, Path: ${req.path}`,
      );
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      Logger.warn(
        `[AUTH] Authentication failed: Invalid or expired token. Source: ${source}, Path: ${req.path}`,
      );
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.',
      });
      return;
    }

    const userId = decoded.userId ?? (decoded as AuthenticatedUser).user_id ?? '';
    const role = ((decoded.role ?? 'user') as string).toLowerCase() as UserRole;

    // IDENTITY VALIDATION: Check for role/ID prefix consistency
    if (!hasValidIdPrefix(userId) && !EXEMPT_ROLES_FROM_PREFIX_CHECK.has(role)) {
      Logger.error(`[AUTH] Identity Conflict: ${userId} has no valid prefix`);
      res.status(403).json({
        success: false,
        message: 'Authentication integrity failure. Please login again.',
      });
      return;
    }

    // DESYNC DETECTION: Compare token identity with cookie identity
    const cookieUser = getUserFromCookies(req);
    if (cookieUser?.userId && cookieUser.userId !== userId) {
      Logger.warn(
        `[AUTH] Session Desync Detected: Token ID(${userId}) != Cookie ID(${cookieUser.userId})`,
      );
      // Log only — token takes priority; reject in strict mode if needed
    }

    Logger.info(`[AUTH] Authenticated ${role} ${userId} via ${source} for ${req.path}`);

    req.user = decoded;
    req.userId = userId;
    req.role = role;

    next();
  } catch (error) {
    const err = error as Error;
    Logger.error('Authentication error:', { message: err.message });
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

// ============================================================
// AUTHORIZATION MIDDLEWARE FACTORY
// ============================================================

/**
 * authorize(...roles) — role-based access control middleware.
 * Accepts one or more required roles; grants access if user's role level >= any required role.
 */
export function authorize(...roles: UserRole[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const userRole = ((req.user.role ?? 'user') as string).toLowerCase();
    const userLevel = ROLE_HIERARCHY[userRole] ?? 1;

    const hasPermission = roles.some((requiredRole) => {
      const requiredLevel = ROLE_HIERARCHY[requiredRole.toLowerCase()] ?? 1;
      return userLevel >= requiredLevel;
    });

    if (!hasPermission) {
      Logger.warn(
        `[AUTH] Access denied for ${userRole} ${req.user?.userId}. Required: ${roles.join(', ')}`,
      );
      res.status(403).json({
        success: false,
        message: `Permission denied. Required role: ${roles.join(' or ')}`,
      });
      return;
    }

    next();
  };
}

// ============================================================
// OPTIONAL AUTHENTICATION
// ============================================================

/**
 * optionalAuth — attaches user to request if a valid token is present,
 * but does NOT reject requests without tokens.
 */
export const optionalAuth: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return next();

    const decoded = verifyAccessToken(token);
    if (!decoded) return next();

    const userId = decoded.userId ?? (decoded as AuthenticatedUser).user_id ?? '';
    const role = ((decoded.role ?? 'user') as string).toLowerCase() as UserRole;

    req.user = decoded;
    req.userId = userId;
    req.role = role;

    next();
  } catch {
    next();
  }
};

// ============================================================
// SYNCHRONOUS AUTH CHECK HELPER
// ============================================================

/**
 * isAuthenticated — synchronously checks if the request has a valid token.
 * Returns a boolean; does not modify the response.
 */
export function isAuthenticated(req: Request): boolean {
  const token = getTokenFromRequest(req);
  if (!token) return false;
  const decoded = verifyAccessToken(token);
  return decoded !== null;
}

// ============================================================
// CommonJS-compatible exports
// ============================================================

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  isAuthenticated,
};
