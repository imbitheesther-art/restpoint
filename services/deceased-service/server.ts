import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5003', 10);

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];

app.use(cors({
    origin: true,
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

// Tenant Middleware
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
                id: 1,
                name: 'System Shared'
            };
            return next();
        }

        let resolvedDbName = null;

        console.log(`[DECEASED] Trying direct database connection for: ${tenantSlug}`);
        try {
            const testPool = require('mysql2/promise').createPool({
                host: process.env.DB_HOST || '127.0.0.1',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'restpoint_user',
                password: process.env.DB_PASSWORD,
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
            id: 0,
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

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[DECEASED] ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'UP',
        service: 'deceased-service',
        tenant: (req as any).tenantSlug,
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Auto-migrate: Ensure deceased tables exist in tenant databases
import { migrateTenantTables } from './migrate-tenant-tables';
if (process.env.DB_NAME) {
    migrateTenantTables(process.env.DB_NAME).catch(err => {
        console.warn(`[DECEASED] Auto-migration warning for ${process.env.DB_NAME}:`, err.message);
    });
}

// Mount routes
import autopsyRoutes from './routes/autopsyRoutes';
import chargesRoutes from './routes/chargesRoutes';
import chargeSettingsRoutes from './routes/chargeSettingsRoutes';
import nextOfKinRoutes from './routes/nextOfKinRoutes';
import hearseRoutes from './routes/hearseRoutes';
import documentsRoutes from './routes/documentsRoutes';

app.use('/', nextOfKinRoutes);
app.use('/', hearseRoutes);
app.use('/', documentsRoutes);
app.use('/', autopsyRoutes);
app.use('/', chargesRoutes);
app.use('/', chargeSettingsRoutes);

import deceasedRoutes from './routes/deceasedRoutes';
app.use('/', deceasedRoutes);

// 404 handler
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

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server with socket error handling and graceful shutdown
const server = http.createServer({
    insecureHTTPParser: false,
}, app);

// Initialize Socket.IO with the HTTP server
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true
    }
});

// Make io available globally for controllers
(global as any).io = io;

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    socket.on('join-tenant', (tenantSlug: string) => {
        socket.join(`tenant:${tenantSlug}`);
        console.log(`[SOCKET] Client ${socket.id} joined tenant: ${tenantSlug}`);
    });

    socket.on('disconnect', () => {
        console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
});

const gracefulShutdown = (signal: string) => {
    console.log(`[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
        console.log('[SHUTDOWN] HTTP server closed.');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('[SHUTDOWN] Forced shutdown after timeout.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
    console.error('[SECURITY] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('[SECURITY] Uncaught Exception:', err.message);
});

server.on('connection', (socket) => {
    socket.setTimeout(120000);
    socket.on('error', (err) => {
        console.error('[SECURITY] Socket error handled:', err.message);
        socket.destroy();
    });
});

server.on('error', (err: NodeJS.ErrnoException) => {
    console.error('[SECURITY] Server error:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Deceased service running on ${PORT}`);
});

export default app;