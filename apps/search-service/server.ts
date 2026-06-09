import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRoutes from './routes/searchRoutes';
import { initializeRedis } from './config/redis';
import { validateTenant } from './middleware/tenantMiddleware';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8020;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Tenant validation middleware
app.use(validateTenant);

// Initialize Redis
initializeRedis();

// Routes
app.use('/api/v1/search', searchRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'search-service',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Search failed',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Search Service running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/v1/search`);
});
