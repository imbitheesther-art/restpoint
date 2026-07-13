const http = require('http');
const { getConsulClient } = require('../config/consulClient');
const Logger = {
    info: (m, d) => console.log(`[INFO] ${m}`, d || ''),
    error: (m, d) => console.error(`[ERROR] ${m}`, d || ''),
    warn: (m, d) => console.warn(`[WARN] ${m}`, d || ''),
};

// =============================================================================
// SERVICE DISCOVERY MIDDLEWARE
// =============================================================================

class ServiceDiscoveryMiddleware {
    constructor() {
        this.consul = getConsulClient();
        this.serviceCache = new Map();
        this.cacheTimeout = 5000; // 5 seconds
        this.fallbackUrls = {};
        this.initialized = false;
    }

    /**
     * Initialize service discovery with fallback URLs
     * @param {Object} fallbackUrls - Map of service names to fallback URLs
     */
    async initialize(fallbackUrls = {}) {
        this.fallbackUrls = fallbackUrls;

        // Check if Consul is available
        const isHealthy = await this.consul.isConsulHealthy();

        if (isHealthy) {
            Logger.info('[SERVICE DISCOVERY] ✓ Consul is healthy');
            this.initialized = true;

            // Pre-load all services into cache
            await this.refreshServiceCache();
        } else {
            Logger.warn('[SERVICE DISCOVERY] ⚠ Consul is not available, using fallback URLs');
            this.initialized = false;
        }

        return this.initialized;
    }

    /**
     * Refresh the service cache from Consul
     */
    async refreshServiceCache() {
        try {
            const services = await this.consul.getAllServices();

            for (const [serviceName, serviceData] of Object.entries(services)) {
                if (serviceName === 'consul') continue; // Skip consul itself

                const instances = await this.consul.discoverService(serviceName);
                if (instances.length > 0) {
                    this.serviceCache.set(serviceName, {
                        instances,
                        lastUpdated: Date.now(),
                    });
                }
            }

            Logger.info(`[SERVICE DISCOVERY] Cached ${this.serviceCache.size} services`);
        } catch (error) {
            Logger.error('[SERVICE DISCOVERY] Failed to refresh cache:', error.message);
        }
    }

    /**
     * Get service URL with caching and fallback
     * @param {string} serviceName - Name of the service
     * @returns {string|null} Service URL or null
     */
    async getServiceUrl(serviceName) {
        // Check cache first
        const cached = this.serviceCache.get(serviceName);
        if (cached && Date.now() - cached.lastUpdated < this.cacheTimeout) {
            if (cached.instances.length > 0) {
                const instance = cached.instances[0];
                return `http://${instance.address}:${instance.port}`;
            }
        }

        // If not in cache or expired, try to discover
        if (this.initialized) {
            const url = await this.consul.getServiceUrl(serviceName);
            if (url) {
                // Update cache
                const instances = await this.consul.discoverService(serviceName);
                if (instances.length > 0) {
                    this.serviceCache.set(serviceName, {
                        instances,
                        lastUpdated: Date.now(),
                    });
                }
                return url;
            }
        }

        // Fallback to hardcoded URL
        // Try exact match first, then try to find by removing common suffixes
        let fallback = this.fallbackUrls[serviceName];
        if (!fallback) {
            // Try short name (e.g., 'deceased-service' -> 'deceased')
            const shortName = serviceName.replace(/-service$/, '');
            fallback = this.fallbackUrls[shortName];
        }
        if (!fallback) {
            // Try by searching for any key that is a prefix of the serviceName
            for (const [key, url] of Object.entries(this.fallbackUrls)) {
                if (serviceName.startsWith(key) || key.startsWith(serviceName.replace(/-service$/, ''))) {
                    fallback = url;
                    break;
                }
            }
        }
        if (fallback) {
            Logger.warn(`[SERVICE DISCOVERY] Using fallback URL for ${serviceName}: ${fallback}`);
            return fallback;
        }

        Logger.error(`[SERVICE DISCOVERY] No URL found for service: ${serviceName}`);
        return null;
    }

    /**
     * Get all healthy instances of a service
     * @param {string} serviceName - Name of the service
     * @returns {Array} Array of service instances
     */
    async getServiceInstances(serviceName) {
        // Check cache
        const cached = this.serviceCache.get(serviceName);
        if (cached && Date.now() - cached.lastUpdated < this.cacheTimeout) {
            return cached.instances;
        }

        // Discover from Consul
        if (this.initialized) {
            const instances = await this.consul.discoverService(serviceName);
            if (instances.length > 0) {
                this.serviceCache.set(serviceName, {
                    instances,
                    lastUpdated: Date.now(),
                });
                return instances;
            }
        }

        return [];
    }

    /**
     * Create a dynamic proxy target resolver
     * @param {string} serviceName - Name of the service
     * @returns {Function} Proxy target function
     */
    createProxyTargetResolver(serviceName) {
        return async (req, res) => {
            const url = await this.getServiceUrl(serviceName);
            if (!url) {
                Logger.error(`[SERVICE DISCOVERY] Service ${serviceName} not available`);
                throw new Error(`Service ${serviceName} is not available`);
            }
            return url;
        };
    }

    /**
     * Start periodic cache refresh
     */
    startCacheRefresh(intervalMs = 10000) {
        this.refreshInterval = setInterval(() => {
            this.refreshServiceCache();
        }, intervalMs);
    }

    /**
     * Stop periodic cache refresh
     */
    stopCacheRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Get service discovery status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            cachedServices: this.serviceCache.size,
            consulHealthy: this.initialized,
        };
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let serviceDiscovery = null;

function getServiceDiscovery() {
    if (!serviceDiscovery) {
        serviceDiscovery = new ServiceDiscoveryMiddleware();
    }
    return serviceDiscovery;
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    ServiceDiscoveryMiddleware,
    getServiceDiscovery,
    Logger
};
