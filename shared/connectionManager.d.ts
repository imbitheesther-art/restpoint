/**
 * @file shared/connectionManager.ts
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  RESTPOINT BULLETPROOF DATABASE CONNECTION MANAGER
 *  ───────────────────────────────────────────────────────────────────────────
 *  Defensive Architecture for Database-per-Tenant MariaDB (22 services × 10 tenants)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * DESIGN GOALS (Defense-in-Depth):
 *  1. THREAD-SAFE SINGLETON — One instance per microservice process
 *  2. LRU POOL EVICTION — Pools idle >5 min are gracefully drained & freed
 *  3. STRICT HARD CAPS — Max 3 connections/tenant; extra queries QUEUE with timeout
 *  4. KEEP-ALIVE & DEAD PRUNING — 'SELECT 1' validation before every handoff to app
 *  5. ABSOLUTE ERROR ISOLATION — Guaranteed connection release via try/catch/finally
 *  6. UNIFIED QUERY METHOD — execute(tenantDbName, sql, params)
 *
 * MEMORY SAFETY GUARANTEES:
 *  - No unclosed pools: Eviction timer drains + cleanup on shutdown
 *  - No dangling connections: Idle connections are pruned by mysql2 + custom timer
 *  - No orphaned Pool objects: WeakRef-like tracking via Map + deletion after drain
 *  - No "Too many connections" errors: Hard cap of 3 conns × 10 tenants = 30 max
 *  - No "Broken pipe" errors: Validation query before every use
 *  - No cross-tenant contamination: Isolated pools with unique connection limits
 *  - No unhandled promise rejections: Every async operation has .catch()
 *  - No infinite memory growth: LRU eviction caps pool count
 *
 * SHUTDOWN SEQUENCE:
 *  On SIGTERM/SIGINT, call connectionManager.shutdown() to:
 *  1. Stop the eviction timer
 *  2. Drain all pools (wait for active queries to finish, max 10s)
 *  3. Close all connections
 *  4. Clear all caches
 *  5. Nullify the singleton reference
 */
