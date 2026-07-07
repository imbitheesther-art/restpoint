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
import { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from 'redis';
type RedisClient = RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
/**
 * Get or create the shared Redis client (lazy initialization)
 * All services share one connection pool to Redis
 */
export declare function getRedisClient(): Promise<RedisClient | null>;
/**
 * Build a namespaced Redis key for a tenant
 * Format: tenant:{tenantSlug}:{key}
 */
export declare function tenantKey(tenantSlug: string, key: string): string;
/**
 * Build a namespaced Redis key for cross-tenant operations
 * Format: cross:{sourceTenant}:{targetTenant}:{key}
 */
export declare function crossTenantKey(sourceTenant: string, targetTenant: string, key: string): string;
/**
 * Set a cached value for a specific tenant
 */
export declare function tenantSet(tenantSlug: string, key: string, value: any, ttlSeconds?: number): Promise<boolean>;
/**
 * Get a cached value for a specific tenant
 */
export declare function tenantGet<T = any>(tenantSlug: string, key: string): Promise<T | null>;
/**
 * Delete a cached value for a specific tenant
 */
export declare function tenantDel(tenantSlug: string, key: string): Promise<boolean>;
/**
 * Clear ALL cached values for a specific tenant (used on tenant suspend/delete)
 */
export declare function clearTenantCache(tenantSlug: string): Promise<number>;
/**
 * Cached balance computation between tenants
 */
export declare function getCachedBalance(tenantSlug: string, computationKey: string): Promise<{
    balance: number;
    cachedAt: string;
} | null>;
/**
 * Set cached balance computation for a tenant
 */
export declare function setCachedBalance(tenantSlug: string, computationKey: string, balance: number, ttlSeconds?: number): Promise<boolean>;
/**
 * Invalidate balance cache for a tenant (when charges change)
 */
export declare function invalidateBalanceCache(tenantSlug: string): Promise<boolean>;
/**
 * Gracefully close the Redis connection
 */
export declare function closeRedis(): Promise<void>;
/**
 * Check if Redis is connected and responsive
 */
export declare function redisHealth(): Promise<{
    status: string;
    latencyMs: number;
}>;
declare const _default: {
    getRedisClient: typeof getRedisClient;
    tenantSet: typeof tenantSet;
    tenantGet: typeof tenantGet;
    tenantDel: typeof tenantDel;
    clearTenantCache: typeof clearTenantCache;
    getCachedBalance: typeof getCachedBalance;
    setCachedBalance: typeof setCachedBalance;
    invalidateBalanceCache: typeof invalidateBalanceCache;
    closeRedis: typeof closeRedis;
    redisHealth: typeof redisHealth;
};
export default _default;
//# sourceMappingURL=redisService.d.ts.map