/**
 * @file shared/dbConfig.ts
 * PRODUCTION-READY: Shared Database Configuration
 * 
 * Provides centralized tenant database access for all services.
 * Each tenant has its own database, looked up from the tenant_tracking database.
 * 
 * Functions:
 *   - lookupTenantDatabase(tenantSlug) → dbName
 *   - safeTenantQuery(dbName, sql, params) → rows[]
 *   - safeTenantExecute(dbName, sql, params) → result
 *   - getTenantDB(tenantSlug) → mysql.Pool
 *   - getRootPool() → mysql.Pool
 */

import mysql from 'mysql2/promise';

// ─── Configuration ───────────────────────────────────────────────────────────

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const TRACKING_DB_NAME = process.env.TRACKING_DB_NAME || 'tenant_tracking';

// ─── Connection Pool Caches ──────────────────────────────────────────────────

let rootPool: mysql.Pool | null = null;
const tenantPoolCache = new Map<string, mysql.Pool>();

// ─── Root Pool (for server-level operations) ────────────────────────────────

/**
 * Get or create the root MySQL pool (no database selected).
 * Used for CREATE DATABASE and similar server-level operations.
 */
export const getRootPool = async (): Promise<mysql.Pool> => {
  if (!rootPool) {
    rootPool = mysql.createPool({
      ...DB_CONFIG,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    console.log('✅ Root database pool created');
  }
  return rootPool;
};

// ─── Tenant Lookup ───────────────────────────────────────────────────────────

/**
 * Look up the database name for a given tenant slug.
 * Queries the tenant_tracking.tenants table.
 * 
 * @param tenantSlug - The tenant's unique slug identifier
 * @returns The database name, or null if not found
 */
export const lookupTenantDatabase = async (tenantSlug: string): Promise<string | null> => {
  try {
    const pool = await getRootPool();
    const [rows] = await pool.query(
      'SELECT db_name FROM tenant_tracking.tenants WHERE tenant_slug = ? AND status = "active" LIMIT 1',
      [tenantSlug]
    );

    const result = rows as any[];
    if (result.length > 0 && result[0].db_name) {
      return result[0].db_name;
    }

    console.warn(`⚠️ No active database found for tenant: ${tenantSlug}`);
    return null;
  } catch (error: any) {
    console.error(`❌ Error looking up tenant database for "${tenantSlug}":`, error.message);
    return null;
  }
};

// ─── Tenant Pool Management ──────────────────────────────────────────────────

/**
 * Get or create a connection pool for a specific tenant database.
 * Pools are cached to avoid creating duplicate connections.
 * 
 * @param tenantDbName - The tenant's database name
 * @returns A mysql2 connection pool
 */
export const getTenantDB = async (tenantDbName: string): Promise<mysql.Pool> => {
  if (tenantPoolCache.has(tenantDbName)) {
    return tenantPoolCache.get(tenantDbName)!;
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
  console.log(`✅ Connected to tenant database: ${tenantDbName}`);
  return pool;
};

/**
 * Get a connection pool for a tenant by slug.
 * Looks up the database name first, then gets/creates the pool.
 * 
 * @param tenantSlug - The tenant's unique slug identifier
 * @returns A mysql2 connection pool, or null if tenant not found
 */
export const getTenantDBBySlug = async (tenantSlug: string): Promise<mysql.Pool | null> => {
  const dbName = await lookupTenantDatabase(tenantSlug);
  if (!dbName) {
    return null;
  }
  return getTenantDB(dbName);
};

// ─── Safe Query Functions ────────────────────────────────────────────────────

/**
 * Execute a SELECT query on a tenant database.
 * Returns an array of rows.
 * 
 * @param dbName - The tenant database name
 * @param sql - The SQL query with ? placeholders
 * @param params - Parameter values for placeholders
 * @returns Array of result rows
 */
export const safeTenantQuery = async (
  dbName: string,
  sql: string,
  params: any[] = []
): Promise<any[]> => {
  try {
    const pool = await getTenantDB(dbName);
    const [rows] = await pool.query(sql, params);
    return rows as any[];
  } catch (error: any) {
    console.error(`❌ safeTenantQuery error on "${dbName}":`, {
      message: error.message,
      sql: sql.substring(0, 200),
    });
    throw error;
  }
};

/**
 * Execute an INSERT, UPDATE, DELETE, or DDL statement on a tenant database.
 * Returns the mysql2 ResultSetHeader with insertId, affectedRows, etc.
 * 
 * @param dbName - The tenant database name
 * @param sql - The SQL statement with ? placeholders
 * @param params - Parameter values for placeholders
 * @returns ResultSetHeader with insertId, affectedRows, etc.
 */
export const safeTenantExecute = async (
  dbName: string,
  sql: string,
  params: any[] = []
): Promise<mysql.ResultSetHeader> => {
  try {
    const pool = await getTenantDB(dbName);
    const [result] = await pool.query(sql, params);
    return result as mysql.ResultSetHeader;
  } catch (error: any) {
    console.error(`❌ safeTenantExecute error on "${dbName}":`, {
      message: error.message,
      sql: sql.substring(0, 200),
    });
    throw error;
  }
};

/**
 * Execute a raw query on a tenant database (no parameterization).
 * Useful for DDL statements or multi-statement queries.
 * 
 * @param dbName - The tenant database name
 * @param sql - The raw SQL to execute
 * @returns Array of result rows
 */
export const safeTenantRaw = async (
  dbName: string,
  sql: string
): Promise<any[]> => {
  try {
    const pool = await getTenantDB(dbName);
    const [rows] = await pool.query(sql);
    return rows as any[];
  } catch (error: any) {
    console.error(`❌ safeTenantRaw error on "${dbName}":`, {
      message: error.message,
      sql: sql.substring(0, 200),
    });
    throw error;
  }
};

// ─── Connection Management ───────────────────────────────────────────────────

/**
 * Close a specific tenant database pool.
 */
export const closeTenantDB = async (tenantDbName: string): Promise<void> => {
  const pool = tenantPoolCache.get(tenantDbName);
  if (pool) {
    await pool.end().catch(() => {});
    tenantPoolCache.delete(tenantDbName);
    console.log(`🔌 Closed pool for: ${tenantDbName}`);
  }
};

/**
 * Close all cached tenant pools and the root pool.
 */
export const closeAllConnections = async (): Promise<void> => {
  for (const [dbName, pool] of tenantPoolCache) {
    await pool.end().catch(() => {});
    console.log(`🔌 Closed pool for: ${dbName}`);
  }
  tenantPoolCache.clear();

  if (rootPool) {
    await rootPool.end().catch(() => {});
    rootPool = null;
    console.log('🔌 Closed root pool');
  }
};

// ─── Default Export ──────────────────────────────────────────────────────────

export default {
  getRootPool,
  lookupTenantDatabase,
  getTenantDB,
  getTenantDBBySlug,
  safeTenantQuery,
  safeTenantExecute,
  safeTenantRaw,
  closeTenantDB,
  closeAllConnections,
};