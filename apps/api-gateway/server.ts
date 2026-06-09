import dotenv from 'dotenv';
import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Options } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { apiReference } from '@scalar/express-api-reference';

dotenv.config();

// Logger interface
interface ILogger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

const Logger: ILogger = {
  info: (message, meta) => console.log(`[INFO] ${message}`, meta || ''),
  error: (message, meta) => console.error(`[ERROR] ${message}`, meta || ''),
  warn: (message, meta) => console.warn(`[WARN] ${message}`, meta || ''),
  debug: (message, meta) => console.debug(`[DEBUG] ${message}`, meta || '')
};

// Services mapping
interface IServices {
  users: string;
  marketplace: string;
  socketio: string;
  mpesa: string;
  portal: string;
  tenant: string;
  deceased: string;
  embalming: string;
  invoices: string;
  coldroom: string;
  coffin: string;
  hearse: string;
  visitors: string;
  notification: string;
  documents: string;
  analytics: string;
  reports: string;
  bodycheckout: string;
  search: string;
}

// Error handlers
process.on('uncaughtException', (error: Error) => {
  Logger.error('Uncaught Exception', { message: error.message, stack: error.stack });
  const connectionErrors = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'];
  if (!connectionErrors.includes((error as any).code)) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason: any) => {
  Logger.error('Unhandled Rejection', { message: reason?.message || reason });
});

// Configuration
const PORT: number = Number(process.env.PORT) || 8000;
const HOST: string = process.env.HOST || '0.0.0.0';

// Service URLs - CRITICAL: Auth is on 8001, NOT users!
const SERVICES: IServices = {
  users: process.env.USERS_SERVICE_URL || 'http://localhost:8003',
  marketplace: process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:8007',
  socketio: process.env.SOCKETIO_SERVICE_URL || 'http://localhost:8009',
  mpesa: process.env.MPESA_SERVICE_URL || 'http://localhost:8011',
  portal: process.env.PORTAL_SERVICE_URL || 'http://localhost:8003',
  tenant: process.env.TENANT_SERVICE_URL || 'http://localhost:8002',
  deceased: process.env.DECEASED_SERVICE_URL || 'http://localhost:8103',
  embalming: process.env.EMBALMING_SERVICE_URL || 'http://localhost:8105',
  invoices: process.env.INVOICES_SERVICE_URL || 'http://localhost:8106',
  coldroom: process.env.COLDROOM_SERVICE_URL || 'http://localhost:8107',
  coffin: process.env.COFFIN_SERVICE_URL || 'http://localhost:8108',
  hearse: process.env.HEARSE_SERVICE_URL || 'http://localhost:8109',
  visitors: process.env.VISITORS_SERVICE_URL || 'http://localhost:8110',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8111',
  documents: process.env.DOCUMENTS_SERVICE_URL || 'http://localhost:8112',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8113',
  reports: process.env.REPORTS_SERVICE_URL || 'http://localhost:8114',
  bodycheckout: process.env.BODYCHECKOUT_SERVICE_URL || 'http://localhost:8115',
  search: process.env.SEARCH_SERVICE_URL || 'http://localhost:8020',
};

// Rate limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
});

// Initialize Express app
const app: Express = express();

// CORS configuration
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:8080',
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error(`CORS: origin ${origin} not permitted`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token', 'x-tenant-slug'],
}));

// Helmet security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Body parser middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const isProxied = req.path.startsWith('/api/v1/') || 
                    req.path.startsWith('/uploads/') || 
                    req.path.startsWith('/socket.io');
  if (isProxied) return next();
  express.json({ limit: '1mb' })(req, res, next);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const isProxied = req.path.startsWith('/api/v1/') || 
                    req.path.startsWith('/uploads/') || 
                    req.path.startsWith('/socket.io');
  if (isProxied) return next();
  express.urlencoded({ extended: true, limit: '1mb' })(req, res, next);
});

// Apply rate limiters
app.use('/api/v1/', apiLimiter);

// Auth-specific rate limiter
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl.match(/\/auth\/(login|register|refresh)/)) {
    return authLimiter(req, res, next);
  }
  next();
});

