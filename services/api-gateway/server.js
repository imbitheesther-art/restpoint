const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const APP_NAME = 'restpoint-gateway';
const APP_VERSION = '1.0.7';

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
// CONFIGURATION
// =============================================================================
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const isProd = (process.env.NODE_ENV || 'development') === 'production';

// =============================================================================
// SERVICE URLS
// =============================================================================
const SERVICE_URLS = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  users: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  tenant: process.env.TENANT_SERVICE_URL || 'http://localhost:5002',
  deceased: process.env.DECEASED_SERVICE_URL || 'http://localhost:5003',
  coffin: process.env.COFFIN_SERVICE_URL || 'http://localhost:5004',
  marketplace: process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:5005',
  mpesa: process.env.MPESA_SERVICE_URL || 'http://localhost:5006',
  portal: process.env.PORTAL_SERVICE_URL || 'http://localhost:5007',
  invoices: process.env.INVOICES_SERVICE_URL || 'http://localhost:5008',
  visitors: process.env.VISITORS_SERVICE_URL || 'http://localhost:5009',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5010',
  documents: process.env.DOCUMENTS_SERVICE_URL || 'http://localhost:5011',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:5012',
  bodycheckout: process.env.BODYCHECKOUT_SERVICE_URL || 'http://localhost:5013',
  edocuments: process.env.EDOCUMENTS_SERVICE_URL || 'http://localhost:5014',
  calendar: process.env.CALENDAR_SERVICE_URL || 'http://localhost:5015',
  chemicals: process.env.CHEMICALS_SERVICE_URL || 'http://localhost:5016',
  billing: process.env.BILLING_SERVICE_URL || 'http://localhost:5017',
  socketio: process.env.SOCKETIO_SERVICE_URL || 'http://localhost:5018',
  extra: process.env.EXTRA_SERVICES_URL || 'http://localhost:5019',
  call: process.env.CALL_SERVICE_URL || 'http://localhost:5020',
  qrcode: process.env.QRCODE_SERVICE_URL || 'http://localhost:5021',
};

// =============================================================================
// EXPRESS APP
// =============================================================================
const app = express();

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-slug',
    'x-tenant-slug',
    'x-tenant-id',
    'Origin',
    'X-Requested-With',
    'Accept'
  ],
};

app.use(cors(corsOptions));

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/v1/', apiLimiter);

// Request logging
app.use((req, res, next) => {
  Logger.info(`→ ${req.method} ${req.originalUrl}`);
  next();
});

