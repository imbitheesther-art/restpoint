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
// SERVICE URLS — All services use port 5000 internally in Docker network
// =============================================================================
const SERVICES = {
  auth:         (process.env.AUTH_SERVICE_URL         || 'http://auth-service:5000').trim(),
  users:        (process.env.USERS_SERVICE_URL        || 'http://auth-service:5000').trim(),
  tenant:       (process.env.TENANT_SERVICE_URL       || 'http://tenant-service:5000').trim(),
  deceased:     (process.env.DECEASED_SERVICE_URL     || 'http://deceased-service:5000').trim(),
  marketplace:  (process.env.MARKETPLACE_SERVICE_URL  || 'http://marketplace-service:5000').trim(),
  mpesa:        (process.env.MPESA_SERVICE_URL        || 'http://mpesa-service:5000').trim(),
  portal:       (process.env.PORTAL_SERVICE_URL       || 'http://portal-service:5000').trim(),
  invoices:     (process.env.INVOICES_SERVICE_URL     || 'http://invoice-service:5000').trim(),
  coffin:       (process.env.COFFIN_SERVICE_URL       || 'http://coffin-service:5000').trim(),
  visitors:     (process.env.VISITORS_SERVICE_URL     || 'http://visitors-service:5000').trim(),
  notification: (process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5000').trim(),
  documents:    (process.env.DOCUMENTS_SERVICE_URL    || 'http://documents-service:5000').trim(),
  analytics:    (process.env.ANALYTICS_SERVICE_URL    || 'http://analytics-service:5000').trim(),
  bodycheckout: (process.env.BODYCHECKOUT_SERVICE_URL || 'http://bodycheckout-service:5000').trim(),
  edocuments:   (process.env.EDOCUMENTS_SERVICE_URL   || 'http://edocuments-service:5000').trim(),
  calendar:     (process.env.CALENDAR_SERVICE_URL     || 'http://calender-service:5000').trim(),
  chemicals:    (process.env.CHEMICAL_SERVICE_URL     || 'http://chemical-service:5000').trim(),
  billing:      (process.env.BILLING_SERVICE_URL      || 'http://billing-service:5000').trim(),
  socketio:     (process.env.SOCKETIO_SERVICE_URL     || 'http://socketio-service:5000').trim(),
  extra:        (process.env.EXTRA_SERVICES_URL       || 'http://extra-services:5000').trim(),
  call:         (process.env.CALL_SERVICE_URL         || 'http://call-service:5000').trim(),
  qrcode:       (process.env.QRCODE_SERVICE_URL       || 'http://qrcode-service:5000').trim(),
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
  const isProxied = req.path.startsWith('/api/v1/') || req.path.startsWith('/v1/');
  if (isProxied) return next();
  express.json({ limit: '1mb' })(req, res, next);
});
app.use((req, res, next) => {
  const isProxied = req.path.startsWith('/api/v1/') || req.path.startsWith('/v1/');
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
const proxyOptions = {
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq, req) => {
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
      if (req.headers['x-tenant-slug']) proxyReq.setHeader('x-tenant-slug', req.headers['x-tenant-slug']);
      if (req.headers['x-tenant-id']) proxyReq.setHeader('x-tenant-id', req.headers['x-tenant-id']);
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
        res.status(503).json({ success: false, message: 'Service temporarily unavailable', path: req.originalUrl, error: err.code });
      }
    }
  }
};

