const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load .env from the api-gateway directory specifically
const dotenvPath = path.join(__dirname, '.env');
console.log('Loading .env from:', dotenvPath);
dotenv.config({ path: dotenvPath, override: true });

const APP_NAME = 'restpoint-gateway';
const APP_VERSION = '1.0.9';

const Logger = {
  info: (m, d) => { console.log(`[INFO] ${m}`, d || ''); },
  error: (m, d) => { console.error(`[ERROR] ${m}`, d || ''); },
  warn: (m, d) => { console.warn(`[WARN] ${m}`, d || ''); },
  debug: (m, d) => { console.debug(`[DEBUG] ${m}`, d || ''); },
};

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const isProd = (process.env.NODE_ENV || 'development') === 'production';

// =============================================================================
// SERVICE URLS — Use 127.0.0.1 to avoid Node 18+ IPv6 localhost resolution bug
// =============================================================================
const SERVICE_URLS = {
  auth: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:5001',
  users: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:5001',
  tenant: process.env.TENANT_SERVICE_URL || 'http://127.0.0.1:8002',
  deceased: process.env.DECEASED_SERVICE_URL || 'http://127.0.0.1:5003',
  coffin: process.env.COFFIN_SERVICE_URL || 'http://127.0.0.1:8108',
  marketplace: process.env.MARKETPLACE_SERVICE_URL || 'http://127.0.0.1:5005',
  mpesa: process.env.MPESA_SERVICE_URL || 'http://127.0.0.1:5006',
  portal: process.env.PORTAL_SERVICE_URL || 'http://127.0.0.1:5007',
  invoices: process.env.INVOICES_SERVICE_URL || 'http://127.0.0.1:5008',
  visitors: process.env.VISITORS_SERVICE_URL || 'http://127.0.0.1:5009',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://127.0.0.1:8111',
  documents: process.env.DOCUMENTS_SERVICE_URL || 'http://127.0.0.1:5011',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://127.0.0.1:5012',
  bodycheckout: process.env.BODYCHECKOUT_SERVICE_URL || 'http://127.0.0.1:5013',
  edocuments: process.env.EDOCUMENTS_SERVICE_URL || 'http://127.0.0.1:5014',
  calendar: process.env.CALENDAR_SERVICE_URL || 'http://127.0.0.1:5015',
  chemicals: process.env.CHEMICALS_SERVICE_URL || 'http://127.0.0.1:5016',
  billing: process.env.BILLING_SERVICE_URL || 'http://127.0.0.1:5017',
  socketio: process.env.SOCKETIO_SERVICE_URL || 'http://127.0.0.1:5018',
  workshop: process.env.WORKSHOP_SERVICE_URL || 'http://127.0.0.1:6969',
  extra: process.env.EXTRA_SERVICES_URL || 'http://127.0.0.1:5019',
  call: process.env.CALL_SERVICE_URL || 'http://127.0.0.1:5020',
  qrcode: process.env.QRCODE_SERVICE_URL || 'http://127.0.0.1:5021',
  scanner: process.env.SCANNER_SERVICE_URL || 'http://127.0.0.1:5022',
  hearse: process.env.HEARSE_SERVICE_URL || 'http://127.0.0.1:5002',
};

const app = express();

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-slug', 'x-tenant-slug', 'x-tenant-id', 'x-user-id', 'Origin', 'X-Requested-With', 'Accept'],
}));

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

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
// PROXY FACTORIES
// =============================================================================
// Express strips the mount path from req.url when using app.use(path, handler).
// For example, app.use('/api/v1/restpoint/hearses', proxy) strips '/api/v1/restpoint/hearses'
// from req.url, so the proxy receives '/available' instead of '/api/v1/restpoint/hearses/available'.
//
// We need two proxy types:
//   1. Full-path proxy: For services that mount routes at /api/v1/restpoint/<service>
//      (hearse, chemical, deceased, etc.) — prepends the mount path back
//   2. Clean-path proxy: For services that mount routes at / (root)
//      (auth) — strips the /api/v1/restpoint/<service> prefix
// =============================================================================

