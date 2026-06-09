"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class RedisCacheService {
    client = null;
    static instance;
    isConnected = false;
    constructor() {
        this.initRedis();
    }
    static getInstance() {
        if (!RedisCacheService.instance) {
            RedisCacheService.instance = new RedisCacheService();
        }
        return RedisCacheService.instance;
    }
    initRedis() {
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            this.client = new ioredis_1.default(redisUrl, {
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => {
                    if (times > 3)
                        return null;
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
        }
        catch (err) {
            console.log('Redis not available');
            this.client = null;
        }
    }
    async get(key) {
        if (!this.client || !this.isConnected)
            return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttl = 3600) {
        if (!this.client || !this.isConnected)
            return false;
        try {
            await this.client.setex(key, ttl, JSON.stringify(value));
            return true;
        }
        catch {
            return false;
        }
    }
    async del(key) {
        if (!this.client || !this.isConnected)
            return false;
        try {
            await this.client.del(key);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.RedisCacheService = RedisCacheService;
exports.default = RedisCacheService;
