
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const { getServiceDiscovery } = require('../../global/middlewares/serviceDiscovery');

dotenv.config();

const APP_NAME = 'restpoint-gateway';
const APP_VERSION = '1.0.1';

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
  Logger.error('UNCAUGHT EXCEPTION', { message: error.message, stack: error.stack });
  const isConnectionError = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(error.code);
  if (!isConnectionError) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason) => {
  Logger.error('UNHANDLED PROMISE REJECTION', { message: reason?.message || reason });
});

// =============================================================================
// CONFIGURATION
// =============================================================================
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const isProd = (process.env.NODE_ENV || 'development') === 'production';

// =============================================================================
// SERVICE DISCOVERY
// =============================================================================
const serviceDiscovery = getServiceDiscovery();

// Fallback URLs (used when Consul is not available)
const FALLBACK_SERVICES = {
  auth: (process.env.AUTH_SERVICE_URL || 'http://restpoint_auth_service:5000').trim(),
  users: (process.env.USERS_SERVICE_URL || 'http://restpoint_auth_service:5000').trim(),
  tenant: (process.env.TENANT_SERVICE_URL || 'http://restpoint_tenant_service:5000').trim(),
  deceased: (process.env.DECEASED_SERVICE_URL || 'http://restpoint_deceased_service:5000').trim(),
  marketplace: (process.env.MARKETPLACE_SERVICE_URL || 'http://restpoint_marketplace_service:5000').trim(),
  mpesa: (process.env.MPESA_SERVICE_URL || 'http://restpoint_mpesa_service:5000').trim(),
  portal: (process.env.PORTAL_SERVICE_URL || 'http://restpoint_portal_service:5000').trim(),
  invoices: (process.env.INVOICES_SERVICE_URL || 'http://restpoint_invoice_service:5000').trim(),
  coffin: (process.env.COFFIN_SERVICE_URL || 'http://restpoint_coffin_service:5000').trim(),
  visitors: (process.env.VISITORS_SERVICE_URL || 'http://restpoint_visitors_service:5000').trim(),
  notification: (process.env.NOTIFICATION_SERVICE_URL || 'http://restpoint_notification_service:5000').trim(),
  documents: (process.env.DOCUMENTS_SERVICE_URL || 'http://restpoint_documents_service:5000').trim(),
  analytics: (process.env.ANALYTICS_SERVICE_URL || 'http://restpoint_analytics_service:5000').trim(),
  bodycheckout: (process.env.BODYCHECKOUT_SERVICE_URL || 'http://restpoint_bodycheckout_service:5000').trim(),
  edocuments: (process.env.EDOCUMENTS_SERVICE_URL || 'http://restpoint_edocuments_service:5000').trim(),
  calendar: (process.env.CALENDAR_SERVICE_URL || 'http://restpoint_calender_service:5000').trim(),
  chemicals: (process.env.CHEMICAL_SERVICE_URL || 'http://restpoint_chemical_service:5000').trim(),
  billing: (process.env.BILLING_SERVICE_URL || 'http://restpoint_billing_service:5000').trim(),
  socketio: (process.env.SOCKETIO_SERVICE_URL || 'http://restpoint_socketio_service:5000').trim(),
  extra: (process.env.EXTRA_SERVICES_URL || 'http://restpoint_extra_services:5000').trim(),
  call: (process.env.CALL_SERVICE_URL || 'http://restpoint_call_service:5000').trim(),
  qrcode: (process.env.QRCODE_SERVICE_URL || 'http://restpoint_qrcode_service:5000').trim(),
};

// Initialize service discovery (non-blocking)
serviceDiscovery.initialize(FALLBACK_SERVICES).then(initialized => {
  if (initialized) {
    Logger.info('[GATEWAY] Service discovery initialized with Consul');
    serviceDiscovery.startCacheRefresh();
  } else {
    Logger.warn('[GATEWAY] Service discovery using fallback URLs (Consul not available)');
  }
});