import mysql from 'mysql2/promise';
interface ConnectionManagerConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    maxConnectionsPerTenant: number;
    maxQueuePerTenant: number;
    queueTimeoutMs: number;
    idleTimeoutMinutes: number;
    evictionCheckIntervalMs: number;
    connectionTimeoutMs: number;
    acquireTimeoutMs: number;
    idleConnectionTimeoutMs: number;
    validationQuery: string;
}
export declare class ConnectionManager {
    private static instance;
    private readonly config;
    private readonly poolCache;
    private readonly lruOrder;
    private evictionTimer;
    private isShuttingDown;
    private totalConnectionsCreated;
    private totalConnectionsDestroyed;
    private constructor();
    /**
     * Gets the singleton ConnectionManager instance.
     * Creates it on first call with optional config overrides.
     *
     * Thread-Safety: In Node.js, module-level state is inherently single-threaded
     * due to JavaScript's event loop model. However, this pattern also works safely
     * in Worker Threads if each thread creates its own instance via the module import.
     *
     * Memory Safety: Only one Map exists per process. No clone/copy is ever made.
     */
    static getInstance(config?: Partial<ConnectionManagerConfig>): ConnectionManager;
    /**
     * Resets the singleton instance (for testing or graceful restart).
     * Drains all pools before nullifying.
     *
     * Memory Safety: Ensures all pool resources are freed before the singleton
     * reference is released, preventing orphaned connections.
     */
    static resetInstance(): Promise<void>;
    /**
     * Executes a SQL query on a tenant's database with guaranteed cleanup.
     *
     * This is the UNIFIED ENTRY POINT for ALL database operations across ALL services.
     * Every query, regardless of which service calls it, goes through this method.
     *
     * GUARANTEES:
     *  1. Connection is always released back to the pool (via finally block)
     *  2. Connection is validated with 'SELECT 1' before use
     *  3. LRU timestamp is updated on every call
     *  4. If pool doesn't exist, it is auto-created
     *  5. If pool is idle too long, it's evicted (next call recreates it)
     *  6. Every error is wrapped, logged, and re-thrown without leaking resources
     *
     * @param tenantDbName - The tenant's database name (e.g., 'tenant_acme_corp')
     * @param sql - The parameterized SQL query
     * @param params - Query parameters (default: [])
     * @returns The query result rows as an array
     *
     * @throws Error if the query fails, but the connection is ALWAYS released first
     */
    query<T = any>(tenantDbName: string, sql: string, params?: any[]): Promise<T[]>;
    /**
     * Executes a SQL statement (INSERT/UPDATE/DELETE) and returns the ResultSetHeader.
     * Identical guarantees as query() but returns affected rows count etc.
     */
    execute<T = mysql.ResultSetHeader>(tenantDbName: string, sql: string, params?: any[]): Promise<T>;
    /**
     * Gets or creates a connection pool for the given tenant database.
     *
     * This is the ONLY place where mysql.createPool() is called, ensuring
     * centralized control over pool creation parameters.
     *
     * Memory Safety: We strictly limit the total number of pools via LRU eviction.
     * If the pool exists, we return it immediately. If not, we create a new one
     * and register it in the cache.
     */
    private getOrCreatePool;
    /**
     * Acquires a connection from the pool with timeout protection.
     *
     * This wraps pool.getConnection() with a timeout promise race to ensure
     * we never wait indefinitely for a connection. If the pool is exhausted
     * and the queue is full, we fail fast with a clear error message.
     *
     * Memory Safety: Timeout rejections from the race are caught. The connection
     * variable is either null (timeout) or a valid connection (acquired).
     */
    private acquireConnection;
    /**
     * Validates a database connection by executing a fast health-check query.
     *
     * This is the KEY defense against "Broken pipe" and "Lost connection" errors.
     * By testing the connection with 'SELECT 1' BEFORE handing it to the app,
     * we catch dead connections early and remove them from the pool.
     *
     * MySQL2's pool internally prunes connections that fail this check,
     * and the next getConnection() will create a fresh, healthy connection.
     */
    private validateConnection;
    /**
     * Updates the LRU order to mark a tenant as recently used.
     * Moves the tenant key to the front of the LRU order array.
     *
     * Time complexity: O(n) where n = number of pools. This is acceptable
     * because we limit pools to ~10-20 tenants. If we had 1000+ tenants,
     * we'd use a proper doubly-linked list.
     *
     * Memory Safety: We never remove items from the LRU array without also
     * cleaning up the corresponding pool. The eviction cycle ensures consistency.
     */
    private updateLRU;
    /**
     * The eviction cycle: Checks all pools and evicts those that have been
     * idle longer than `idleTimeoutMinutes`.
     *
     * This runs on a timer (default: every 60 seconds) and is designed to be
     * safe to call even while queries are in flight.
     *
     * Safety: We check `activeConnections` before evicting. If a pool has
     * active connections, we skip eviction (it's not truly idle).
     * The pool will be evicted on the next cycle if it becomes idle.
     *
     * Memory Safety: We iterate backward through the LRU array (oldest first)
     * so we evict the least recently used pools first. This is the correct
     * LRU eviction strategy — we keep the most recently used pools.
     */
    private evictionCycle;
    /**
     * Evicts a single pool: drains it, closes all connections, and removes it from the cache.
     *
     * This is a GRACEFUL eviction:
     *  1. We remove the pool from the cache FIRST (so no new queries can use it)
     *  2. We drain the pool (wait for active queries to finish, with a timeout)
     *  3. We close all connections in the pool
     *  4. We clean up the LRU order
     *
     * Grace period: If the pool has active connections, we wait up to 10 seconds
     * for them to finish before force-closing.
     *
     * Memory Safety: Every step is wrapped in try/catch. Even if pool.end() fails,
     * we still remove the Map entry and LRU entry to prevent phantom references.
     */
    private evictPool;
    /**
     * Removes a tenant from the LRU order array.
     * Safe to call even if the tenant is not in the array.
     */
    private removeFromLRU;
    /**
     * Starts the background eviction timer.
     *
     * This timer runs continuously and checks every `evictionCheckIntervalMs`
     * for pools that have been idle too long.
     *
     * The timer is a Node.js `setInterval` which runs on the event loop.
     * It does NOT block the main thread. Evictions are scheduled asynchronously.
     */
    private startEvictionTimer;
    /**
     * Stops the eviction timer.
     */
    private stopEvictionTimer;
    /**
     * Graceful shutdown of ALL pools.
     *
     * Call this on SIGTERM / SIGINT to ensure all connections are closed
     * before the process exits. This prevents "aborted connections" warnings
     * from MariaDB.
     *
     * Shutdown sequence:
     *  1. Set the shutdown flag (rejects all new queries)
     *  2. Stop the eviction timer
     *  3. Drain all pools (with 10s timeout per pool)
     *  4. Clear all caches
     *  5. Log final statistics
     *
     * Memory Safety: After this completes, all mysql2 pool resources are freed.
     * There should be no more open TCP connections to MariaDB.
     */
    shutdown(): Promise<void>;
    /**
     * Registers handlers for SIGTERM and SIGINT to ensure graceful shutdown.
     *
     * We use `process.once()` to avoid registering duplicate handlers
     * if getInstance() is called multiple times.
     *
     * Note: SIGKILL cannot be caught, so there's always a possibility of
     * unclean shutdown. However, MariaDB's `wait_timeout` will eventually
     * clean up orphaned connections from the server side.
     */
    private registerShutdownHandlers;
    /**
     * Returns diagnostic information about the connection manager's state.
     * Useful for health check endpoints and monitoring dashboards.
     *
     * This method does NOT acquire or release any connections — it's purely
     * informational and has no side effects.
     */
    getHealth(): object;
    /**
     * Returns the approximate number of open TCP connections across all pools.
     * This is an estimate based on created minus destroyed.
     */
    private getTotalOpenConnections;
    /**
     * Returns the number of currently active (checked-out) connections across all pools.
     */
    getActiveConnectionCount(): number;
}
/**
 * Creates and returns the singleton ConnectionManager instance.
 * This is the recommended import for all RESTPoint services.
 *
 * Usage:
 *   import { connectionManager } from '../../shared/connectionManager';
 *   const rows = await connectionManager.query('tenant_db', 'SELECT * FROM users');
 *   const result = await connectionManager.execute('tenant_db', 'UPDATE users SET name=?', ['Alice']);
 */
export declare const connectionManager: ConnectionManager;
/**
 * Convenience function for backward compatibility with existing services
 * that import from shared/database.js or shared/dbConfig.ts.
 *
 * This wraps the legacy signature: safeTenantQuery(dbName, sql, params)
 */
export declare const safeQuery: (tenantDbName: string, sql: string, params?: any[]) => Promise<any[]>;
export declare const safeExecute: (tenantDbName: string, sql: string, params?: any[]) => Promise<mysql.ResultSetHeader>;
export default connectionManager;
//# sourceMappingURL=connectionManager.d.ts.map