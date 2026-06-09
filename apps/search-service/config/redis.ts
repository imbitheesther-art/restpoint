import Redis from 'ioredis';

let redis: Redis;

export function initializeRedis() {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true,
  });

  redis.on('connect', () => {
    console.log('✅ Connected to Redis');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis error:', err);
  });

  redis.connect();
  return redis;
}

export function getRedis() {
  if (!redis) {
    throw new Error('Redis not initialized');
  }
  return redis;
}

/**
 * Generate tenant-aware Redis cache key
 * Example: tenant:123:deceased:peter
 */
export function getTenantCacheKey(tenantId: string | number, module: string, query?: string): string {
  if (query) {
    return `tenant:${tenantId}:${module}:${query.toLowerCase().replace(/\s+/g, '-')}`;
  }
  return `tenant:${tenantId}:${module}`;
}

/**
 * Generate cache key for recent searches
 * Example: tenant:123:recent-searches
 */
export function getRecentSearchesCacheKey(tenantId: string | number): string {
  return `tenant:${tenantId}:recent-searches`;
}

/**
 * Cache search results with expiry
 */
export async function cacheSearchResults(
  tenantId: string | number,
  module: string,
  query: string,
  results: any,
  expirySeconds: number = 3600
): Promise<void> {
  const key = getTenantCacheKey(tenantId, module, query);
  await getRedis().setex(key, expirySeconds, JSON.stringify(results));
}

/**
 * Get cached search results
 */
export async function getCachedSearchResults(
  tenantId: string | number,
  module: string,
  query: string
): Promise<any | null> {
  const key = getTenantCacheKey(tenantId, module, query);
  const cached = await getRedis().get(key);
  return cached ? JSON.parse(cached) : null;
}

/**
 * Add to recent searches
 */
export async function addRecentSearch(
  tenantId: string | number,
  query: string
): Promise<void> {
  const key = getRecentSearchesCacheKey(tenantId);
  const recentSearches = await getRedis().lrange(key, 0, 99);
  
  // Remove if already exists
  await getRedis().lrem(key, 1, query);
  
  // Add to front
  await getRedis().lpush(key, query);
  
  // Keep only 50 recent searches
  await getRedis().ltrim(key, 0, 49);
  
  // Set expiry
  await getRedis().expire(key, 30 * 24 * 60 * 60); // 30 days
}

/**
 * Get recent searches for tenant
 */
export async function getRecentSearches(tenantId: string | number): Promise<string[]> {
  const key = getRecentSearchesCacheKey(tenantId);
  return await getRedis().lrange(key, 0, 49);
}

/**
 * Clear tenant cache (for testing/admin purposes)
 */
export async function clearTenantCache(tenantId: string | number): Promise<void> {
  const pattern = `tenant:${tenantId}:*`;
  const keys = await getRedis().keys(pattern);
  
  if (keys.length > 0) {
    await getRedis().del(...keys);
  }
}
