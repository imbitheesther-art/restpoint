import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import db from './src/config/db.js';
import mpesaRoutes from './src/routes/mpesa.routes.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { tenantMiddleware } = require('../../global/middlewares/tenant-validation');

dotenv.config();

// Database Initialization
const initDB = async () => {
  try {
    console.log('✅ [M-Pesa Service] Database ready.');
  } catch (error) {
    console.warn('⚠️ [M-Pesa Service] DB init failed:', error.message);
  }
};

initDB();

const app = express();
const PORT = process.env.PORT || 8011;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply tenant validation to all API routes
app.use('/api/v1/mpesa', tenantMiddleware);

// Routes
app.use('/api/v1/mpesa', mpesaRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'mpesa-service',
    timestamp: new Date().toISOString()
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 M-Pesa Service running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🛑 M-Pesa Service shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 M-Pesa Service shutting down...');
  server.close(() => {
    process.exit(0);
  });
});