// Service name mapping (API gateway service key -> Consul service name)
const SERVICE_NAME_MAP = {
  auth: 'auth-service',
  users: 'auth-service',
  tenant: 'tenant-service',
  deceased: 'deceased-service',
  marketplace: 'marketplace-service',
  mpesa: 'mpesa-service',
  portal: 'portal-service',
  invoices: 'invoice-service',
  coffin: 'coffin-service',
  visitors: 'visitors-service',
  notification: 'notification-service',
  documents: 'documents-service',
  analytics: 'analytics-service',
  bodycheckout: 'bodycheckout-service',
  edocuments: 'edocuments-service',
  calendar: 'calender-service',
  chemicals: 'chemical-service',
  billing: 'billing-service',
  socketio: 'socketio-service',
  extra: 'extra-services',
  call: 'call-service',
  qrcode: 'qrcode-service',
};

// Dynamic service URL resolver
async function getServiceUrl(serviceKey) {
  const consulServiceName = SERVICE_NAME_MAP[serviceKey];
  if (!consulServiceName) {
    Logger.warn(`[GATEWAY] Unknown service key: ${serviceKey}, using fallback`);
    return FALLBACK_SERVICES[serviceKey] || null;
  }

  const url = await serviceDiscovery.getServiceUrl(consulServiceName);
  if (url) {
    return url;
  }

  // Fallback to hardcoded URL
  return FALLBACK_SERVICES[serviceKey] || null;
}

Logger.info('Service discovery configured for services:');
Object.entries(SERVICE_NAME_MAP).forEach(([key, name]) => {
  Logger.info(` ${key} -> ${name}`);
});

// =============================================================================
// STARTUP CONNECTIVITY CHECK
// =============================================================================
async function checkServiceHealth(name, baseUrl) {
  let target;
  try {
    target = new URL(baseUrl);
  } catch (e) {
    Logger.error(`[STARTUP CHECK] ${name}: invalid URL "${baseUrl}" - ${e.message}`);
    return;
  }

  return new Promise((resolve) => {
    const req = http.get(
      { hostname: target.hostname, port: target.port || 5000, path: '/health', timeout: 3000 },
      (res) => {
        if (res.statusCode && res.statusCode < 500) {
          Logger.info(`[STARTUP CHECK] ${name}: reachable (${res.statusCode}) at ${baseUrl}`);
        } else {
          Logger.warn(`[STARTUP CHECK] ${name}: responded with ${res.statusCode} at ${baseUrl}`);
        }
        res.resume();
        resolve();
      }
    );
    req.on('timeout', () => {
      req.destroy();
      Logger.warn(`[STARTUP CHECK] ${name}: TIMEOUT reaching ${baseUrl}`);
      resolve();
    });
    req.on('error', (err) => {
      Logger.warn(`[STARTUP CHECK] ${name}: UNREACHABLE at ${baseUrl} - ${err.code || err.message}`);
      resolve();
    });
  });
}

async function runStartupChecks() {
  Logger.info('Running startup connectivity checks...');

  // Check Consul first
  const consulHealthy = await serviceDiscovery.consul.isConsulHealthy();
  if (consulHealthy) {
    Logger.info('[STARTUP CHECK] Consul: reachable');
  } else {
    Logger.warn('[STARTUP CHECK] Consul: not reachable, will use fallback URLs');
  }

  // Check fallback services
  const uniqueTargets = new Map();
  Object.entries(FALLBACK_SERVICES).forEach(([name, url]) => {
    if (!uniqueTargets.has(url)) uniqueTargets.set(url, []);
    uniqueTargets.get(url).push(name);
  });

  Logger.info(`Checking ${uniqueTargets.size} unique service targets...`);

  for (const [url, names] of uniqueTargets) {
    await checkServiceHealth(names.join('/'), url);
  }
}

// Run checks (non-blocking)
runStartupChecks();

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

// Trust proxy for correct IP behind reverse proxy
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : 0);

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
    'x-slug',
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

