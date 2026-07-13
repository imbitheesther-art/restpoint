/**
 * Global Database Configuration for Portal Service
 * Multi-Tenant SaaS - Each tenant has their own database
 * Looked up from tenant_tracking.tenants table
 */
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'mariadb',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
};

let rootPool = null;
const tenantPoolCache = new Map();

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
  return pool;
};

const safeQuery = async (sql, params = [], tenantSlug = null) => {
  const pool = tenantSlug 
    ? await getTenantPool(await lookupTenantDb(tenantSlug))
    : await getRootPool();
  const [rows] = await pool.query(sql, params);
  return rows;
};

const safeQueryOne = async (sql, params = [], tenantSlug = null) => {
  const rows = await safeQuery(sql, params, tenantSlug);
  return rows[0] || null;
};

const transaction = async (callback, tenantSlug = null) => {
  const pool = tenantSlug 
    ? await getTenantPool(await lookupTenantDb(tenantSlug))
    : await getRootPool();
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

const getConnection = async (tenantSlug = null) => {
  const pool = tenantSlug 
    ? await getTenantPool(await lookupTenantDb(tenantSlug))
    : await getRootPool();
  return await pool.getConnection();
};

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
};