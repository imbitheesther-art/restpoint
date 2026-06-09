/**
 * @file apps/global/types/errors.ts
 * Structured typed error class hierarchy.
 * Replaces generic Error throws throughout the codebase.
 *
 * Usage:
 *   throw new AuthenticationError('Invalid credentials');
 *   throw new ValidationError('Email is required', ['email']);
 */

// ============================================================
// BASE APP ERROR
// ============================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================================
// VALIDATION ERRORS (400)
// ============================================================

export class ValidationError extends AppError {
  public readonly fields?: string[];

  constructor(message: string, fields?: string[]) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}

// ============================================================
// AUTHENTICATION ERRORS (401)
// ============================================================

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// ============================================================
// AUTHORIZATION ERRORS (403)
// ============================================================

export class AuthorizationError extends AppError {
  public readonly requiredRoles?: string[];

  constructor(message = 'Permission denied', requiredRoles?: string[]) {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.requiredRoles = requiredRoles;
  }
}

// ============================================================
// TENANT ISOLATION ERRORS (403)
// ============================================================

export class TenantIsolationError extends AppError {
  public readonly tenantSlug?: string;

  constructor(message = 'Tenant access denied', tenantSlug?: string) {
    super(message, 403, 'TENANT_ISOLATION_ERROR');
    this.tenantSlug = tenantSlug;
  }
}

// ============================================================
// NOT FOUND ERRORS (404)
// ============================================================

export class NotFoundError extends AppError {
  public readonly resource?: string;

  constructor(message = 'Resource not found', resource?: string) {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.resource = resource;
  }
}

// ============================================================
// DATABASE ERRORS (500)
// ============================================================

export class DatabaseError extends AppError {
  public readonly query?: string;

  constructor(message = 'Database operation failed', query?: string) {
    super(message, 500, 'DATABASE_ERROR', false);
    this.query = query;
  }
}

// ============================================================
// EXTERNAL SERVICE ERRORS (502/503)
// ============================================================

export class ExternalServiceError extends AppError {
  public readonly service?: string;

  constructor(message = 'External service error', service?: string, statusCode = 502) {
    super(message, statusCode, 'EXTERNAL_SERVICE_ERROR', true);
    this.service = service;
  }
}

// ============================================================
// CONFLICT ERRORS (409)
// ============================================================

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

// ============================================================
// RATE LIMIT ERRORS (429)
// ============================================================

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

// ============================================================
// TYPE GUARD
// ============================================================

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Converts any caught error into a safe { statusCode, message } pair.
 * Never leaks internal details to clients.
 */
export function toHttpError(
  error: unknown,
  isProd = process.env['NODE_ENV'] === 'production',
): { statusCode: number; message: string; code: string } {
  if (isAppError(error)) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
    };
  }

  // Unknown error — hide details in production
  return {
    statusCode: 500,
    message: isProd ? 'Internal server error' : String(error),
    code: 'INTERNAL_ERROR',
  };
}