// Users Service proxy
const usersProxy = createProxyMiddleware({
  target: SERVICES.users,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[USERS PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.users}${req.url}`);
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }
      if (req.headers['x-tenant-slug']) {
        proxyReq.setHeader('x-tenant-slug', req.headers['x-tenant-slug']);
      }
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[USERS PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Users service temporarily unavailable' });
      }
    },
  },
});

// Auth Service proxy - CRITICAL FIX: Route to port 8001 without path stripping
const authProxy = createProxyMiddleware({
  target: 'http://localhost:8001',
  changeOrigin: true,
  proxyTimeout: 30000,
  timeout: 30000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[AUTH PROXY] ${req.method} ${req.originalUrl} → http://localhost:8001${req.url}`);
      
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }
      if (req.headers['x-tenant-slug']) {
        proxyReq.setHeader('x-tenant-slug', req.headers['x-tenant-slug']);
      }
      
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.headers['content-type']) {
        proxyReq.setHeader('Content-Type', req.headers['content-type']);
      }
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[AUTH PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Auth service temporarily unavailable' });
      }
    },
  },
});

// Marketplace Service proxy
const marketplaceProxy = createProxyMiddleware({
  target: SERVICES.marketplace,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[MARKETPLACE PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.marketplace}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[MARKETPLACE PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Marketplace service temporarily unavailable' });
      }
    },
  },
});

// Mpesa Service proxy
const mpesaProxy = createProxyMiddleware({
  target: SERVICES.mpesa,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[MPESA PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.mpesa}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[MPESA PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'M-Pesa service temporarily unavailable' });
      }
    },
  },
});

// Tenant Service proxy
const tenantProxy = createProxyMiddleware({
  target: SERVICES.tenant,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[TENANT PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.tenant}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
      if (req.headers['x-tenant-slug']) proxyReq.setHeader('x-tenant-slug', req.headers['x-tenant-slug']);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[TENANT PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Tenant service temporarily unavailable' });
      }
    },
  },
});

// Deceased Service proxy
const deceasedProxy = createProxyMiddleware({
  target: SERVICES.deceased,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[DECEASED PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.deceased}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[DECEASED PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Deceased service temporarily unavailable' });
      }
    },
  },
});

// Embalming Service proxy
const embalmingProxy = createProxyMiddleware({
  target: SERVICES.embalming,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[EMBALMING PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.embalming}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[EMBALMING PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Embalming service temporarily unavailable' });
      }
    },
  },
});

// Invoices Service proxy
const invoicesProxy = createProxyMiddleware({
  target: SERVICES.invoices,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[INVOICES PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.invoices}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[INVOICES PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Invoices service temporarily unavailable' });
      }
    },
  },
});

// Coldroom Service proxy
const coldroomProxy = createProxyMiddleware({
  target: SERVICES.coldroom,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[COLDROOM PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.coldroom}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[COLDROOM PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Coldroom service temporarily unavailable' });
      }
    },
  },
});

// Coffin Service proxy
const coffinProxy = createProxyMiddleware({
  target: SERVICES.coffin,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[COFFIN PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.coffin}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[COFFIN PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Coffin service temporarily unavailable' });
      }
    },
  },
});

// Hearse Service proxy
const hearseProxy = createProxyMiddleware({
  target: SERVICES.hearse,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[HEARSE PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.hearse}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[HEARSE PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Hearse service temporarily unavailable' });
      }
    },
  },
});

// Visitors Service proxy
const visitorsProxy = createProxyMiddleware({
  target: SERVICES.visitors,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[VISITORS PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.visitors}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[VISITORS PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Visitors service temporarily unavailable' });
      }
    },
  },
});

// Notification Service proxy
const notificationProxy = createProxyMiddleware({
  target: SERVICES.notification,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[NOTIFICATION PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.notification}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[NOTIFICATION PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Notification service temporarily unavailable' });
      }
    },
  },
});

// Documents Service proxy
const documentsProxy = createProxyMiddleware({
  target: SERVICES.documents,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[DOCUMENTS PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.documents}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[DOCUMENTS PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Documents service temporarily unavailable' });
      }
    },
  },
});

// Analytics Service proxy
const analyticsProxy = createProxyMiddleware({
  target: SERVICES.analytics,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[ANALYTICS PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.analytics}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[ANALYTICS PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Analytics service temporarily unavailable' });
      }
    },
  },
});

// Reports Service proxy
const reportsProxy = createProxyMiddleware({
  target: SERVICES.reports,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[REPORTS PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.reports}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[REPORTS PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Reports service temporarily unavailable' });
      }
    },
  },
});

// Body Checkout Service proxy
const bodycheckoutProxy = createProxyMiddleware({
  target: SERVICES.bodycheckout,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[BODYCHECKOUT PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.bodycheckout}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[BODYCHECKOUT PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Body checkout service temporarily unavailable' });
      }
    },
  },
});

// Search Service proxy
const searchProxy = createProxyMiddleware({
  target: SERVICES.search,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[SEARCH PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.search}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[SEARCH PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Search service temporarily unavailable' });
      }
    },
  },
});

