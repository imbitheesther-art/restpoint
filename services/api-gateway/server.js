#!/usr/bin/env node
// RestPoint API Gateway — Central routing
// Run with memory limit: node --max-old-space-size=4096 server.js
try { const v8 = require('v8'); v8.setFlagsFromString('--max-old-space-size=4096'); } catch(e){}

const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');

dotenv.config();

const APP_NAME = 'restpoint-gateway';
const APP_VERSION = '1.0.0';

const Logger = {
  info: (m, d) => { if (d) console.log('[INFO] ' + m, d); else console.log('[INFO] ' + m); },
  error: (m, d) => { if (d) console.error('[ERROR] ' + m, d); else console.error('[ERROR] ' + m); },
  warn: (m, d) => { if (d) console.warn('[WARN] ' + m, d); else console.warn('[WARN] ' + m); },
  debug: (m, d) => { if (d) console.debug('[DEBUG] ' + m, d); else console.debug('[DEBUG] ' + m); },
};

process.on('uncaughtException', function(e) {
  Logger.error('Uncaught Exception', { message: e.message, stack: e.stack });
  if ([ 'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET' ].indexOf(e.code) < 0) {
    process.exit(1);
  }
});

process.on('unhandledRejection', function(r) {
  Logger.error('Unhandled Rejection', { message: (r && r.message) || r });
});

function env(key, fallback) {
  var val = process.env[key];
  return val || fallback || '';
}

var PORT = Number(process.env.PORT) || 5000;
var HOST = process.env.HOST || '0.0.0.0';

// =============================================================================
// SERVICE URL CONFIGURATION
// =============================================================================
// All backend services are on port 5000 INTERNALLY (inside the Docker network)
// The gateway resolves them by their Docker service name
// =============================================================================
var SVC = {};

// Internal Docker network URLs (port 5000 for ALL services)
const DOCKER_NETWORK = 'restpoint_restpoint_net';
const isDocker = !!process.env.DOCKER_CONTAINER;

function serviceUrl(serviceName, defaultPort) {
  // In Docker, all services are accessible via container name on port 5000
  if (isDocker || process.env[serviceName.toUpperCase() + '_SERVICE_URL']) {
    return env(serviceName.toUpperCase() + '_SERVICE_URL', 'http://' + serviceName + ':5000');
  }
  return env(serviceName.toUpperCase() + '_SERVICE_URL', 'http://localhost:' + (defaultPort || '5000'));
}

SVC.auth        = serviceUrl('auth', '5001');
SVC.users       = serviceUrl('users', '5001');
SVC.marketplace = serviceUrl('marketplace', '5004');
SVC.mpesa       = serviceUrl('mpesa', '5011');
SVC.portal      = serviceUrl('portal', '5019');
SVC.tenant      = serviceUrl('tenant', '5002');
SVC.deceased    = serviceUrl('deceased', '5003');
SVC.embalming   = serviceUrl('embalming', '5105');
SVC.invoices    = serviceUrl('invoices', '5005');
SVC.coffin      = serviceUrl('coffin', '5006');
SVC.visitors    = serviceUrl('visitors', '5014');
SVC.notification= serviceUrl('notification', '5111');
SVC.documents   = serviceUrl('documents', '5007');
SVC.analytics   = serviceUrl('analytics', '5009');
SVC.bodycheckout= serviceUrl('bodycheckout', '5015');
SVC.edocuments  = serviceUrl('edocuments', '5008');
SVC.calendar    = serviceUrl('calendar', '5010');
SVC.chemicals   = serviceUrl('chemicals', '5105');

Logger.info('Service URLs:');
Object.keys(SVC).forEach(function(key) {
  Logger.info('  ' + key + ' -> ' + SVC[key]);
});

// =============================================================================
// RATE LIMITING
// =============================================================================
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

var isProd = env('NODE_ENV', 'development') === 'production';
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 10 : 100,
  message: { success: false, message: 'Too many auth attempts' },
  standardHeaders: true,
  legacyHeaders: false,
});

var app = express();

// =============================================================================
// GLOBAL MIDDLEWARE
// =============================================================================

