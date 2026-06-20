import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cron from 'node-cron';
import axios from 'axios';
import winston from 'winston';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { BillingController } from './controllers/billingController';
import { CalculationController } from './controllers/calculationController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5020;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/billing-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/billing-combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many billing requests' }
});
app.use('/api', limiter);

// Initialize controllers
const billingController = new BillingController(logger);
const calculationController = new CalculationController(logger);

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'billing-service-typescript',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Manual trigger for daily billing
app.post('/api/billing/run', async (req, res) => {
  try {
    const { tenant_slug } = req.body;
    const result = tenant_slug 
      ? await billingController.processTenantBilling(tenant_slug)
      : await billingController.processAllTenantsBilling();
    
    res.json({
      success: true,
      message: 'Billing processed',
      data: result
    });
  } catch (error: any) {
    logger.error('Manual billing trigger failed:', error);
    res.status(500).json({
      success: false,
      message: 'Billing failed',
      error: error.message
    });
  }
});

// Calculate charges for specific deceased
app.post('/api/billing/calculate', async (req, res) => {
  try {
    const { deceased_id, tenant_slug } = req.body;
    
    if (!deceased_id || !tenant_slug) {
      return res.status(400).json({
        success: false,
        message: 'deceased_id and tenant_slug are required'
      });
    }

    const charges = await calculationController.calculateDeceasedCharges(deceased_id, tenant_slug);
    
    res.json({
      success: true,
      data: charges
    });
  } catch (error: any) {
    logger.error('Calculate charges failed:', error);
    res.status(500).json({
      success: false,
      message: 'Calculation failed',
      error: error.message
    });
  }
});

// Get billing history
app.get('/api/billing/history/:tenantSlug', async (req, res) => {
  try {
    const { tenantSlug } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;
    
    const history = await billingController.getBillingHistory(
      tenantSlug,
      startDate as string,
      endDate as string,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error: any) {
    logger.error('Get billing history failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history',
      error: error.message
    });
  }
});

// Get billing job logs
app.get('/api/billing/logs', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const logs = await billingController.getJobLogs(parseInt(limit as string));

    res.json({
      success: true,
      data: logs
    });
  } catch (error: any) {
    logger.error('Get billing logs failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: error.message
    });
  }
});

// Fallback status
app.get('/api/billing/fallback-status', (req, res) => {
  res.json({
    success: true,
    fallbacks: [
      { name: 'Python', port: 5021, url: process.env.PYTHON_FALLBACK_URL || 'http://localhost:5021' },
      { name: 'Go', port: 5022, url: process.env.GO_FALLBACK_URL || 'http://localhost:5022' }
    ]
  });
});

// ============================================
// SCHEDULED BILLING JOBS
// ============================================

// Daily billing at 8:00 AM
const dailyBillingSchedule = process.env.DAILY_BILLING_CRON || '0 0 8 * * *';
cron.schedule(dailyBillingSchedule, async () => {
  logger.info('Cron job triggered: Daily billing');
  try {
    await billingController.processAllTenantsBilling();
  } catch (error) {
    logger.error('Cron job failed:', error);
  }
});

// Hourly updates for active deceased
const hourlyUpdateSchedule = '0 * * * *'; // Every hour
cron.schedule(hourlyUpdateSchedule, async () => {
  logger.info('Cron job triggered: Hourly billing update');
  try {
    await billingController.hourlyUpdate();
  } catch (error) {
    logger.error('Hourly update failed:', error);
  }
});

logger.info(`Billing service scheduled: ${dailyBillingSchedule}`);
logger.info(`Hourly updates scheduled: ${hourlyUpdateSchedule}`);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`========================================`);
  logger.info(`TypeScript Billing Service started on port ${PORT}`);
  logger.info(`Daily billing: ${dailyBillingSchedule}`);
  logger.info(`Hourly updates: ${hourlyUpdateSchedule}`);
  logger.info(`Python fallback: ${process.env.PYTHON_FALLBACK_URL || 'http://localhost:5021'}`);
  logger.info(`Go fallback: ${process.env.GO_FALLBACK_URL || 'http://localhost:5022'}`);
  logger.info(`========================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
