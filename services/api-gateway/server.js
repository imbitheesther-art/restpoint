const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load .env from the api-gateway directory specifically
const dotenvPath = path.join(__dirname, '.env');
console.log('Loading .env from:', dotenvPath);
dotenv.config({ path: dotenvPath, override: true });

const APP_NAME = 'restpoint-gateway';
const APP_VERSION = '1.0.8';

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
  coffin: process.env.COFFIN_SERVICE_URL || 'http://127.0.0.1:8108',  // ✅ FIXED: Actual running port
  marketplace: process.env.MARKETPLACE_SERVICE_URL || 'http://127.0.0.1:5005',
  mpesa: process.env.MPESA_SERVICE_URL || 'http://127.0.0.1:5006',
  portal: process.env.PORTAL_SERVICE_URL || 'http://127.0.0.1:5007',
  invoices: process.env.INVOICES_SERVICE_URL || 'http://127.0.0.1:5008',
  visitors: process.env.VISITORS_SERVICE_URL || 'http://127.0.0.1:5009',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://127.0.0.1:8111',  // ✅ FIXED: Actual running port
  documents: process.env.DOCUMENTS_SERVICE_URL || 'http://127.0.0.1:5011',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://127.0.0.1:5012',
  bodycheckout: process.env.BODYCHECKOUT_SERVICE_URL || 'http://127.0.0.1:5013',
  edocuments: process.env.EDOCUMENTS_SERVICE_URL || 'http://127.0.0.1:5014',
  calendar: process.env.CALENDAR_SERVICE_URL || 'http://127.0.0.1:5015',
  chemicals: process.env.CHEMICALS_SERVICE_URL || 'http://127.0.0.1:5016',
  billing: process.env.BILLING_SERVICE_URL || 'http://127.0.0.1:5017',
  socketio: process.env.SOCKETIO_SERVICE_URL || 'http://127.0.0.1:5018',
  extra: process.env.EXTRA_SERVICES_URL || 'http://127.0.0.1:5019',
  call: process.env.CALL_SERVICE_URL || 'http://127.0.0.1:5020',
  qrcode: process.env.QRCODE_SERVICE_URL || 'http://127.0.0.1:5021',
  scanner: process.env.SCANNER_SERVICE_URL || 'http://127.0.0.1:5022',  // ✅ ADDED: Scanner service
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
// Do NOT use express.json() here - the proxy needs the raw body stream to forward to services.
// Body parsing is handled by each microservice independently.

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
// PROXY FACTORY — with pathRewrite + fixRequestBody
// =============================================================================
const createProxy = (targetUrl) => {
  Logger.debug(`[PROXY] Creating proxy targeting: ${targetUrl}`);

  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    secure: false,
    proxyTimeout: 30000,
    timeout: 30000,
    // Strip gateway prefixes so microservices receive clean paths
    pathRewrite: {
      '^/api/v1/restpoint/auth': '/auth',
      '^/v1/restpoint/auth': '/auth',
      '^/api/v1/restpoint/deceased': '/deceased',
      '^/v1/restpoint/deceased': '/deceased',
      '^/api/v1/restpoint/tenant': '/tenant',
      '^/v1/restpoint/tenant': '/tenant',
      '^/api/v1/restpoint/coffins': '/coffins',
      '^/v1/restpoint/coffins': '/coffins',
      '^/api/v1/restpoint/billing': '/billing',
      '^/v1/restpoint/billing': '/billing',
      '^/api/v1/restpoint/invoices': '/invoices',
      '^/v1/restpoint/invoices': '/invoices',
      '^/api/v1/restpoint': '',
      '^/v1/restpoint': '',
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward auth/tenant/user headers
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers['x-tenant-slug']) proxyReq.setHeader('x-tenant-slug', req.headers['x-tenant-slug']);
      if (req.headers['x-tenant-id']) proxyReq.setHeader('x-tenant-id', req.headers['x-tenant-id']);
      if (req.headers['x-user-id']) proxyReq.setHeader('x-user-id', req.headers['x-user-id']);

      // CRITICAL: Re-serialize and write back the JSON body.
      // express.json() consumed the original stream, so we must re-write it.
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

// Deceased
const deceasedProxy = createProxy(SERVICE_URLS.deceased);
app.use('/deceased', deceasedProxy);
app.use('/api/v1/restpoint/deceased', deceasedProxy);
app.use('/v1/restpoint/deceased', deceasedProxy);

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

// Scanner
const scannerProxy = createProxy(SERVICE_URLS.scanner);
app.use('/scanner', scannerProxy);
app.use('/api/v1/scanner', scannerProxy);
app.use('/api/v1/restpoint/scanner', scannerProxy);

// Chemicals
const chemicalsProxy = createProxy(SERVICE_URLS.chemicals);
app.use('/chemicals', chemicalsProxy);
app.use('/api/v1/restpoint/chemicals', chemicalsProxy);
app.use('/v1/restpoint/chemicals', chemicalsProxy);

// Hearse - proxy to deceased service
const hearseProxy = createProxy(SERVICE_URLS.deceased);
app.use('/hearse', hearseProxy);
app.use('/api/v1/restpoint/hearse', hearseProxy);
app.use('/v1/restpoint/hearse', hearseProxy);

// Documents - proxy to documents service
const documentsProxy = createProxy(SERVICE_URLS.documents);
app.use('/documents', documentsProxy);
app.use('/api/v1/restpoint/documents', documentsProxy);
app.use('/v1/restpoint/documents', documentsProxy);

// Notification - proxy to notification service
const notificationProxy = createProxy(SERVICE_URLS.notification);
app.use('/notification', notificationProxy);
app.use('/api/v1/restpoint/notification', notificationProxy);
app.use('/v1/restpoint/notification', notificationProxy);

// E-Documents - proxy to edocuments service
const edocumentsProxy = createProxy(SERVICE_URLS.edocuments);
app.use('/edocuments', edocumentsProxy);
app.use('/api/v1/restpoint/edocuments', edocumentsProxy);
app.use('/v1/restpoint/edocuments', edocumentsProxy);

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