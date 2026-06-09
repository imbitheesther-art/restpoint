/**
 * @file apps/global/config/db.ts
 * Typed MySQL2 connection pool with parameterized query helpers.
 *
 * SECURITY:
 * - No 'root' or plaintext credential fallbacks in production
 * - Credentials resolved from validated env config
 * - Parameterized queries only — no string concatenation
 * - mTLS available via DB_SSL env var
 */

import mysql, { Pool, PoolConnection, RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2/promise';
import { config } from './env';
import { DatabaseError } from '../types/errors';

const Logger = require('../logger/logger') as { info: (m: string, ...a: unknown[]) => void; warn: (m: string, ...a: unknown[]) => void; error: (m: string, ...a: unknown[]) => void; debug: (m: string, ...a: unknown[]) => void };

// ============================================================
// POOL CREATION
// ============================================================

const poolConfig: mysql.PoolOptions = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: config.db.poolSize,
  queueLimit: config.db.queueLimit,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: config.db.connectionTimeout,
  dateStrings: true,
  ...(config.db.ssl && {
    ssl: {
      rejectUnauthorized: config.db.sslRejectUnauthorized,
    },
  }),
};

export const pool: Pool = mysql.createPool(poolConfig);

// ============================================================
// TYPED QUERY HELPERS
// ============================================================

export type SqlRow = RowDataPacket;
export type SqlResult = OkPacket | ResultSetHeader;

/**
 * Execute a parameterized SQL query returning multiple rows.
 * Type param T constrains the shape of returned rows.
 */
export async function safeQuery<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const startTime = Date.now();
  try {
    const [rows] = await pool.execute<T[]>(sql, params);
    const duration = Date.now() - startTime;

    if (duration > 1000) {
      Logger.warn(`Slow query (${duration}ms): ${sql.substring(0, 200)}`);
    }

    return rows;
  } catch (error) {
    const err = error as Error & { code?: string };
    Logger.error('Query error:', {
      sql: sql.substring(0, 500),
      params,
      error: err.message,
      code: err.code,
    });
    throw new DatabaseError(`Database query failed: ${err.message}`, sql.substring(0, 200));
  }
}

/**
 * Execute a parameterized SQL query returning only the first row or null.
 */
export async function safeQueryOne<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await safeQuery<T>(sql, params);
  return rows[0] ?? null;
}

/**
 * Get a raw connection for manual transaction management.
 */
export async function getConnection(): Promise<PoolConnection> {
  return pool.getConnection();
}

// ============================================================
// TRANSACTION SUPPORT
// ============================================================

export interface TransactionContext {
  query: <T extends RowDataPacket = RowDataPacket>(sql: string, params?: unknown[]) => Promise<T[]>;
  queryOne: <T extends RowDataPacket = RowDataPacket>(sql: string, params?: unknown[]) => Promise<T | null>;
  execute: (sql: string, params?: unknown[]) => Promise<SqlResult>;
  connection: PoolConnection;
}

/**
 * Execute a callback inside a database transaction.
 * Automatically commits on success, rolls back on error.
 */
export async function transaction<T>(callback: (ctx: TransactionContext) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    Logger.debug('Transaction started');

    const ctx: TransactionContext = {
      query: async <R extends RowDataPacket = RowDataPacket>(sql: string, params: unknown[] = []) => {
        const [rows] = await connection.execute<R[]>(sql, params);
        return rows;
      },
      queryOne: async <R extends RowDataPacket = RowDataPacket>(sql: string, params: unknown[] = []) => {
        const [rows] = await connection.execute<R[]>(sql, params);
        return rows[0] ?? null;
      },
      execute: async (sql: string, params: unknown[] = []) => {
        const [result] = await connection.execute<ResultSetHeader>(sql, params);
        return result;
      },
      connection,
    };

    const result = await callback(ctx);
    await connection.commit();
    Logger.debug('Transaction committed');
    return result;
  } catch (error) {
    await connection.rollback();
    const err = error as Error;
    Logger.error('Transaction rolled back:', { error: err.message, stack: err.stack });
    throw error;
  } finally {
    connection.release();
  }
}

// ============================================================
// HEALTH CHECK
// ============================================================

export async function healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { status: 'healthy', message: 'Database connection successful' };
  } catch (error) {
    const err = error as Error;
    Logger.error('Database health check failed:', error);
    return { status: 'unhealthy', message: err.message };
  }
}

// ============================================================
// POOL MONITORING
// ============================================================

export function getPoolStatus(): { totalConnections: number; freeConnections: number; waitingClients: number } {
  // mysql2 pool internals (best-effort, may not be available in all versions)
  const p = pool as unknown as { pool?: { _allConnections?: unknown[]; _freeConnections?: unknown[]; _connectionQueue?: unknown[] } };
  return {
    totalConnections: p.pool?._allConnections?.length ?? 0,
    freeConnections: p.pool?._freeConnections?.length ?? 0,
    waitingClients: p.pool?._connectionQueue?.length ?? 0,
  };
}

// ============================================================
// INITIALIZE / CLOSE
// ============================================================

let isInitialized = false;

export async function initDB(): Promise<void> {
  if (isInitialized) return;

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    Logger.info(`✅ Connected to database: ${config.db.name}@${config.db.host}:${config.db.port}`);
    isInitialized = true;
  } catch (error) {
    const err = error as Error & { code?: string };
    Logger.error('❌ Failed to connect to database:', { error: err.message, code: err.code });
    throw new DatabaseError(`Failed to connect to database: ${err.message}`);
  }
}

export async function closeDB(): Promise<void> {
  try {
    await pool.end();
    Logger.info('✅ Database pool closed');
    isInitialized = false;
  } catch (error) {
    const err = error as Error;
    Logger.error('Error closing database pool:', error);
    throw new DatabaseError(`Failed to close database pool: ${err.message}`);
  }
}

// ============================================================
// EXPORTS (CommonJS-compatible for services still using require())
// ============================================================

module.exports = {
  pool,
  safeQuery,
  safeQueryOne,
  getConnection,
  transaction,
  healthCheck,
  getPoolStatus,
  initDB,
  closeDB,
};
