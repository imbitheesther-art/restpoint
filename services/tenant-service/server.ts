import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import * as mysql from 'mysql2/promise';
import { TenantModel } from './models/Tenant.model';
import onboardingRoutes from './routes/onboardingRoutes';
import systemAdminRoutes from './routes/systemAdminRoutes';
import { UserController } from './controllers/userController';
import { errorHandler, notFoundHandler, asyncHandler } from '../app-global/middlewares/errorHandler';

dotenv.config();

// Start provision worker if enabled
if (process.env.START_PROVISION_WORKER !== 'false') {
  try {
    require('./scripts/provision-worker');
    console.log('Provision worker started');
  } catch (err) {
    console.warn('Failed to start provision worker:', err);
  }
}


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
// SIMPLIFIED ROUTES (tenantSlug only) - MUST BE FIRST
// ============================================
// These routes use only tenantSlug and must be defined BEFORE
// the /tenant/:tenantSlug/:dbName middleware to avoid conflicts
// Pattern: /tenant/:tenantSlug/:resource
// Example: /tenant/donholm-feuneral-donholm/settings
// ============================================

// Simplified settings route (tenantSlug only)
app.get('/tenant/:tenantSlug/settings', asyncHandler(async (req: Request, res: Response) => {
  const tenantSlug = Array.isArray(req.params.tenantSlug) ? req.params.tenantSlug[0] : req.params.tenantSlug;
  const tenant = await TenantModel.findBySubdomain(tenantSlug);

  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant not found' });
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: tenant.db_name
  });

  try {
    const [branches] = await conn.query('SELECT COUNT(*) as count FROM branches WHERE is_active = TRUE');
    const branchCount = (branches as any[])[0]?.count || 0;

    res.json({
      success: true,
      data: {
        deploymentType: branchCount > 1 ? 'multi' : 'single',
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
}));

// Simplified user routes (tenantSlug only)
app.get('/tenant/:tenantSlug/users', asyncHandler(async (req: Request, res: Response) => {
  const tenantSlug = Array.isArray(req.params.tenantSlug) ? req.params.tenantSlug[0] : req.params.tenantSlug;
  const tenant = await TenantModel.findBySubdomain(tenantSlug);

  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant not found' });
  }

  const userController = new UserController();
  const originalDbName = (req as any).dbName;
  (req as any).dbName = tenant.db_name;
  await userController.getUsers(req, res);
  (req as any).dbName = originalDbName;
}));

// Simplified branches route (tenantSlug only)
app.get('/tenant/:tenantSlug/branches', asyncHandler(async (req: Request, res: Response) => {
  const tenantSlug = Array.isArray(req.params.tenantSlug) ? req.params.tenantSlug[0] : req.params.tenantSlug;
  const tenant = await TenantModel.findBySubdomain(tenantSlug);

  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant not found' });
  }

  const userController = new UserController();
  const originalDbName = (req as any).dbName;
  (req as any).dbName = tenant.db_name;
  await userController.getBranches(req, res);
  (req as any).dbName = originalDbName;
}));

// Create user route (tenantSlug only)
app.post('/tenant/:tenantSlug/users/register', asyncHandler(async (req: Request, res: Response) => {
  const tenantSlug = Array.isArray(req.params.tenantSlug) ? req.params.tenantSlug[0] : req.params.tenantSlug;
  const tenant = await TenantModel.findBySubdomain(tenantSlug);

  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant not found' });
  }

  // Set req.user for the controller (it expects user.tenantSlug)
  (req as any).user = {
    userId: 1, // Admin user creating this user
    tenantSlug: tenantSlug
  };

  const userController = new UserController();
  const originalDbName = (req as any).dbName;
  (req as any).dbName = tenant.db_name;
  await userController.registerUser(req, res);
  (req as any).dbName = originalDbName;
}));

// ============================================
// BRANCH-AWARE ROUTING MIDDLEWARE (USING DB NAME)
// ============================================
// For multi-tenant: URLs include database name directly
// Pattern: /tenant/:tenantSlug/:dbName/:resource
// Example: /tenant/thika-feuneral/thika_feuneral_thika/all-deceased
// Example: /tenant/thika-feuneral/thika_feuneral_wamasaa/all-deceased
// ============================================

