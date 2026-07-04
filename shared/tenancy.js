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
    // Get root pool with retry logic
    let pool;
    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        pool = await dbConfig.getRootPool();
        break;
      } catch (error) {
        lastError = error;
        retries--;
        console.log(`Retrying connection... (${retries} attempts left)`);
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!pool) {
      throw new Error(`Failed to establish database connection: ${lastError?.message || 'Unknown error'}`);
    }

    // Query the tenant
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
    console.error('Stack trace:', error.stack);

    // Check for specific errors
    if (error.message && error.message.includes('GSSAPI')) {
      console.error('GSSAPI authentication error detected. Please check MariaDB configuration.');
      console.error('Try running: ALTER USER \'root\'@\'%\' IDENTIFIED WITH mysql_native_password BY \'root\';');
    }

    return {
      active: false,
      reason: `Error validating tenant: ${error.message}`
    };
  }
};

module.exports = {
  validateTenantActive
};