// =============================================================================
// CREATE PROXY - SIMPLIFIED
// =============================================================================
const createProxy = (targetUrl) => {
  Logger.debug(`[PROXY] Creating proxy for ${targetUrl}`);

  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    proxyTimeout: 120000,
    timeout: 120000,
    onProxyReq: (proxyReq, req, res) => {
      // Forward all headers
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
      if (req.headers['x-tenant-slug']) {
        proxyReq.setHeader('x-tenant-slug', req.headers['x-tenant-slug']);
      }
      if (req.headers['x-tenant-id']) {
        proxyReq.setHeader('x-tenant-id', req.headers['x-tenant-id']);
      }
      if (req.headers['content-type']) {
        proxyReq.setHeader('Content-Type', req.headers['content-type']);
      }

      const targetFull = `${targetUrl}${req.path}`;
      Logger.debug(`[PROXY] ${req.method} ${req.originalUrl} → ${targetFull}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      Logger.debug(`[PROXY] ${req.method} ${req.originalUrl} → ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      Logger.error(`[PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: 'Service temporarily unavailable',
          path: req.originalUrl,
          error: err.code,
          target: targetUrl
        });
      }
    }
  });
};

// =============================================================================
// DECEASED PROXY
// =============================================================================
const deceasedTarget = SERVICE_URLS.deceased;
const deceasedProxy = createProxy(deceasedTarget);

// =============================================================================
// ✅ ALL DECEASED ROUTES - MUST BE REGISTERED
// =============================================================================

// 1. Direct routes (no prefix)
app.use('/register-deceased', deceasedProxy);
app.use('/deceased-all', deceasedProxy);
app.use('/deceased-id', deceasedProxy);
app.use('/deceased-id/:id', deceasedProxy);
app.use('/stats', deceasedProxy);
app.use('/export-excel', deceasedProxy);
app.use('/export-history', deceasedProxy);

// 2. With /deceased prefix
app.use('/deceased/register-deceased', deceasedProxy);
app.use('/deceased/deceased-all', deceasedProxy);
app.use('/deceased/deceased-id', deceasedProxy);
app.use('/deceased/deceased-id/:id', deceasedProxy);
app.use('/deceased/stats', deceasedProxy);
app.use('/deceased/export-excel', deceasedProxy);
app.use('/deceased/export-history', deceasedProxy);
app.use('/deceased', deceasedProxy);

// 3. With /api/v1/restpoint prefix
app.use('/api/v1/restpoint/deceased/register-deceased', deceasedProxy);
app.use('/api/v1/restpoint/deceased/deceased-all', deceasedProxy);
app.use('/api/v1/restpoint/deceased/deceased-id', deceasedProxy);
app.use('/api/v1/restpoint/deceased/deceased-id/:id', deceasedProxy);
app.use('/api/v1/restpoint/deceased/stats', deceasedProxy);
app.use('/api/v1/restpoint/deceased/export-excel', deceasedProxy);
app.use('/api/v1/restpoint/deceased/export-history', deceasedProxy);
app.use('/api/v1/restpoint/deceased', deceasedProxy);

// 4. With /v1/restpoint prefix
app.use('/v1/restpoint/deceased/register-deceased', deceasedProxy);
app.use('/v1/restpoint/deceased/deceased-all', deceasedProxy);
app.use('/v1/restpoint/deceased/deceased-id', deceasedProxy);
app.use('/v1/restpoint/deceased/deceased-id/:id', deceasedProxy);
app.use('/v1/restpoint/deceased/stats', deceasedProxy);
app.use('/v1/restpoint/deceased/export-excel', deceasedProxy);
app.use('/v1/restpoint/deceased/export-history', deceasedProxy);
app.use('/v1/restpoint/deceased', deceasedProxy);

// =============================================================================
// OTHER SERVICES
// =============================================================================

// Auth
const authProxy = createProxy(SERVICE_URLS.auth);
app.use('/auth', authProxy);
app.use('/api/v1/restpoint/auth', authProxy);
app.use('/v1/restpoint/auth', authProxy);

// Tenant
const tenantProxy = createProxy(SERVICE_URLS.tenant);
app.use('/tenant', tenantProxy);
app.use('/api/v1/restpoint/tenant', tenantProxy);
app.use('/v1/restpoint/tenant', tenantProxy);

// Coffin
const coffinProxy = createProxy(SERVICE_URLS.coffin);
app.use('/coffins', coffinProxy);
app.use('/api/v1/restpoint/coffins', coffinProxy);
app.use('/v1/restpoint/coffins', coffinProxy);

// Billing
const billingProxy = createProxy(SERVICE_URLS.billing);
app.use('/billing', billingProxy);
app.use('/api/v1/restpoint/billing', billingProxy);
app.use('/v1/restpoint/billing', billingProxy);

// Invoices
const invoiceProxy = createProxy(SERVICE_URLS.invoices);
app.use('/invoices', invoiceProxy);
app.use('/api/v1/restpoint/invoices', invoiceProxy);
app.use('/v1/restpoint/invoices', invoiceProxy);

// =============================================================================
// HEALTH & DEBUG
// =============================================================================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: APP_NAME,
    version: APP_VERSION,
    port: PORT,
    uptime: process.uptime(),
    services: Object.keys(SERVICE_URLS),
    deceasedService: SERVICE_URLS.deceased
  });
});

app.get('/api/v1/debug/routes', (req, res) => {
  res.json({
    success: true,
    message: 'Gateway routes',
    gatewayVersion: APP_VERSION,
    serviceUrls: SERVICE_URLS,
    deceasedTarget: deceasedTarget,
    routes: {
      deceased: [
        'POST /register-deceased',
        'GET /deceased-all',
        'GET /deceased-id/:id',
        'GET /deceased',
        'GET /stats'
      ]
    }
  });
});

// =============================================================================
// 404 HANDLER
// =============================================================================
app.use((req, res) => {
  Logger.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /health',
      'POST /register-deceased',
      'POST /deceased/register-deceased',
      'GET /deceased',
      'GET /deceased/:id',
      'GET /deceased/deceased-id/:id',
      'PUT /deceased/:id',
      'DELETE /deceased/:id',
      'GET /stats'
    ]
  });
});

// =============================================================================
// ERROR HANDLER
// =============================================================================
app.use((err, req, res, next) => {
  Logger.error(`Internal Server Error: ${err.message}`);
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
  Logger.info(`  Deceased Service: ${deceasedTarget}`);
  Logger.info('========================================');
  Logger.info('  ✅ Deceased Routes:');
  Logger.info(`    POST http://localhost:${PORT}/register-deceased`);
  Logger.info(`    GET  http://localhost:${PORT}/deceased`);
  Logger.info(`    GET  http://localhost:${PORT}/deceased-id/:id`);
  Logger.info(`    GET  http://localhost:${PORT}/deceased/deceased-id/:id`);
  Logger.info(`    GET  http://localhost:${PORT}/stats`);
  Logger.info('========================================');
});

process.on('SIGINT', () => {
  Logger.info('Shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  Logger.info('Shutting down...');
  server.close(() => process.exit(0));
});

module.exports = app;