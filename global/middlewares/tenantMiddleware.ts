/**
 * @file global/middlewares/tenantMiddleware.ts
 * Express middleware for multi-tenant request validation.
 * 
 * Extracts tenantSlug from x-tenant-slug header, validates it exists,
 * and attaches dbName to the request for downstream use.
 */

import { Request, Response, NextFunction } from 'express';
import { lookupTenantDatabase } from '../../shared/dbConfig';

export interface TenantRequest extends Request {
    tenantSlug?: string;
    dbName?: string | null;
}

/**
 * Middleware that validates tenant and injects database name into request.
 * Must be used after any authentication middleware.
 */
export const tenantMiddleware = async (req: Request & { tenantSlug?: string; dbName?: string | null }, res: Response, next: NextFunction): Promise<void> => {
    const tenantSlug = req.get('x-tenant-slug') || undefined;

    if (!tenantSlug) {
        res.status(400).json({
            success: false,
            message: 'Missing x-tenant-slug header'
        });
        return;
    }

    if (tenantSlug === 'system_shared') {
        res.status(400).json({
            success: false,
            message: 'Invalid tenant slug: system_shared is reserved'
        });
        return;
    }

    try {
        const dbName = await lookupTenantDatabase(tenantSlug);

        if (!dbName) {
            res.status(404).json({
                success: false,
                message: `Tenant not found: ${tenantSlug}`
            });
            return;
        }

        req.tenantSlug = tenantSlug;
        req.dbName = dbName;
        next();
    } catch (error: any) {
        console.error('❌ Tenant middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate tenant'
        });
    }
};

/**
 * Lightweight middleware that only extracts tenantSlug without validation.
 * Use this when you need the slug for logging or non-database operations.
 */
export const extractTenantSlug = (req: Request & { tenantSlug?: string; dbName?: string | null }, res: Response, next: NextFunction): void => {
    const tenantSlug = req.get('x-tenant-slug') || undefined;
    req.tenantSlug = tenantSlug;
    next();
};