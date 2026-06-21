import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import onboardingRoutes from './routes/onboardingRoutes';
import systemAdminRoutes from './routes/systemAdminRoutes';

dotenv.config();

// ============================================
// EXPRESS APP SETUP
// ============================================
const app: Application = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// CORS — strict whitelist (no wildcard in production)
// ============================================
const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:8082').split(',');
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
    'x-slug',
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

// Request logging
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
// ROUTES
// ============================================
// ═══════════════════════════════════════════════════════════════════
// ROUTE MOUNTS — Tenant Onboarding + System Admin
// ═══════════════════════════════════════════════════════════════════
// IMPORTANT: The API gateway's pathRewrite strips /api prefix from forwarded paths.
// Example: Client→Gateway: /api/v1/restpoint/tenant/onboarding/organization
//          Gateway→Service: /v1/restpoint/tenant/onboarding/organization
// So we MUST mount on BOTH /api/v1/* AND /v1/* paths.
// ═══════════════════════════════════════════════════════════════════

// --- Onboarding routes (api prefix) ---
app.use('/api/v1/restpoint/tenant/onboarding', apiLimiter, onboardingRoutes);
app.use('/api/v1/restpoint/tenants/onboarding', apiLimiter, onboardingRoutes);
app.use('/api/v1/restpoint/tenants/register', apiLimiter, onboardingRoutes);
app.use('/api/onboarding', authLimiter, onboardingRoutes);

// --- Onboarding routes (v1 prefix — after gateway strips /api) ---
app.use('/v1/restpoint/tenant/onboarding', apiLimiter, onboardingRoutes);
app.use('/v1/restpoint/tenants/onboarding', apiLimiter, onboardingRoutes);
app.use('/v1/restpoint/tenants/register', apiLimiter, onboardingRoutes);
app.use('/v1/onboarding', authLimiter, onboardingRoutes);
// Gateway strips /api → /onboarding, so mount without /v1 too
app.use('/onboarding', authLimiter, onboardingRoutes);

// --- System Admin Routes ---
app.use('/api/system-admin', systemAdminRoutes);
app.use('/api/v1/restpoint/system-admin', systemAdminRoutes);
// System admin via gateway (after /api strip)
app.use('/v1/restpoint/system-admin', systemAdminRoutes);
app.use('/v1/system-admin', systemAdminRoutes);

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
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`\n🚀 Tenant Service running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Test: http://localhost:${PORT}/test`);
  console.log(`📍 Register: POST http://localhost:${PORT}/api/onboarding/organization`);
  console.log(`📍 Login: POST http://localhost:${PORT}/api/onboarding/login`);
  console.log(`\n📊 Database: ${process.env.MASTER_DB_NAME || 'master_db'}@${process.env.MASTER_DB_HOST || 'localhost'}`);
  console.log('✅ Ready to accept tenant registrations!\n');
});
