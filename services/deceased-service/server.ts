import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from '../../global/middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5003', 10);

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-slug',
        'x-tenant-slug',
        'x-tenant-id',
        'x-user-id',
        'Origin',
        'X-Requested-With',
        'Accept'
    ],
}));

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Tenant middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const tenantSlug = req.headers['x-tenant-slug'] as string | undefined;
    (req as any).tenantSlug = tenantSlug;
    next();
});

// ============================================
// REQUEST LOGGING (before routes for debugging)
// ============================================
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[DECEASED] ${req.method} ${req.path}`);
    next();
});

// ============================================
// HEALTH CHECK (MUST be before routes to avoid /:id catching it)
// ============================================
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'UP',
        service: 'deceased-service',
        tenant: (req as any).tenantSlug,
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// ============================================
// ✅ MOUNT ROUTES - CLEAN ROOT MOUNT
// ============================================
// The API Gateway strips /api/v1/restpoint prefix and forwards remaining path
// Gateway extracts first segment (e.g. "deceased") as routing key
// It proxies the ENTIRE remaining URL to the target service
//
// For example: /api/v1/restpoint/deceased/deceased-all
//   Gateway strips /api/v1/restpoint → /deceased/deceased-all
//   Gateway proxies → http://localhost:5003/deceased/deceased-all
//   We match it with full-prefix routes below

// Import routes
import deceasedRoutes from './routes/deceasedRoutes';
import autopsyRoutes from './routes/autopsyRoutes';
import chargesRoutes from './routes/chargesRoutes';
import chargeSettingsRoutes from './routes/chargeSettingsRoutes';

// Mount all sub-routers at root - routes use paths relative to root
// IMPORTANT: Routes must match the FULL forwarded path from the gateway
app.use('/', deceasedRoutes);

// Import other route modules
import nextOfKinRoutes from './routes/nextOfKinRoutes';
import hearseRoutes from './routes/hearseRoutes';
import documentsRoutes from './routes/documentsRoutes';

app.use('/', nextOfKinRoutes);
app.use('/', hearseRoutes);
app.use('/', documentsRoutes);
app.use('/', autopsyRoutes);
app.use('/', chargesRoutes);
app.use('/', chargeSettingsRoutes);

// ============================================
// 404 HANDLER
// ============================================
app.use((req: Request, res: Response) => {
    console.log(`[404] ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        path: req.path,
        method: req.method,
        availableRoutes: [
            'GET /health',
            'POST /register-deceased',
            'GET /deceased-id/:id',
            'GET /deceased/:id',
            'GET /:id',
            'GET /deceased',
            'PUT /:id',
            'DELETE /:id',
            'GET /stats'
        ]
    });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log(`  🚀 Deceased Service`);
    console.log(`  📡 Running on http://localhost:${PORT}`);
    console.log(`  🔗 Health: http://localhost:${PORT}/health`);
    console.log(`  📝 POST: http://localhost:${PORT}/register-deceased`);
    console.log(`  📋 GET: http://localhost:${PORT}/deceased`);
    console.log(`  📋 GET: http://localhost:${PORT}/deceased-id/:id`);
    console.log('========================================');
});

export default app;