// =============================================================================
// ROUTE MAPPING — ALL 23 SERVICES
// Both /api/v1/restpoint/* and /v1/restpoint/* for compatibility
// Path rewrite strips /api prefix when present
// =============================================================================
const routes = [
  { paths: ['/api/v1/restpoint/auth', '/api/v1/restpoint/users', '/api/v1/users', '/v1/restpoint/auth', '/v1/restpoint/users'], target: SERVICES.auth },
  { paths: ['/api/v1/restpoint/tenant', '/api/v1/restpoint/tenants', '/api/v1/restpoint/system-admin', '/api/onboarding', '/v1/restpoint/tenant', '/v1/restpoint/tenants'], target: SERVICES.tenant },
  { paths: ['/api/v1/restpoint/deceased', '/api/v1/restpoint/embalming', '/v1/restpoint/deceased', '/v1/restpoint/embalming'], target: SERVICES.deceased },
  { paths: ['/api/v1/restpoint/marketplace', '/api/v1/marketplace', '/v1/restpoint/marketplace'], target: SERVICES.marketplace },
  { paths: ['/api/v1/restpoint/mpesa', '/api/v1/mpesa', '/v1/restpoint/mpesa'], target: SERVICES.mpesa },
  { paths: ['/api/v1/restpoint/portal', '/v1/restpoint/portal'], target: SERVICES.portal },
  { paths: ['/api/v1/restpoint/invoices', '/v1/restpoint/invoices'], target: SERVICES.invoices },
  { paths: ['/api/v1/restpoint/coffin', '/v1/restpoint/coffin'], target: SERVICES.coffin },
  { paths: ['/api/v1/restpoint/visitors', '/v1/restpoint/visitors'], target: SERVICES.visitors },
  { paths: ['/api/v1/restpoint/notification', '/v1/restpoint/notification'], target: SERVICES.notification },
  { paths: ['/api/v1/restpoint/documents', '/v1/restpoint/documents'], target: SERVICES.documents },
  { paths: ['/api/v1/restpoint/analytics', '/api/v1/restpoint/performance', '/v1/restpoint/analytics', '/v1/restpoint/performance'], target: SERVICES.analytics },
  { paths: ['/api/v1/restpoint/bodycheckout', '/v1/restpoint/bodycheckout'], target: SERVICES.bodycheckout },
  { paths: ['/api/v1/restpoint/edocuments', '/api/v1/edocuments', '/v1/restpoint/edocuments'], target: SERVICES.edocuments },
  { paths: ['/api/v1/restpoint/calendar', '/api/v1/calendar', '/v1/restpoint/calendar'], target: SERVICES.calendar },
  { paths: ['/api/v1/restpoint/chemicals', '/v1/restpoint/chemicals'], target: SERVICES.chemicals },
  { paths: ['/api/v1/restpoint/billing', '/v1/restpoint/billing'], target: SERVICES.billing },
  { paths: ['/api/v1/restpoint/socketio', '/api/v1/socketio', '/v1/restpoint/socketio', '/socket.io'], target: SERVICES.socketio },
  { paths: ['/api/v1/restpoint/extra', '/v1/restpoint/extra'], target: SERVICES.extra },
  { paths: ['/api/v1/restpoint/call', '/v1/restpoint/call'], target: SERVICES.call },
  { paths: ['/api/v1/restpoint/qrcode', '/v1/restpoint/qrcode'], target: SERVICES.qrcode },
];

Logger.info('Registered routes:');
routes.forEach(route => {
  route.paths.forEach(path => {
    Logger.info(`  ${path} → ${route.target}`);
    app.use(path, createProxyMiddleware({
      ...proxyOptions,
      target: route.target,
      pathRewrite: (path, req) => {
        // Strip /api prefix if present, keep /v1 prefix
        return path.replace(/^\/api/, '');
      },
    }));
  });
});

// =============================================================================
// HEALTH & DIAGNOSTIC ENDPOINTS
// =============================================================================
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', service: APP_NAME, version: APP_VERSION, port: PORT, uptime: process.uptime() });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime(), timestamp: Date.now(), services: Object.keys(SERVICES), serviceCount: Object.keys(SERVICES).length, routeCount: routes.reduce((acc, r) => acc + r.paths.length, 0) });
});

app.get('/api/v1/debug/routes', (req, res) => {
  const routeList = [];
  routes.forEach(route => { route.paths.forEach(path => { routeList.push({ path, target: route.target }); }); });
  res.json({ success: true, message: 'Gateway routes', gatewayVersion: APP_VERSION, serviceCount: Object.keys(SERVICES).length, routeCount: routeList.length, routes: routeList, services: SERVICES, environment: { nodeEnv: process.env.NODE_ENV || 'development', port: PORT } });
});

// =============================================================================
// 404 HANDLER
// =============================================================================
app.use((req, res) => {
  Logger.warn(`[404] ${req.method} ${req.originalUrl} — No matching route`);
  const matchingRoutes = [];
  routes.forEach(route => { route.paths.forEach(path => { if (req.originalUrl.indexOf(path) >= 0) matchingRoutes.push({ path, target: route.target }); }); });
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}`, originalUrl: req.originalUrl, matchedRoutes: matchingRoutes.length > 0 ? matchingRoutes : [], hint: matchingRoutes.length > 0 ? 'Route matched but proxy forwarding may have failed. Check if the target service is running.' : 'No matching route found. Check /api/v1/debug/routes for all registered routes.' });
});

// =============================================================================
// ERROR HANDLER
// =============================================================================
app.use((err, req, res, next) => {
  Logger.error(`Internal Server Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ success: false, message: 'Internal Server Error', error: isProd ? undefined : err.message });
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
function shutdown() { Logger.info('Shutting down...'); server.close(() => process.exit(0)); }

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;
