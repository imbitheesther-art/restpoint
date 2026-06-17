/**
 * @file shared/tenancy.js
 * 
 * Compatibility shim for services expecting `require('../../shared/tenancy')`.
 * Provides validateTenantActive function that checks if a tenant exists and is active.
 */
const dbConfig = require('./dbConfig');

/**
 * Validate that a tenant exists and is active.
 * 
 * @param {string} tenantSlug - The tenant slug to validate
 * @returns {Promise<{active: boolean, tenant?: object, reason?: string}>}
 */
const validateTenantActive = async (tenantSlug) => {
  try {
    const pool = await dbConfig.getRootPool();
    const [rows] = await pool.query(
      `SELECT * FROM tenant_tracking.tenants WHERE tenant_slug = ? LIMIT 1`,
      [tenantSlug]
    );

    if (!rows || rows.length === 0) {
      return {
        active: false,
        reason: `Tenant "${tenantSlug}" not found`
      };
    }

    const tenant = rows[0];

    if (tenant.status !== 'active') {
      return {
        active: false,
        reason: `Tenant "${tenantSlug}" is not active (status: ${tenant.status})`,
        tenant
      };
    }

    return {
      active: true,
      tenant
    };
  } catch (error) {
    console.error(`Error validating tenant "${tenantSlug}":`, error.message);
    return {
      active: false,
      reason: `Error validating tenant: ${error.message}`
    };
  }
};

module.exports = {
  validateTenantActive
};