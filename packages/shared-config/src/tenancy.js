"use strict";
/**
 * Tenant validation and isolation helpers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = void 0;
exports.validateTenantActive = validateTenantActive;
const database_1 = require("./database");
/**
 * Validates if a tenant exists and is currently active.
 */
async function validateTenantActive(tenantSlug) {
    if (!tenantSlug || tenantSlug.trim() === '') {
        return { active: false, reason: 'Tenant identifier missing' };
    }
    try {
        const tenant = await (0, database_1.safeQueryOne)(`SELECT tenant_id as id, tenant_slug as slug, tenant_name as organization_name, db_name,
              CASE WHEN status = 'active' THEN 1 ELSE 0 END as is_active,
              subscription_status, subscription_expires_at
       FROM tenants WHERE tenant_slug = ?`, [tenantSlug]);
        if (!tenant) {
            return { active: false, reason: 'Tenant not found' };
        }
        if (tenant.is_active !== 1) {
            return { active: false, reason: 'Tenant is suspended/inactive' };
        }
        if (tenant.subscription_expires_at && new Date(tenant.subscription_expires_at) < new Date()) {
            return { active: false, reason: 'Tenant subscription expired' };
        }
        return { active: true, tenant };
    }
    catch (error) {
        console.error('Tenant validation error:', error);
        return { active: false, reason: 'Tenant validation failed' };
    }
}
/**
 * Express middleware to validate and set tenant on request
 */
const tenantMiddleware = async (req, res, next) => {
    const tenantSlug = String(req.headers['x-tenant-slug'] || req.params.tenantSlug || 'system_shared');
    if (tenantSlug !== 'system_shared') {
        const result = await validateTenantActive(tenantSlug);
        if (!result.active) {
            return res.status(403).json({ success: false, message: result.reason });
        }
        req.tenant = result.tenant;
    }
    req.tenantSlug = tenantSlug;
    next();
};
exports.tenantMiddleware = tenantMiddleware;
//# sourceMappingURL=tenancy.js.map