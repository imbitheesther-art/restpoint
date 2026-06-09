/**
 * @file shared/redis.ts
 * PRODUCTION-READY: Global Redis connection for ALL services
 *
 * KEY FEATURES:
 * - Single Redis instance shared across all services
 * - Connection pooling and reuse
 * - Automatic reconnection with exponential backoff
 * - Session management, rate limiting, caching
 * - Type-safe operations
 *
 * USAGE:
 * import { getRedis } from '../shared/redis';
 * const redis = getRedis();
 * await redis.set('key', 'value', 'EX', 3600);
 */

import Redis, { Cluster } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================
// TYPES
// ============================================================

export interface RedisClient {
  set(key: string, value: any, exType: string, exTime: number): Promise<string>;
  get(key: string): Promise<string | null>;
  del(...keys: string[]): Promise<number>;
  exists(...keys: string[]): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  lpush(key: string, ...values: any[]): Promise<number>;
  rpush(key: string, ...values: any[]): Promise<number>;
  lpop(key: string): Promise<string | null>;
  rpop(key: string): Promise<string | null>;
  llen(key: string): Promise<number>;
  hset(key: string, field: string, value: any): Promise<number>;
  hget(key: string, field: string): Promise<string | null>;
  hdel(key: string, ...fields: string[]): Promise<number>;
  hgetall(key: string): Promise<Record<string, string>>;
  sadd(key: string, ...members: any[]): Promise<number>;
  srem(key: string, ...members: any[]): Promise<number>;
  smembers(key: string): Promise<string[]>;
  quit(): Promise<void>;
  flushdb(): Promise<string>;
}

// ============================================================
// ENVIRONMENT VARIABLES
// ============================================================

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const REDIS_DB = parseInt(process.env.REDIS_DB || '0');
const REDIS_TLS = process.env.REDIS_TLS === 'true';

// ============================================================
// REDIS CONNECTION
// ============================================================

let redisClient: Redis | null = null;

/**
 * Initialize and return Redis client (singleton)
 * Cached after first call
 */
export function getRedis(): Redis {
  if (redisClient) {
    if (redisClient.status === 'ready') {
      return redisClient;
    }
    if (redisClient.status === 'reconnecting') {
      console.warn('⚠️  Redis reconnecting, returning existing client...');
      return redisClient;
    }
  }

  console.log(`🔴 Initializing Redis connection (${REDIS_HOST}:${REDIS_PORT})`);

  redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
    tls: REDIS_TLS ? {} : undefined,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      console.warn(`⚠️  Redis reconnect attempt ${times}, delay ${delay}ms`);
      return delay;
    },
    reconnectOnError: (err) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        console.error('❌ Redis READONLY error, reconnecting...');
        return true;
      }
      return false;
    },
    enableReadyCheck: true,
    enableOfflineQueue: true,
    maxRetriesPerRequest: null,
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis client connected');
  });

  redisClient.on('error', (error) => {
    console.error('❌ Redis error:', error.message);
  });

  redisClient.on('close', () => {
    console.log('🔴 Redis connection closed');
  });

  return redisClient;
}

/**
 * Check if Redis is available
 */
export async function isRedisAvailable(): Promise<boolean> {
  try {
    const redis = getRedis();
    await redis.ping();
    return true;
  } catch (error) {
    console.warn('⚠️  Redis unavailable:', error);
    return false;
  }
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('✅ Redis connection closed');
      redisClient = null;
    } catch (error) {
      console.error('⚠️  Error closing Redis:', error);
    }
  }
}

/**
 * Session storage operations
 */
export const sessionOps = {
  /**
   * Store session with TTL (expires in seconds)
   */
  async store(sessionId: string, sessionData: any, ttlSeconds: number = 86400): Promise<void> {
    const redis = getRedis();
    const key = `session:${sessionId}`;
    const value = JSON.stringify(sessionData);
    await redis.set(key, value, 'EX', ttlSeconds);
  },

  /**
   * Retrieve session
   */
  async get(sessionId: string): Promise<any> {
    const redis = getRedis();
    const key = `session:${sessionId}`;
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },

  /**
   * Delete session
   */
  async destroy(sessionId: string): Promise<void> {
    const redis = getRedis();
    await redis.del(`session:${sessionId}`);
  },

  /**
   * Extend session TTL
   */
  async refresh(sessionId: string, ttlSeconds: number = 86400): Promise<void> {
    const redis = getRedis();
    await redis.expire(`session:${sessionId}`, ttlSeconds);
  },
};

/**
 * Rate limiting operations
 */
export const rateLimitOps = {
  /**
   * Increment rate limit counter
   * Returns: current count after increment
   */
  async incrementCounter(
    identifier: string,
    windowSeconds: number = 60
  ): Promise<number> {
    const redis = getRedis();
    const key = `ratelimit:${identifier}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    return count;
  },

  /**
   * Check if rate limit exceeded
   */
  async isLimited(
    identifier: string,
    maxRequests: number,
    windowSeconds: number = 60
  ): Promise<boolean> {
    const count = await this.incrementCounter(identifier, windowSeconds);
    return count > maxRequests;
  },

  /**
   * Get current rate limit count
   */
  async getCount(identifier: string): Promise<number> {
    const redis = getRedis();
    const value = await redis.get(`ratelimit:${identifier}`);
    return parseInt(value || '0');
  },

  /**
   * Reset rate limit
   */
  async reset(identifier: string): Promise<void> {
    const redis = getRedis();
    await redis.del(`ratelimit:${identifier}`);
  },
};

/**
 * Cache operations
 */
export const cacheOps = {
  /**
   * Set cached value
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const redis = getRedis();
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await redis.set(`cache:${key}`, serialized, 'EX', ttlSeconds);
  },

  /**
   * Get cached value
   */
  async get(key: string): Promise<any> {
    const redis = getRedis();
    const value = await redis.get(`cache:${key}`);
    return value ? JSON.parse(value) : null;
  },

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    const redis = getRedis();
    await redis.del(`cache:${key}`);
  },

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    const redis = getRedis();
    const keys = await redis.keys('cache:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  /**
   * Get or compute value (cache-aside pattern)
   */
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    const cached = await this.get(key);
    if (cached) {
      return cached;
    }
    const computed = await computeFn();
    await this.set(key, computed, ttlSeconds);
    return computed;
  },
};

export default {
  getRedis,
  isRedisAvailable,
  closeRedis,
  sessionOps,
  rateLimitOps,
  cacheOps,
};
