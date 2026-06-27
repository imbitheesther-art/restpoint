/**
 * @file shared/dbConfig.js
 * * CommonJS compatibility shim for shared/dbConfig.ts
 * Provides legacy `safeQuery`, `safeExecute`, `safeMasterQuery` exports
 * that services importing `../../shared/dbConfig` expect.
 */
const mysql = require('mysql2/promise');

// ─── Configuration ───────────────────────────────────────────────────────────
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

// ─── Connection Pool Caches ──────────────────────────────────────────────────
let rootPool = null;
const tenantPoolCache = new Map();

// ─── Root Pool ────────────────────────────────────────────────────────────────
const getRootPool = async () => {
  if (!rootPool) {
    rootPool = mysql.createPool({
      ...DB_CONFIG,
      database: 'tenant_tracking',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return rootPool;
};

// ─── Tenant Database Functions ────────────────────────────────────────────────

const lookupTenantDatabase = async (tenantSlug) => {
  try {
    const pool = await getRootPool();
    const [rows] = await pool.query(
      `SELECT db_name FROM tenants WHERE tenant_slug = ? AND status = 'active' LIMIT 1`,
      [tenantSlug]
    );
    if (rows.length > 0 && rows[0].db_name) {
      return rows[0].db_name;
    }
    return null;
  } catch (error) {
    console.error(`Error looking up tenant database for "${tenantSlug}":`, error.message);
    return null;
  }
};

const getTenantDB = async (tenantDbName) => {
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

const getTenantDBBySlug = async (tenantSlug) => {
  const dbName = await lookupTenantDatabase(tenantSlug);
  if (!dbName) return null;
  return getTenantDB(dbName);
};

// ─── Legacy Tenant Operations ─────────────────────────────────────────────────

const safeTenantQuery = async (dbName, sql, params = []) => {
  try {
    const pool = await getTenantDB(dbName);
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error(`safeTenantQuery error on "${dbName}":`, error.message);
    throw error;
  }
};

const safeTenantExecute = async (dbName, sql, params = []) => {
  try {
    const pool = await getTenantDB(dbName);
    const [result] = await pool.query(sql, params);
    return result;
  } catch (error) {
    console.error(`safeTenantExecute error on "${dbName}":`, error.message);
    throw error;
  }
};

const safeTenantRaw = async (dbName, sql) => {
  try {
    const pool = await getTenantDB(dbName);
    const [rows] = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error(`safeTenantRaw error on "${dbName}":`, error.message);
    throw error;
  }
};

// ─── Master/Root Database Operations ──────────────────────────────────────────

const safeMasterQuery = async (sql, params = []) => {
  try {
    const pool = await getRootPool();
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error(`safeMasterQuery error:`, error.message);
    throw error;
  }
};

const safeMasterExecute = async (sql, params = []) => {
  try {
    const pool = await getRootPool();
    const [result] = await pool.query(sql, params);
    return result;
  } catch (error) {
    console.error(`safeMasterExecute error:`, error.message);
    throw error;
  }
};

// ─── FIXED: Dynamic Signature Normalization Wrappers ─────────────────────────

const safeQuery = async (...args) => {
  // Pattern 1: safeQuery(dbName, sql, params)
  if (args.length >= 3) {
    return safeTenantQuery(args[0], args[1], args[2] || []);
  }
  
  if (args.length === 2) {
    // Pattern 2: safeQuery(dbName, sql) -> without explicit params array
    if (typeof args[0] === 'string' && args[1].toUpperCase().includes('SELECT')) {
      return safeTenantQuery(args[0], args[1], []);
    }
    // Pattern 3: safeQuery(sql, params) -> targeted at Master DB
    return safeMasterQuery(args[0], Array.isArray(args[1]) ? args[1] : [args[1]]);
  }

  // Pattern 4: safeQuery(sql) fallback to master
  return safeMasterQuery(args[0], []);
};

const safeExecute = async (...args) => {
  // Pattern 1: safeExecute(dbName, sql, params)
  if (args.length >= 3) {
    return safeTenantExecute(args[0], args[1], args[2] || []);
  }

  if (args.length === 2) {
    // Pattern 2: safeExecute(dbName, sql)
    if (typeof args[0] === 'string' && !Array.isArray(args[1])) {
      return safeTenantExecute(args[0], args[1], []);
    }
    // Pattern 3: safeExecute(sql, params) -> targeted at Master DB
    return safeMasterExecute(args[0], args[1]);
  }

  // Pattern 4: safeExecute(sql) fallback to master
  return safeMasterExecute(args[0], []);
};

// ─── Connection Management ───────────────────────────────────────────────────

const closeTenantDB = async (tenantDbName) => {
  const pool = tenantPoolCache.get(tenantDbName);
  if (pool) {
    await pool.end().catch(() => {});
    tenantPoolCache.delete(tenantDbName);
  }
};

const closeAllConnections = async () => {
  for (const [dbName, pool] of tenantPoolCache) {
    await pool.end().catch(() => {});
  }
  tenantPoolCache.clear();
  if (rootPool) {
    await rootPool.end().catch(() => {});
    rootPool = null;
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  getRootPool,
  lookupTenantDatabase,
  getTenantDB,
  getTenantDBBySlug,
  safeTenantQuery,
  safeTenantExecute,
  safeTenantRaw,
  safeMasterQuery,
  safeMasterExecute,
  safeQuery,
  safeExecute, 
  closeTenantDB,
  closeAllConnections,
};