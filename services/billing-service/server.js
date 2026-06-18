require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const axios = require('axios');
const winston = require('winston');
const rateLimit = require('express-rate-limit');

const { safeQuery } = require('../../configurations/sqlConfig/db');
const { getKenyaTimeISO } = require('../../packages/shared-utils/dist/timestamps');

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

// ============================================
// DAILY BILLING CALCULATOR - NEVER FAILS
// ============================================

/**
 * Calculate daily charges for a deceased person
 * This is the core billing logic that must never fail
 */
const calculateDailyCharges = async (deceasedId, tenantSlug) => {
  try {
    logger.info(`Calculating daily charges for deceased: ${deceasedId}, tenant: ${tenantSlug}`);

    // Get deceased details
    const deceasedSql = `
      SELECT d.*, 
        DATEDIFF(NOW(), d.date_admitted) as days_admitted,
        DATEDIFF(NOW(), d.date_of_death) as days_since_death
      FROM deceased d
      WHERE d.id = ? AND d.tenant_slug = ?
    `;
    const [deceased] = await safeQuery(deceasedSql, [deceasedId, tenantSlug]);

    if (!deceased) {
      throw new Error(`Deceased not found: ${deceasedId}`);
    }

    // Get daily rate from tenant settings or use default
    const settingsSql = `
      SELECT daily_rate, embalming_rate, storage_rate 
      FROM tenant_settings 
      WHERE tenant_slug = ?
    `;
    const [settings] = await safeQuery(settingsSql, [tenantSlug]);
    
    const dailyRate = settings?.daily_rate || 1500; // Default KES 1500/day
    const embalmingRate = settings?.embalming_rate || 3000;
    const storageRate = settings?.storage_rate || 500;

    // Calculate charges
    const daysAdmitted = deceased.days_admitted || 1;
    const baseCharges = daysAdmitted * dailyRate;
    
    // Additional charges
    let additionalCharges = 0;
    if (deceased.embalming) additionalCharges += embalmingRate;
    if (deceased.cold_storage) additionalCharges += storageRate * daysAdmitted;

    const totalDailyCharge = baseCharges + additionalCharges;

    logger.info(`Daily charges calculated: KES ${totalDailyCharge} for ${daysAdmitted} days`);

    return {
      deceasedId,
      tenantSlug,
      daysAdmitted,
      dailyRate,
      baseCharges,
      additionalCharges,
      totalDailyCharge,
      calculatedAt: getKenyaTimeISO()
    };

  } catch (error) {
    logger.error(`Error calculating charges for deceased ${deceasedId}:`, error);
    throw error;
  }
};

/**
 * Process daily billing for all active deceased in a tenant
 */
const processDailyBilling = async (tenantSlug) => {
  const billingResults = {
    success: true,
    tenant: tenantSlug,
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
    timestamp: getKenyaTimeISO()
  };

  try {
    logger.info(`Starting daily billing for tenant: ${tenantSlug}`);

    // Get all active deceased for this tenant
    const deceasedSql = `
      SELECT id, deceased_id, full_name, date_admitted, status
      FROM deceased 
      WHERE tenant_slug = ? AND status IN ('admitted', 'active')
    `;
    const deceasedList = await safeQuery(deceasedSql, [tenantSlug]);

    logger.info(`Found ${deceasedList.length} deceased records to bill`);

    for (const deceased of deceasedList) {
      try {
        billingResults.processed++;
        
        const charges = await calculateDailyCharges(deceased.id, tenantSlug);
        
        // Save billing record
        const insertSql = `
          INSERT INTO daily_billing 
          (deceased_id, tenant_slug, days_admitted, daily_rate, base_charges, 
           additional_charges, total_charge, billing_date, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)
          ON DUPLICATE KEY UPDATE
          days_admitted = VALUES(days_admitted),
          base_charges = VALUES(base_charges),
          additional_charges = VALUES(additional_charges),
          total_charge = VALUES(total_charge),
          updated_at = VALUES(created_at)
        `;
        
        await safeQuery(insertSql, [
          deceased.id,
          tenantSlug,
          charges.daysAdmitted,
          charges.dailyRate,
          charges.baseCharges,
          charges.additionalCharges,
          charges.totalDailyCharge,
          getKenyaTimeISO()
        ]);

        // Update deceased billing field
        await safeQuery(
          'UPDATE deceased SET billing = billing + ? WHERE id = ?',
          [charges.totalDailyCharge, deceased.id]
        );

        billingResults.succeeded++;
        logger.info(`✓ Billed ${deceased.full_name}: KES ${charges.totalDailyCharge}`);

      } catch (error) {
        billingResults.failed++;
        billingResults.errors.push({
          deceasedId: deceased.id,
          name: deceased.full_name,
          error: error.message
        });
        logger.error(`✗ Failed to bill ${deceased.full_name}:`, error);
      }
    }

    logger.info(`Daily billing completed for ${tenantSlug}: ${billingResults.succeeded}/${billingResults.processed} succeeded`);

  } catch (error) {
    logger.error(`Fatal error in daily billing for ${tenantSlug}:`, error);
    billingResults.success = false;
    billingResults.fatalError = error.message;
  }

  return billingResults;
};

// ============================================
// FALLBACK TO PYTHON SERVICE
// ============================================

