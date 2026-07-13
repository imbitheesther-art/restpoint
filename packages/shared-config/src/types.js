"use strict";
/**
 * Shared types for configuration, database, and tenancy
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.TenantIsolationError = exports.DatabaseError = exports.AppError = void 0;
// ============================================================
// ERROR TYPES
// ============================================================
class AppError extends Error {
    statusCode;
    isOperational;
    code;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class DatabaseError extends AppError {
    query;
    constructor(message = 'Database operation failed', query) {
        super(message, 500, 'DATABASE_ERROR', false);
        this.query = query;
    }
}
exports.DatabaseError = DatabaseError;
class TenantIsolationError extends AppError {
    tenantSlug;
    constructor(message = 'Tenant access denied', tenantSlug) {
        super(message, 403, 'TENANT_ISOLATION_ERROR');
        this.tenantSlug = tenantSlug;
    }
}
exports.TenantIsolationError = TenantIsolationError;
class ValidationError extends AppError {
    fields;
    constructor(message, fields) {
        super(message, 400, 'VALIDATION_ERROR');
        this.fields = fields;
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=types.js.map