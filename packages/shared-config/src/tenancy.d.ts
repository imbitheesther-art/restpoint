/**
 * Tenant validation and isolation helpers
 */
import type { RequestHandler } from 'express';
import type { TenantValidationResult } from './types';
/**
 * Validates if a tenant exists and is currently active.
 */
export declare function validateTenantActive(tenantSlug: string): Promise<TenantValidationResult>;
/**
 * Express middleware to validate and set tenant on request
 */
export declare const tenantMiddleware: RequestHandler;
//# sourceMappingURL=tenancy.d.ts.map