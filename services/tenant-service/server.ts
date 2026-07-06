import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import onboardingRoutes from './routes/onboardingRoutes';
import systemAdminRoutes from './routes/systemAdminRoutes';
import { errorHandler, notFoundHandler, asyncHandler } from '../../global/middlewares/errorHandler';

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
// ROUTES - Clean root mount
// ============================================
// The API Gateway strips /api/v1/restpoint/tenant prefix and forwards clean paths
// So we mount at / and routes use clean paths

// Onboarding routes - mounted at root
app.use('/', apiLimiter, onboardingRoutes);

// System Admin Routes - mounted at root
app.use('/', systemAdminRoutes);

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
