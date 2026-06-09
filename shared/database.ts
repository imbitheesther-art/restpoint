/**
 * @file shared/database.ts
 * Shared MySQL2 connection pool for services that don't use apps/global.
 *
 * SECURITY:
 * - No 'root' credential fallbacks — missing DB_USER/DB_PASSWORD logs a warning
 * - Parameterized queries only (safeQuery/safeQueryOne)
 * - SSL support via DB_SSL env var
 */

import mysql, { Pool, RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';
import { DatabaseError } from '../apps/global/types/errors';

dotenv.config();

// ============================================================
// CREDENTIAL RESOLUTION
// ============================================================

function requireEnv(key: string, fallback?: string): string {
  const val = process.env[key];
  if (!val) {
    if (fallback !== undefined) {
      // In non-production, use fallback but warn
      if (process.env['NODE_ENV'] !== 'production') {
        console.warn(`[shared/database] ${key} not set, using fallback for non-production`);
        return fallback;
      }
      console.error(`[shared/database] FATAL: Required env var ${key} is not set`);
      process.exit(1);
    }
    return '';
  }
  return val;
}

const DB_HOST = requireEnv('MAIN_DB_HOST', requireEnv('DB_HOST', 'localhost'));
const DB_PORT = parseInt(process.env['MAIN_DB_PORT'] ?? process.env['DB_PORT'] ?? '3306', 10);
const DB_USER = requireEnv('MAIN_DB_USER', requireEnv('DB_USER', 'app_user'));
const DB_PASSWORD = requireEnv('MAIN_DB_PASSWORD', requireEnv('DB_PASSWORD', ''));
const DB_NAME = requireEnv('MAIN_DB_NAME', requireEnv('DB_NAME', 'montezuma_mortuary'));
const DB_POOL_SIZE = parseInt(process.env['DB_POOL_SIZE'] ?? '10', 10);

// ============================================================
// POOL CREATION
// ============================================================

export const pool: Pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: DB_POOL_SIZE,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true,
  ...(process.env['DB_SSL'] === 'true' && {
    ssl: {
      rejectUnauthorized: process.env['DB_SSL_REJECT_UNAUTHORIZED'] !== 'false',
    },
  }),
});

// ============================================================
// TYPED QUERY HELPERS
// ============================================================

/**
 * Execute a parameterized SQL query returning multiple rows.
 * @param sql - Parameterized SQL string (use ? placeholders)
 * @param params - Bound parameters — NEVER build SQL via string concatenation
 */
export async function safeQuery<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  try {
    const [rows] = await pool.execute<T[]>(sql, params);
    return rows;
  } catch (error) {
    const err = error as Error & { code?: string };
    console.error('Database query error:', {
      sql: sql.substring(0, 500),
      error: err.message,
      code: err.code,
    });
    throw new DatabaseError(`Query failed: ${err.message}`, sql.substring(0, 200));
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

// ============================================================
// CommonJS-compatible exports
// ============================================================

module.exports = {
  pool,
  safeQuery,
  safeQueryOne,
};