interface BranchRequest extends Request {
  branchDbName?: string;
  tenantSlug?: string;
}

// Middleware to extract tenant and database from URL
app.use('/tenant/:tenantSlug/:dbName', asyncHandler(async (req: BranchRequest, res: Response, next: NextFunction) => {
  const tenantSlug = Array.isArray(req.params.tenantSlug) ? req.params.tenantSlug[0] : req.params.tenantSlug;
  const dbName = Array.isArray(req.params.dbName) ? req.params.dbName[0] : req.params.dbName;

  if (!tenantSlug || !dbName) {
    return res.status(400).json({ success: false, message: 'Tenant slug and database name are required' });
  }

  // Find tenant
  const tenant = await TenantModel.findBySubdomain(tenantSlug);
  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant not found' });
  }

  // The dbName from URL IS the branch database name
  // Verify it exists by checking if it matches tenant.db_name (primary) or any branch
  let branchDbName = dbName;

  // If it's not the primary DB, verify it's a valid branch DB
  if (dbName !== tenant.db_name) {
    const verifiedDbName = await TenantModel.getBranchDbName(tenant.db_name, dbName);
    if (!verifiedDbName) {
      return res.status(404).json({ success: false, message: 'Branch database not found' });
    }
    branchDbName = verifiedDbName;
  }

  // Attach to request for use in controllers
  req.tenantSlug = tenantSlug;
  req.branchDbName = branchDbName;

  next();
}));

// Branch-aware user routes (with dbName)
app.get('/tenant/:tenantSlug/:dbName/users', asyncHandler(async (req: BranchRequest, res: Response) => {
  const userController = new UserController();
  const originalDbName = (req as any).dbName;
  (req as any).dbName = req.branchDbName;
  await userController.getUsers(req, res);
  (req as any).dbName = originalDbName;
}));

// Branch-aware branches route (with dbName)
app.get('/tenant/:tenantSlug/:dbName/branches', asyncHandler(async (req: BranchRequest, res: Response) => {
  const userController = new UserController();
  const originalDbName = (req as any).dbName;
  (req as any).dbName = req.branchDbName;
  await userController.getBranches(req, res);
  (req as any).dbName = originalDbName;
}));

// Branch-aware settings route (with dbName)
app.get('/tenant/:tenantSlug/:dbName/settings', asyncHandler(async (req: BranchRequest, res: Response) => {
  const tenantSlug = Array.isArray(req.params.tenantSlug) ? req.params.tenantSlug[0] : req.params.tenantSlug;
  const tenant = await TenantModel.findBySubdomain(tenantSlug);
  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant not found' });
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: tenant.db_name
  });

  try {
    const [branches] = await conn.query('SELECT COUNT(*) as count FROM branches WHERE is_active = TRUE');
    const branchCount = (branches as any[])[0]?.count || 0;

    res.json({
      success: true,
      data: {
        deploymentType: branchCount > 1 ? 'multi' : 'single',
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
}));

// Get tenant settings (deployment type, etc.)
// Public endpoint - no auth required for basic tenant info
app.get('/tenant/settings', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Try to get tenant from header or query param
    const headerSlug = req.headers['x-tenant-slug'] as string;
    const querySlug = req.query.slug;
    const querySlugStr = typeof querySlug === 'string' ? querySlug : (Array.isArray(querySlug) ? querySlug[0] : '');
    const tenantSlug = headerSlug || querySlugStr;

    if (!tenantSlug || typeof tenantSlug !== 'string') {
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
// ONBOARDING ROUTES (Public - No tenant context required)
// ============================================
app.use('/onboarding', onboardingRoutes);

// ============================================
// SYSTEM ADMIN ROUTES
// ============================================
app.use('/system-admin', systemAdminRoutes);

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
const HOST = process.env.HOST || '0.0.0.0';
app.listen(Number(PORT), HOST, () => {
  console.log(`Tenant service running on port ${PORT}`);
  console.log(`Health check: http://${HOST}:${PORT}/health`);
  console.log(`${new Date().toISOString()}`);
});
