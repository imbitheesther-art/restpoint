// Load service-specific .env first, then root .env for shared config (with override)
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env'), override: false });

// Debug: Check if DB credentials are loaded
console.log('[COFFIN] DB_USER:', process.env.DB_USER);
console.log('[COFFIN] DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
console.log('[COFFIN] DB_HOST:', process.env.DB_HOST);
console.log('[COFFIN] DB_NAME:', process.env.DB_NAME);

// NOW load modules that depend on environment variables
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Load routes AFTER .env is loaded so dbConfig can read DB credentials
const coffinRoutes = require('./routes/coffinRoutes.cjs');

const app = express();
const PORT = process.env.PORT || 8108;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-slug', 'x-tenant-id', 'x-user-id', 'x-branch-id', 'x-branch-code']
};

// Simple logger
const logger = {
  info: (msg) => console.log(`[COFFIN] ${msg}`),
  error: (msg, err) => {
    console.error(`[COFFIN] ERROR: ${msg}`);
    if (err) {
      console.error(`[COFFIN] ${err.message}`);
      if (err.stack) console.error(err.stack);
    }
  },
  warn: (msg) => console.warn(`[COFFIN] WARN: ${msg}`)
};

logger.info('Starting coffin service...');

// Prevent process from exiting
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('exit', (code) => {
  logger.info(`Process exiting with code: ${code}`);
});

// Mount routes
const routes = coffinRoutes;

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

logger.info('Middleware configured');

// Simple tenant middleware - just pass through the slug, no validation
app.use(async (req, res, next) => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] || req.headers['x-slug'] || 'system_shared';

    req.tenantSlug = tenantSlug;
    req.tenant = {
      db_name: tenantSlug === 'system_shared' ? (process.env.DB_NAME || 'restpoint_main') : tenantSlug,
      tenant_id: tenantSlug === 'system_shared' ? 1 : 0,
      tenant_name: tenantSlug,
      tenant_slug: tenantSlug
    };

    logger.info(`${req.method} ${req.path} - Tenant: ${tenantSlug} → DB: ${req.tenant.db_name}`);

    next();
  } catch (error) {
    logger.error('Middleware error', error);
    res.status(500).json({
      success: false,
      message: 'Middleware error',
      error: error.message
    });
  }
});

// Routes - mount at /coffins to match API gateway paths
app.use('/coffins', routes);

// Log all registered routes after mounting
try {
  logger.info('Registered routes after mounting:');
  if (app._router && app._router.stack) {
    app._router.stack.forEach((layer, i) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
        logger.info(`  ${methods} ${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        layer.handle.stack.forEach((subLayer) => {
          if (subLayer.route) {
            const methods = Object.keys(subLayer.route.methods).map(m => m.toUpperCase()).join(', ');
            logger.info(`  ${methods} /coffins${subLayer.route.path}`);
          }
        });
      }
    });
  }
} catch (err) {
  logger.warn('Could not log routes: ' + err.message);
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'coffin-service',
    tenant: req.tenantSlug,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Coffin Service',
    tenant: req.tenantSlug,
    endpoints: {
      create: 'POST /',
      list: 'GET /',
      detail: 'GET /:id',
      update: 'PUT /:id',
      delete: 'DELETE /:id',
      assign: 'POST /assign',
      health: 'GET /health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  logger.info(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled Error', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info('========================================');
    logger.info(`  🚀 Coffin Service`);
    logger.info(`  📡 Running on http://localhost:${PORT}`);
    logger.info(`  🔗 Health: http://localhost:${PORT}/health`);
    logger.info(`  📝 POST: http://localhost:${PORT}/`);
    logger.info(`  📋 GET: http://localhost:${PORT}/`);
    logger.info('========================================');
    console.log('[COFFIN] ✅ Service is ready and listening for requests');
  });

  server.on('error', (error) => {
    logger.error('Server error', error);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down...');
    server.close(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down...');
    server.close(() => process.exit(0));
  });

  // Keep-alive
  setInterval(() => { }, 30000);

} catch (error) {
  logger.error('Failed to start server', error);
  process.exit(1);
}