import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler, asyncHandler } from '../../global/middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8103', 10);

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token', 'x-tenant-slug'],
}));
app.use(helmet());
app.use(express.json());

// Tenant middleware - IMPORTANT: This should run before routes
app.use((req: Request, res: Response, next: NextFunction) => {
    const tenantSlug = req.headers['x-tenant-slug'] as string || 'system_shared';
    (req as any).tenantSlug = tenantSlug;
    next();
});

// Import routes
import deceasedRoutes from './routes/deceasedRoutes';
import autopsyRoutes from './routes/autopsyRoutes';
import chargesRoutes from './routes/chargesRoutes';
import chargeSettingsRoutes from './routes/chargeSettingsRoutes';

// Mount routes at BOTH /api/v1/restpoint/* and /v1/restpoint/* for gateway compatibility
app.use('/api/v1/restpoint', deceasedRoutes);
app.use('/v1/restpoint', deceasedRoutes);
app.use('/api/v1/restpoint', autopsyRoutes);
app.use('/v1/restpoint', autopsyRoutes);
app.use('/api/v1/restpoint', chargesRoutes);
app.use('/v1/restpoint', chargesRoutes);
app.use('/api/v1/restpoint', chargeSettingsRoutes);
app.use('/v1/restpoint', chargeSettingsRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'UP',
        service: 'deceased-service',
        tenant: (req as any).tenantSlug,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Deceased service is running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
});

export default app;
