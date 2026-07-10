/**
 * @file global/middlewares/tenantMiddleware.ts
 * Express middleware for multi-tenant request validation.
 *
 * Extracts tenantSlug from x-tenant-slug header, validates it exists,
 * and attaches dbName to the request for downstream use.
 */
import { Request, Response, NextFunction } from 'express';
export interface TenantRequest extends Request {
    tenantSlug?: string;
    dbName?: string | null;
}
/**
 * Middleware that validates tenant and injects database name into request.
 * Must be used after any authentication middleware.
 */
export declare const tenantMiddleware: (req: Request & {
    tenantSlug?: string;
    dbName?: string | null;
}, res: Response, next: NextFunction) => Promise<void>;
/**
 * Lightweight middleware that only extracts tenantSlug without validation.
 * Use this when you need the slug for logging or non-database operations.
 */
export declare const extractTenantSlug: (req: Request & {
    tenantSlug?: string;
    dbName?: string | null;
}, res: Response, next: NextFunction) => void;
//# sourceMappingURL=tenantMiddleware.d.ts.map