/**
 * Fallback to Python billing service if Node.js fails
 */
const fallbackToPython = async (tenantSlug) => {
  const pythonServiceUrl = process.env.FALLBACK_SERVICE_URL || 'http://localhost:5021';
  
  try {
    logger.warn(`Falling back to Python billing service for tenant: ${tenantSlug}`);
    
    const response = await axios.post(`${pythonServiceUrl}/api/billing/process`, {
      tenant_slug: tenantSlug,
      timestamp: getKenyaTimeISO()
    }, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    logger.info(`Python fallback succeeded for ${tenantSlug}:`, response.data);
    return {
      success: true,
      fallback: true,
      data: response.data
    };

  } catch (error) {
    logger.error(`Python fallback also failed for ${tenantSlug}:`, error.message);
    return {
      success: false,
      fallback: true,
      error: error.message
    };
  }
};

// ============================================
// SCHEDULED BILLING JOB
// ============================================

const runDailyBilling = async () => {
  logger.info('========================================');
  logger.info('Starting scheduled daily billing job');
  logger.info('========================================');

  try {
    // Get all active tenants
    const tenantsSql = `
      SELECT tenant_slug, tenant_name 
      FROM tenant_tracking.tenants 
      WHERE status = 'active'
    `;
    const tenants = await safeQuery(tenantsSql);

    logger.info(`Found ${tenants.length} active tenants`);

    const results = [];

    for (const tenant of tenants) {
      try {
        // Try primary Node.js billing
        let result = await processDailyBilling(tenant.tenant_slug);
        
        // If failed, try Python fallback
        if (!result.success) {
          logger.warn(`Primary billing failed for ${tenant.tenant_slug}, trying fallback...`);
          const fallbackResult = await fallbackToPython(tenant.tenant_slug);
          result.fallbackUsed = fallbackResult.success;
        }

        results.push(result);

      } catch (error) {
        logger.error(`Critical error processing tenant ${tenant.tenant_slug}:`, error);
        results.push({
          tenant: tenant.tenant_slug,
          success: false,
          error: error.message
        });
      }
    }

    // Log summary
    const totalProcessed = results.reduce((sum, r) => sum + (r.processed || 0), 0);
    const totalSucceeded = results.reduce((sum, r) => sum + (r.succeeded || 0), 0);
    const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);

    logger.info('========================================');
    logger.info('Daily billing job completed');
    logger.info(`Total processed: ${totalProcessed}`);
    logger.info(`Total succeeded: ${totalSucceeded}`);
    logger.info(`Total failed: ${totalFailed}`);
    logger.info('========================================');

    // Store results for monitoring
    await safeQuery(`
      INSERT INTO billing_job_logs 
      (job_type, total_tenants, total_processed, total_succeeded, total_failed, 
       results, executed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'daily_billing',
      tenants.length,
      totalProcessed,
      totalSucceeded,
      totalFailed,
      JSON.stringify(results),
      getKenyaTimeISO()
    ]);

    return results;

  } catch (error) {
    logger.error('Fatal error in daily billing job:', error);
    throw error;
  }
};

// Schedule daily billing at 8:00 AM
const billingSchedule = process.env.DAILY_BILLING_CRON || '0 0 8 * * *';
cron.schedule(billingSchedule, () => {
  logger.info('Cron job triggered: Daily billing');
  runDailyBilling().catch(err => {
    logger.error('Cron job failed:', err);
  });
});

logger.info(`Billing service scheduled: ${billingSchedule}`);

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'billing-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Manual trigger for daily billing
app.post('/api/billing/run', async (req, res) => {
  try {
    const { tenant_slug } = req.body;
    
    let result;
    if (tenant_slug) {
      result = await processDailyBilling(tenant_slug);
    } else {
      result = await runDailyBilling();
    }

    res.json({
      success: true,
      message: 'Billing processed',
      data: result
    });

  } catch (error) {
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

    const charges = await calculateDailyCharges(deceased_id, tenant_slug);

    res.json({
      success: true,
      data: charges
    });

  } catch (error) {
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

    let sql = `
      SELECT * FROM daily_billing 
      WHERE tenant_slug = ?
    `;
    const params = [tenantSlug];

    if (startDate) {
      sql += ' AND billing_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND billing_date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY billing_date DESC LIMIT ?';
    params.push(parseInt(limit));

    const history = await safeQuery(sql, params);

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
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

    const logs = await safeQuery(`
      SELECT * FROM billing_job_logs 
      ORDER BY executed_at DESC 
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({
      success: true,
      data: logs
    });

  } catch (error) {
    logger.error('Get billing logs failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: error.message
    });
  }
});

// Fallback endpoint for Python service
app.post('/api/billing/fallback-status', (req, res) => {
  res.json({
    success: true,
    fallback_available: !!process.env.FALLBACK_SERVICE_URL,
    python_url: process.env.FALLBACK_SERVICE_URL || 'Not configured'
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`========================================`);
  logger.info(`Billing Service started on port ${PORT}`);
  logger.info(`Daily billing schedule: ${billingSchedule}`);
  logger.info(`Fallback service: ${process.env.FALLBACK_SERVICE_URL || 'Not configured'}`);
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

module.exports = app;