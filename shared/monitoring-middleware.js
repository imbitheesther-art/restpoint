/**
 * RestPoint Universal Monitoring Middleware
 * 
 * Add this to ANY Express service to get:
 * - /health endpoint (returns service status)
 * - /ready endpoint (readiness probe)
 * - /metrics endpoint (Prometheus metrics)
 * - Request logging with response times
 * - Error tracking (unhandled rejections, exceptions)
 * - Database query tracking
 * 
 * Usage:
 *   const monitoring = require('./shared/monitoring-middleware');
 *   app.use(monitoring.middleware('service-name'));
 *   app.get('/health', monitoring.healthHandler);
 *   app.get('/ready', monitoring.readyHandler);
 *   app.get('/metrics', monitoring.metricsHandler);
 *   monitoring.setupGlobalHandlers('service-name');
 */

const promClient = require('prom-client');

// Create a Registry
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// ============================================
// METRIC DEFINITIONS
// ============================================

const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'service'],
    registers: [register],
});

const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'service'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [register],
});

const httpRequestSize = new promClient.Histogram({
    name: 'http_request_size_bytes',
    help: 'Size of HTTP requests in bytes',
    labelNames: ['method', 'route', 'service'],
    buckets: [100, 1000, 10000, 100000, 1000000, 10000000],
    registers: [register],
});

const httpResponseSize = new promClient.Histogram({
    name: 'http_response_size_bytes',
    help: 'Size of HTTP responses in bytes',
    labelNames: ['method', 'route', 'service'],
    buckets: [100, 1000, 10000, 100000, 1000000, 10000000],
    registers: [register],
});

const httpErrorTotal = new promClient.Counter({
    name: 'http_errors_total',
    help: 'Total number of HTTP error responses',
    labelNames: ['method', 'route', 'status_code', 'error_type', 'service'],
    registers: [register],
});

const activeConnections = new promClient.Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    labelNames: ['service'],
    registers: [register],
});

const memoryUsage = new promClient.Gauge({
    name: 'process_memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['service', 'type'],
    registers: [register],
});

const eventLoopLag = new promClient.Gauge({
    name: 'event_loop_lag_seconds',
    help: 'Event loop lag in seconds',
    labelNames: ['service'],
    registers: [register],
});

const unhandledRejectionTotal = new promClient.Counter({
    name: 'unhandled_rejection_total',
    help: 'Total number of unhandled promise rejections',
    labelNames: ['service', 'error_type'],
    registers: [register],
});

const uncaughtExceptionTotal = new promClient.Counter({
    name: 'uncaught_exception_total',
    help: 'Total number of uncaught exceptions',
    labelNames: ['service', 'error_type'],
    registers: [register],
});

const dbQueryTotal = new promClient.Counter({
    name: 'database_queries_total',
    help: 'Total number of database queries',
    labelNames: ['service', 'query_type', 'table'],
    registers: [register],
});

const dbQueryDuration = new promClient.Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['service', 'query_type', 'table'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register],
});

const dbConnectionErrorTotal = new promClient.Counter({
    name: 'database_connection_errors_total',
    help: 'Total number of database connection errors',
    labelNames: ['service', 'error_type'],
    registers: [register],
});

// Business metrics
const deceasedRegistrations = new promClient.Counter({
    name: 'deceased_registrations_total',
    help: 'Total number of deceased registrations',
    labelNames: ['service', 'branch'],
    registers: [register],
});

const bookingTotal = new promClient.Counter({
    name: 'bookings_total',
    help: 'Total number of bookings',
    labelNames: ['service', 'booking_type', 'status'],
    registers: [register],
});

const invoiceTotal = new promClient.Counter({
    name: 'invoices_total',
    help: 'Total number of invoices created',
    labelNames: ['service', 'status'],
    registers: [register],
});

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Express middleware that tracks all HTTP metrics
 */
