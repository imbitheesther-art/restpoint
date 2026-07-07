"use strict";
/**
 * @file packages/shared-services/src/redisService.ts
 * CENTRALIZED: Redis Service with per-tenant namespacing
 *
 * Features:
 * - Per-tenant key namespace isolation (tenant:{slug}:*)
 * - Demand-based connection pool (lazy connect, shared connections)
 * - Automatic cache clearing when tenant is suspended/deleted
 * - Balance computation caching between tenants
 * - Graceful fallback when Redis is unavailable
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = getRedisClient;
exports.tenantKey = tenantKey;
exports.crossTenantKey = crossTenantKey;
exports.tenantSet = tenantSet;
exports.tenantGet = tenantGet;
exports.tenantDel = tenantDel;
exports.clearTenantCache = clearTenantCache;
exports.getCachedBalance = getCachedBalance;
exports.setCachedBalance = setCachedBalance;
exports.invalidateBalanceCache = invalidateBalanceCache;
exports.closeRedis = closeRedis;
exports.redisHealth = redisHealth;
const redis_1 = require("redis");
const DEFAULT_REDIS_URL = process.env.REDIS_URL || process.env.REDIS_HOST
    ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`
    : 'redis://redis:6379';
const DEFAULT_TTL_SECONDS = parseInt(process.env.REDIS_DEFAULT_TTL || '3600', 10); // 1 hour
// ─── Client Pool ──────  
let client = null;
let isConnected = false;
let connectionAttempted = false;
/**
 * Get or create the shared Redis client (lazy initialization)
 * All services share one connection pool to Redis
 */
async function getRedisClient() {
    if (client && isConnected)
        return client;
    if (connectionAttempted)
        return client; // Don't retry if already failed
    connectionAttempted = true;
    try {
        client = (0, redis_1.createClient)({
            url: DEFAULT_REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 5) {
                        console.error('[Redis] Max reconnection attempts reached');
                        return new Error('Max reconnection attempts');
                    }
                    return Math.min(retries * 200, 2000);
                },
                connectTimeout: 5000,
            },
        });
        client.on('connect', () => {
            console.log('[Redis] ✅ Connected');
            isConnected = true;
        });
        client.on('error', (err) => {
            console.error('[Redis] ❌ Error:', err.message);
            isConnected = false;
        });
        client.on('end', () => {
            console.log('[Redis] 🔌 Connection closed');
            isConnected = false;
        });
        client.on('reconnecting', () => {
            console.log('[Redis] 🔄 Reconnecting...');
        });
        await client.connect();
        isConnected = true;
        return client;
    }
    catch (error) {
        console.error(`[Redis]  Failed to connect: ${error.message}`);
        console.warn('[Redis]   Running without Redis - caching disabled');
        client = null;
        isConnected = false;
        return null;
    }
}
// ─── Tenant Key Namespacing ──────────────────────────────────────────────
/**
 * Build a namespaced Redis key for a tenant
 * Format: tenant:{tenantSlug}:{key}
 */
function tenantKey(tenantSlug, key) {
    return `tenant:${tenantSlug}:${key}`;
}
/**
 * Build a namespaced Redis key for cross-tenant operations
 * Format: cross:{sourceTenant}:{targetTenant}:{key}
 */
function crossTenantKey(sourceTenant, targetTenant, key) {
    return `cross:${sourceTenant}:${targetTenant}:${key}`;
}
// ─── Per-Tenant Cache Operations ──────────────────────────────────────────
/**
 * Set a cached value for a specific tenant
 */
async function tenantSet(tenantSlug, key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
    try {
        const r = await getRedisClient();
        if (!r)
            return false;
        const fullKey = tenantKey(tenantSlug, key);
        const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
        await r.setEx(fullKey, ttlSeconds, serialized);
        return true;
    }
    catch (error) {
        console.warn(`[Redis]  tenantSet failed: ${error.message}`);
        return false;
    }
}
/**
 * Get a cached value for a specific tenant
 */
