/**
 * @file shared/errorHandling.ts
 * PRODUCTION-READY: Global error handling across all services
 *
 * KEY FEATURES:
 * - Standardized error responses
 * - Error classification (validation, auth, server, etc.)
 * - Logging with context
 * - No sensitive data in responses
 * - Proper HTTP status codes
 *
 * USAGE:
 * import { AppError, handleError } from '../shared/errorHandling';
 * throw new AppError('Invalid email', 400, 'VALIDATION_ERROR');
 */

import type { Request, Response, NextFunction } from 'express';

// ============================================================
// TYPES
// ============================================================

export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',

  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  TENANT_MISMATCH = 'TENANT_MISMATCH',

  // Not found errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',

  // Conflict errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  RESOURCE_EXISTS = 'RESOURCE_EXISTS',

  // Rate limit errors (429)
  RATE_LIMITED = 'RATE_LIMITED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppErrorData {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
  userId?: number;
  tenantId?: number;
  timestamp?: string;
  path?: string;
  method?: string;
}

// ============================================================
// ERROR CLASS
// ============================================================

export class AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): AppErrorData {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================
// LOGGING
// ============================================================

/**
 * Enhanced error logger with context
 */
export function logError(
  error: Error | AppError,
  context: {
    userId?: number;
    tenantId?: number;
    path?: string;
    method?: string;
    query?: Record<string, any>;
    body?: Record<string, any>;
  }
): void {
  const timestamp = new Date().toISOString();
  const errorData = {
    timestamp,
    type: error.constructor.name,
    message: error.message,
    code: (error as AppError).code || ErrorCode.UNKNOWN_ERROR,
    statusCode: (error as AppError).statusCode || 500,
    details: (error as AppError).details,
    context: {
      userId: context.userId,
      tenantId: context.tenantId,
      path: context.path,
      method: context.method,
    },
  };

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ ERROR:', JSON.stringify(errorData, null, 2));
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  } else {
    // In production, use proper logging service
    console.error(JSON.stringify(errorData));
  }
}

// ============================================================
// ERROR HANDLERS
// ============================================================

/**
 * Express error handling middleware
 * Place LAST in middleware stack
 */
export function errorHandlerMiddleware(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Ensure error is AppError
  let appError: AppError;
  if (error instanceof AppError) {
    appError = error;
  } else {
    // Convert unknown errors
    console.error('Unexpected error:', error);
    appError = new AppError(
      'Internal server error',
      500,
      ErrorCode.INTERNAL_ERROR
    );
  }

  // Log error with context
  logError(appError, {
    userId: (req as any).userId,
    tenantId: (req as any).tenantId,
    path: req.path,
    method: req.method,
  });

  // Send response
  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(process.env.NODE_ENV !== 'production' && { details: appError.details }),
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Async route wrapper to catch errors
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validate required fields
 */
export function validateRequired(
  obj: Record<string, any>,
  fields: string[]
): void {
  const missing: string[] = [];
  for (const field of fields) {
    if (!obj[field]) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new AppError(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      ErrorCode.VALIDATION_ERROR,
      { missingFields: missing }
    );
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(
      'Invalid email format',
      400,
      ErrorCode.INVALID_INPUT,
      { field: 'email' }
    );
  }
}

/**
 * Validate tenant slug format
 */
export function validateTenantSlug(slug: string): void {
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    throw new AppError(
      'Invalid tenant slug. Must contain only lowercase letters, numbers, and hyphens.',
      400,
      ErrorCode.INVALID_INPUT,
      { field: 'tenantSlug' }
    );
  }
}

/**
 * Verify tenant access
 */
export function verifyTenantAccess(
  requestTenantId: number | undefined,
  resourceTenantId: number
): void {
  if (requestTenantId !== resourceTenantId) {
    throw new AppError(
      'Access denied: tenant mismatch',
      403,
      ErrorCode.TENANT_MISMATCH,
      { requestTenantId, resourceTenantId }
    );
  }
}

// ============================================================
// SPECIFIC ERROR CONSTRUCTORS
// ============================================================

export function unauthorized(message: string = 'Unauthorized'): AppError {
  return new AppError(message, 401, ErrorCode.UNAUTHORIZED);
}

export function forbidden(message: string = 'Forbidden'): AppError {
  return new AppError(message, 403, ErrorCode.FORBIDDEN);
}

export function notFound(resource: string = 'Resource'): AppError {
  return new AppError(
    `${resource} not found`,
    404,
    ErrorCode.NOT_FOUND
  );
}

export function validationError(message: string, details?: Record<string, any>): AppError {
  return new AppError(message, 400, ErrorCode.VALIDATION_ERROR, details);
}

export function conflict(message: string, details?: Record<string, any>): AppError {
  return new AppError(message, 409, ErrorCode.CONFLICT, details);
}

export function rateLimited(message: string = 'Too many requests'): AppError {
  return new AppError(message, 429, ErrorCode.RATE_LIMITED);
}

export function internalError(message: string = 'Internal server error', details?: Record<string, any>): AppError {
  return new AppError(message, 500, ErrorCode.INTERNAL_ERROR, details);
}

export default {
  AppError,
  ErrorCode,
  errorHandlerMiddleware,
  asyncHandler,
  validateRequired,
  validateEmail,
  validateTenantSlug,
  verifyTenantAccess,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  conflict,
  rateLimited,
  internalError,
  logError,
};
