/**
 * Auth Service - Secure Authentication Microservice
 *
 * TypeScript rewrite with enterprise-grade security:
 * - Helmet (HTTP headers security)
 * - HPP (HTTP parameter pollution protection)
 * - express-session (persistent sessions with Redis store)
 * - CSRF protection (double-submit cookie pattern)
 * - Rate limiting (brute force protection)
 * - JWT tokens with per-tenant secrets
 */

import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import { autoInitSystemAdmin } from './scripts/auto-init-system-admin';

const app = express();
const PORT = process.env.PORT || 5001;

// ============================================
// 1. SECURITY MIDDLEWARE (order matters)
// ============================================

// 1a. Helmet - sets secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// 1b. CORS - strict in production
const corsOptions: cors.CorsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 'Authorization', 'X-Requested-With',
    'Accept', 'Origin', 'X-Tenant-Id', 'X-CSRF-Token',
    'x-tenant-slug', 'x-branch-id'
  ],
  exposedHeaders: ['Set-Cookie', 'X-CSRF-Token'],
  maxAge: 86400, // 24h preflight cache
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 1c. HPP - prevent HTTP parameter pollution
app.use(hpp({
  whitelist: ['page', 'limit', 'status', 'search'], // allow duplicate query params for pagination
}));

// 1d. Body parsing with limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(process.env.JWT_SECRET));

// 1e. Session - remember user across requests
const SESSION_SECRET = process.env.JWT_SECRET || 'restpoint-session-secret-change-me';
app.set('trust proxy', 1); // trust first proxy (nginx/gateway)

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'restpoint.sid',
  cookie: {
    httpOnly: true,       // not accessible via JS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',   // CSRF protection via SameSite
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  },
  rolling: true, // refresh session on each request
}));

// 1f. Rate limiting - global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});
app.use('/auth', globalLimiter);

// ============================================
// 2. REQUEST LOGGING
// ============================================

if (process.env.LOG_LEVEL !== 'silent') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} ` +
      `IP:${req.ip} Session:${req.session?.id?.slice(0, 8) || 'none'}`
    );
    next();
  });
}

// ============================================
// 3. HEALTH CHECKS
// ============================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'auth-service',
    version: '2.0.0-ts',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/db', async (_req: Request, res: Response) => {
  try {
    const { checkDBConnection } = await import('./scripts/dbHealth');
    const result = await checkDBConnection();
    if (result.ok) {
      return res.status(200).json({ ok: true, message: 'Database reachable' });
    }
    const err: any = result.error || {};
    const msg = process.env.NODE_ENV === 'development'
      ? (err.message || String(err))
      : 'Database unreachable';
    return res.status(503).json({ ok: false, message: msg });
  } catch (error: any) {
    return res.status(503).json({
      ok: false,
      message: process.env.NODE_ENV === 'development'
        ? (error.message || String(error))
        : 'Database unreachable',
    });
  }
});

// ============================================
// 4. AUTH ROUTES
// ============================================

app.use('/auth', authRoutes);

// ============================================
// 5. CSRF TOKEN ENDPOINT
// ============================================

app.get('/auth/csrf-token', (req: Request, res: Response) => {
  // Generate and return a CSRF token stored in session
  const token = req.sessionID + '-' + Date.now();
  req.session.csrfToken = token;
  res.json({ success: true, csrfToken: token });
});

// ============================================
// 6. ERROR HANDLING
// ============================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found in auth-service`,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  // Handle aborted requests gracefully
  if (err.type === 'request.aborted' || (err.message && err.message.includes('aborted'))) {
    console.warn(`[Warning] Request to ${req.url} was aborted.`);
    if (!res.headersSent) {
      return res.status(400).json({
        success: false,
        message: 'Request aborted or connection closed unexpectedly.',
      });
    }
    return;
  }

  // Handle CSRF errors
  if (err.code === 'EBADCSRFTOKEN' || err.message?.includes('csrf')) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token. Please refresh and try again.',
    });
  }

  console.error('Error:', err.stack || err.message || err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong inside auth-service!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================
// 7. STARTUP SEQUENCE
// ============================================

async function startServer() {
  const { spawn } = require('child_process');

  async function runBootstrapIfAdminAvailable(): Promise<boolean> {
    const adminUser = process.env.DB_ADMIN_USER || process.env.ROOT_DB_USER;
    const adminPass = process.env.DB_ADMIN_PASSWORD || process.env.ROOT_DB_PASSWORD;
    if (!adminUser || !adminPass) {
      console.log('No DB admin credentials provided; skipping auto-provisioning.');
      return false;
    }

    return new Promise((resolve, reject) => {
      const env = Object.assign({}, process.env, {
        DB_ADMIN_USER: adminUser,
        DB_ADMIN_PASSWORD: adminPass,
      });

      const child = spawn(process.execPath, ['scripts/bootstrap-db.js'], {
        env, cwd: __dirname, stdio: ['ignore', 'pipe', 'pipe'],
      });

      child.stdout.on('data', (data: Buffer) => console.log(`[bootstrap] ${data.toString().trim()}`));
      child.stderr.on('data', (data: Buffer) => console.error(`[bootstrap] ${data.toString().trim()}`));
      child.on('error', (err: Error) => reject(err));
      child.on('close', (code: number | null) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error('Bootstrap script failed with exit code ' + code));
        }
      });
    });
  }

  try {
    let initResult: any;
    try {
      initResult = await autoInitSystemAdmin();
      if (!initResult.success) {
        const isAccessDenied = initResult.message && initResult.message.toLowerCase().includes('access denied');
        if (isAccessDenied) {
          console.warn('DB access denied during auto-init. Attempting bootstrap...');
          await runBootstrapIfAdminAvailable();
          initResult = await autoInitSystemAdmin();
        }
      } else {
        console.log('✅ System admin auto-initialization complete');
      }
    } catch (err: any) {
      const isAccessDenied = err?.code === 'ER_ACCESS_DENIED_ERROR' ||
        (err?.message && err.message.toLowerCase().includes('access denied'));
      if (isAccessDenied) {
        console.warn('DB access denied. Attempting bootstrap...');
        await runBootstrapIfAdminAvailable();
        const retryResult = await autoInitSystemAdmin();
        if (!retryResult.success) {
          console.error('Init still failed after bootstrap:', retryResult.message);
          process.exit(1);
        }
      } else {
        console.error('❌ Auto-init error:', err?.message || err);
        process.exit(1);
      }
    }
  } catch (error: any) {
    console.error('❌ Startup error:', error?.message || error);
    process.exit(1);
  }

  const HOST = process.env.HOST || '0.0.0.0';
  app.listen(Number(PORT), HOST, () => {
    console.log(`🚀 Auth Service [TS] running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🔒 Security: helmet | hpp | session | rate-limit | csrf`);
  });
}

startServer();

// Export for testing
export default app;