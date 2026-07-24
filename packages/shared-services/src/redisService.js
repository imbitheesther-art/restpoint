"use strict";
/**
 * @file packages/shared-services/src/redisService.ts
 * CENTRALIZED: Redis Service with per-service memory limits
 *
 * Features:
 * - Per-service memory limits (10MB per service)
 * - Automatic balancing when service exceeds limit
 * - Universal notification system
 * - Redis-backed real-time notifications via Socket.IO
 * - Auto-expiration with configurable TTL
 * - Cross-tenant notification routing
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPriority = exports.NotificationType = void 0;
exports.setNotificationEmitter = setNotificationEmitter;
exports.registerService = registerService;
exports.getServiceConfig = getServiceConfig;
exports.getRedisClient = getRedisClient;
exports.serviceKey = serviceKey;
exports.notificationKey = notificationKey;
exports.crossNotificationKey = crossNotificationKey;
exports.serviceSet = serviceSet;
exports.serviceGet = serviceGet;
exports.serviceDel = serviceDel;
exports.getServiceMemoryUsage = getServiceMemoryUsage;
exports.checkAndBalance = checkAndBalance;
exports.storeNotification = storeNotification;
exports.getNotifications = getNotifications;
exports.deleteNotification = deleteNotification;
exports.deleteAllNotifications = deleteAllNotifications;
exports.clearServiceCache = clearServiceCache;
exports.clearTenantCache = clearTenantCache;
exports.redisHealth = redisHealth;
exports.initRedis = initRedis;
const redis_1 = require("redis");
const index_1 = __importDefault(require("../../shared-logger/dist/index"));
const DEFAULT_REDIS_URL = process.env.REDIS_URL || process.env.REDIS_HOST
    ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`
    : 'redis://redis:6379';
// ─── Notification Types ──────────────────────────────────────────────────
var NotificationType;
(function (NotificationType) {
    NotificationType["ALERT"] = "alert";
    NotificationType["INFO"] = "info";
    NotificationType["WARNING"] = "warning";
    NotificationType["SUCCESS"] = "success";
    NotificationType["ERROR"] = "error";
    NotificationType["SYSTEM"] = "system";
    NotificationType["PAYMENT"] = "payment";
    NotificationType["BOOKING"] = "booking";
    NotificationType["REMINDER"] = "reminder";
    NotificationType["TASK"] = "task";
    NotificationType["DECEASED"] = "deceased";
    NotificationType["HEARSE"] = "hearse";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["MEDIUM"] = "medium";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["CRITICAL"] = "critical";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
// ─── Default Configuration ─────────────────────────────────────────────
const DEFAULT_SERVICE_CONFIG = {
    maxMemoryMB: 10, // 10MB per service
    softLimitMB: 8, // Start cleaning at 8MB
    notificationTTL: 86400, // 24 hours
    balanceTTL: 300, // 5 minutes
};
// Service config registry
const serviceConfigs = new Map();
// ─── Notification Event Emitter ──────────────────────────────────────────
let notificationEmitter = null;
function setNotificationEmitter(emitter) {
    notificationEmitter = emitter;
    index_1.default.info('[Redis]  Notification emitter configured');
}
function emitNotification(notification) {
    if (notificationEmitter) {
        notificationEmitter(notification);
    }
}
// ─── Service Configuration ──────────────────────────────────────────────
/**
 * Register or update service configuration
 */
function registerService(config) {
    const max = Math.min(config.maxMemoryMB, 20); // Max 20MB per service
    const soft = Math.min(config.softLimitMB || max * 0.8, max * 0.9);
    serviceConfigs.set(config.name, {
        ...DEFAULT_SERVICE_CONFIG,
        ...config,
        maxMemoryMB: max,
        softLimitMB: soft,
    });
    index_1.default.info(`[Redis]  Service "${config.name}" registered: ${max}MB max, ${soft}MB soft limit`);
}
/**
 * Get service configuration
 */
