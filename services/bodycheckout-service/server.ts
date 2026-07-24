import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import Logger from '../../packages/shared-logger/dist/index';
import bodyReleaseRoutes from './routes/bodyRelease.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '8115', 10);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Tenant Resolution Middleware
app.use((req: any, res: any, next: any) => {
    const tenantSlug = req.headers['x-tenant-slug'] as string;

    if (tenantSlug) {
        req.tenantSlug = tenantSlug;
    }

    next();
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Bodycheckout service is running',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/body-release', bodyReleaseRoutes);

// Express error handler
app.use((err: any, req: any, res: any, next: any) => {
    Logger.error({
        message: 'Unhandled Express error',
        stack: err.stack,
        error: err.message
    });

    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    Logger.info(`Bodycheckout service running on port ${PORT}`);
});



process.on('uncaughtException', (error) => {
    Logger.error({
        message: 'Uncaught Exception',
        error: error.message,
        stack: error.stack
    });

    // Stop accepting new requests
    server.close(() => {
        process.exit(1);
    });

    // Force exit if shutdown hangs
    setTimeout(() => process.exit(1), 5000);
});

process.on('unhandledRejection', (reason: any) => {
    Logger.error({
        message: 'Unhandled Promise Rejection',
        error: reason?.message || String(reason),
        stack: reason?.stack
    });

    server.close(() => {
        process.exit(1);
    });

    setTimeout(() => process.exit(1), 5000);
});