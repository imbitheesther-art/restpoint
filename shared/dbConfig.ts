/**
 * @file shared/dbConfig.ts
 * PRODUCTION-READY: Single database configuration used by ALL services
 *
 * KEY FEATURES:
 * - Master DB connection (tenant registry)
 * - Per-tenant database connection pooling
 * - Automatic connection reuse (LRU cache)
 * - Proper error handling and graceful degradation
 * - UTC timestamps for all queries
 * - Connection health checks
 *
 * USAGE IN SERVICES:
 * import { getMasterDB, getTenantDB } from '../shared/dbConfig';
 *
 * const masterConn = getMasterDB();
 * const tenantConn = getTenantDB(tenantDbName);
 */

import mysql, { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================
// TYPES
// ============================================================

interface DBConnectionConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean | object;
  connectionLimit: number;
  timezone: '+00:00'; // UTC always
  supportBigNumbers: boolean;
  bigNumberStrings: boolean;
  enableTimeoutError: boolean;
  waitForConnections: boolean;
  enableKeepAlive: boolean;
  keepAliveInitialDelayMs: number;
}

interface TenantDatabaseCache {
  pool: Pool;
  lastUsed: Date;
}

// ============================================================
// ENVIRONMENT VARIABLES
// ============================================================

function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`❌ FATAL: Environment variable ${key} is required`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// ============================================================
// CONNECTION CONFIGURATION
// ============================================================

