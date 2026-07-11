import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from '../../app-global/middlewares/errorHandler';

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

// Tenant Middleware - supports both tenant slugs and branch database name slugs
app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantSlug = req.headers['x-tenant-slug'] as string | undefined;
        const branchId = req.headers['x-branch-id'] as string | undefined;

        (req as any).tenantSlug = tenantSlug;
        (req as any).branchId = branchId;

        console.log(`[DECEASED] ${req.method} ${req.path} - Tenant: ${tenantSlug}`);

        if (!tenantSlug || tenantSlug === 'system_shared') {
            (req as any).tenant = {
                db_name: process.env.DB_NAME || 'restpoint_db',
                tenant_id: 1,
                name: 'System Shared'
            };
            return next();
        }

        // Step 1: Try direct database connection (slug IS the database name)
        let resolvedDbName = null;

        console.log(`[DECEASED] Trying direct database connection for: ${tenantSlug}`);
        try {
            const testPool = require('mysql2/promise').createPool({
                host: process.env.DB_HOST || '127.0.0.1',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'restpoint_user',
                password: process.env.DB_PASSWORD || 'RestPointUser2024',
                database: tenantSlug,
                waitForConnections: true,
                connectionLimit: 2,
                queueLimit: 0,
            });
            const [result] = await testPool.query('SELECT 1');
            if (result) {
                resolvedDbName = tenantSlug;
                console.log(`[DECEASED] Direct database connection successful: ${resolvedDbName}`);
            }
            await testPool.end().catch(() => { });
        } catch (dbErr) {
            console.log(`[DECEASED] Direct database connection failed: ${dbErr.message}`);
        }

        // Step 2: If direct connection failed, try resolveDatabase
        if (!resolvedDbName) {
            try {
                const { resolveDatabase } = require('../../shared/dbConfig');
                resolvedDbName = await resolveDatabase(tenantSlug);
            } catch (e) {
                console.log(`[DECEASED] resolveDatabase failed: ${e.message}`);
            }
        }

        if (!resolvedDbName) {
            return res.status(403).json({
                success: false,
                message: 'Tenant not found or not active'
            });
        }

        (req as any).tenant = {
            db_name: resolvedDbName,
            tenant_id: 0,
            name: tenantSlug,
            tenant_slug: tenantSlug
        };
        console.log(`[DECEASED] Tenant resolved: ${resolvedDbName}`);

        next();
    } catch (error) {
        console.error('[DECEASED] Tenant middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize tenant database',
            error: error.message
        });
    }
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