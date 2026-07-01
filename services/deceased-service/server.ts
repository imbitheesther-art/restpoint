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

// Import routes
import deceasedRoutes from './routes/deceasedRoutes';
import autopsyRoutes from './routes/autopsyRoutes';
import chargesRoutes from './routes/chargesRoutes';
import chargeSettingsRoutes from './routes/chargeSettingsRoutes';

// ============================================
// ✅ MOUNT ROUTES - ALL POSSIBLE PATHS
// ============================================

// Mount at root level for direct access (IMPORTANT: must be first)
app.use('/', deceasedRoutes);  // This handles /register-deceased, /deceased-id/:id, etc.

// Mount with /deceased prefix
app.use('/deceased', deceasedRoutes);

// Mount with /api/v1/restpoint/deceased prefix
app.use('/api/v1/restpoint/deceased', deceasedRoutes);

// Mount with /v1/restpoint/deceased prefix
app.use('/v1/restpoint/deceased', deceasedRoutes);

// Other services
app.use('/api/v1/restpoint/autopsy', autopsyRoutes);
app.use('/v1/restpoint/autopsy', autopsyRoutes);
app.use('/autopsy', autopsyRoutes);

app.use('/api/v1/restpoint/charges', chargesRoutes);
app.use('/v1/restpoint/charges', chargesRoutes);
app.use('/charges', chargesRoutes);

app.use('/api/v1/restpoint/charge-settings', chargeSettingsRoutes);
app.use('/v1/restpoint/charge-settings', chargeSettingsRoutes);
app.use('/charge-settings', chargeSettingsRoutes);

// Next of Kin routes - mount at root for /:deceased_id/next-of-kin pattern
// Gateway strips /api/v1/restpoint/deceased, so service receives /:deceased_id/next-of-kin
import nextOfKinRoutes from './routes/nextOfKinRoutes';
app.use('/', nextOfKinRoutes);

// Hearse routes - mount at root for /hearse/* pattern
// Gateway strips /api/v1/restpoint/hearse, so service receives /hearse/*
import hearseRoutes from './routes/hearseRoutes';
app.use('/', hearseRoutes);

// Documents routes - mount at root for /:deceased_id/documents pattern
// Gateway strips /api/v1/restpoint/deceased, so service receives /:deceased_id/documents
import documentsRoutes from './routes/documentsRoutes';
app.use('/', documentsRoutes);

// ============================================
// HEALTH CHECK
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
// REQUEST LOGGING
// ============================================
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
});

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