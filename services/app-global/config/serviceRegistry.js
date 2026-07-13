const { getConsulClient } = require('./consulClient');

// =============================================================================
// SERVICE REGISTRATION HELPER
// =============================================================================
// This module helps microservices register themselves with Consul.
// Each service should call registerService() on startup and
// deregisterService() on shutdown.

class ServiceRegistry {
    constructor() {
        this.consul = getConsulClient();
        this.serviceName = process.env.SERVICE_NAME || '';
        this.servicePort = parseInt(process.env.PORT) || 5000;
        this.serviceHost = process.env.SERVICE_HOST || process.env.HOST || '0.0.0.0';
        this.serviceVersion = process.env.SERVICE_VERSION || '1.0.0';
        this.serviceId = `${this.serviceName}-${process.env.HOSTNAME || process.env.HOST || 'local'}`;
        this.healthCheckPath = '/health';
        this.registered = false;
    }

    /**
     * Register this service with Consul
     * @returns {Promise<boolean>} True if registration succeeded
     */
    async register() {
        if (!this.serviceName) {
            console.warn('[SERVICE REGISTRY] SERVICE_NAME not set in environment variables');
            console.warn('[SERVICE REGISTRY] Set SERVICE_NAME in your .env or docker-compose.yml');
            return false;
        }

        const serviceDefinition = {
            ID: this.serviceId,
            Name: this.serviceName,
            Tags: this.buildTags(),
            Address: this.resolveAddress(),
            Port: this.servicePort,
            Check: this.buildHealthCheck(),
            Meta: this.buildMeta(),
        };

        try {
            const response = await this.consul.registerService(serviceDefinition);

            if (response) {
                console.log(`[SERVICE REGISTRY] ✓ Registered: ${this.serviceName}`);
                console.log(`[SERVICE REGISTRY]   ID: ${this.serviceId}`);
                console.log(`[SERVICE REGISTRY]   Address: ${serviceDefinition.Address}:${serviceDefinition.Port}`);
                console.log(`[SERVICE REGISTRY]   Health: http://${serviceDefinition.Address}:${serviceDefinition.Port}${this.healthCheckPath}`);
                this.registered = true;
                return true;
            }
        } catch (error) {
            console.error(`[SERVICE REGISTRY] ✗ Registration failed for ${this.serviceName}:`, error.message);
        }

        return false;
    }

    /**
     * Deregister this service from Consul (call on shutdown)
     * @returns {Promise<boolean>} True if deregistration succeeded
     */
    async deregister() {
        if (!this.registered || !this.serviceName) {
            return false;
        }

        try {
            const response = await this.consul.deregisterService();

            if (response) {
                console.log(`[SERVICE REGISTRY] ✓ Deregistered: ${this.serviceName}`);
                this.registered = false;
                return true;
            }
        } catch (error) {
            console.error(`[SERVICE REGISTRY] ✗ Deregistration failed for ${this.serviceName}:`, error.message);
        }

        return false;
    }

    /**
     * Build service tags for Consul
     * @private
     */
    buildTags() {
        const tags = [
            'restpoint',
            'microservice',
            process.env.NODE_ENV || 'development',
        ];

        // Add custom tags if provided
        if (process.env.SERVICE_TAGS) {
            const customTags = process.env.SERVICE_TAGS.split(',').map(tag => tag.trim());
            tags.push(...customTags);
        }

        return tags;
    }

    /**
     * Build health check configuration
     * @private
     */
    buildHealthCheck() {
        const address = this.serviceHost === '0.0.0.0' ? 'localhost' : this.serviceHost;

        return {
            HTTP: `http://${address}:${this.servicePort}${this.healthCheckPath}`,
            Interval: process.env.HEALTH_CHECK_INTERVAL || '10s',
            Timeout: '5s',
            DeregisterCriticalServiceAfter: process.env.DEREGISTER_AFTER || '30s',
        };
    }

    /**
     * Build service metadata
     * @private
     */
    buildMeta() {
        const meta = {
            version: this.serviceVersion,
            environment: process.env.NODE_ENV || 'development',
        };

        // Add custom metadata if provided
        if (process.env.SERVICE_META) {
            try {
                const customMeta = JSON.parse(process.env.SERVICE_META);
                Object.assign(meta, customMeta);
            } catch (e) {
                console.warn('[SERVICE REGISTRY] Invalid SERVICE_META format, should be JSON');
            }
        }

        return meta;
    }

    /**
     * Resolve the service address
     * @private
     */
    resolveAddress() {
        // If HOST is 0.0.0.0, we need to get the actual container IP
        if (this.serviceHost === '0.0.0.0') {
            return this.getContainerIp();
        }
        return this.serviceHost;
    }

    /**
     * Get the container's IP address
     * @private
     */
    getContainerIp() {
        const { networkInterfaces } = require('os');
        const nets = networkInterfaces();

        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                if (net.family === 'IPv4' && !net.internal) {
                    return net.address;
                }
            }
        }

        return '127.0.0.1';
    }

    /**
     * Check if service is registered
     * @returns {boolean}
     */
    isRegistered() {
        return this.registered;
    }

    /**
     * Get service information
     * @returns {Object}
     */
    getServiceInfo() {
        return {
            id: this.serviceId,
            name: this.serviceName,
            address: this.resolveAddress(),
            port: this.servicePort,
            version: this.serviceVersion,
            registered: this.registered,
        };
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let serviceRegistry = null;

function getServiceRegistry() {
    if (!serviceRegistry) {
        serviceRegistry = new ServiceRegistry();
    }
    return serviceRegistry;
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Register the current service with Consul
 * @returns {Promise<boolean>}
 */
async function registerService() {
    const registry = getServiceRegistry();
    return await registry.register();
}

/**
 * Deregister the current service from Consul
 * @returns {Promise<boolean>}
 */
async function deregisterService() {
    const registry = getServiceRegistry();
    return await registry.deregister();
}

/**
 * Get service registry instance
 * @returns {ServiceRegistry}
 */
function getRegistry() {
    return getServiceRegistry();
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    ServiceRegistry,
    getServiceRegistry,
    registerService,
    deregisterService,
    getRegistry,
};