const MASTER_DB_CONFIG: DBConnectionConfig = {
  host: requireEnv('DB_HOST', 'localhost'),
  port: parseInt(requireEnv('DB_PORT', '3306')),
  user: requireEnv('DB_USER'),
  password: requireEnv('DB_PASSWORD'),
  database: requireEnv('MASTER_DB_NAME', 'restpoint_master'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionLimit: parseInt(optionalEnv('DB_MASTER_POOL_SIZE', '10')),
  timezone: '+00:00',
  supportBigNumbers: true,
  bigNumberStrings: true,
  enableTimeoutError: true,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 30000,
};

// Default config for tenant databases (can be overridden)
const TENANT_DB_CONFIG_TEMPLATE: Omit<DBConnectionConfig, 'database'> = {
  host: requireEnv('DB_HOST', 'localhost'),
  port: parseInt(requireEnv('DB_PORT', '3306')),
  user: requireEnv('DB_USER'),
  password: requireEnv('DB_PASSWORD'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionLimit: parseInt(optionalEnv('DB_TENANT_POOL_SIZE', '5')),
  timezone: '+00:00',
  supportBigNumbers: true,
  bigNumberStrings: true,
  enableTimeoutError: true,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 30000,
};

// ============================================================
// CONNECTION POOLING
// ============================================================

let masterPool: Pool | null = null;
const tenantDatabaseCache = new Map<string, TenantDatabaseCache>();
const MAX_CACHED_POOLS = 50;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Initialize and return the master database connection pool
 * Cached after first call
 */
export async function getMasterDB(): Promise<Pool> {
  if (masterPool) {
    try {
      const conn = await masterPool.getConnection();
      conn.release();
      return masterPool;
    } catch (error) {
      console.error('❌ Master DB connection pool error:', error);
      masterPool = null;
    }
  }

  console.log(`📊 Initializing Master DB pool (host: ${MASTER_DB_CONFIG.host}:${MASTER_DB_CONFIG.port})`);
  
  try {
    masterPool = mysql.createPool(MASTER_DB_CONFIG);
    
    // Test connection
    const conn = await masterPool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    
    console.log('✅ Master DB connection pool initialized');
    return masterPool;
  } catch (error) {
    console.error('❌ FATAL: Failed to initialize Master DB:', error);
    throw error;
  }
}

/**
 * Get connection pool for a specific tenant database
 * Implements LRU caching with automatic cleanup
 */
export async function getTenantDB(tenantDbName: string): Promise<Pool> {
  if (!tenantDbName) {
    throw new Error('❌ Tenant database name is required');
  }

  // Check cache
  const cached = tenantDatabaseCache.get(tenantDbName);
  if (cached) {
    cached.lastUsed = new Date();
    try {
      const conn = await cached.pool.getConnection();
      conn.release();
      return cached.pool;
    } catch (error) {
      console.warn(`⚠️  Tenant DB connection pool stale, recreating:`, tenantDbName);
      tenantDatabaseCache.delete(tenantDbName);
    }
  }

  // Cleanup old pools if cache is full
  if (tenantDatabaseCache.size >= MAX_CACHED_POOLS) {
    let oldest = Array.from(tenantDatabaseCache.entries())
      .reduce((prev, curr) =>
        prev[1].lastUsed < curr[1].lastUsed ? prev : curr
      );
    console.log(`🧹 Cache full, evicting oldest tenant DB: ${oldest[0]}`);
    const poolToClose = oldest[1].pool;
    tenantDatabaseCache.delete(oldest[0]);
    
    // Close connections gracefully
    try {
      await poolToClose.end();
    } catch (error) {
      console.error(`⚠️  Error closing evicted pool:`, error);
    }
  }

  // Create new pool
  console.log(`🔄 Creating new tenant DB pool for: ${tenantDbName}`);
  
  const config: DBConnectionConfig = {
    ...TENANT_DB_CONFIG_TEMPLATE,
    database: tenantDbName,
  };

  try {
    const pool = mysql.createPool(config);
    
    // Test connection
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    
    tenantDatabaseCache.set(tenantDbName, {
      pool,
      lastUsed: new Date(),
    });
    
    console.log(`✅ Tenant DB pool ready: ${tenantDbName}`);
    return pool;
  } catch (error) {
    console.error(`❌ Failed to create tenant DB pool for ${tenantDbName}:`, error);
    throw error;
  }
}

/**
 * Execute safe parameterized query on master DB
 */
export async function safeMasterQuery<T extends RowDataPacket>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = await getMasterDB();
  try {
    const [rows] = await pool.query<T[]>(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Master DB query error:', { sql, params, error });
    throw error;
  }
}

/**
 * Execute safe single-row query on master DB
 */
export async function safeMasterQueryOne<T extends RowDataPacket>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const pool = await getMasterDB();
  try {
    const [rows] = await pool.query<T[]>(sql, params);
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Master DB single query error:', { sql, params, error });
    throw error;
  }
}

/**
 * Execute safe parameterized query on tenant DB
 */
export async function safeTenantQuery<T extends RowDataPacket>(
  tenantDbName: string,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = await getTenantDB(tenantDbName);
  try {
    const [rows] = await pool.query<T[]>(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Tenant DB query error:', { tenantDbName, sql, params, error });
    throw error;
  }
}

/**
 * Execute safe single-row query on tenant DB
 */
export async function safeTenantQueryOne<T extends RowDataPacket>(
  tenantDbName: string,
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const pool = await getTenantDB(tenantDbName);
  try {
    const [rows] = await pool.query<T[]>(sql, params);
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Tenant DB single query error:', { tenantDbName, sql, params, error });
    throw error;
  }
}

/**
 * Execute INSERT/UPDATE/DELETE on tenant DB and return affected rows
 */
export async function safeTenantExecute(
  tenantDbName: string,
  sql: string,
  params: unknown[] = []
): Promise<{ affectedRows: number; insertId: number }> {
  const pool = await getTenantDB(tenantDbName);
  try {
    const [result] = await pool.query<any>(sql, params);
    return {
      affectedRows: result.affectedRows || 0,
      insertId: result.insertId || 0,
    };
  } catch (error) {
    console.error('❌ Tenant DB execute error:', { tenantDbName, sql, params, error });
    throw error;
  }
}

/**
 * Gracefully close all connections
 */
export async function closeAllConnections(): Promise<void> {
  console.log('🛑 Closing all database connections...');
  
  if (masterPool) {
    try {
      await masterPool.end();
      console.log('✅ Master DB pool closed');
    } catch (error) {
      console.error('⚠️  Error closing Master DB pool:', error);
    }
  }

  for (const [dbName, cache] of tenantDatabaseCache.entries()) {
    try {
      await cache.pool.end();
      console.log(`✅ Tenant DB pool closed: ${dbName}`);
    } catch (error) {
      console.error(`⚠️  Error closing tenant DB pool ${dbName}:`, error);
    }
  }

  tenantDatabaseCache.clear();
}

/**
 * Get current cache statistics (for monitoring)
 */
export function getCacheStats(): {
  totalCached: number;
  databases: string[];
  masterPoolActive: boolean;
} {
  return {
    totalCached: tenantDatabaseCache.size,
    databases: Array.from(tenantDatabaseCache.keys()),
    masterPoolActive: masterPool !== null,
  };
}

export default {
  getMasterDB,
  getTenantDB,
  safeMasterQuery,
  safeMasterQueryOne,
  safeTenantQuery,
  safeTenantQueryOne,
  safeTenantExecute,
  closeAllConnections,
  getCacheStats,
};
