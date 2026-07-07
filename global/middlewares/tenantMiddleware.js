"use strict";
/**
 * @file global/middlewares/tenantMiddleware.ts
 * Express middleware for multi-tenant request validation.
 *
 * Extracts tenantSlug from x-tenant-slug header, validates it exists,
 * and attaches dbName to the request for downstream use.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTenantSlug = exports.tenantMiddleware = void 0;
const dbConfig_1 = require("../../shared/dbConfig");
/**
 * Middleware that validates tenant and injects database name into request.
 * Must be used after any authentication middleware.
 */
const tenantMiddleware = async (req, res, next) => {
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
        const dbName = await (0, dbConfig_1.lookupTenantDatabase)(tenantSlug);
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
    }
    catch (error) {
        console.error('❌ Tenant middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate tenant'
        });
    }
};
exports.tenantMiddleware = tenantMiddleware;
/**
 * Lightweight middleware that only extracts tenantSlug without validation.
 * Use this when you need the slug for logging or non-database operations.
 */
const extractTenantSlug = (req, res, next) => {
    const tenantSlug = req.get('x-tenant-slug') || undefined;
    req.tenantSlug = tenantSlug;
    next();
};
exports.extractTenantSlug = extractTenantSlug;
//# sourceMappingURL=tenantMiddleware.js.map