function getServiceConfig(serviceName) {
    const config = serviceConfigs.get(serviceName);
    if (config)
        return config;
    // Return default config if service not registered
    return {
        name: serviceName,
        maxMemoryMB: 10,
        softLimitMB: 8,
        notificationTTL: 86400,
        balanceTTL: 300,
    };
}
// ─── Client Pool ─────────────────────────────────────────────────────
let client = null;
let isConnected = false;
let connectionAttempted = false;
let redisDisabled = false;
async function getRedisClient() {
    if (redisDisabled) return null;
    if (client && isConnected) return client;
    if (connectionAttempted) {
        redisDisabled = true;
        return null;
    }
    connectionAttempted = true;
    try {
        client = (0, redis_1.createClient)({
            url: DEFAULT_REDIS_URL,
            socket: {
                reconnectStrategy: () => false,
                connectTimeout: 3000,
            },
        });
        client.on('connect', () => {
            index_1.default.info('[Redis]  Connected');
            isConnected = true;
        });
        client.on('error', (err) => {
            if (isConnected) {
                index_1.default.error('[Redis]  Error:', err.message);
            }
            isConnected = false;
        });
        client.on('end', () => {
            index_1.default.info('[Redis]  Connection closed');
            isConnected = false;
        });
        await client.connect();
        isConnected = true;
        return client;
    }
    catch (error) {
        index_1.default.warn(`[Redis] Not available - running without Redis (${error.message})`);
        redisDisabled = true;
        client = null;
        isConnected = false;
        return null;
    }
}
// ─── Key Namespacing ──────────────────────────────────────────────
function serviceKey(serviceName, tenantSlug, key) {
    return `service:${serviceName}:tenant:${tenantSlug}:${key}`;
}
function notificationKey(tenantSlug, serviceName, notificationId) {
    return `notifications:${tenantSlug}:${serviceName}:${notificationId}`;
}
function crossNotificationKey(sourceTenant, targetTenant, notificationId) {
    return `cross:notifications:${sourceTenant}:${targetTenant}:${notificationId}`;
}
// ─── Base Operations ──────────────────────────────────────────────
async function serviceSet(serviceName, tenantSlug, key, value, ttlSeconds = 3600) {
    try {
        const r = await getRedisClient();
        if (!r)
            return false;
        const fullKey = serviceKey(serviceName, tenantSlug, key);
        const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
        await r.setEx(fullKey, ttlSeconds, serialized);
        // Check memory usage after set
        await checkAndBalance(serviceName, tenantSlug);
        return true;
    }
    catch (error) {
        index_1.default.warn(`[Redis] serviceSet failed for ${serviceName}: ${error.message}`);
        return false;
    }
}
async function serviceGet(serviceName, tenantSlug, key) {
    try {
        const r = await getRedisClient();
        if (!r)
            return null;
        const fullKey = serviceKey(serviceName, tenantSlug, key);
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
        index_1.default.warn(`[Redis] serviceGet failed for ${serviceName}: ${error.message}`);
        return null;
    }
}
async function serviceDel(serviceName, tenantSlug, key) {
    try {
        const r = await getRedisClient();
        if (!r)
            return false;
        const fullKey = serviceKey(serviceName, tenantSlug, key);
        await r.del(fullKey);
        return true;
    }
    catch (error) {
        index_1.default.warn(`[Redis] serviceDel failed for ${serviceName}: ${error.message}`);
        return false;
    }
}
// ─── Memory Management ──────────────────────────────────────────────
async function scanKeys(pattern) {
    const r = await getRedisClient();
    if (!r)
        return [];
    const keys = [];
    let cursor = 0;
    do {
        const result = await r.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;
        keys.push(...result.keys);
    } while (cursor !== 0);
    return keys;
}
async function getServiceMemoryUsage(serviceName, tenantSlug) {
    try {
        const r = await getRedisClient();
        if (!r)
            return { usedMB: 0, maxMB: 0, softLimitMB: 0, percentage: 0, softLimitPercentage: 0, keys: 0, keysWithTTL: 0 };
        const pattern = serviceKey(serviceName, tenantSlug, '*');
        const keys = await scanKeys(pattern);
        let totalMemory = 0;
        let keysWithTTL = 0;
        for (const key of keys) {
            const mem = await r.memoryUsage(key) || 1024;
            totalMemory += mem;
            const ttl = await r.ttl(key);
            if (ttl > 0)
                keysWithTTL++;
        }
        const usedMB = totalMemory / (1024 * 1024);
        const config = getServiceConfig(serviceName);
        return {
            usedMB: Math.round(usedMB * 100) / 100,
            maxMB: config.maxMemoryMB,
            softLimitMB: config.softLimitMB,
            percentage: Math.min(Math.round((usedMB / config.maxMemoryMB) * 100), 100),
            softLimitPercentage: Math.min(Math.round((usedMB / config.softLimitMB) * 100), 100),
            keys: keys.length,
            keysWithTTL,
        };
    }
    catch (error) {
        index_1.default.warn(`[Redis] getServiceMemoryUsage failed: ${error.message}`);
        return { usedMB: 0, maxMB: 0, softLimitMB: 0, percentage: 0, softLimitPercentage: 0, keys: 0, keysWithTTL: 0 };
    }
}
async function checkAndBalance(serviceName, tenantSlug) {
    try {
        const r = await getRedisClient();
        if (!r)
            return { balanced: false, removed: 0, freedMB: 0, reason: 'none' };
        const memory = await getServiceMemoryUsage(serviceName, tenantSlug);
        const config = getServiceConfig(serviceName);
        if (memory.usedMB < config.softLimitMB) {
            return { balanced: false, removed: 0, freedMB: 0, reason: 'none' };
        }
        const isHardLimit = memory.usedMB >= config.maxMemoryMB * 0.85;
        const reason = isHardLimit ? 'hard_limit' : 'soft_limit';
        const pattern = serviceKey(serviceName, tenantSlug, '*');
        const keys = await scanKeys(pattern);
        const keyData = await Promise.all(keys.map(async (key) => {
            const ttl = await r.ttl(key);
            const mem = await r.memoryUsage(key) || 1024;
            return { key, ttl, mem };
        }));
        keyData.sort((a, b) => {
            if (a.ttl === -1 && b.ttl === -1)
                return 0;
            if (a.ttl === -1)
                return 1;
            if (b.ttl === -1)
                return -1;
            return a.ttl - b.ttl;
        });
        const targetMB = isHardLimit ? config.softLimitMB : config.softLimitMB * 0.85;
        let removed = 0;
        let freedMB = 0;
        let currentMB = memory.usedMB;
        for (const { key, ttl, mem } of keyData) {
            if (currentMB <= targetMB)
                break;
            if (ttl === -1 && !isHardLimit)
                continue;
            await r.del(key);
            removed++;
            freedMB += mem / (1024 * 1024);
            currentMB -= mem / (1024 * 1024);
        }
        if (removed > 0) {
            const level = isHardLimit ? 'warn' : 'info';
            index_1.default[level](`[Redis] 🔄 Balanced "${serviceName}" for "${tenantSlug}": ` +
                `${removed} keys, ${Math.round(freedMB * 100) / 100}MB freed (${reason})`);
        }
        return { balanced: removed > 0, removed, freedMB: Math.round(freedMB * 100) / 100, reason };
    }
    catch (error) {
        index_1.default.warn(`[Redis] checkAndBalance failed: ${error.message}`);
        return { balanced: false, removed: 0, freedMB: 0, reason: 'none' };
    }
}
// ─── UNIVERSAL NOTIFICATION SYSTEM ─────────────────────────────────────
async function storeNotification(tenantSlug, serviceName, notification) {
    try {
        const r = await getRedisClient();
        if (!r)
            return null;
        const config = getServiceConfig(serviceName);
        const ttl = config.notificationTTL;
        const fullNotification = {
            ...notification,
            tenantSlug,
            serviceName,
            read: false,
            delivered: false,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
        };
        const key = notificationKey(tenantSlug, serviceName, notification.id);
        await r.setEx(key, ttl, JSON.stringify(fullNotification));
        const listKey = `notifications:${tenantSlug}:${serviceName}:list`;
        await r.lPush(listKey, notification.id);
        await r.expire(listKey, ttl);
        emitNotification(fullNotification);
        await checkAndBalance(serviceName, tenantSlug);
        index_1.default.info(`[Redis]  [${serviceName}] Notification: ${notification.type} - ${notification.title}`);
        return fullNotification;
    }
    catch (error) {
        index_1.default.error(`[Redis] storeNotification failed: ${error.message}`);
        return null;
    }
}
async function getNotifications(tenantSlug, serviceName, filters) {
    try {
        const r = await getRedisClient();
        if (!r)
            return { notifications: [], total: 0 };
        const limit = filters?.limit || 50;
        const offset = filters?.offset || 0;
        // If no service specified, get from all services
        if (!serviceName) {
            const allNotifications = [];
            const serviceNames = Array.from(serviceConfigs.keys());
            for (const svc of serviceNames) {
                const listKey = `notifications:${tenantSlug}:${svc}:list`;
                const ids = await r.lRange(listKey, offset, offset + limit - 1);
                for (const id of ids) {
                    const key = notificationKey(tenantSlug, svc, id);
                    const data = await r.get(key);
                    if (data) {
                        try {
                            allNotifications.push(JSON.parse(data));
                        }
                        catch { }
                    }
                }
            }
            // Apply filters
            let filtered = allNotifications;
            if (filters?.type)
                filtered = filtered.filter(n => filters.type.includes(n.type));
            if (filters?.priority)
                filtered = filtered.filter(n => filters.priority.includes(n.priority));
            if (filters?.serviceName)
                filtered = filtered.filter(n => filters.serviceName.includes(n.serviceName));
            if (filters?.read !== undefined)
                filtered = filtered.filter(n => n.read === filters.read);
            return { notifications: filtered.slice(0, limit), total: filtered.length };
        }
        // Get from specific service
        const listKey = `notifications:${tenantSlug}:${serviceName}:list`;
        const ids = await r.lRange(listKey, offset, offset + limit - 1);
        const notifications = [];
        for (const id of ids) {
            const key = notificationKey(tenantSlug, serviceName, id);
            const data = await r.get(key);
            if (data) {
                try {
                    const notif = JSON.parse(data);
                    if (filters?.type && !filters.type.includes(notif.type))
                        continue;
                    if (filters?.priority && !filters.priority.includes(notif.priority))
                        continue;
                    if (filters?.read !== undefined && notif.read !== filters.read)
                        continue;
                    notifications.push(notif);
                }
                catch { }
            }
        }
        return { notifications, total: notifications.length };
    }
    catch (error) {
        index_1.default.warn(`[Redis] getNotifications failed: ${error.message}`);
        return { notifications: [], total: 0 };
    }
}
async function deleteNotification(tenantSlug, serviceName, notificationId) {
    try {
        const r = await getRedisClient();
        if (!r)
            return false;
        const key = notificationKey(tenantSlug, serviceName, notificationId);
        await r.del(key);
        const listKey = `notifications:${tenantSlug}:${serviceName}:list`;
        await r.lRem(listKey, 1, notificationId);
        index_1.default.info(`[Redis] 🗑️ [${serviceName}] Notification deleted: ${notificationId}`);
        return true;
    }
    catch (error) {
        index_1.default.warn(`[Redis] deleteNotification failed: ${error.message}`);
        return false;
    }
}
async function deleteAllNotifications(tenantSlug, serviceName) {
    try {
        const r = await getRedisClient();
        if (!r)
            return 0;
        const listKey = `notifications:${tenantSlug}:${serviceName}:list`;
        const ids = await r.lRange(listKey, 0, -1);
        let deleted = 0;
        for (const id of ids) {
            const key = notificationKey(tenantSlug, serviceName, id);
            await r.del(key);
            deleted++;
        }
        await r.del(listKey);
        index_1.default.info(`[Redis] 🗑️ [${serviceName}] Deleted ${deleted} notifications`);
        return deleted;
    }
    catch (error) {
        index_1.default.warn(`[Redis] deleteAllNotifications failed: ${error.message}`);
        return 0;
    }
}
// ─── Per-Service Cache Clearing ──────────────────────────────────────────────
/**
 * Clear all cache entries for a specific service and tenant
 */
