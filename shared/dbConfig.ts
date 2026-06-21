/**
 * @file shared/dbConfig.ts
 * CENTRALIZED DATABASE CONFIGURATION — Single source of truth for ALL services
 * 
 * All database resolution, query execution, and connection management lives here.
 * No service should have its own dbConfig or migration files.
 * 
 * ARCHITECTURE:
 * - Unified x-slug header: "pamoja-funeral-home" (single) or "pamoja-funeral-home-nairobi" (branch)
 * - resolveDatabase(slug) → returns correct database name
 * - query(req, sql, params) → SELECT queries
 * - execute(req, sql, params) → INSERT/UPDATE/DELETE
 * 
 * MIGRATIONS:
 * - All migrations are in tenant-service ONLY
 * - Other services must NOT have their own migration files
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
const branchDbCache = new Map<string, string>();

// ─── Root Pool ───────────────────────────────────────────────────────────────

export const getRootPool = async (): Promise<mysql.Pool> => {
  if (!rootPool) {
    rootPool = mysql.createPool({
      ...DB_CONFIG,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    console.log('✅ Root database pool created');
  }
  return rootPool;
};

// ─── Tenant Lookup ───────────────────────────────────────────────────────────

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

// ─── Unified Slug Resolution (Single + Multi-branch) ─────────────────────────

/**
 * Resolve the correct database from a unified x-slug header.
 * 
 * x-slug can be:
 *   - "pamoja-funeral-home" → single-branch mode (main tenant DB)
 *   - "pamoja-funeral-home-nairobi" → multi-branch mode (branch DB)
 * 
 * Resolution flow:
 * 1. Try slug as main tenant → return main DB
 * 2. If not found, strip last "-segment" as branch name → look up in branches table
 * 3. Return branch-specific DB or fallback to main tenant DB
 * 
 * @param slug - The slug from x-slug header
 * @returns The database name to use
 */
export const resolveDatabase = async (slug: string): Promise<string | null> => {
  if (!slug || slug === 'system_shared') {
    console.error('❌ Invalid slug provided');
    return null;
  }

  console.log(`🔍 Resolving database for slug: ${slug}`);

  // Step 1: Try as a main tenant slug (single-branch mode)
  const mainDbName = await lookupTenantDatabase(slug);
  if (mainDbName) {
    console.log(`📁 Single-branch mode: using main tenant DB: ${mainDbName}`);
    return mainDbName;
  }

  // Step 2: Not a main tenant → try branch mode
  const lastDashIndex = slug.lastIndexOf('-');
  if (lastDashIndex > 0) {
    const possibleTenantSlug = slug.substring(0, lastDashIndex);
    const branchName = slug.substring(lastDashIndex + 1);

    console.log(`🔍 Trying branch mode: tenant="${possibleTenantSlug}", branch="${branchName}"`);

    const tenantDbName = await lookupTenantDatabase(possibleTenantSlug);
    if (tenantDbName) {
      // Look up branch in tenant's branches table by name
      try {
        const conn = await mysql.createConnection({
          ...DB_CONFIG,
          database: tenantDbName,
        });

        try {
          const [rows] = await conn.query(
            `SELECT branch_db_name FROM branches 
             WHERE (branch_slug LIKE ? OR branch_name LIKE ?) AND is_active = TRUE 
             LIMIT 1`,
            [`%${branchName}%`, `%${branchName}%`]
          );
          const list = rows as any[];
          if (list.length > 0) {
            const branchDbName = list[0].branch_db_name;
            console.log(`📁 Multi-branch mode: using branch DB: ${branchDbName}`);
            return branchDbName;
          }
        } finally {
          await conn.end();
        }
      } catch (err) {
        console.warn(`⚠️ Error looking up branch, falling back to main DB: ${tenantDbName}`);
        return tenantDbName;
      }

      // Branch not found but tenant exists → use main DB as fallback
      console.warn(`⚠️ Branch "${branchName}" not found, using main DB: ${tenantDbName}`);
      return tenantDbName;
    }
  }

  // Step 3: Nothing worked
  console.error(`❌ Could not resolve database for slug: ${slug}`);
  return null;
};

// ─── Tenant Pool Management ──────────────────────────────────────────────────

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

export const getTenantDBBySlug = async (tenantSlug: string): Promise<mysql.Pool | null> => {
  const dbName = await lookupTenantDatabase(tenantSlug);
  if (!dbName) {
    return null;
  }
  return getTenantDB(dbName);
};

// ─── Global Query Executors ──────────────────────────────────────────────────

/**
 * Execute a SELECT query on the tenant's database.
 * Automatically resolves the correct database from x-slug header.
 * 
 * @param req - Express request object (reads x-slug or x-tenant-slug header)
 * @param sql - SQL query with ? placeholders
 * @param params - Parameter values for placeholders
 * @returns Array of result rows
 */
export const query = async (req: any, sql: string, params: any[] = []): Promise<any[]> => {
  const slug = req.headers['x-slug'] || req.headers['x-tenant-slug'];
  if (!slug) {
    throw new Error('Missing x-slug or x-tenant-slug header');
  }

  const dbName = await resolveDatabase(slug);
  if (!dbName) {
    throw new Error(`No database configured for: ${slug}`);
  }

  try {
    const pool = await getTenantDB(dbName);
    const [rows] = await pool.query(sql, params);
    return rows as any[];
  } catch (error: any) {
    console.error(`❌ Query error on "${dbName}":`, {
      message: error.message,
      sql: sql.substring(0, 200),
    });
    throw error;
  }
};

/**
 * Execute an INSERT, UPDATE, DELETE, or DDL statement.
 * Automatically resolves the correct database from x-slug header.
 * 
 * @param req - Express request object (reads x-slug or x-tenant-slug header)
 * @param sql - SQL statement with ? placeholders
 * @param params - Parameter values for placeholders
 * @returns ResultSetHeader with insertId, affectedRows, etc.
 */
export const execute = async (req: any, sql: string, params: any[] = []): Promise<mysql.ResultSetHeader> => {
  const slug = req.headers['x-slug'] || req.headers['x-tenant-slug'];
  if (!slug) {
    throw new Error('Missing x-slug or x-tenant-slug header');
  }

  const dbName = await resolveDatabase(slug);
  if (!dbName) {
    throw new Error(`No database configured for: ${slug}`);
  }

  try {
    const pool = await getTenantDB(dbName);
    const [result] = await pool.query(sql, params);
    return result as mysql.ResultSetHeader;
  } catch (error: any) {
    console.error(`❌ Execute error on "${dbName}":`, {
      message: error.message,
      sql: sql.substring(0, 200),
    });
    throw error;
  }
};

// ─── Legacy Safe Query Functions (for backwards compatibility) ───────────────

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

// ─── Connection Management ───────────────────────────────────────────────────

export const closeTenantDB = async (tenantDbName: string): Promise<void> => {
  const pool = tenantPoolCache.get(tenantDbName);
  if (pool) {
    await pool.end().catch(() => {});
    tenantPoolCache.delete(tenantDbName);
    console.log(`🔌 Closed pool for: ${tenantDbName}`);
  }
};

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
  resolveDatabase,
  getTenantDB,
  getTenantDBBySlug,
  query,
  execute,
  safeTenantQuery,
  safeTenantExecute,
  closeTenantDB,
  closeAllConnections,
};