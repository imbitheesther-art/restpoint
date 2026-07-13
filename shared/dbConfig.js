"use strict";
/**
 * @file shared/dbConfig.ts
 * CENTRALIZED DATABASE CONFIGURATION — Single source of truth for ALL services
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeAllConnections = exports.closeTenantDB = exports.safeTenantExecute = exports.safeTenantQuery = exports.execute = exports.query = exports.getTenantDBBySlug = exports.getTenantDB = exports.resolveDatabase = exports.lookupTenantDatabase = exports.getRootPool = void 0;
const mysql = require("mysql2/promise");
const mysql_promise = mysql;
// ============================================
// Database Configuration
// ============================================
// Centralized database configuration with connection pooling
// Each service uses this shared configuration for consistent database access
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
// FIXED: Now actively used to prevent recurring multi-hop queries
const branchDbCache = new Map();
// ─── Root Pool ───────────────────────────────────────────────────────────────
const getRootPool = async () => {
    if (!rootPool) {
        rootPool = mysql.createPool({
            ...DB_CONFIG,
            database: 'tenant_tracking',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
        });
        console.log('✅ Root database pool created (default DB: tenant_tracking)');
    }
    return rootPool;
};
exports.getRootPool = getRootPool;
// ─── Tenant Lookup ───────────────────────────────────────────────────────────
const lookupTenantDatabase = async (tenantSlug) => {
    try {
        const pool = await (0, exports.getRootPool)();
        const [rows] = await pool.query('SELECT db_name FROM tenants WHERE tenant_slug = ? AND status = "active" LIMIT 1', [tenantSlug]);
        const result = rows;
        if (result.length > 0 && result[0].db_name) {
            return result[0].db_name;
        }
        console.warn(`⚠️ No active database found for tenant: ${tenantSlug}`);
        return null;
    }
    catch (error) {
        console.error(`❌ Error looking up tenant database for "${tenantSlug}":`, error.message);
        return null;
    }
};
exports.lookupTenantDatabase = lookupTenantDatabase;
// ─── Unified Slug Resolution (Single + Multi-branch) ─────────────────────────
const resolveDatabase = async (slug) => {
    if (!slug || slug === 'system_shared') {
        console.error('❌ Invalid slug provided');
        return null;
    }
    // FIXED: Return instantly if slug translation has already been cached
    if (branchDbCache.has(slug)) {
        return branchDbCache.get(slug);
    }
    console.log(`🔍 Resolving database for slug: ${slug}`);
    // ✅ NEW: First check if the slug IS the database name (direct database access)
    try {
        const rootPool = await (0, exports.getRootPool)();
        const [dbRows] = await rootPool.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ? LIMIT 1`, [slug]);
        const dbResult = dbRows;
        if (dbResult.length > 0) {
            console.log(`✅ Direct database access: ${slug}`);
            branchDbCache.set(slug, slug);
            return slug;
        }
    }
    catch (err) {
        console.warn(`⚠️ Direct DB check failed for "${slug}": ${err.message}`);
    }
    // Step 1: Try as a main tenant slug (single-branch mode)
    const mainDbName = await (0, exports.lookupTenantDatabase)(slug);
    if (mainDbName) {
        console.log(`📁 Single-branch mode: using main tenant DB: ${mainDbName}`);
        branchDbCache.set(slug, mainDbName);
        return mainDbName;
    }
    // Step 2: Not a main tenant → try branch mode
    const lastDashIndex = slug.lastIndexOf('-');
    if (lastDashIndex > 0) {
        const possibleTenantSlug = slug.substring(0, lastDashIndex);
        const branchName = slug.substring(lastDashIndex + 1);
        console.log(`🔍 Trying branch mode: tenant="${possibleTenantSlug}", branch="${branchName}"`);
        const tenantDbName = await (0, exports.lookupTenantDatabase)(possibleTenantSlug);
        if (tenantDbName) {
            try {
                // FIXED: Swapped out slow createConnection() for reusable tenantPoolCache borrowing
                const pool = await (0, exports.getTenantDB)(tenantDbName);
                const [rows] = await pool.query(`SELECT branch_db_name FROM branches 
           WHERE (branch_slug LIKE ? OR branch_name LIKE ?) AND is_active = TRUE 
           LIMIT 1`, [`%${branchName}%`, `%${branchName}%`]);
                const list = rows;
                if (list.length > 0) {
                    const branchDbName = list[0].branch_db_name;
                    console.log(`📁 Multi-branch mode: using branch DB: ${branchDbName}`);
                    branchDbCache.set(slug, branchDbName);
                    return branchDbName;
                }
            }
            catch (err) {
                console.warn(`⚠️ Error looking up branch, falling back to main DB: ${tenantDbName}. Error: ${err.message}`);
                return tenantDbName;
            }
            console.warn(`⚠️ Branch "${branchName}" not found, using main DB fallback: ${tenantDbName}`);
            return tenantDbName;
        }
    }
    console.error(`❌ Could not resolve database for slug: ${slug}`);
    return null;
};
exports.resolveDatabase = resolveDatabase;
// ─── Tenant Pool Management ──────────────────────────────────────────────────
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
    console.log(`✅ Connected to tenant database: ${tenantDbName}`);
    return pool;
};
exports.getTenantDB = getTenantDB;
const getTenantDBBySlug = async (tenantSlug) => {
    const dbName = await (0, exports.lookupTenantDatabase)(tenantSlug);
    if (!dbName) {
        return null;
    }
    return (0, exports.getTenantDB)(dbName);
};
exports.getTenantDBBySlug = getTenantDBBySlug;
// ─── Global Query Executors ──────────────────────────────────────────────────
const query = async (req, sql, params = []) => {
    // FIXED: Ensured safe parsing of Express lowercase normalized string arrays
    const rawSlug = req.headers['x-slug'] || req.headers['x-tenant-slug'];
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
    if (!slug) {
        throw new Error('Missing x-slug or x-tenant-slug header');
    }
    const dbName = await (0, exports.resolveDatabase)(slug);
    if (!dbName) {
        throw new Error(`No database configured for: ${slug}`);
    }
    try {
        const pool = await (0, exports.getTenantDB)(dbName);
        const [rows] = await pool.query(sql, params);
        return rows;
    }
    catch (error) {
        console.error(`❌ Query error on "${dbName}":`, {
            message: error.message,
            sql: sql.substring(0, 200),
        });
        throw error;
    }
};
exports.query = query;
const execute = async (req, sql, params = []) => {
    // FIXED: Safe string extraction for custom router headers
    const rawSlug = req.headers['x-slug'] || req.headers['x-tenant-slug'];
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
    if (!slug) {
        throw new Error('Missing x-slug or x-tenant-slug header');
    }
    const dbName = await (0, exports.resolveDatabase)(slug);
    if (!dbName) {
        throw new Error(`No database configured for: ${slug}`);
    }
    try {
        const pool = await (0, exports.getTenantDB)(dbName);
        const [result] = await pool.query(sql, params);
        return result;
    }
    catch (error) {
        console.error(`❌ Execute error on "${dbName}":`, {
            message: error.message,
            sql: sql.substring(0, 200),
        });
        throw error;
    }
};
exports.execute = execute;
// ─── Legacy Safe Query Functions ───────────────────────────────────────────────
const safeTenantQuery = async (dbName, sql, params = []) => {
    try {
        const pool = await (0, exports.getTenantDB)(dbName);
        const [rows] = await pool.query(sql, params);
        return rows;
    }
    catch (error) {
        console.error(`❌ safeTenantQuery error on "${dbName}":`, { message: error.message, sql: sql.substring(0, 200) });
        throw error;
    }
};
exports.safeTenantQuery = safeTenantQuery;
const safeTenantExecute = async (dbName, sql, params = []) => {
    try {
        const pool = await (0, exports.getTenantDB)(dbName);
        const [result] = await pool.query(sql, params);
        return result;
    }
    catch (error) {
        console.error(`❌ safeTenantExecute error on "${dbName}":`, { message: error.message, sql: sql.substring(0, 200) });
        throw error;
    }
};
exports.safeTenantExecute = safeTenantExecute;
// ─── Connection Management ───────────────────────────────────────────────────
const closeTenantDB = async (tenantDbName) => {
    const pool = tenantPoolCache.get(tenantDbName);
    if (pool) {
        await pool.end().catch(() => { });
        tenantPoolCache.delete(tenantDbName);
        console.log(`🔌 Closed pool for: ${tenantDbName}`);
    }
};
exports.closeTenantDB = closeTenantDB;
const closeAllConnections = async () => {
    for (const [dbName, pool] of tenantPoolCache) {
        await pool.end().catch(() => { });
        console.log(`🔌 Closed pool for: ${dbName}`);
    }
    tenantPoolCache.clear();
    branchDbCache.clear(); // Clear mapping definitions cache too
    if (rootPool) {
        await rootPool.end().catch(() => { });
        rootPool = null;
        console.log('🔌 Closed root pool');
    }
};
exports.closeAllConnections = closeAllConnections;
// ─── Default Export ──────────────────────────────────────────────────────────
exports.default = {
    getRootPool: exports.getRootPool,
    lookupTenantDatabase: exports.lookupTenantDatabase,
    resolveDatabase: exports.resolveDatabase,
    getTenantDB: exports.getTenantDB,
    getTenantDBBySlug: exports.getTenantDBBySlug,
    query: exports.query,
    execute: exports.execute,
    safeTenantQuery: exports.safeTenantQuery,
    safeTenantExecute: exports.safeTenantExecute,
    closeTenantDB: exports.closeTenantDB,
    closeAllConnections: exports.closeAllConnections,
};
//# sourceMappingURL=dbConfig.js.map