const promClient = require('prom-client');

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Enable default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// ============================================
// HTTP REQUEST METRICS
// ============================================

// Counter for total HTTP requests
const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'service'],
    registers: [register],
});

// Histogram for HTTP request duration
const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'service'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [register],
});

// ============================================
// ERROR METRICS
// ============================================

// Counter for unhandled rejections
const unhandledRejectionTotal = new promClient.Counter({
    name: 'unhandled_rejection_total',
    help: 'Total number of unhandled promise rejections',
    labelNames: ['service', 'error_type'],
    registers: [register],
});

// Counter for uncaught exceptions
const uncaughtExceptionTotal = new promClient.Counter({
    name: 'uncaught_exception_total',
    help: 'Total number of uncaught exceptions',
    labelNames: ['service', 'error_type'],
    registers: [register],
});

// Counter for HTTP errors (4xx, 5xx)
const httpErrorTotal = new promClient.Counter({
    name: 'http_errors_total',
    help: 'Total number of HTTP error responses',
    labelNames: ['method', 'route', 'status_code', 'error_type', 'service'],
    registers: [register],
});

// ============================================
// RESOURCE USAGE METRICS
// ============================================

// Gauge for active connections
const activeConnections = new promClient.Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    labelNames: ['service'],
    registers: [register],
});

// Gauge for memory usage
const memoryUsage = new promClient.Gauge({
    name: 'process_memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['service', 'type'],
    registers: [register],
});

// Gauge for event loop lag
const eventLoopLag = new promClient.Gauge({
    name: 'event_loop_lag_seconds',
    help: 'Event loop lag in seconds',
    labelNames: ['service'],
    registers: [register],
});

// ============================================
// DATABASE METRICS
// ============================================

// Counter for database queries
const dbQueryTotal = new promClient.Counter({
    name: 'database_queries_total',
    help: 'Total number of database queries',
    labelNames: ['service', 'query_type', 'table'],
    registers: [register],
});

// Histogram for database query duration
const dbQueryDuration = new promClient.Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['service', 'query_type', 'table'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
    registers: [register],
});

// Counter for database connection errors
const dbConnectionErrorTotal = new promClient.Counter({
    name: 'database_connection_errors_total',
    help: 'Total number of database connection errors',
    labelNames: ['service', 'error_type'],
    registers: [register],
});

// ============================================
// BUSINESS METRICS
// ============================================

// Counter for deceased registrations
const deceasedRegistrations = new promClient.Counter({
    name: 'deceased_registrations_total',
    help: 'Total number of deceased registrations',
    labelNames: ['service', 'branch'],
    registers: [register],
});

// Counter for bookings
const bookingTotal = new promClient.Counter({
    name: 'bookings_total',
    help: 'Total number of bookings',
    labelNames: ['service', 'booking_type', 'status'],
    registers: [register],
});

// Counter for invoice creations
const invoiceTotal = new promClient.Counter({
    name: 'invoices_total',
    help: 'Total number of invoices created',
    labelNames: ['service', 'status'],
    registers: [register],
});

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================

/**
 * Express middleware to track HTTP metrics
 */
const metricsMiddleware = (serviceName) => {
    return (req, res, next) => {
        const start = Date.now();

        // Track active connections
        activeConnections.inc({ service: serviceName });

        res.on('finish', () => {
            const duration = (Date.now() - start) / 1000;
            const route = req.route?.path || req.path;
            const method = req.method;
            const statusCode = res.statusCode;

            // Track request
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

            // Decrement active connections
            activeConnections.dec({ service: serviceName });
        });

        next();
    };
};

/**
 * Error tracking middleware
 */
const errorTrackingMiddleware = (serviceName) => {
    return (err, req, res, next) => {
        // Track unhandled rejections
        unhandledRejectionTotal.inc({
            service: serviceName,
            error_type: err.name || 'Error',
        });

        console.error(`[${serviceName}] Unhandled rejection:`, err);
        next(err);
    };
};

/**
 * Database query tracking
 */
const trackDbQuery = (serviceName, queryType, table, duration) => {
    dbQueryTotal.inc({
        service: serviceName,
        query_type: queryType,
        table: table,
    });

    dbQueryDuration.observe({
        service: serviceName,
        query_type: queryType,
        table: table,
    }, duration);
};

/**
 * Track database connection errors
 */
const trackDbError = (serviceName, errorType) => {
    dbConnectionErrorTotal.inc({
        service: serviceName,
        error_type: errorType,
    });
};

/**
 * Track business events
 */
const trackDeceasedRegistration = (serviceName, branch) => {
    deceasedRegistrations.inc({
        service: serviceName,
        branch: branch || 'unknown',
    });
};

const trackBooking = (serviceName, bookingType, status) => {
    bookingTotal.inc({
        service: serviceName,
        booking_type: bookingType,
        status: status,
    });
};

const trackInvoice = (serviceName, status) => {
    invoiceTotal.inc({
        service: serviceName,
        status: status,
    });
};

// ============================================
// METRICS ENDPOINT
// ============================================

/**
 * Express route handler for /metrics endpoint
 */
const metricsEndpoint = (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
};

// ============================================
// EVENT LOOP MONITORING
// ============================================

/**
 * Start monitoring event loop lag
 */
const startEventLoopMonitoring = (serviceName) => {
    setInterval(() => {
        const start = Date.now();
        setImmediate(() => {
            const lag = (Date.now() - start) / 1000;
            eventLoopLag.set({
                service: serviceName,
            }, lag);
        });
    }, 1000);
};

/**
 * Update memory usage metrics
 */
const updateMemoryMetrics = (serviceName) => {
    setInterval(() => {
        const memUsage = process.memoryUsage();

        memoryUsage.set({
            service: serviceName,
            type: 'rss',
        }, memUsage.rss);

        memoryUsage.set({
            service: serviceName,
            type: 'heap_used',
        }, memUsage.heapUsed);

        memoryUsage.set({
            service: serviceName,
            type: 'heap_total',
        }, memUsage.heapTotal);

        memoryUsage.set({
            service: serviceName,
            type: 'external',
        }, memUsage.external);
    }, 5000);
};

// ============================================
// GLOBAL ERROR HANDLERS
// ============================================

/**
 * Setup global error handlers for the service
 */
const setupGlobalErrorHandlers = (serviceName) => {
    // Track unhandled rejections
    process.on('unhandledRejection', (err) => {
        unhandledRejectionTotal.inc({
            service: serviceName,
            error_type: err.name || 'Error',
        });
        console.error(`[${serviceName}] Unhandled rejection:`, err);
    });

    // Track uncaught exceptions
    process.on('uncaughtException', (err) => {
        uncaughtExceptionTotal.inc({
            service: serviceName,
            error_type: err.name || 'Error',
        });
        console.error(`[${serviceName}] Uncaught exception:`, err);
    });
};

module.exports = {
    register,
    metricsMiddleware,
    errorTrackingMiddleware,
    trackDbQuery,
    trackDbError,
    trackDeceasedRegistration,
    trackBooking,
    trackInvoice,
    metricsEndpoint,
    startEventLoopMonitoring,
    updateMemoryMetrics,
    setupGlobalErrorHandlers,
};