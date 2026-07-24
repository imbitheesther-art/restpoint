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
import { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from 'redis';
type RedisClient = RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
export interface ServiceConfig {
    name: string;
    maxMemoryMB: number;
    softLimitMB: number;
    notificationTTL: number;
    balanceTTL: number;
}
export declare enum NotificationType {
    ALERT = "alert",
    INFO = "info",
    WARNING = "warning",
    SUCCESS = "success",
    ERROR = "error",
    SYSTEM = "system",
    PAYMENT = "payment",
    BOOKING = "booking",
    REMINDER = "reminder",
    TASK = "task",
    DECEASED = "deceased",
    HEARSE = "hearse"
}
export declare enum NotificationPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface Notification {
    id: string;
    tenantSlug: string;
    serviceName: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    data?: any;
    read: boolean;
    delivered: boolean;
    createdAt: string;
    expiresAt: string;
    source?: string;
    target?: string | string[];
    actions?: {
        label: string;
        url: string;
    }[];
}
export interface NotificationFilters {
    type?: NotificationType[];
    priority?: NotificationPriority[];
    serviceName?: string[];
    read?: boolean;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
}
export declare function setNotificationEmitter(emitter: (notification: Notification) => void): void;
/**
 * Register or update service configuration
 */
export declare function registerService(config: ServiceConfig): void;
/**
 * Get service configuration
 */
export declare function getServiceConfig(serviceName: string): ServiceConfig;
export declare function getRedisClient(): Promise<RedisClient | null>;
export declare function serviceKey(serviceName: string, tenantSlug: string, key: string): string;
export declare function notificationKey(tenantSlug: string, serviceName: string, notificationId: string): string;
export declare function crossNotificationKey(sourceTenant: string, targetTenant: string, notificationId: string): string;
export declare function serviceSet(serviceName: string, tenantSlug: string, key: string, value: any, ttlSeconds?: number): Promise<boolean>;
export declare function serviceGet<T = any>(serviceName: string, tenantSlug: string, key: string): Promise<T | null>;
export declare function serviceDel(serviceName: string, tenantSlug: string, key: string): Promise<boolean>;
export declare function getServiceMemoryUsage(serviceName: string, tenantSlug: string): Promise<{
    usedMB: number;
    maxMB: number;
    softLimitMB: number;
    percentage: number;
    softLimitPercentage: number;
    keys: number;
    keysWithTTL: number;
}>;
export declare function checkAndBalance(serviceName: string, tenantSlug: string): Promise<{
    balanced: boolean;
    removed: number;
    freedMB: number;
    reason: 'soft_limit' | 'hard_limit' | 'none';
}>;
export declare function storeNotification(tenantSlug: string, serviceName: string, notification: Omit<Notification, 'createdAt' | 'expiresAt' | 'read' | 'delivered' | 'serviceName'>): Promise<Notification | null>;
export declare function getNotifications(tenantSlug: string, serviceName?: string, filters?: NotificationFilters): Promise<{
    notifications: Notification[];
    total: number;
}>;
export declare function deleteNotification(tenantSlug: string, serviceName: string, notificationId: string): Promise<boolean>;
export declare function deleteAllNotifications(tenantSlug: string, serviceName: string): Promise<number>;
/**
 * Clear all cache entries for a specific service and tenant
 */
export declare function clearServiceCache(serviceName: string, tenantSlug: string): Promise<number>;
/**
 * Clear ALL cache entries for a specific tenant across all registered services.
 * This is useful when suspending/deleting a tenant to ensure all their cached data is purged.
 */
export declare function clearTenantCache(tenantSlug: string): Promise<number>;
export declare function redisHealth(): Promise<{
    status: string;
    latencyMs: number;
    services: number;
}>;
export declare function initRedis(serviceConfigsList?: ServiceConfig[]): Promise<boolean>;
declare const _default: {
    getRedisClient: typeof getRedisClient;
    redisHealth: typeof redisHealth;
    initRedis: typeof initRedis;
    registerService: typeof registerService;
    getServiceConfig: typeof getServiceConfig;
    serviceSet: typeof serviceSet;
    serviceGet: typeof serviceGet;
    serviceDel: typeof serviceDel;
    clearServiceCache: typeof clearServiceCache;
    clearTenantCache: typeof clearTenantCache;
    getServiceMemoryUsage: typeof getServiceMemoryUsage;
    checkAndBalance: typeof checkAndBalance;
    storeNotification: typeof storeNotification;
    getNotifications: typeof getNotifications;
    deleteNotification: typeof deleteNotification;
    deleteAllNotifications: typeof deleteAllNotifications;
    setNotificationEmitter: typeof setNotificationEmitter;
    NotificationType: typeof NotificationType;
    NotificationPriority: typeof NotificationPriority;
};
export default _default;
//# sourceMappingURL=redisService.d.ts.map