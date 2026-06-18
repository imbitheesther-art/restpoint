#!/usr/bin/env node
// RestPoint API Gateway — Central routing
// Based on working Siasa Hub gateway pattern using http-proxy-middleware
// Run with memory limit: node --max-old-space-size=4096 server.js
try { const v8 = require('v8'); v8.setFlagsFromString('--max-old-space-size=4096'); } catch(e){}

const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

dotenv.config();

const APP_NAME = 'restpoint-gateway';
const APP_VERSION = '1.0.0';

// =============================================================================
// LOGGER
// =============================================================================
const Logger = {
  info: (m, d) => { console.log(`[INFO] ${m}`, d || ''); },
  error: (m, d) => { console.error(`[ERROR] ${m}`, d || ''); },
  warn: (m, d) => { console.warn(`[WARN] ${m}`, d || ''); },
  debug: (m, d) => { console.debug(`[DEBUG] ${m}`, d || ''); },
};

// =============================================================================
// PROCESS ERROR HANDLERS
// =============================================================================
process.on('uncaughtException', (error) => {
  Logger.error('🔥 UNCAUGHT EXCEPTION', { message: error.message, stack: error.stack });
  const isConnectionError = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(error.code);
  if (!isConnectionError) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason) => {
  Logger.error('🌀 UNHANDLED PROMISE REJECTION', { message: reason?.message || reason });
});

// =============================================================================
// CONFIGURATION
// =============================================================================
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const isProd = (process.env.NODE_ENV || 'development') === 'production';

// =============================================================================
// SERVICE URLS — All services use port 5000 internally in Docker
// =============================================================================
const SERVICES = {
  auth:        (process.env.AUTH_SERVICE_URL        || 'http://restpoint_auth:5000').trim(),
  users:       (process.env.USERS_SERVICE_URL       || 'http://restpoint_auth:5000').trim(),
  tenant:      (process.env.TENANT_SERVICE_URL      || 'http://restpoint_tenant:5000').trim(),
  deceased:    (process.env.DECEASED_SERVICE_URL    || 'http://restpoint_deceased:5000').trim(),
  marketplace: (process.env.MARKETPLACE_SERVICE_URL || 'http://restpoint_marketplace:5000').trim(),
  mpesa:       (process.env.MPESA_SERVICE_URL       || 'http://restpoint_mpesa:5000').trim(),
  portal:      (process.env.PORTAL_SERVICE_URL      || 'http://restpoint_portal:5000').trim(),
  invoices:    (process.env.INVOICES_SERVICE_URL    || 'http://restpoint_invoice:5000').trim(),
  coffin:      (process.env.COFFIN_SERVICE_URL      || 'http://restpoint_coffin:5000').trim(),
  visitors:    (process.env.VISITORS_SERVICE_URL    || 'http://restpoint_visitors:5000').trim(),
  notification:(process.env.NOTIFICATION_SERVICE_URL|| 'http://restpoint_notification:5000').trim(),
  documents:   (process.env.DOCUMENTS_SERVICE_URL   || 'http://restpoint_documents:5000').trim(),
  analytics:   (process.env.ANALYTICS_SERVICE_URL   || 'http://restpoint_analytics:5000').trim(),
  bodycheckout:(process.env.BODYCHECKOUT_SERVICE_URL|| 'http://restpoint_bodycheckout:5000').trim(),
  edocuments:  (process.env.EDOCUMENTS_SERVICE_URL  || 'http://restpoint_edocuments:5000').trim(),
  calendar:    (process.env.CALENDAR_SERVICE_URL    || 'http://restpoint_calender:5000').trim(),
  chemicals:   (process.env.CHEMICAL_SERVICE_URL    || 'http://restpoint_chemical:5000').trim(),
  embalming:   (process.env.EMBALMING_SERVICE_URL   || 'http://restpoint_deceased:5000').trim(),
};

Logger.info('Service URLs:');
Object.entries(SERVICES).forEach(([name, url]) => {
  Logger.info(`  ${name} → ${url}`);
});

// =============================================================================
// RATE LIMITING
// =============================================================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 10 : 100,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// =============================================================================
// EXPRESS APP
// =============================================================================
const app = express();

// =============================================================================
// CORS
// =============================================================================
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.indexOf('localhost') >= 0) return callback(null, true);
    const allowed = [
      'https://restpoint.co.ke',
      'https://app.restpoint.co.ke',
      'https://portal.restpoint.co.ke',
    ];
    if (allowed.indexOf(origin) >= 0) return callback(null, true);
    return callback(new Error('Origin not allowed: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-tenant-slug',
    'x-tenant-id',
    'x-request-timestamp',
    'x-session-fingerprint',
    'X-Session-Fingerprint',
    'x-client-id',
    'X-Client-ID',
    'X-CSRF-Token',
    'Origin',
    'X-Requested-With',
    'Accept'
  ],
}));