async function clearServiceCache(serviceName, tenantSlug) {
    try {
        const r = await getRedisClient();
        if (!r)
            return 0;
        const pattern = serviceKey(serviceName, tenantSlug, '*');
        const keys = await scanKeys(pattern);
        if (keys.length > 0) {
            await r.del(keys);
            index_1.default.info(`[Redis]  [${serviceName}] Cleared ${keys.length} cache entries for "${tenantSlug}"`);
        }
        return keys.length;
    }
    catch (error) {
        index_1.default.error(`[Redis] clearServiceCache failed: ${error.message}`);
        return 0;
    }
}
// ─── Tenant-wide Cache Clearing ────────────────────────────────────────────
/**
 * Clear ALL cache entries for a specific tenant across all registered services.
 * This is useful when suspending/deleting a tenant to ensure all their cached data is purged.
 */
async function clearTenantCache(tenantSlug) {
    try {
        const r = await getRedisClient();
        if (!r)
            return 0;
        let totalCleared = 0;
        // Clear cache for each registered service
        for (const [serviceName] of serviceConfigs) {
            const pattern = serviceKey(serviceName, tenantSlug, '*');
            const keys = await scanKeys(pattern);
            if (keys.length > 0) {
                await r.del(keys);
                totalCleared += keys.length;
            }
        }
        // Also clear any notification keys for this tenant
        const notifPattern = `notifications:${tenantSlug}:*`;
        const notifKeys = await scanKeys(notifPattern);
        if (notifKeys.length > 0) {
            await r.del(notifKeys);
            totalCleared += notifKeys.length;
        }
        index_1.default.info(`[Redis] 🧹 Cleared ${totalCleared} cache entries for tenant "${tenantSlug}"`);
        return totalCleared;
    }
    catch (error) {
        index_1.default.error(`[Redis] clearTenantCache failed for "${tenantSlug}": ${error.message}`);
        return 0;
    }
}
// ─── Health Check ─────────────────────────────────────────────────────────
async function redisHealth() {
    const start = Date.now();
    try {
        const r = await getRedisClient();
        if (!r)
            return { status: 'DISCONNECTED', latencyMs: 0, services: 0 };
        await r.ping();
        return {
            status: 'UP',
            latencyMs: Date.now() - start,
            services: serviceConfigs.size,
        };
    }
    catch {
        return { status: 'DOWN', latencyMs: Date.now() - start, services: 0 };
    }
}
// ─── Initialization ──────────────────────────────────────────────────────
async function initRedis(serviceConfigsList) {
    if (serviceConfigsList) {
        serviceConfigsList.forEach((config) => registerService(config));
    }
    const client = await getRedisClient();
    if (client) {
        index_1.default.info('[Redis] ✅ Initialized successfully');
        index_1.default.info(`[Redis] 📊 Registered ${serviceConfigs.size} services`);
        return true;
    }
    index_1.default.warn('[Redis] ⚠️ Running in fallback mode (no Redis)');
    return false;
}
// ─── EXPORTS ──────────────────────────────────────────────────────────────
exports.default = {
    // Connection
    getRedisClient,
    redisHealth,
    initRedis,
    // Service config
    registerService,
    getServiceConfig,
    // Cache operations
    serviceSet,
    serviceGet,
    serviceDel,
    clearServiceCache,
    clearTenantCache,
    // Memory management
    getServiceMemoryUsage,
    checkAndBalance,
    // Universal Notification System
    storeNotification,
    getNotifications,
    deleteNotification,
    deleteAllNotifications,
    setNotificationEmitter,
    // Enums
    NotificationType,
    NotificationPriority,
};
//# sourceMappingURL=redisService.js.map