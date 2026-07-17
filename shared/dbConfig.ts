/**
 * @file shared/dbConfig.ts
 * PRODUCTION-GRADE CENTRALIZED DATABASE CONFIGURATION
 * Features: Circuit Breaker, Pool Limits, Logger, Memory Leak Prevention
 */

import * as mysql from 'mysql2/promise';

// ============================================
// Logger (production-safe, no console.log)
// ============================================
const LOGGER = {
  info: (msg: string, data?: any) => {
    if (process.env.NODE_ENV !== 'test') {
      process.stdout.write(JSON.stringify({ level: 'info', msg, data, ts: new Date().toISOString() }) + '\n');
    }
  },
  warn: (msg: string, data?: any) => {
    process.stdout.write(JSON.stringify({ level: 'warn', msg, data, ts: new Date().toISOString() }) + '\n');
  },
  error: (msg: string, data?: any) => {
    process.stderr.write(JSON.stringify({ level: 'error', msg, data, ts: new Date().toISOString() }) + '\n');
  },
};

// ============================================
// GSSAPI Auth Plugin Fix for MariaDB 10.11+
// ============================================
const auth_gssapi_client = () => () => {
  throw new Error('GSSAPI not supported - use mysql_native_password');
};

// ============================================
// Circuit Breaker
// ============================================
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly threshold: number;
  private readonly timeout: number;
  private readonly halfOpenMaxRequests: number = 1;
  private halfOpenRequests: number = 0;

  constructor(threshold: number = 5, timeout: number = 30000) {
    this.threshold = threshold;
    this.timeout = timeout;
  }

  async call<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = 'HALF_OPEN';
        this.halfOpenRequests = 0;
        LOGGER.info('Circuit breaker half-open, allowing test request');
      } else {
        LOGGER.warn('Circuit breaker OPEN, using fallback', { failures: this.failures });
        return fallback();
      }
    }

    if (this.state === 'HALF_OPEN' && this.halfOpenRequests >= this.halfOpenMaxRequests) {
      return fallback();
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error: any) {
      this.onFailure(error);
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.halfOpenRequests = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      LOGGER.info('Circuit breaker CLOSED after successful half-open request');
    }
  }

  private onFailure(error: any): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      LOGGER.error('Circuit breaker OPEN after half-open failure', { error: error.message });
    } else if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      LOGGER.error('Circuit breaker OPEN', { failures: this.failures, threshold: this.threshold });
    }
  }

  getState(): string { return this.state; }
  reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.halfOpenRequests = 0;
  }
}

// ============================================
// Configuration
// ============================================
const DB_CONFIG = {
  host: process.env.DB_HOST || 'mariadb',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'restpoint_user',
  password: process.env.DB_PASSWORD || '',
  authPlugins: { auth_gssapi_client },
  connectTimeout: 10000,
};

// Pool limits to prevent memory leaks
const MAX_POOL_CACHE_SIZE = 50; // Max tenant pools to cache
const POOL_IDLE_TIMEOUT = 300000; // 5 minutes idle timeout
const POOL_CLEANUP_INTERVAL = 60000; // Check every 60s
const MAX_POOL_CONNECTIONS = 10;
const MIN_POOL_CONNECTIONS = 2;

// ─── Connection Pool Caches ──────────────────────────────────────────────────
let rootPool: mysql.Pool | null = null;
const tenantPoolCache = new Map<string, { pool: mysql.Pool; createdAt: number; lastUsed: number }>();
const branchDbCache = new Map<string, { dbName: string; createdAt: number }>();
const branchDbCacheTTL = 300000; // 5 minutes

// Circuit breakers
const rootPoolBreaker = new CircuitBreaker(5, 30000);
const tenantPoolBreaker = new CircuitBreaker(3, 30000);

// ─── Pool Cleanup Interval (prevents memory leaks) ───────────────────────────
let cleanupInterval: NodeJS.Timeout | null = null;

function startPoolCleanup(): void {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    // Clean stale branch DB cache entries
    for (const [key, entry] of branchDbCache) {
      if (now - entry.createdAt > branchDbCacheTTL) {
        branchDbCache.delete(key);
        cleaned++;
      }
    }

    // Clean idle tenant pools (beyond max cache size)
    if (tenantPoolCache.size > MAX_POOL_CACHE_SIZE) {
      const sorted = [...tenantPoolCache.entries()]
        .sort((a, b) => a[1].lastUsed - b[1].lastUsed);

      const toRemove = sorted.slice(0, tenantPoolCache.size - MAX_POOL_CACHE_SIZE);
      for (const [key, entry] of toRemove) {
        entry.pool.end().catch(() => { });
        tenantPoolCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      LOGGER.info('Pool cleanup completed', { removed: cleaned, remaining: tenantPoolCache.size });
    }
  }, POOL_CLEANUP_INTERVAL);

  // Allow process to exit even if interval is running
  if (cleanupInterval) cleanupInterval.unref();
}

function stopPoolCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

// ─── Root Pool ───────────────────────────────────────────────────────────────

export const getRootPool = async (): Promise<mysql.Pool> => {
  if (!rootPool) {
    rootPool = mysql.createPool({
      ...DB_CONFIG,
      database: 'tenant_tracking',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 10,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      idleTimeout: POOL_IDLE_TIMEOUT,
    });

    // Test connection
    try {
      const conn = await rootPool.getConnection();
      await conn.ping();
      conn.release();
      LOGGER.info('Root database pool created (tenant_tracking)');
    } catch (err: any) {
      LOGGER.error('Root pool creation failed', { error: err.message });
    }

    startPoolCleanup();
  }
  return rootPool;
};

// ─── Tenant Lookup with Circuit Breaker ──────────────────────────────────────

export const lookupTenantDatabase = async (tenantSlug: string): Promise<string | null> => {
  return rootPoolBreaker.call(
    async () => {
      const pool = await getRootPool();
      const [rows] = await pool.query(
        'SELECT db_name FROM tenants WHERE tenant_slug = ? AND status = "active" LIMIT 1',
        [tenantSlug]
      );
      const result = rows as any[];
      if (result.length > 0 && result[0].db_name) {
        return result[0].db_name;
      }
      LOGGER.warn('No active database found for tenant', { tenantSlug });
      return null;
    },
    () => null
  );
};

// ─── Unified Slug Resolution ─────────────────────────────────────────

export const resolveDatabase = async (slug: string): Promise<string | null> => {
  if (!slug || slug === 'system_shared') {
    LOGGER.warn('Invalid slug provided', { slug });
    return null;
  }

  // Check cache first
  const cached = branchDbCache.get(slug);
  if (cached && Date.now() - cached.createdAt < branchDbCacheTTL) {
    return cached.dbName;
  }

  LOGGER.info('Resolving database for slug', { slug });

  // Check if slug IS the database name
  try {
    const pool = await getRootPool();
    const [dbRows] = await pool.query(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ? LIMIT 1',
      [slug]
    );
    const dbResult = dbRows as any[];
    if (dbResult.length > 0) {
      branchDbCache.set(slug, { dbName: slug, createdAt: Date.now() });
      return slug;
    }
  } catch (err: any) {
    LOGGER.warn('Direct DB check failed', { slug, error: err.message });
  }

  // Try as main tenant slug
  const mainDbName = await lookupTenantDatabase(slug);
  if (mainDbName) {
    branchDbCache.set(slug, { dbName: mainDbName, createdAt: Date.now() });
    return mainDbName;
  }

  // Try branch mode
  const lastDashIndex = slug.lastIndexOf('-');
  if (lastDashIndex > 0) {
    const possibleTenantSlug = slug.substring(0, lastDashIndex);
    const branchName = slug.substring(lastDashIndex + 1);
    const tenantDbName = await lookupTenantDatabase(possibleTenantSlug);

    if (tenantDbName) {
      try {
        const pool = await getTenantDB(tenantDbName);
        const [rows] = await pool.query(
          `SELECT branch_db_name FROM branches 
           WHERE (branch_slug LIKE ? OR branch_name LIKE ?) AND is_active = TRUE 
           LIMIT 1`,
          [`%${branchName}%`, `%${branchName}%`]
        );
        const list = rows as any[];
        if (list.length > 0) {
          const branchDbName = list[0].branch_db_name;
          branchDbCache.set(slug, { dbName: branchDbName, createdAt: Date.now() });
          return branchDbName;
        }
      } catch (err: any) {
        LOGGER.warn('Branch lookup failed, falling back to main DB', {
          tenantDbName, error: err.message,
        });
        return tenantDbName;
      }
      return tenantDbName;
    }
  }

  LOGGER.error('Could not resolve database for slug', { slug });
  return null;
};

// ─── Tenant Pool Management ──────────────────────────────────────────────────