// Portal Service proxy
const portalProxy = createProxyMiddleware({
  target: SERVICES.portal,
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      Logger.debug(`[PORTAL PROXY] ${req.method} ${req.originalUrl} → ${SERVICES.portal}${req.url}`);
      if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
    },
    error: (err: any, req: any, res: any) => {
      Logger.error(`[PORTAL PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'Portal service temporarily unavailable' });
      }
    },
  },
});

// Mount all proxy routes
// Auth routes - MUST be mounted before users routes
app.use('/api/v1/restpoint/auth', authProxy);

// Users routes
app.use('/api/v1/restpoint/users', usersProxy);
app.use('/api/v1/users', usersProxy);
app.use('/uploads/users', usersProxy);

// Marketplace routes
app.use('/api/v1/restpoint/marketplace', marketplaceProxy);
app.use('/api/v1/marketplace', marketplaceProxy);

// M-Pesa routes
app.use('/api/v1/restpoint/mpesa', mpesaProxy);
app.use('/api/v1/mpesa', mpesaProxy);

// Tenant routes
app.use('/api/v1/restpoint/tenants', tenantProxy);
app.use('/api/v1/restpoint/tenant', tenantProxy);
app.use('/api/onboarding', tenantProxy);

// Deceased routes
app.use('/api/v1/restpoint/deceased', deceasedProxy);

// Embalming routes
app.use('/api/v1/restpoint/embalming', embalmingProxy);
app.use('/api/v1/restpoint/chemicals', embalmingProxy);

// Invoices routes
app.use('/api/v1/restpoint/invoices', invoicesProxy);

// Coldroom routes
app.use('/api/v1/restpoint/coldroom', coldroomProxy);

// Coffin routes
app.use('/api/v1/restpoint/coffin', coffinProxy);
app.use('/api/v1/restpoint/register-coffin', coffinProxy);

// Hearse routes
app.use('/api/v1/restpoint/hearse', hearseProxy);

// Visitors routes
app.use('/api/v1/restpoint/visitors', visitorsProxy);

// Notification routes
app.use('/api/v1/restpoint/notification', notificationProxy);

// Documents routes
app.use('/api/v1/restpoint/documents', documentsProxy);

// Analytics routes
app.use('/api/v1/restpoint/analytics', analyticsProxy);
app.use('/api/v1/restpoint/performance', analyticsProxy);
app.use('/api/v1/restpoint/mortuary-analytics', analyticsProxy);

// Reports routes
app.use('/api/v1/restpoint/reports', reportsProxy);

// Body Checkout routes
app.use('/api/v1/restpoint/bodycheckout', bodycheckoutProxy);

// Search routes
app.use('/api/v1/search', searchProxy);

// Portal routes
app.use('/api/v1/restpoint/portal', portalProxy);

// Socket.IO Proxy
const socketProxy = createProxyMiddleware({
  target: SERVICES.socketio,
  changeOrigin: true,
  ws: true,
} as any);

app.use('/socket.io', socketProxy);

// Health check endpoints
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(), 
    timestamp: Date.now(),
    services: Object.keys(SERVICES)
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'api-gateway', port: PORT });
});

// API Reference documentation
app.use(
  '/reference',
  apiReference({
    spec: {
      content: {
        openapi: '3.1.0',
        info: { 
          title: 'API Gateway - RestPoint MMS', 
          version: '1.0.0',
          description: 'Unified API Gateway for RestPoint Mortuary Management System'
        },
        servers: [{ url: `http://localhost:${PORT}`, description: 'Local development' }],
      }
    }
  })
);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: `Cannot ${req.method} ${req.originalUrl}`,
    path: req.originalUrl
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  Logger.error(`Internal Server Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  Logger.info(`🚀 API Gateway running on http://${HOST}:${PORT}`);
  console.log('\n📋 Service Mapping:');
  console.log('═'.repeat(50));
  Object.entries(SERVICES).forEach(([name, url]) => {
    console.log(`   ✅ ${name.padEnd(15)} → ${url}`);
  });
  console.log('═'.repeat(50));
  console.log(`\n📖 API Reference: http://localhost:${PORT}/reference`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

// WebSocket upgrade handling
server.on('upgrade', (req, socket, head) => {
  if (req.url?.startsWith('/socket.io')) {
    socketProxy.upgrade(req as any, socket as any, head as any);
  }
});

// Graceful shutdown
const shutdown = () => {
  Logger.info('Shutting down API Gateway...');
  server.close(() => {
    Logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app;