// CORS
app.use(cors({
  origin: function(origin, cb) {
    if (!origin || origin.indexOf('localhost') >= 0) return cb(null, true);
    var allowed = [
      'https://restpoint.co.ke',
      'https://app.restpoint.co.ke',
      'https://portal.restpoint.co.ke',
    ];
    if (allowed.indexOf(origin) >= 0) return cb(null, true);
    return cb(new Error('Origin not allowed: ' + origin));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
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

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api/v1/', apiLimiter);

app.use(function(req, res, next) {
  if (req.originalUrl.match(/\/auth\/(login|register|refresh)/)) {
    return authLimiter(req, res, next);
  }
  next();
});

// =============================================================================
// SECURITY MIDDLEWARES
// =============================================================================

// 1. Sensitive Data Masking Middleware
const sensitiveFields = [
  'password', 'email', 'phone', 'token', 'secret', 'apiKey',
   'idNumber', 'nationalId', 'passport',
  'deathCertificate', 'burialPermit', 'cremationPermit',
  'bankAccount', 'accountNumber', 'cardNumber', 'cvv', 'pin',
  'resetToken', 'refreshToken', 'accessToken',
  'ssn', 'socialSecurity', 'taxId',
  'biometricData', 'fingerprint', 'irisScan',
  'bodyTagId', 'caseNumber', 'mortuaryId'
];

app.use(function(req, res, next) {
  const originalJson = res.json;
  res.json = function(data) {
    function mask(obj) {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(function(item) { return mask(item); });
      var masked = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (sensitiveFields.indexOf(key) >= 0) {
            masked[key] = '********';
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            masked[key] = mask(obj[key]);
          } else {
            masked[key] = obj[key];
          }
        }
      }
      return masked;
    }
    return originalJson.call(this, mask(data));
  };
  next();
});

// 2. File Upload Security Middleware
app.use(function(req, res, next) {
  if (req.is && req.is('multipart/form-data')) {
    var contentLength = parseInt(req.headers['content-length'] || '0', 10);
    var maxUploadSize = 50 * 1024 * 1024;
    if (contentLength > maxUploadSize) {
      return res.status(413).json({ success: false, message: 'Upload too large. Maximum 50MB allowed.' });
    }
  }
  next();
});

// 3. Tenant/Mortuary Ownership Middleware
app.use(function(req, res, next) {
  var tenantSlug = req.headers['x-tenant-slug'];
  var tenantId = req.headers['x-tenant-id'];

  if (tenantSlug || tenantId) {
    if (tenantSlug && !/^[a-zA-Z0-9\-]+$/.test(tenantSlug)) {
      return res.status(400).json({ success: false, message: 'Invalid tenant slug format' });
    }
    req.tenantSlug = tenantSlug;
    req.tenantId = tenantId;
  }

  next();
});

// =============================================================================
// REQUEST LOGGING MIDDLEWARE
// =============================================================================
app.use(function(req, res, next) {
  // Log ALL requests with their original path
  Logger.info('→ ' + req.method + ' ' + req.originalUrl);
  next();
});

// =============================================================================
// PROXY FUNCTION
// =============================================================================
// IMPORTANT: The gateway receives paths like /api/v1/restpoint/tenant/onboarding/organization
// Backend services have routes MOUNTED at /api/v1/restpoint/... (WITH /api prefix)
// So we forward the path AS-IS without stripping /api
// =============================================================================
function createProxy(target, serviceName) {
  var parts = new URL(target);
  return function(req, res) {
    var path = req.originalUrl || req.url || '/';
    
    // DEBUG: Log the path being forwarded
    Logger.debug('[PROXY] ' + serviceName + ' ← ' + req.method + ' ' + path + ' → ' + target + path);
    
    var opts = {
      hostname: parts.hostname,
      port: parts.port,
      path: path,
      method: req.method,
      headers: Object.assign({}, req.headers, { host: parts.host }),
    };
    delete opts.headers['connection'];

    var proxy = http.request(opts, function(proxyRes) {
      Logger.debug('[PROXY] ' + serviceName + ' → ' + proxyRes.statusCode + ' for ' + req.method + ' ' + path);
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxy.on('error', function(err) {
      Logger.error('[PROXY] ' + serviceName + ' error: ' + target + path + ' - ' + err.message);
      if (!res.headersSent) {
        res.status(503).json({ 
          success: false, 
          message: 'Service unavailable: ' + serviceName + ' (' + err.code + ')',
          service: serviceName,
          forwardedPath: path,
          targetUrl: target + path
        });
      }
    });

    if (req.body && Object.keys(req.body).length > 0) {
      proxy.write(JSON.stringify(req.body));
    }
    proxy.end();
  };
}

// =============================================================================
// ROUTE CONFIGURATION
// =============================================================================
// Format: [path, serviceKey]
// Express app.use() matches all sub-paths automatically.
// e.g. /api/v1/restpoint/tenant matches /api/v1/restpoint/tenant/onboarding/organization
// The path is forwarded AS-IS to the target service (no /api stripping)
// =============================================================================
var routes = [
  ['/api/v1/restpoint/auth', 'auth'],
  ['/api/v1/restpoint/users', 'users'],
  ['/api/v1/users', 'users'],
  ['/api/v1/restpoint/marketplace', 'marketplace'],
  ['/api/v1/marketplace', 'marketplace'],
  ['/api/v1/restpoint/mpesa', 'mpesa'],
  ['/api/v1/mpesa', 'mpesa'],
  ['/api/v1/restpoint/tenants', 'tenant'],
  ['/api/v1/restpoint/tenant', 'tenant'],
  ['/api/onboarding', 'tenant'],
  ['/api/v1/restpoint/system-admin', 'tenant'],
  ['/api/v1/restpoint/deceased', 'deceased'],
  ['/api/v1/restpoint/embalming', 'embalming'],
  ['/api/v1/restpoint/chemicals', 'chemicals'],
  ['/api/v1/restpoint/invoices', 'invoices'],
  ['/api/v1/restpoint/coffin', 'coffin'],
  ['/api/v1/restpoint/visitors', 'visitors'],
  ['/api/v1/restpoint/notification', 'notification'],
  ['/api/v1/restpoint/documents', 'documents'],
  ['/api/v1/restpoint/analytics', 'analytics'],
  ['/api/v1/restpoint/performance', 'analytics'],
  ['/api/v1/restpoint/bodycheckout', 'bodycheckout'],
  ['/api/v1/restpoint/portal', 'portal'],
  ['/api/v1/restpoint/calendar', 'calendar'],
  ['/api/v1/calendar', 'calendar'],
  ['/api/v1/restpoint/edocuments', 'edocuments'],
  ['/api/v1/edocuments', 'edocuments'],
];

Logger.info('Registered routes:');
for (var i = 0; i < routes.length; i++) {
  Logger.info('  ' + routes[i][0] + ' → ' + routes[i][1] + ' (' + SVC[routes[i][1]] + ')');
  app.use(routes[i][0], createProxy(SVC[routes[i][1]], routes[i][1]));
}

// =============================================================================
// DIAGNOSTIC ENDPOINTS
// =============================================================================

// Health check (accessible at both paths)
app.get('/api/v1/health', function(req, res) {
  res.json({ 
    success: true,
    status: 'ok', 
    uptime: process.uptime(), 
    timestamp: Date.now(), 
    services: Object.keys(SVC),
    serviceCount: Object.keys(SVC).length,
    routes: routes.length
  });
});

app.get('/health', function(req, res) {
  res.json({ 
    success: true,
    status: 'ok', 
    service: APP_NAME, 
    version: APP_VERSION, 
    port: PORT,
    uptime: process.uptime()
  });
});

// Debug: Show all registered routes (admin endpoint)
app.get('/api/v1/debug/routes', function(req, res) {
  var routeList = routes.map(function(r) {
    return { path: r[0], service: r[1], targetUrl: SVC[r[1]] };
  });
  res.json({
    success: true,
    message: 'Gateway routes',
    gatewayVersion: APP_VERSION,
    serviceCount: Object.keys(SVC).length,
    routeCount: routes.length,
    routes: routeList,
    services: SVC,
    environment: {
      nodeEnv: env('NODE_ENV', 'development'),
      docker: isDocker,
      network: DOCKER_NETWORK
    }
  });
});

// Debug: Test a specific service
app.all('/api/v1/debug/test-service/:serviceName/:path(*)', function(req, res) {
  var serviceName = req.params.serviceName;
  var subPath = req.params.path || '';
  var targetUrl = SVC[serviceName];
  
  if (!targetUrl) {
    return res.status(400).json({
      success: false,
      message: 'Unknown service: ' + serviceName,
      availableServices: Object.keys(SVC)
    });
  }

  var testPath = '/api/v1/restpoint/' + serviceName + (subPath ? '/' + subPath : '');
  
  res.json({
    success: true,
    message: 'Debug info for ' + serviceName,
    serviceName: serviceName,
    serviceKey: serviceName,
    targetUrl: targetUrl,
    matchedRoute: '/api/v1/restpoint/' + serviceName,
    forwardedPath: testPath,
    fullForwardUrl: targetUrl + testPath,
    frontendRequest: 'https://app.restpoint.co.ke' + testPath
  });
});

// =============================================================================
// WILDCATCH ROUTE — catch ALL remaining /api/v1/restpoint/* requests
// This acts as a fallback for any routes not explicitly listed above
// =============================================================================
app.all('/api/v1/restpoint/:service/:path(*)', function(req, res) {
  var serviceName = req.params.service;
  var targetUrl = SVC[serviceName];
  var subPath = req.params.path || '';
  
  Logger.warn('[WILDCARD] ' + req.method + ' /api/v1/restpoint/' + serviceName + '/' + subPath + ' → ' + (targetUrl || 'NO MATCH'));
  
  if (!targetUrl) {
    return res.status(404).json({
      success: false,
      message: 'Unknown service: ' + serviceName,
      originalUrl: req.originalUrl,
      availableServices: Object.keys(SVC).sort()
    });
  }
  
  // Forward to the matched service
  var path = '/api/v1/restpoint/' + serviceName + (subPath ? '/' + subPath : '');
  var parts = new URL(targetUrl);
  
  Logger.debug('[WILDCARD PROXY] ' + serviceName + ' ← ' + req.method + ' ' + path + ' → ' + targetUrl + path);
  
  var opts = {
    hostname: parts.hostname,
    port: parts.port,
    path: path,
    method: req.method,
    headers: Object.assign({}, req.headers, { host: parts.host }),
  };
  delete opts.headers['connection'];

  var proxy = http.request(opts, function(proxyRes) {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on('error', function(err) {
    Logger.error('[WILDCARD PROXY] Error: ' + targetUrl + path + ' - ' + err.message);
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Service unavailable: ' + serviceName,
        error: err.code
      });
    }
  });

  if (req.body && Object.keys(req.body).length > 0) {
    proxy.write(JSON.stringify(req.body));
  }
  proxy.end();
});

// =============================================================================
// 404 HANDLER
// =============================================================================
app.use(function(req, res) {
  // Log the 404 with details
  Logger.warn('[404] ' + req.method + ' ' + req.originalUrl + ' — No matching route');
  
  // Provide helpful error message with matched routes
  var matchingRoutes = routes.filter(function(r) {
    return req.originalUrl.indexOf(r[0]) >= 0;
  });
  
  res.status(404).json({ 
    success: false, 
    message: 'Cannot ' + req.method + ' ' + req.originalUrl,
    originalUrl: req.originalUrl,
    matchedRoutes: matchingRoutes.length > 0 ? matchingRoutes.map(function(r) {
      return { path: r[0], service: r[1], targetUrl: SVC[r[1]] };
    }) : [],
    hint: matchingRoutes.length > 0 
      ? 'Route matched but proxy forwarding may have failed. Check if the target service is running.' 
      : 'No matching route found. Check /api/v1/debug/routes for all registered routes.'
  });
});

// =============================================================================
// ERROR HANDLER
// =============================================================================
app.use(function(err, req, res, next) {
  Logger.error('Internal: ' + err.message, { stack: err.stack });
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: isProd ? undefined : err.message
  });
});

// =============================================================================
// START SERVER
// =============================================================================
var server = app.listen(PORT, HOST, function() {
  Logger.info('========================================');
  Logger.info('  ' + APP_NAME + ' v' + APP_VERSION);
  Logger.info('  Running on http://' + HOST + ':' + PORT);
  Logger.info('  Environment: ' + env('NODE_ENV', 'development'));
  Logger.info('  Proxying ' + Object.keys(SVC).length + ' services');
  Logger.info('  Registered ' + routes.length + ' routes');
  Logger.info('  Network: ' + DOCKER_NETWORK);
  Logger.info('  Docker mode: ' + isDocker);
  Logger.info('========================================');
});

function shutdown() {
  Logger.info('Shutting down...');
  server.close(function() { process.exit(0); });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;