// =============================================================================
// SECURITY & PARSING MIDDLEWARE
// =============================================================================
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// Body parsers — only for non-proxied routes (health, debug, etc.)
app.use((req, res, next) => {
  const isProxied = req.path.startsWith('/api/v1/') || req.path.startsWith('/api/');
  if (isProxied) return next(); // skip body parser — let proxy forward raw body
  express.json({ limit: '1mb' })(req, res, next);
});
app.use((req, res, next) => {
  const isProxied = req.path.startsWith('/api/v1/') || req.path.startsWith('/api/');
  if (isProxied) return next();
  express.urlencoded({ extended: true, limit: '1mb' })(req, res, next);
});

// Apply rate limiters
app.use('/api/v1/', apiLimiter);

// Auth-specific rate limiting
app.use((req, res, next) => {
  if (req.originalUrl.match(/\/auth\/(login|register|refresh)/)) {
    return authLimiter(req, res, next);
  }
  next();
});

// =============================================================================
// REQUEST LOGGING
// =============================================================================
app.use((req, res, next) => {
  Logger.info(`→ ${req.method} ${req.originalUrl}`);
  next();
});

// =============================================================================
// PROXY CONFIGURATION
// =============================================================================
// KEY INSIGHT: http-proxy-middleware handles all the complexity:
// - Forwards the FULL original path (req.originalUrl) to the backend
// - Backend services have routes mounted at /api/v1/restpoint/... (WITH /api)
// - No path stripping needed — forward AS-IS
// - Handles WebSocket upgrades, connection pooling, error handling
// =============================================================================

const proxyOptions = {
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq, req) => {
      // Forward auth headers
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
      if (req.headers['x-tenant-slug']) proxyReq.setHeader('x-tenant-slug', req.headers['x-tenant-slug']);
      if (req.headers['x-tenant-id']) proxyReq.setHeader('x-tenant-id', req.headers['x-tenant-id']);

      // Fix for POST/PUT requests with body-parser
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.headers['content-type']) {
        proxyReq.setHeader('Content-Type', req.headers['content-type']);
      }

      Logger.debug(`[PROXY] ${req.method} ${req.originalUrl} → ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    },
    proxyRes: (proxyRes, req) => {
      Logger.debug(`[PROXY] ${req.method} ${req.originalUrl} → ${proxyRes.statusCode}`);
    },
    error: (err, req, res) => {
      Logger.error(`[PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: 'Service temporarily unavailable',
          path: req.originalUrl,
          error: err.code
        });
      }
    }
  }
};

// =============================================================================
// ROUTE MAPPING
// =============================================================================
// Each route maps a path prefix to a backend service.
// http-proxy-middleware automatically forwards ALL sub-paths.
// pathRewrite: req.originalUrl ensures the FULL path is sent to the backend.
// =============================================================================

const routes = [
  // Auth & Users
  { paths: ['/api/v1/restpoint/auth', '/api/v1/restpoint/users', '/api/v1/users'], target: SERVICES.auth },

  // Tenant (includes onboarding, system-admin, tenants)
  { paths: ['/api/v1/restpoint/tenant', '/api/v1/restpoint/tenants', '/api/v1/restpoint/system-admin', '/api/onboarding'], target: SERVICES.tenant },

  // Deceased & Embalming
  { paths: ['/api/v1/restpoint/deceased', '/api/v1/restpoint/embalming'], target: SERVICES.deceased },

  // Marketplace
  { paths: ['/api/v1/restpoint/marketplace', '/api/v1/marketplace'], target: SERVICES.marketplace },

  // Mpesa
  { paths: ['/api/v1/restpoint/mpesa', '/api/v1/mpesa'], target: SERVICES.mpesa },

  // Portal
  { paths: ['/api/v1/restpoint/portal'], target: SERVICES.portal },

  // Invoices
  { paths: ['/api/v1/restpoint/invoices'], target: SERVICES.invoices },

  // Coffin
  { paths: ['/api/v1/restpoint/coffin'], target: SERVICES.coffin },

  // Visitors
  { paths: ['/api/v1/restpoint/visitors'], target: SERVICES.visitors },

  // Notification
  { paths: ['/api/v1/restpoint/notification'], target: SERVICES.notification },

  // Documents
  { paths: ['/api/v1/restpoint/documents'], target: SERVICES.documents },

  // Analytics & Performance
  { paths: ['/api/v1/restpoint/analytics', '/api/v1/restpoint/performance'], target: SERVICES.analytics },

  // Body Checkout
  { paths: ['/api/v1/restpoint/bodycheckout'], target: SERVICES.bodycheckout },

  // E-Documents
  { paths: ['/api/v1/restpoint/edocuments', '/api/v1/edocuments'], target: SERVICES.edocuments },

  // Calendar
  { paths: ['/api/v1/restpoint/calendar', '/api/v1/calendar'], target: SERVICES.calendar },

  // Chemicals
  { paths: ['/api/v1/restpoint/chemicals'], target: SERVICES.chemicals },
];

