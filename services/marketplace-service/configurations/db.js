/**
 * Marketplace Service - Database Configuration
 * Uses centralized shared/dbConfig for per-tenant database resolution
 * 
 * Each tenant gets their own database - products are stored in the tenant's DB
 */

const { resolveDatabase, getTenantDB, query, execute, safeTenantQuery, safeTenantExecute } = require('../../../shared/dbConfig');

// Initialize database connection (called on server startup)
const initDB = async () => {
  try {
    // Test root connection by looking up a tenant
    const { lookupTenantDatabase } = require('../../../shared/dbConfig');
    const testSlug = process.env.TEST_TENANT_SLUG || 'system_shared';
    const dbName = await lookupTenantDatabase(testSlug);
    
    if (dbName) {
      // Pre-warm the pool
      await getTenantDB(dbName);
      console.log(`✅ Marketplace DB initialized (test tenant: ${testSlug} → ${dbName})`);
    } else {
      console.log('⚠️ No test tenant found, DB pools will be created on first request');
    }
    return true;
  } catch (error) {
    console.error('❌ Marketplace DB init error:', error.message);
    return false;
  }
};

// Safe query wrapper that accepts dbName directly (for backwards compatibility)
const safeQuery = async (sql, params = []) => {
  // This is a fallback - controllers should use the req-based query() instead
  // For backwards compatibility with existing code that passes dbName
  if (typeof sql === 'object' && sql.dbName) {
    const { dbName, query: querySql, params: queryParams } = sql;
    return safeTenantQuery(dbName, querySql, queryParams || params);
  }
  throw new Error('safeQuery requires dbName. Use query(req, sql, params) instead.');
};

// Safe query one - returns single row
const safeQueryOne = async (sql, params = []) => {
  if (typeof sql === 'object' && sql.dbName) {
    const { dbName, query: querySql, params: queryParams } = sql;
    const results = await safeTenantQuery(dbName, querySql, queryParams || params);
    return results.length > 0 ? results[0] : null;
  }
  throw new Error('safeQueryOne requires dbName. Use query(req, sql, params) instead.');
};

// Get tenant database name from x-slug header
const getTenantDbFromRequest = async (req) => {
  const slug = req.headers['x-slug'] || req.headers['x-tenant-slug'];
  if (!slug) {
    throw new Error('Missing x-slug or x-tenant-slug header');
  }
  return resolveDatabase(slug);
};

// Execute query on tenant's database (new pattern)
const tenantQuery = async (req, sql, params = []) => {
  return query(req, sql, params);
};

// Execute on tenant's database (new pattern)
const tenantExecute = async (req, sql, params = []) => {
  return execute(req, sql, params);
};

module.exports = {
  initDB,
  safeQuery,
  safeQueryOne,
  getTenantDbFromRequest,
  tenantQuery,
  tenantExecute,
  // Re-export for backwards compatibility
  resolveDatabase,
  getTenantDB,
  query,
  execute
};