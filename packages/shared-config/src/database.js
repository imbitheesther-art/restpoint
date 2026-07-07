"use strict";
/**
 * @file Database connection pool and query helpers
 * Shared MySQL2 connection for services.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.safeQuery = safeQuery;
exports.safeQueryOne = safeQueryOne;
exports.getConnection = getConnection;
exports.releaseConnection = releaseConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const types_1 = require("./types");
dotenv_1.default.config();
// ============================================================
// CREDENTIAL RESOLUTION
// ============================================================
function requireEnv(key, fallback) {
    const val = process.env[key];
    if (!val) {
        if (fallback !== undefined) {
            if (process.env['NODE_ENV'] !== 'production') {
                console.warn(`[shared-config] ${key} not set, using fallback for non-production`);
                return fallback;
            }
            console.error(`[shared-config] FATAL: Required env var ${key} is not set`);
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
exports.pool = promise_1.default.createPool({
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
 * @param params - Bound parameters
 */
async function safeQuery(sql, params = []) {
    try {
        const [rows] = await exports.pool.execute(sql, params);
        return rows;
    }
    catch (error) {
        const err = error;
        console.error('Database query error:', {
            sql: sql.substring(0, 500),
            error: err.message,
            code: err.code,
        });
        throw new types_1.DatabaseError(`Query failed: ${err.message}`, sql.substring(0, 200));
    }
}
/**
 * Execute a parameterized SQL query returning only the first row or null.
 */
async function safeQueryOne(sql, params = []) {
    const rows = await safeQuery(sql, params);
    return rows[0] ?? null;
}
/**
 * Get a single connection from the pool for transaction support
 */
async function getConnection() {
    return await exports.pool.getConnection();
}
/**
 * Release a connection back to the pool
 */
async function releaseConnection(connection) {
    if (connection) {
        await connection.release();
    }
}
//# sourceMappingURL=database.js.map