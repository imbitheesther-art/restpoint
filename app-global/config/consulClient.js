const http = require('http');
const axios = require('axios');

// =============================================================================
// CONSUL CLIENT - Service Registration & Discovery
// =============================================================================

class ConsulClient {
    constructor() {
        this.consulHost = process.env.CONSUL_HOST || 'http://restpoint_consul:8500';
        this.serviceName = process.env.SERVICE_NAME || '';
        this.servicePort = parseInt(process.env.PORT) || 5000;
        this.serviceHost = process.env.SERVICE_HOST || process.env.HOST || '0.0.0.0';
        this.serviceId = `${this.serviceName}-${process.env.HOSTNAME || 'local'}`;
        this.healthCheckPath = '/health';
        this.healthCheckInterval = '10s';
        this.deregisterAfter = '30s';
        this.registered = false;
    }

    // ===========================================================================
    // SERVICE REGISTRATION
    // ===========================================================================

    /**
     * Register this service with Consul
     */
    async registerService() {
        if (!this.serviceName) {
            console.warn('[CONSUL] SERVICE_NAME not set, skipping registration');
            return false;
        }

        const serviceDefinition = {
            ID: this.serviceId,
            Name: this.serviceName,
            Tags: [
                'restpoint',
                'microservice',
                process.env.NODE_ENV || 'development'
            ],
            Address: this.serviceHost === '0.0.0.0' ? this.getContainerIp() : this.serviceHost,
            Port: this.servicePort,
            Check: {
                HTTP: `http://${this.serviceHost === '0.0.0.0' ? 'localhost' : this.serviceHost}:${this.servicePort}${this.healthCheckPath}`,
                Interval: this.healthCheckInterval,
                Timeout: '5s',
                DeregisterCriticalServiceAfter: this.deregisterAfter,
            },
            Meta: {
                version: process.env.SERVICE_VERSION || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
            },
        };

        try {
            const response = await axios.put(
                `${this.consulHost}/v1/agent/service/register`,
                serviceDefinition,
                { timeout: 5000 }
            );

            if (response.status === 200) {
                console.log(`[CONSUL] ✓ Service registered: ${this.serviceName} (${this.serviceId}) at ${serviceDefinition.Address}:${serviceDefinition.Port}`);
                this.registered = true;
                return true;
            }
        } catch (error) {
            console.error(`[CONSUL] ✗ Failed to register service ${this.serviceName}:`, error.message);
            return false;
        }

        return false;
    }

    /**
     * Deregister this service from Consul (on shutdown)
     */
    async deregisterService() {
        if (!this.registered || !this.serviceName) return;

        try {
            const response = await axios.put(
                `${this.consulHost}/v1/agent/service/deregister/${this.serviceId}`,
                { timeout: 5000 }
            );

            if (response.status === 200) {
                console.log(`[CONSUL] ✓ Service deregistered: ${this.serviceName}`);
                this.registered = false;
            }
        } catch (error) {
            console.error(`[CONSUL] ✗ Failed to deregister service ${this.serviceName}:`, error.message);
        }
    }

    /**
     * Update service health check (for manual heartbeat)
     */
    async passHealthCheck() {
        if (!this.registered) return;

        try {
            await axios.put(
                `${this.consulHost}/v1/agent/check/pass/service:${this.serviceId}`,
                { timeout: 3000 }
            );
        } catch (error) {
            console.error(`[CONSUL] Failed to pass health check:`, error.message);
        }
    }

    // ===========================================================================
    // SERVICE DISCOVERY
    // ===========================================================================

    /**
     * Discover a service by name from Consul
     * @param {string} serviceName - Name of the service to discover
     * @param {string} tag - Optional tag filter
     * @returns {Array} Array of healthy service instances
     */
    async discoverService(serviceName, tag = null) {
        try {
            let url = `${this.consulHost}/v1/health/service/${serviceName}?passing=true`;
            if (tag) {
                url += `&tag=${tag}`;
            }

            const response = await axios.get(url, { timeout: 5000 });

            if (response.data && Array.isArray(response.data)) {
                return response.data
                    .filter(service => service.Service && service.Service.Port)
                    .map(service => ({
                        id: service.Service.ID,
                        name: service.Service.Service,
                        address: service.Service.Address,
                        port: service.Service.Port,
                        tags: service.Service.Tags,
                        meta: service.Service.Meta,
                    }));
            }
        } catch (error) {
            console.error(`[CONSUL] Failed to discover service ${serviceName}:`, error.message);
        }

        return [];
    }

    /**
     * Get a single healthy instance of a service (for simple load balancing)
     * @param {string} serviceName - Name of the service
     * @returns {Object|null} Service instance or null
     */
    async getServiceInstance(serviceName) {
        const instances = await this.discoverService(serviceName);

        if (instances.length === 0) {
            return null;
        }

        // Simple round-robin could be implemented here
        // For now, return the first healthy instance
        return instances[0];
    }

    /**
     * Get service URL in format: http://address:port
     * @param {string} serviceName - Name of the service
     * @returns {string|null} Service URL or null
     */
    async getServiceUrl(serviceName) {
        const instance = await this.getServiceInstance(serviceName);

        if (!instance) {
            return null;
        }

        return `http://${instance.address}:${instance.port}`;
    }

    // ===========================================================================
    // HEALTH & MONITORING
    // ===========================================================================

    /**
     * Check if Consul is reachable
     */
    async isConsulHealthy() {
        try {
            const response = await axios.get(`${this.consulHost}/v1/status/leader`, { timeout: 3000 });
            return response.status === 200 && response.data !== '';
        } catch (error) {
            return false;
        }
    }

    /**
     * Get all registered services
     */
    async getAllServices() {
        try {
            const response = await axios.get(`${this.consulHost}/v1/catalog/services`, { timeout: 5000 });
            return response.data || {};
        } catch (error) {
            console.error('[CONSUL] Failed to get services:', error.message);
            return {};
        }
    }

    // ===========================================================================
    // UTILITIES
    // ===========================================================================

    /**
     * Get container IP address (for Docker networking)
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
     * Start periodic health check heartbeat
     */
    startHeartbeat(intervalMs = 5000) {
        this.heartbeatInterval = setInterval(() => {
            this.passHealthCheck();
        }, intervalMs);
    }

    /**
     * Stop periodic health check heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let consulClient = null;

function getConsulClient() {
    if (!consulClient) {
        consulClient = new ConsulClient();
    }
    return consulClient;
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    ConsulClient,
    getConsulClient,
};