// Proxy for services that expect the FULL path (e.g., /api/v1/restpoint/hearses)
const createFullPathProxy = (targetUrl, mountPath) => {
  Logger.debug(`[PROXY-FULL] ${targetUrl} (mount: ${mountPath})`);

  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    secure: false,
    proxyTimeout: 30000,
    timeout: 30000,
    // Express strips mountPath from req.url, so we prepend it back
    pathRewrite: (path, req) => {
      const fullPath = mountPath + path;
      Logger.debug(`[PROXY-FULL] "${path}" → "${fullPath}"`);
      return fullPath;
    },
    onProxyReq: (proxyReq, req, res) => {
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers['x-tenant-slug']) proxyReq.setHeader('x-tenant-slug', req.headers['x-tenant-slug']);
      if (req.headers['x-tenant-id']) proxyReq.setHeader('x-tenant-id', req.headers['x-tenant-id']);
      if (req.headers['x-user-id']) proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
      if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        const bodyStr = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyStr));
        proxyReq.write(bodyStr);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      Logger.debug(`[PROXY] ${req.method} ${req.originalUrl} → ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      Logger.error(`[PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: 'Gateway Timeout: The microservice failed to respond.',
          error: err.code,
          target: targetUrl
        });
      }
    }
  });
};

// Proxy for services that expect CLEAN paths (e.g., /login instead of /api/v1/restpoint/auth/login)
const createCleanPathProxy = (targetUrl, stripPrefix) => {
  Logger.debug(`[PROXY-CLEAN] ${targetUrl} (strip: ${stripPrefix})`);

  const rewriteRule = {};
  rewriteRule['^' + stripPrefix] = '';

  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    secure: false,
    proxyTimeout: 30000,
    timeout: 30000,
    pathRewrite: rewriteRule,
    onProxyReq: (proxyReq, req, res) => {
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers['x-tenant-slug']) proxyReq.setHeader('x-tenant-slug', req.headers['x-tenant-slug']);
      if (req.headers['x-tenant-id']) proxyReq.setHeader('x-tenant-id', req.headers['x-tenant-id']);
      if (req.headers['x-user-id']) proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
      if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        const bodyStr = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyStr));
        proxyReq.write(bodyStr);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      Logger.debug(`[PROXY] ${req.method} ${req.originalUrl} → ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      Logger.error(`[PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: 'Gateway Timeout: The microservice failed to respond.',
          error: err.code,
          target: targetUrl
        });
      }
    }
  });
};

// =============================================================================
// ROUTE REGISTRATION
// =============================================================================
// Services that mount at /api/v1/restpoint/<service> → use createFullPathProxy
// Services that mount at / (root) → use createCleanPathProxy
// =============================================================================

// --- Auth (mounts at /, expects clean paths like /login) ---
const authProxy = createCleanPathProxy(SERVICE_URLS.auth, '/api/v1/restpoint/auth');
app.use('/api/v1/restpoint/auth', authProxy);
app.use('/v1/restpoint/auth', authProxy);
app.use('/auth', authProxy);

// --- Tenant ---
const tenantProxy = createFullPathProxy(SERVICE_URLS.tenant, '/api/v1/restpoint/tenant');
app.use('/api/v1/restpoint/tenant', tenantProxy);
app.use('/v1/restpoint/tenant', tenantProxy);
app.use('/tenant', tenantProxy);

// --- Deceased (mounts at /api/v1/restpoint/deceased) ---
const deceasedProxy = createFullPathProxy(SERVICE_URLS.deceased, '/api/v1/restpoint/deceased');
app.use('/api/v1/restpoint/deceased', deceasedProxy);
app.use('/v1/restpoint/deceased', deceasedProxy);
app.use('/deceased', deceasedProxy);

// --- Coffin ---
const coffinProxy = createFullPathProxy(SERVICE_URLS.coffin, '/api/v1/restpoint/coffins');
app.use('/api/v1/restpoint/coffins', coffinProxy);
app.use('/v1/restpoint/coffins', coffinProxy);
app.use('/coffins', coffinProxy);

// --- Billing ---
const billingProxy = createFullPathProxy(SERVICE_URLS.billing, '/api/v1/restpoint/billing');
app.use('/api/v1/restpoint/billing', billingProxy);
app.use('/v1/restpoint/billing', billingProxy);
app.use('/billing', billingProxy);

// --- Invoices ---
const invoiceProxy = createFullPathProxy(SERVICE_URLS.invoices, '/api/v1/restpoint/invoices');
app.use('/api/v1/restpoint/invoices', invoiceProxy);
app.use('/v1/restpoint/invoices', invoiceProxy);
app.use('/invoices', invoiceProxy);

// --- Scanner ---
const scannerProxy = createFullPathProxy(SERVICE_URLS.scanner, '/api/v1/restpoint/scanner');
app.use('/api/v1/restpoint/scanner', scannerProxy);
app.use('/v1/restpoint/scanner', scannerProxy);
app.use('/scanner', scannerProxy);