// Mount all proxies
Logger.info('Registered routes:');
routes.forEach(route => {
  route.paths.forEach(path => {
    Logger.info(`  ${path} → ${route.target}`);
    app.use(path, createProxyMiddleware({
      ...proxyOptions,
      target: route.target,
      pathRewrite: (path, req) => req.originalUrl, // Forward FULL original path
    }));
  });
});

// =============================================================================
// WILDCARD FALLBACK — Catch any /api/v1/restpoint/:service not explicitly listed
// =============================================================================
app.all('/api/v1/restpoint/:service/:path(*)', (req, res) => {
  const serviceName = req.params.service;
  const targetUrl = SERVICES[serviceName];
  const subPath = req.params.path || '';

  Logger.warn(`[WILDCARD] ${req.method} /api/v1/restpoint/${serviceName}/${subPath} → ${targetUrl || 'NO MATCH'}`);

  if (!targetUrl) {
    return res.status(404).json({
      success: false,
      message: `Unknown service: ${serviceName}`,
      originalUrl: req.originalUrl,
      availableServices: Object.keys(SERVICES).sort()
    });
  }

  // Forward using http-proxy-middleware
  const wildcardProxy = createProxyMiddleware({
    ...proxyOptions,
    target: targetUrl,
    pathRewrite: (path, req) => req.originalUrl,
  });
  wildcardProxy(req, res);
});

// =============================================================================
// HEALTH & DIAGNOSTIC ENDPOINTS
// =============================================================================

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    services: Object.keys(SERVICES),
    serviceCount: Object.keys(SERVICES).length,
    routeCount: routes.reduce((acc, r) => acc + r.paths.length, 0)
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: APP_NAME,
    version: APP_VERSION,
    port: PORT,
    uptime: process.uptime()
  });
});

// Debug: Show all registered routes
app.get('/api/v1/debug/routes', (req, res) => {
  const routeList = [];
  routes.forEach(route => {
    route.paths.forEach(path => {
      routeList.push({ path, service: route.target });
    });
  });
  res.json({
    success: true,
    message: 'Gateway routes',
    gatewayVersion: APP_VERSION,
    serviceCount: Object.keys(SERVICES).length,
    routeCount: routeList.length,
    routes: routeList,
    services: SERVICES,
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: PORT
    }
  });
});

// =============================================================================
// 404 HANDLER
// =============================================================================
app.use((req, res) => {
  Logger.warn(`[404] ${req.method} ${req.originalUrl} — No matching route`);

  // Check if any route prefix matches
  const matchingRoutes = [];
  routes.forEach(route => {
    route.paths.forEach(path => {
      if (req.originalUrl.indexOf(path) >= 0) {
        matchingRoutes.push({ path, target: route.target });
      }
    });
  });

  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    originalUrl: req.originalUrl,
    matchedRoutes: matchingRoutes.length > 0 ? matchingRoutes : [],
    hint: matchingRoutes.length > 0
      ? 'Route matched but proxy forwarding may have failed. Check if the target service is running.'
      : 'No matching route found. Check /api/v1/debug/routes for all registered routes.'
  });
});

// =============================================================================
// ERROR HANDLER
// =============================================================================
app.use((err, req, res, next) => {
  Logger.error(`Internal Server Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: isProd ? undefined : err.message
  });
});

// =============================================================================
// START SERVER
// =============================================================================
const server = app.listen(PORT, HOST, () => {
  Logger.info('========================================');
  Logger.info(`  ${APP_NAME} v${APP_VERSION}`);
  Logger.info(`  Running on http://${HOST}:${PORT}`);
  Logger.info(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  Logger.info(`  Proxying ${Object.keys(SERVICES).length} services`);
  Logger.info(`  Registered ${routes.reduce((acc, r) => acc + r.paths.length, 0)} routes`);
  Logger.info('========================================');
});

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================
function shutdown() {
  Logger.info('Shutting down...');
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;