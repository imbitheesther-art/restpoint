/**
 * Shared types for configuration, database, and tenancy
 */
export type DatabaseRow = Record<string, unknown>;
export interface QueryResult {
    affectedRows?: number;
    insertId?: number;
    changedRows?: number;
}
export interface TenantRecord {
    id: number;
    slug: string;
    organization_name: string;
    is_active: 0 | 1;
    subscription_status: string | null;
    subscription_expires_at: string | null;
}
export interface TenantValidationResult {
    active: boolean;
    reason?: string;
    tenant?: TenantRecord;
}
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly code: string;
    constructor(message: string, statusCode?: number, code?: string, isOperational?: boolean);
}
export declare class DatabaseError extends AppError {
    readonly query?: string;
    constructor(message?: string, query?: string);
}
export declare class TenantIsolationError extends AppError {
    readonly tenantSlug?: string;
    constructor(message?: string, tenantSlug?: string);
}
export declare class ValidationError extends AppError {
    readonly fields?: string[];
    constructor(message: string, fields?: string[]);
}
declare module 'express-serve-static-core' {
    interface Request {
        tenantId?: number;
        tenantSlug?: string;
        tenant?: TenantRecord;
    }
}
//# sourceMappingURL=types.d.ts.map