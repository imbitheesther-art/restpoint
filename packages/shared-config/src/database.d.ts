/**
 * @file Database connection pool and query helpers
 * Shared MySQL2 connection for services.
 */
import mysql, { Pool, RowDataPacket, ExecuteValues } from 'mysql2/promise';
export declare const pool: Pool;
/**
 * Execute a parameterized SQL query returning multiple rows.
 * @param sql - Parameterized SQL string (use ? placeholders)
 * @param params - Bound parameters
 */
export declare function safeQuery<T extends RowDataPacket = RowDataPacket>(sql: string, params?: ExecuteValues): Promise<T[]>;
/**
 * Execute a parameterized SQL query returning only the first row or null.
 */
export declare function safeQueryOne<T extends RowDataPacket = RowDataPacket>(sql: string, params?: ExecuteValues): Promise<T | null>;
/**
 * Get a single connection from the pool for transaction support
 */
export declare function getConnection(): Promise<mysql.PoolConnection>;
/**
 * Release a connection back to the pool
 */
export declare function releaseConnection(connection: any): Promise<void>;
//# sourceMappingURL=database.d.ts.map