// --- Chemicals (mounts at /api/v1/restpoint/chemicals) ---
const chemicalsProxy = createFullPathProxy(SERVICE_URLS.chemicals, '/api/v1/restpoint/chemicals');
app.use('/api/v1/restpoint/chemicals', chemicalsProxy);
app.use('/v1/restpoint/chemicals', chemicalsProxy);
app.use('/chemicals', chemicalsProxy);

// --- Workshop ---
const workshopProxy = createFullPathProxy(SERVICE_URLS.workshop, '/api/v1/restpoint/workshop');
app.use('/api/v1/restpoint/workshop', workshopProxy);
app.use('/v1/restpoint/workshop', workshopProxy);
app.use('/workshop', workshopProxy);

// =============================================================================
// HEARSE ROUTES (mounts at /api/v1/restpoint, expects full paths)
// =============================================================================
const hearseProxy = createFullPathProxy(SERVICE_URLS.hearse, '/api/v1/restpoint/hearses');
const hearseBookingsProxy = createFullPathProxy(SERVICE_URLS.hearse, '/api/v1/restpoint/hearse-bookings');
const allDriversProxy = createFullPathProxy(SERVICE_URLS.hearse, '/api/v1/restpoint/all-drivers');
const hearseSingularProxy = createFullPathProxy(SERVICE_URLS.hearse, '/api/v1/restpoint/hearse');

app.use('/api/v1/restpoint/hearses', hearseProxy);
app.use('/api/v1/restpoint/hearse-bookings', hearseBookingsProxy);
app.use('/api/v1/restpoint/all-drivers', allDriversProxy);
app.use('/api/v1/restpoint/hearse', hearseSingularProxy);

app.use('/v1/restpoint/hearses', hearseProxy);
app.use('/v1/restpoint/hearse-bookings', hearseBookingsProxy);
app.use('/v1/restpoint/all-drivers', allDriversProxy);
app.use('/v1/restpoint/hearse', hearseSingularProxy);

app.use('/hearses', hearseProxy);
app.use('/hearse-bookings', hearseBookingsProxy);
app.use('/all-drivers', allDriversProxy);
app.use('/hearse', hearseSingularProxy);

// --- Documents ---
const documentsProxy = createFullPathProxy(SERVICE_URLS.documents, '/api/v1/restpoint/documents');
app.use('/api/v1/restpoint/documents', documentsProxy);
app.use('/v1/restpoint/documents', documentsProxy);
app.use('/documents', documentsProxy);

// --- Notification ---
const notificationProxy = createFullPathProxy(SERVICE_URLS.notification, '/api/v1/restpoint/notification');
app.use('/api/v1/restpoint/notification', notificationProxy);
app.use('/v1/restpoint/notification', notificationProxy);
app.use('/notification', notificationProxy);

// --- E-Documents ---
const edocumentsProxy = createFullPathProxy(SERVICE_URLS.edocuments, '/api/v1/restpoint/edocuments');
app.use('/api/v1/restpoint/edocuments', edocumentsProxy);
app.use('/v1/restpoint/edocuments', edocumentsProxy);
app.use('/edocuments', edocumentsProxy);

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
    hearse_service: SERVICE_URLS.hearse,
  });
});

app.get('/services', (req, res) => {
  res.json({
    success: true,
    services: SERVICE_URLS,
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
  });
});

// =============================================================================
// ERROR HANDLER
// =============================================================================
app.use((err, req, res, next) => {
  Logger.error(`Server Error: ${err.message}`);
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
  Logger.info(`  Hearse Service: ${SERVICE_URLS.hearse}`);
  Logger.info('========================================');
  Logger.info('📋 Available Endpoints:');
  Logger.info(`   GET  http://localhost:${PORT}/health`);
  Logger.info(`   GET  http://localhost:${PORT}/services`);
  Logger.info(`   POST http://localhost:${PORT}/api/v1/restpoint/hearses`);
  Logger.info(`   GET  http://localhost:${PORT}/api/v1/restpoint/hearses`);
  Logger.info(`   GET  http://localhost:${PORT}/api/v1/restpoint/hearses/available`);
  Logger.info(`   POST http://localhost:${PORT}/api/v1/restpoint/hearse-bookings`);
  Logger.info(`   GET  http://localhost:${PORT}/api/v1/restpoint/hearse-bookings`);
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