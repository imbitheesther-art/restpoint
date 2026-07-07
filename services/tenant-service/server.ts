git   import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import * as mysql from 'mysql2/promise';
import { TenantModel } from './models/Tenant.model';
import onboardingRoutes from './routes/onboardingRoutes';
import systemAdminRoutes from './routes/systemAdminRoutes';
import { UserController } from './controllers/userController';
import { errorHandler, notFoundHandler, asyncHandler } from '../../global/middlewares/errorHandler';

dotenv.config();

// ============================================
// EXPRESS APP SETUP
// ============================================
const app: Application = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// CORS â€” REMOVED COMPLETELY
// ============================================
const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:8082').split(',');
  if (!origin || allowedOrigins.some(o => origin.includes(o.replace(/https?:\/\//, '')))) {
    return callback(null, true);
  }
  return callback(new Error('Origin not allowed by CORS: ' + origin));
};

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'x-tenant-slug',
    'x-tenant-id',
    'x-request-timestamp',
    'x-client-id',
    'x-session-fingerprint',
    'Origin',
    'X-Requested-With',
    'Accept'
  ]
}));

// Serve uploaded files
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ============================================
// RATE LIMITING
// ============================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// ROUTES - Fixed mount paths to match API Gateway routing
// ============================================
// The API Gateway strips /api/v1/restpoint prefix and forwards the remaining path.
// When frontend calls POST /tenant/onboarding/organization:
//   Gateway receives: /api/v1/restpoint/tenant/onboarding/organization
//   Gateway strips prefix: req.url = /tenant/onboarding/organization
//   First segment = "tenant" → proxies to tenant service at /tenant/onboarding/organization
//
// So we must mount onboarding routes at /tenant/onboarding to match the forwarded path.
// The route /organization inside onboardingRoutes.ts will then match correctly.

// Onboarding routes - mounted at /tenant/onboarding to match gateway proxy path
app.use('/tenant/onboarding', apiLimiter, onboardingRoutes);

// Also mount at root for direct access (backward compatibility)
app.use('/', apiLimiter, onboardingRoutes);

// System Admin Routes - mounted at root
app.use('/', systemAdminRoutes);

// User Management Routes
const userController = new UserController();

// Get all users
app.get('/tenant/users', asyncHandler(async (req: Request, res: Response) => {
  await userController.getUsers(req, res);
}));

// Get all branches
app.get('/tenant/branches', asyncHandler(async (req: Request, res: Response) => {
  await userController.getBranches(req, res);
}));

// Register new user
app.post('/tenant/users/register', asyncHandler(async (req: Request, res: Response) => {
  await userController.registerUser(req, res);
}));

// Get tenant settings (deployment type, etc.)
// Public endpoint - no auth required for basic tenant info
app.get('/tenant/settings', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Try to get tenant from header or query param
    const tenantSlug = req.headers['x-tenant-slug'] as string || req.query.slug as string;

    if (!tenantSlug) {
      // Return default settings if no tenant specified
      res.json({
        success: true,
        data: {
          deploymentType: 'single',
          branchCount: 0,
          tenantName: '',
          tenantSlug: ''
        }
      });
      return;
    }

    const tenant = await TenantModel.findBySubdomain(tenantSlug);

    if (!tenant) {
      res.status(404).json({ success: false, message: 'Tenant not found' });
      return;
    }

    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: tenant.db_name
    });

    try {
      // Get branches count
      const [branches] = await conn.query('SELECT COUNT(*) as count FROM branches WHERE is_active = TRUE');
      const branchCount = (branches as any[])[0]?.count || 0;

      // Get deployment type from tenant_tracking database
      const serverConn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: 'tenant_tracking'
      });

      let deploymentType = 'single';
      try {
        const [tracking] = await serverConn.query(
          'SELECT deployment_type FROM tenants WHERE tenant_slug = ?',
          [tenantSlug]
        );
        const trackingData = tracking as any[];
        if (trackingData.length > 0 && trackingData[0].deployment_type) {
          deploymentType = trackingData[0].deployment_type;
        } else {
          // Fallback: determine from branch count
          deploymentType = branchCount > 1 ? 'multi' : 'single';
        }
      } catch (err) {
        // If column doesn't exist, use branch count
        deploymentType = branchCount > 1 ? 'multi' : 'single';
      } finally {
        await serverConn.end();
      }

      res.json({
        success: true,
        data: {
          deploymentType,
          branchCount,
          tenantName: tenant.tenant_name,
          tenantSlug: tenant.tenant_slug,
          country: tenant.country,
          location: tenant.location,
          email: tenant.email
        }
      });
    } finally {
      await conn.end();
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings', error: error.message });
  }
}));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'tenant-service',
    timestamp: new Date().toISOString(),
    database: process.env.MASTER_DB_NAME || 'master_db'
  });
});

// Test endpoint
app.get('/test', (req: Request, res: Response) => {
  res.json({
    message: 'Tenant service is running!',
    endpoints: {
      register: 'POST /api/onboarding/organization',
      registerViaGateway: 'POST /api/v1/restpoint/tenant/onboarding/organization',
      login: 'POST /api/onboarding/login',
      getOrg: 'GET /api/onboarding/organization',
      health: 'GET /health'
    },
    config: {
      dbHost: process.env.MASTER_DB_HOST || 'localhost',
      dbName: process.env.MASTER_DB_NAME || 'master_db'
    }
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use(notFoundHandler);

// ============================================
// ERROR HANDLER
// ============================================
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`Tenant service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`${new Date().toISOString()}`);
});