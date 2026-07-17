/**
 * @file shared/services/serviceClient.js
 * Service-to-service HTTP client with circuit breaker and caching
 * Used for inter-microservice communication
 */

const axios = require('axios');

const SERVICE_URLS = {
    'hearse-service': process.env.HEARSE_SERVICE_URL || 'http://hearse-service:5002',
    'chemical-service': process.env.CHEMICAL_SERVICE_URL || 'http://chemical-service:5003',
    'workshop-service': process.env.WORKSHOP_SERVICE_URL || 'http://workshop-service:5004',
    'analytics-service': process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:5005',
};

const TIMEOUT = process.env.SERVICE_CALL_TIMEOUT || 30000;

class ServiceClient {
    constructor() {
        this.circuitBreakers = {};
        this.cache = new Map();
        this.cacheExpiry = new Map();
    }

    /**
     * Get or create a circuit breaker for a service
     */
    getCircuitBreaker(serviceName) {
        if (!this.circuitBreakers[serviceName]) {
            this.circuitBreakers[serviceName] = {
                failures: 0,
                state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
                lastFailureTime: 0,
                threshold: 5,
                resetTimeout: 60000,
            };
        }
        return this.circuitBreakers[serviceName];
    }

    /**
     * Check if a call should proceed based on circuit breaker state
     */
    checkCircuitBreaker(serviceName) {
        const cb = this.getCircuitBreaker(serviceName);

        if (cb.state === 'CLOSED') {
            return true;
        }

        if (cb.state === 'OPEN') {
            if (Date.now() - cb.lastFailureTime > cb.resetTimeout) {
                cb.state = 'HALF_OPEN';
                cb.failures = 0;
                return true;
            }
            throw new Error(`Circuit breaker OPEN for ${serviceName}`);
        }

        // HALF_OPEN - allow one request
        return true;
    }

    /**
     * Record success - close circuit breaker
     */
    recordSuccess(serviceName) {
        const cb = this.getCircuitBreaker(serviceName);
        cb.failures = 0;
        cb.state = 'CLOSED';
    }

    /**
     * Record failure - trip circuit breaker if threshold exceeded
     */
    recordFailure(serviceName) {
        const cb = this.getCircuitBreaker(serviceName);
        cb.failures++;
        cb.lastFailureTime = Date.now();

        if (cb.failures >= cb.threshold) {
            cb.state = 'OPEN';
        }
    }

    /**
     * Make HTTP request to another service
     */
    async call(serviceName, method, endpoint, data = null, headers = {}, cacheSeconds = 0) {
        const cacheKey = `${serviceName}:${method}:${endpoint}`;

        // Check cache
        if (method === 'GET' && cacheSeconds > 0) {
            if (this.cache.has(cacheKey)) {
                const expiry = this.cacheExpiry.get(cacheKey);
                if (Date.now() < expiry) {
                    return this.cache.get(cacheKey);
                }
                // Expired cache entry
                this.cache.delete(cacheKey);
                this.cacheExpiry.delete(cacheKey);
            }
        }

        // Check circuit breaker
        try {
            this.checkCircuitBreaker(serviceName);
        } catch (err) {
            console.warn(`[ServiceClient] ${err.message}`);
            // Return cached data if available, even if stale
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            throw err;
        }

        try {
            const url = `${SERVICE_URLS[serviceName]}${endpoint}`;
            const config = {
                method,
                url,
                timeout: TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            };

            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                config.data = data;
            }

            const response = await axios(config);

            // Record success
            this.recordSuccess(serviceName);

            // Cache GET responses
            if (method === 'GET' && cacheSeconds > 0) {
                this.cache.set(cacheKey, response.data);
                this.cacheExpiry.set(cacheKey, Date.now() + cacheSeconds * 1000);
            }

            return response.data;
        } catch (error) {
            this.recordFailure(serviceName);

            // Log error
            console.error(`[ServiceClient] Error calling ${serviceName}${endpoint}:`, {
                status: error.response?.status,
                message: error.message,
            });

            // Return cached data if available
            if (this.cache.has(cacheKey)) {
                console.warn(`[ServiceClient] Returning stale cache for ${cacheKey}`);
                return this.cache.get(cacheKey);
            }

            throw error;
        }
    }

    /**
     * GET request
     */
    async get(serviceName, endpoint, headers = {}, cacheSeconds = 0) {
        return this.call(serviceName, 'GET', endpoint, null, headers, cacheSeconds);
    }

    /**
     * POST request
     */
    async post(serviceName, endpoint, data, headers = {}) {
        return this.call(serviceName, 'POST', endpoint, data, headers);
    }

    /**
     * PUT request
     */
    async put(serviceName, endpoint, data, headers = {}) {
        return this.call(serviceName, 'PUT', endpoint, data, headers);
    }

    /**
     * Clear cache for a key
     */
    clearCache(serviceName, endpoint) {
        for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) {
            const key = `${serviceName}:${method}:${endpoint}`;
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
        }
    }

    /**
     * Clear all cache
     */
    clearAllCache() {
        this.cache.clear();
        this.cacheExpiry.clear();
    }
}

module.exports = new ServiceClient();
