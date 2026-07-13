/**
 * Global Database Configuration for Portal Service
 * Multi-Tenant SaaS - Each tenant has their own database
 * Looked up from tenant_tracking.tenants table
 */
const mysql = require('mysql2/promise');

// ============================================
// FIX: Handle MariaDB GSSAPI authentication
// ============================================
// This patch handles the GSSAPI authentication issue with MariaDB 10.11+
// by telling the server we don't support GSSAPI and to use mysql_native_password

const originalCreatePool = mysql.createPool;

mysql.createPool = function (config) {
  if (!config) config = {};

  // Ensure authPlugins exists
  if (!config.authPlugins) {
    config.authPlugins = {};
  }

  // Handle GSSAPI - tell the server we don't support it
  // This forces fallback to mysql_native_password
  config.authPlugins.auth_gssapi_client = function () {
    return function () {
      throw new Error('GSSAPI not supported - use mysql_native_password');
    };
  };

  return originalCreatePool.call(this, config);
};

// ============================================
// Database Configuration
// ============================================

const DB_CONFIG = {
  host: process.env.DB_HOST || 'mariadb',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  // GSSAPI handling at config level
  authPlugins: {
    auth_gssapi_client: function () {
      return function () {
        throw new Error('GSSAPI not supported - use mysql_native_password');
      };
    }
  },
  connectTimeout: 10000,
  acquireTimeout: 10000,
};

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

    // Test connection silently
    try {
      const testConn = await rootPool.getConnection();
      await testConn.ping();
      testConn.release();
      console.log('✅ Root database pool created');
    } catch (err) {
      console.error('❌ Root database pool creation failed:', err.message);
      // Still return the pool, let the caller handle errors
    }
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
    return rows.length > 0 ? rows[0].db_name : null;
  } catch (err) {
    console.error(`Tenant lookup error for "${tenantSlug}":`, err.message);
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

  // Test connection silently
  try {
    const testConn = await pool.getConnection();
    await testConn.ping();
    testConn.release();
    console.log(`✅ Tenant database pool created: ${tenantDbName}`);
  } catch (err) {
    console.error(`❌ Tenant database pool creation failed for ${tenantDbName}:`, err.message);
  }

  tenantPoolCache.set(tenantDbName, pool);
  return pool;
};

/**
 * safeQuery - Execute a query with optional tenant context
 */
const safeQuery = async (sql, params = [], tenantSlug = null) => {
  try {
    let pool;
    if (tenantSlug) {
      const dbName = await lookupTenantDb(tenantSlug);
      if (!dbName) {
        throw new Error(`Tenant database not found for: ${tenantSlug}`);
      }
      pool = await getTenantPool(dbName);
    } else {
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
 * safeQueryOne - Execute a query and return the first row
 */
const safeQueryOne = async (sql, params = [], tenantSlug = null) => {
  const rows = await safeQuery(sql, params, tenantSlug);
  return rows[0] || null;
};

/**
 * transaction - Execute a transaction with optional tenant context
 */
const transaction = async (callback, tenantSlug = null) => {
  let pool;
  if (tenantSlug) {
    const dbName = await lookupTenantDb(tenantSlug);
    if (!dbName) {
      throw new Error(`Tenant database not found for: ${tenantSlug}`);
    }
    pool = await getTenantPool(dbName);
  } else {
    pool = await getRootPool();
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * getConnection - Get a connection with optional tenant context
 */
const getConnection = async (tenantSlug = null) => {
  let pool;
  if (tenantSlug) {
    const dbName = await lookupTenantDb(tenantSlug);
    if (!dbName) {
      throw new Error(`Tenant database not found for: ${tenantSlug}`);
    }
    pool = await getTenantPool(dbName);
  } else {
    pool = await getRootPool();
  }
  return await pool.getConnection();
};

/**
 * closeAll - Close all connections (called on shutdown)
 */
const closeAll = async () => {
  console.log('🔄 Closing all database connections...');

  // Close tenant pools
  for (const [name, pool] of tenantPoolCache) {
    try {
      await pool.end();
      console.log(`✅ Closed pool for: ${name}`);
    } catch (err) {
      console.error(`⚠️ Error closing pool for ${name}:`, err.message);
    }
  }
  tenantPoolCache.clear();

  // Close root pool
  if (rootPool) {
    try {
      await rootPool.end();
      console.log('✅ Closed root pool');
    } catch (err) {
      console.error('⚠️ Error closing root pool:', err.message);
    }
    rootPool = null;
  }
};

/**
 * healthCheck - Check database health
 */
const healthCheck = async () => {
  try {
    const pool = await getRootPool();
    const [rows] = await pool.query('SELECT 1 as health');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      result: rows[0]
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: err.message
    };
  }
};

// Keep original pool variable for backward compatibility
const pool = null; // Root pool, lazily initialized via getRootPool

module.exports = {
  safeQuery,
  safeQueryOne,
  transaction,
  getConnection,
  pool,
  getRootPool,
  lookupTenantDb,
  getTenantPool,
  closeAll,
  healthCheck,
};