const middleware = (serviceName) => {
    return (req, res, next) => {
        const start = Date.now();
        const chunks = [];

        activeConnections.inc({ service: serviceName });

        // Track request size
        req.on('data', (chunk) => chunks.push(chunk));

        res.on('finish', () => {
            const duration = (Date.now() - start) / 1000;
            const route = req.route?.path || req.path;
            const method = req.method;
            const statusCode = res.statusCode;

            // Count request
            httpRequestTotal.inc({
                method,
                route,
                status_code: statusCode,
                service: serviceName,
            });

            // Track duration
            httpRequestDuration.observe({
                method,
                route,
                service: serviceName,
            }, duration);

            // Track response size
            const contentLength = res.get('content-length');
            if (contentLength) {
                httpResponseSize.observe({
                    method,
                    route,
                    service: serviceName,
                }, parseInt(contentLength));
            }

            // Track errors
            if (statusCode >= 400) {
                const errorType = statusCode >= 500 ? 'server_error' : 'client_error';
                httpErrorTotal.inc({
                    method,
                    route,
                    status_code: statusCode,
                    error_type: errorType,
                    service: serviceName,
                });
            }

            activeConnections.dec({ service: serviceName });
        });

        next();
    };
};

/**
 * Health check handler - returns service status
 */
const healthHandler = (req, res) => {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.json({
        status: 'healthy',
        service: req.headers['x-service-name'] || 'unknown',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime),
        memory: {
            rss: memUsage.rss,
            heapTotal: memUsage.heapTotal,
            heapUsed: memUsage.heapUsed,
            external: memUsage.external,
        },
        cpu: {
            loadAvg: require('os').loadavg(),
            cpus: require('os').cpus().length,
        },
    });
};

/**
 * Readiness probe handler
 */
const readyHandler = (req, res) => {
    res.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
    });
};

/**
 * Metrics handler - exposes Prometheus metrics
 */
const metricsHandler = async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Setup global error handlers for unhandled rejections and exceptions
 */
const setupGlobalHandlers = (serviceName) => {
    process.on('unhandledRejection', (err) => {
        unhandledRejectionTotal.inc({
            service: serviceName,
            error_type: err.name || 'Error',
        });
        console.error(`[${serviceName}] UNHANDLED REJECTION:`, err);
    });

    process.on('uncaughtException', (err) => {
        uncaughtExceptionTotal.inc({
            service: serviceName,
            error_type: err.name || 'Error',
        });
        console.error(`[${serviceName}] UNCAUGHT EXCEPTION:`, err);
    });
};

/**
 * Start monitoring event loop lag
 */
const startEventLoopMonitoring = (serviceName) => {
    setInterval(() => {
        const start = Date.now();
        setImmediate(() => {
            const lag = (Date.now() - start) / 1000;
            eventLoopLag.set({ service: serviceName }, lag);
        });
    }, 1000);
};

/**
 * Update memory usage metrics periodically
 */
const startMemoryMonitoring = (serviceName) => {
    setInterval(() => {
        const mem = process.memoryUsage();
        memoryUsage.set({ service: serviceName, type: 'rss' }, mem.rss);
        memoryUsage.set({ service: serviceName, type: 'heap_used' }, mem.heapUsed);
        memoryUsage.set({ service: serviceName, type: 'heap_total' }, mem.heapTotal);
        memoryUsage.set({ service: serviceName, type: 'external' }, mem.external);
    }, 5000);
};

// ============================================
// DATABASE TRACKING
// ============================================

/**
 * Track a database query
 */
const trackDbQuery = (serviceName, queryType, table, duration) => {
    dbQueryTotal.inc({ service: serviceName, query_type: queryType, table });
    dbQueryDuration.observe({ service: serviceName, query_type: queryType, table }, duration);
};

/**
 * Track a database connection error
 */
const trackDbError = (serviceName, errorType) => {
    dbConnectionErrorTotal.inc({ service: serviceName, error_type: errorType });
};

// ============================================
// BUSINESS METRICS TRACKING
// ============================================

const trackDeceasedRegistration = (serviceName, branch) => {
    deceasedRegistrations.inc({ service: serviceName, branch: branch || 'unknown' });
};

const trackBooking = (serviceName, bookingType, status) => {
    bookingTotal.inc({ service: serviceName, booking_type: bookingType, status });
};

const trackInvoice = (serviceName, status) => {
    invoiceTotal.inc({ service: serviceName, status });
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
    register,
    middleware,
    healthHandler,
    readyHandler,
    metricsHandler,
    setupGlobalHandlers,
    startEventLoopMonitoring,
    startMemoryMonitoring,
    trackDbQuery,
    trackDbError,
    trackDeceasedRegistration,
    trackBooking,
    trackInvoice,
};