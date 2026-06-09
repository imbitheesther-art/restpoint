import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = parseInt(process.env.PORT || '8103', 10);

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Tenant middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const tenantSlug = req.headers['x-tenant-slug'] as string || 'system_shared';
  (req as any).tenantSlug = tenantSlug;
  console.log(`[Deceased Service] Tenant: ${tenantSlug}`);
  next();
});

// Import routes
const deceasedRoutes = require('./routes/deceasedRoutes');
const nextOfKinRoutes = require('./routes/nextOfKinRoutes');

// Mount routes
app.use('/api/v1/restpoint/deceased', deceasedRoutes);
app.use('/api/v1/restpoint/next-of-kin', nextOfKinRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'deceased-service',
    tenant: (req as any).tenantSlug,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', (req: Request, res: Response) => {
  res.json({
    message: 'Deceased service is running',
    tenant: (req as any).tenantSlug,
    endpoints: {
      register: 'POST /api/v1/restpoint/deceased/register-deceased',
      list: 'GET /api/v1/restpoint/deceased/deceased-all',
      getById: 'GET /api/v1/restpoint/deceased/deceased-id',
      update: 'PUT /api/v1/restpoint/deceased/update-deceased/:id',
      nextOfKin: 'POST /api/v1/restpoint/next-of-kin/register/kin',
      health: 'GET /health'
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Deceased service is running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API: http://localhost:${PORT}/api/v1/restpoint/deceased`);
});

export default app;
