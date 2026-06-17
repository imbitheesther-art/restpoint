/**
 * Shared Database Configuration - Multi-Tenant
 * Used by: qrcode-service, updates-service, documents-service
 * 
 * This is a multi-tenant SaaS product. Each tenant has their own database.
 * Database names are tracked in the tenant_tracking.tenants table.
 * NO hardcoded database names - all tenant-specific.
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'mariadb',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
};

// Cache for connection pools (one pool per tenant database)
let rootPool = null;
const tenantPoolCache = new Map();

/**
 * Get root pool (no database selected) - for tenant lookup operations
 */
const getRootPool = async () => {
  if (!rootPool) {
    rootPool = mysql.createPool({
      ...DB_CONFIG,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return rootPool;
};

/**
 * Look up tenant database name from tenant_tracking schema
 */
const lookupTenantDb = async (tenantSlug) => {
  try {
    const pool = await getRootPool();
    const [rows] = await pool.query(
      'SELECT db_name FROM tenant_tracking.tenants WHERE tenant_slug = ? AND status = "active" LIMIT 1',
      [tenantSlug]
    );
    if (rows.length > 0 && rows[0].db_name) {
      return rows[0].db_name;
    }
    console.warn(`No active database found for tenant: ${tenantSlug}`);
    return null;
  } catch (err) {
    console.error(`Error looking up tenant db for "${tenantSlug}":`, err.message);
    return null;
  }
};

/**
 * Get or create a connection pool for a specific tenant database
 */
const getTenantPool = async (tenantDbName) => {
  if (tenantPoolCache.has(tenantDbName)) {
    return tenantPoolCache.get(tenantDbName);
  }
  const pool = mysql.createPool({
    ...DB_CONFIG,
    database: tenantDbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
  tenantPoolCache.set(tenantDbName, pool);
  console.log(`Connected to tenant database: ${tenantDbName}`);
  return pool;
};

/**
 * safeQuery - Generic multi-tenant query function
 * For simplicity, reads from the master/central database.
 * In multi-tenant flow, pass tenantSlug as third param or use middleware.
 * 
 * @param {string} sql - SQL query with ? placeholders
 * @param {Array} params - Parameter values
 * @param {string} [tenantSlug] - Optional tenant slug for tenant-specific queries
 * @returns {Array} Query results
 */
const safeQuery = async (sql, params = [], tenantSlug = null) => {
  try {
    let pool;
    if (tenantSlug) {
      const dbName = await lookupTenantDb(tenantSlug);
      if (!dbName) throw new Error(`Tenant database not found for: ${tenantSlug}`);
      pool = await getTenantPool(dbName);
    } else {
      // Default: use root pool for master queries (tenant_tracking, system tables)
      pool = await getRootPool();
    }
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    console.error('safeQuery error:', err.message);
    throw err;
  }
};

/**
 * Close all connections (called on shutdown)
 */
const closeAll = async () => {
  for (const [name, pool] of tenantPoolCache) {
    await pool.end().catch(() => {});
    console.log(`Closed pool for: ${name}`);
  }
  tenantPoolCache.clear();
  if (rootPool) {
    await rootPool.end().catch(() => {});
    rootPool = null;
  }
};

module.exports = { safeQuery, lookupTenantDb, getTenantPool, getRootPool, closeAll, DB_CONFIG };