export const getTenantDB = async (tenantDbName: string): Promise<mysql.Pool> => {
  const cached = tenantPoolCache.get(tenantDbName);
  if (cached) {
    cached.lastUsed = Date.now();
    return cached.pool;
  }

  // Enforce max cache size
  if (tenantPoolCache.size >= MAX_POOL_CACHE_SIZE) {
    const oldest = [...tenantPoolCache.entries()]
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0];
    if (oldest) {
      oldest[1].pool.end().catch(() => { });
      tenantPoolCache.delete(oldest[0]);
      LOGGER.info('Evicted oldest pool to maintain cache limit', { dbName: oldest[0] });
    }
  }

  const pool = mysql.createPool({
    ...DB_CONFIG,
    database: tenantDbName,
    waitForConnections: true,
    connectionLimit: MAX_POOL_CONNECTIONS,
    queueLimit: 20,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    idleTimeout: POOL_IDLE_TIMEOUT,
  });

  // Test connection
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    LOGGER.info('Connected to tenant database', { dbName: tenantDbName });
  } catch (err: any) {
    LOGGER.error('Tenant database connection failed', { dbName: tenantDbName, error: err.message });
  }

  tenantPoolCache.set(tenantDbName, { pool, createdAt: Date.now(), lastUsed: Date.now() });
  return pool;
};

export const getTenantDBBySlug = async (tenantSlug: string): Promise<mysql.Pool | null> => {
  const dbName = await lookupTenantDatabase(tenantSlug);
  if (!dbName) return null;
  return getTenantDB(dbName);
};

// ─── Global Query Executors ──────────────────────────────────────────────────

export const query = async (req: any, sql: string, params: any[] = []): Promise<any[]> => {
  const rawSlug = req.headers['x-slug'] || req.headers['x-tenant-slug'];
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

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
    LOGGER.error('Query error', { dbName, message: error.message, sql: sql.substring(0, 200) });
    throw error;
  }
};

export const execute = async (req: any, sql: string, params: any[] = []): Promise<mysql.ResultSetHeader> => {
  const rawSlug = req.headers['x-slug'] || req.headers['x-tenant-slug'];
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

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
    LOGGER.error('Execute error', { dbName, message: error.message, sql: sql.substring(0, 200) });
    throw error;
  }
};

// ─── Safe Query Functions ────────────────────────────────────────────────────

export const safeTenantQuery = async (dbName: string, sql: string, params: any[] = []): Promise<any[]> => {
  try {
    const pool = await getTenantDB(dbName);
    const [rows] = await pool.query(sql, params);
    return rows as any[];
  } catch (error: any) {
    LOGGER.error('safeTenantQuery error', { dbName, message: error.message, sql: sql.substring(0, 200) });
    throw error;
  }
};

export const safeTenantExecute = async (dbName: string, sql: string, params: any[] = []): Promise<mysql.ResultSetHeader> => {
  try {
    const pool = await getTenantDB(dbName);
    const [result] = await pool.query(sql, params);
    return result as mysql.ResultSetHeader;
  } catch (error: any) {
    LOGGER.error('safeTenantExecute error', { dbName, message: error.message, sql: sql.substring(0, 200) });
    throw error;
  }
};

// ─── Connection Management ───────────────────────────────────────────────────

export const closeTenantDB = async (tenantDbName: string): Promise<void> => {
  const entry = tenantPoolCache.get(tenantDbName);
  if (entry) {
    await entry.pool.end().catch(() => { });
    tenantPoolCache.delete(tenantDbName);
    LOGGER.info('Closed pool for tenant', { dbName: tenantDbName });
  }
};

export const closeAllConnections = async (): Promise<void> => {
  stopPoolCleanup();

  for (const [dbName, entry] of tenantPoolCache) {
    await entry.pool.end().catch(() => { });
    LOGGER.info('Closed pool', { dbName });
  }
  tenantPoolCache.clear();
  branchDbCache.clear();

  if (rootPool) {
    await rootPool.end().catch(() => { });
    rootPool = null;
    LOGGER.info('Closed root pool');
  }
};

// ─── Health Check ────────────────────────────────────────────────────────────

export const healthCheck = async (): Promise<{
  status: string;
  pools: number;
  cacheSize: number;
  rootPoolBreaker: string;
  timestamp: string;
}> => {
  try {
    const pool = await getRootPool();
    await pool.query('SELECT 1');
    return {
      status: 'healthy',
      pools: tenantPoolCache.size,
      cacheSize: branchDbCache.size,
      rootPoolBreaker: rootPoolBreaker.getState(),
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      status: 'unhealthy',
      pools: tenantPoolCache.size,
      cacheSize: branchDbCache.size,
      rootPoolBreaker: rootPoolBreaker.getState(),
      timestamp: new Date().toISOString(),
    };
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
  healthCheck,
};