async function tenantGet(tenantSlug, key) {
    try {
        const r = await getRedisClient();
        if (!r)
            return null;
        const fullKey = tenantKey(tenantSlug, key);
        const value = await r.get(fullKey);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    catch (error) {
        console.warn(`[Redis]  tenantGet failed: ${error.message}`);
        return null;
    }
}
/**
 * Delete a cached value for a specific tenant
 */
async function tenantDel(tenantSlug, key) {
    try {
        const r = await getRedisClient();
        if (!r)
            return false;
        const fullKey = tenantKey(tenantSlug, key);
        await r.del(fullKey);
        return true;
    }
    catch (error) {
        console.warn(`[Redis]  tenantDel failed: ${error.message}`);
        return false;
    }
}
/**
 * Clear ALL cached values for a specific tenant (used on tenant suspend/delete)
 */
async function clearTenantCache(tenantSlug) {
    try {
        const r = await getRedisClient();
        if (!r)
            return 0;
        const pattern = tenantKey(tenantSlug, '*');
        let deletedCount = 0;
        // Use SCAN to find all keys for this tenant
        let cursor = 0;
        do {
            const result = await r.scan(cursor, { MATCH: pattern, COUNT: 100 });
            cursor = result.cursor;
            const keys = result.keys;
            if (keys.length > 0) {
                await r.del(keys);
                deletedCount += keys.length;
            }
        } while (cursor !== 0);
        console.log(`[Redis]  Cleared ${deletedCount} cache entries for tenant "${tenantSlug}"`);
        return deletedCount;
    }
    catch (error) {
        console.error(`[Redis]  clearTenantCache failed: ${error.message}`);
        return 0;
    }
}
// ─── Balance Computation Caching ─────────────────────────────────────────
/**
 * Cached balance computation between tenants
 */
async function getCachedBalance(tenantSlug, computationKey) {
    return tenantGet(tenantSlug, `balance:${computationKey}`);
}
/**
 * Set cached balance computation for a tenant
 */
async function setCachedBalance(tenantSlug, computationKey, balance, ttlSeconds = 300 // 5 minutes default for balance caching
) {
    return tenantSet(tenantSlug, `balance:${computationKey}`, { balance, cachedAt: new Date().toISOString() }, ttlSeconds);
}
/**
 * Invalidate balance cache for a tenant (when charges change)
 */
async function invalidateBalanceCache(tenantSlug) {
    try {
        const r = await getRedisClient();
        if (!r)
            return false;
        const pattern = tenantKey(tenantSlug, 'balance:*');
        let cursor = 0;
        let deletedCount = 0;
        do {
            const result = await r.scan(cursor, { MATCH: pattern, COUNT: 100 });
            cursor = result.cursor;
            if (result.keys.length > 0) {
                await r.del(result.keys);
                deletedCount += result.keys.length;
            }
        } while (cursor !== 0);
        if (deletedCount > 0) {
            console.log(`[Redis]  Invalidated ${deletedCount} balance caches for "${tenantSlug}"`);
        }
        return true;
    }
    catch (error) {
        console.warn(`[Redis]  invalidateBalanceCache failed: ${error.message}`);
        return false;
    }
}
// ─── Connection Management ───────────────────────────────────────────────
/**
 * Gracefully close the Redis connection
 */
async function closeRedis() {
    try {
        if (client && isConnected) {
            await client.quit();
            console.log('[Redis]  Connection closed gracefully');
        }
    }
    catch (error) {
        console.error('[Redis]  Error closing connection:', error.message);
    }
    finally {
        client = null;
        isConnected = false;
        connectionAttempted = false;
    }
}
// ─── Health Check ────────────────────────────────────────────────────────
/**
 * Check if Redis is connected and responsive
 */
async function redisHealth() {
    const start = Date.now();
    try {
        const r = await getRedisClient();
        if (!r)
            return { status: 'DISCONNECTED', latencyMs: 0 };
        await r.ping();
        return { status: 'UP', latencyMs: Date.now() - start };
    }
    catch {
        return { status: 'DOWN', latencyMs: Date.now() - start };
    }
}
exports.default = {
    getRedisClient,
    tenantSet,
    tenantGet,
    tenantDel,
    clearTenantCache,
    getCachedBalance,
    setCachedBalance,
    invalidateBalanceCache,
    closeRedis,
    redisHealth,
};
//# sourceMappingURL=redisService.js.map