// Body parsers â€” only for non-proxied routes (health, debug, etc.)
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
  Logger.info(`â†’ ${req.method} ${req.originalUrl}`);
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
      if (req.headers['x-slug']) proxyReq.setHeader('x-slug', req.headers['x-slug']);
      if (req.headers['x-tenant-slug']) proxyReq.setHeader('x-tenant-slug', req.headers['x-tenant-slug']);
      if (req.headers['x-tenant-id']) proxyReq.setHeader('x-tenant-id', req.headers['x-tenant-id']);
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.headers['content-type']) {
        proxyReq.setHeader('Content-Type', req.headers['content-type']);
      }
      Logger.debug(`[PROXY] ${req.method} ${req.originalUrl} â†’ ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    },
    proxyRes: (proxyRes, req) => {
      Logger.debug(`[PROXY] ${req.method} ${req.originalUrl} â†’ ${proxyRes.statusCode}`);
    },
    error: (err, req, res) => {
      Logger.error(`[PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`, { code: err.code });
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Service temporarily unavailable', path: req.originalUrl, error: err.code });
      }
    }
  }
};

// =============================================================================
// ROUTE MAPPING  ALL 23 SERVICES
// Both /api/v1/restpoint/* and /v1/restpoint/* for compatibility
// Path rewrite strips /api prefix when present
//
// NOTE ON ORDERING: Express matches app.use(path, ...) as a PREFIX match.
// Routes are registered in array order below, and more specific/longer
// paths for a given prefix are listed BEFORE shorter ones within each
// service block (e.g. '.../tenant/onboarding' before '.../tenant') so the
// specific match wins. This was already correct in the original file â€”
// kept as-is, just documenting it so it doesn't get silently broken by a
// future edit that reorders the array.
// =============================================================================
const routes = [
  // AUTH SERVICE
  {
    paths: [
      '/api/v1/restpoint/auth',
      '/api/v1/restpoint/users',
      '/api/v1/users',
      '/v1/restpoint/auth',
      '/v1/restpoint/users'
    ],
    serviceKey: 'auth'
  },

  // TENANT SERVICE - longer/more specific paths first
  {
    paths: [
      '/api/v1/restpoint/tenant/onboarding',
      '/api/v1/restpoint/tenants/onboarding',
      '/api/v1/restpoint/tenants/register',
      '/api/v1/restpoint/tenants',
      '/api/v1/restpoint/tenant',
      '/api/v1/restpoint/system-admin',
      '/api/onboarding',
      '/v1/restpoint/tenant/onboarding',
      '/v1/restpoint/tenants/onboarding',
      '/v1/restpoint/tenants/register',
      '/v1/restpoint/tenants',
      '/v1/restpoint/tenant',
      '/v1/onboarding'
    ],
    serviceKey: 'tenant'
  },

  // DECEASED SERVICE
  {
    paths: [
      '/api/v1/restpoint/deceased',
      '/api/v1/restpoint/embalming',
      '/v1/restpoint/deceased',
      '/v1/restpoint/embalming'
    ],
    serviceKey: 'deceased'
  },

  // MARKETPLACE SERVICE
  {
    paths: [
      '/api/v1/restpoint/marketplace',
      '/api/v1/marketplace',
      '/v1/restpoint/marketplace'
    ],
    serviceKey: 'marketplace'
  },

  // MPESA SERVICE
  {
    paths: [
      '/api/v1/restpoint/mpesa',
      '/api/v1/mpesa',
      '/v1/restpoint/mpesa'
    ],
    serviceKey: 'mpesa'
  },

  // PORTAL SERVICE
  {
    paths: [
      '/api/v1/restpoint/portal',
      '/v1/restpoint/portal'
    ],
    serviceKey: 'portal'
  },

  // INVOICES SERVICE
  {
    paths: [
      '/api/v1/restpoint/invoices',
      '/v1/restpoint/invoices'
    ],
    serviceKey: 'invoices'
  },

  // COFFIN SERVICE
  {
    paths: [
      '/api/v1/restpoint/coffin',
      '/v1/restpoint/coffin'
    ],
    serviceKey: 'coffin'
  },

  // VISITORS SERVICE
  {
    paths: [
      '/api/v1/restpoint/visitors',
      '/v1/restpoint/visitors'
    ],
    serviceKey: 'visitors'
  },

  // NOTIFICATION SERVICE
  {
    paths: [
      '/api/v1/restpoint/notification',
      '/v1/restpoint/notification'
    ],
    serviceKey: 'notification'
  },

  // DOCUMENTS SERVICE
  {
    paths: [
      '/api/v1/restpoint/documents',
      '/v1/restpoint/documents'
    ],
    serviceKey: 'documents'
  },

  // ANALYTICS SERVICE
  {
    paths: [
      '/api/v1/restpoint/analytics',
      '/api/v1/restpoint/performance',
      '/v1/restpoint/analytics',
      '/v1/restpoint/performance'
    ],
    serviceKey: 'analytics'
  },

  // BODYCHECKOUT SERVICE
  {
    paths: [
      '/api/v1/restpoint/bodycheckout',
      '/v1/restpoint/bodycheckout'
    ],
    serviceKey: 'bodycheckout'
  },

  // EDOCUMENTS SERVICE
  {
    paths: [
      '/api/v1/restpoint/edocuments',
      '/api/v1/edocuments',
      '/v1/restpoint/edocuments'
    ],
    serviceKey: 'edocuments'
  },

  // CALENDAR SERVICE
  {
    paths: [
      '/api/v1/restpoint/calendar',
      '/api/v1/calendar',
      '/v1/restpoint/calendar'
    ],
    serviceKey: 'calendar'
  },

  // CHEMICALS SERVICE
  {
    paths: [
      '/api/v1/restpoint/chemicals',
      '/v1/restpoint/chemicals'
    ],
    serviceKey: 'chemicals'
  },

  // BILLING SERVICE
  {
    paths: [
      '/api/v1/restpoint/billing',
      '/v1/restpoint/billing'
    ],
    serviceKey: 'billing'
  },

  // SOCKETIO SERVICE
  {
    paths: [
      '/api/v1/restpoint/socketio',
      '/api/v1/socketio',
      '/v1/restpoint/socketio',
      '/socket.io'
    ],
    serviceKey: 'socketio'
  },

  // EXTRA SERVICES
  {
    paths: [
      '/api/v1/restpoint/extra',
      '/v1/restpoint/extra'
    ],
    serviceKey: 'extra'
  },

  // CALL SERVICE
  {
    paths: [
      '/api/v1/restpoint/call',
      '/v1/restpoint/call'
    ],
    serviceKey: 'call'
  },

  // QRCODE SERVICE
  {
    paths: [
      '/api/v1/restpoint/qrcode',
      '/v1/restpoint/qrcode'
    ],
    serviceKey: 'qrcode'
  },
];

// =============================================================================
// REGISTER ROUTES WITH PROXY (Dynamic Service Discovery)
// =============================================================================
Logger.info('Registered routes:');
routes.forEach(route => {
  route.paths.forEach(path => {
    Logger.info(` ${path} -> ${route.serviceKey}`);

    // Create proxy middleware with dynamic target resolution
    const proxy = createProxyMiddleware({
      ...proxyOptions,
      target: FALLBACK_SERVICES[route.serviceKey] || 'http://localhost:5000',
      router: async () => {
        const url = await getServiceUrl(route.serviceKey);
        if (!url) {
          throw new Error(`Service ${route.serviceKey} not available`);
        }
        return url;
      },
      pathRewrite: (path, req) => {
        // Special handling for tenant onboarding paths
        let rewrittenPath = path;

        // If path starts with /api, strip it
        if (rewrittenPath.startsWith('/api')) {
          rewrittenPath = rewrittenPath.replace(/^\/api/, '');
        }

        Logger.debug(`[PATH REWRITE] ${path} -> ${rewrittenPath}`);
        return rewrittenPath;
      },
    });

    app.use(path, proxy);
  });
});

// =============================================================================
// HEALTH & DIAGNOSTIC ENDPOINTS
// =============================================================================
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', service: APP_NAME, version: APP_VERSION, port: PORT, uptime: process.uptime() });
});

app.get('/api/v1/health', async (req, res) => {
  const discoveryStatus = serviceDiscovery.getStatus();
  res.json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    services: Object.keys(SERVICE_NAME_MAP),
    serviceCount: Object.keys(SERVICE_NAME_MAP).length,
    routeCount: routes.reduce((acc, r) => acc + r.paths.length, 0),
    serviceDiscovery: discoveryStatus,
  });
});

app.get('/api/v1/debug/routes', async (req, res) => {
  const routeList = [];
  routes.forEach(route => {
    route.paths.forEach(path => {
      routeList.push({ path, serviceKey: route.serviceKey });
    });
  });

  // Resolve current service URLs
  const resolvedServices = {};
  for (const [key, name] of Object.entries(SERVICE_NAME_MAP)) {
    resolvedServices[key] = await getServiceUrl(key);
  }

  res.json({
    success: true,
    message: 'Gateway routes',
    gatewayVersion: APP_VERSION,
    serviceCount: Object.keys(SERVICE_NAME_MAP).length,
    routeCount: routeList.length,
    routes: routeList,
    services: resolvedServices,
    serviceNameMap: SERVICE_NAME_MAP,
    environment: { nodeEnv: process.env.NODE_ENV || 'development', port: PORT }
  });
});

// NEW: live re-check of all service targets, callable any time without restarting the gateway
app.get('/api/v1/debug/health-check', async (req, res) => {
  const results = await Promise.all(
    Object.entries(SERVICE_NAME_MAP).map(async ([key, consulName]) => {
      const url = await getServiceUrl(key);
      if (!url) {
        return { name: key, consulName, url: null, reachable: false, error: 'Service not found' };
      }

      return new Promise((resolve) => {
        let target;
        try {
          target = new URL(url);
        } catch (e) {
          return resolve({ name: key, consulName, url, reachable: false, error: `invalid URL: ${e.message}` });
        }
        const req2 = http.get(
          { hostname: target.hostname, port: target.port || 5000, path: '/health', timeout: 3000 },
          (r) => { r.resume(); resolve({ name: key, consulName, url, reachable: r.statusCode < 500, statusCode: r.statusCode }); }
        );
        req2.on('timeout', () => { req2.destroy(); resolve({ name: key, consulName, url, reachable: false, error: 'timeout' }); });
        req2.on('error', (err) => resolve({ name: key, consulName, url, reachable: false, error: err.code || err.message }));
      });
    })
  );
  const unreachable = results.filter(r => !r.reachable);
  res.json({ success: unreachable.length === 0, total: results.length, unreachableCount: unreachable.length, results });
});

// =============================================================================
// 404 HANDLER
// =============================================================================
app.use((req, res) => {
  Logger.warn(`[404] ${req.method} ${req.originalUrl}” No matching route`);
  const matchingRoutes = [];
  routes.forEach(route => {
    route.paths.forEach(path => {
      if (req.originalUrl.indexOf(path) >= 0) matchingRoutes.push({ path, target: route.target });
    });
  });
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    originalUrl: req.originalUrl,
    matchedRoutes: matchingRoutes.length > 0 ? matchingRoutes : [],
    hint: matchingRoutes.length > 0 ? 'Route matched but proxy forwarding may have failed. Check if the target service is running.' : 'No matching route found. Check /api/v1/debug/routes for all registered routes.'
  });
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
  Logger.info(`  Proxying ${Object.keys(SERVICE_NAME_MAP).length} services`);
  Logger.info(`  Registered ${routes.reduce((acc, r) => acc + r.paths.length, 0)} routes`);
  Logger.info(`  Service Discovery: ${serviceDiscovery.getStatus().initialized ? 'Consul' : 'Fallback URLs'}`);
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
