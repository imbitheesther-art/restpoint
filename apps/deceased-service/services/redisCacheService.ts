import Redis from 'ioredis';

export class RedisCacheService {
  private client: Redis | null = null;
  private static instance: RedisCacheService;
  private isConnected = false;

  private constructor() {
    this.initRedis();
  }

  public static getInstance(): RedisCacheService {
    if (!RedisCacheService.instance) {
      RedisCacheService.instance = new RedisCacheService();
    }
    return RedisCacheService.instance;
  }

  private initRedis(): void {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 100, 2000);
        }
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('Redis connected');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        console.log('Redis error:', err.message);
      });
    } catch (err) {
      console.log('Redis not available');
      this.client = null;
    }
  }

  async get(key: string): Promise<any> {
    if (!this.client || !this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    if (!this.client || !this.isConnected) return false;
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch {
      return false;
    }
  }
}

export default RedisCacheService;
