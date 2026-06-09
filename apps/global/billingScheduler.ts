import cron from 'node-cron';
import { billingService, billingScheduler as serviceScheduler } from '../services/deceasedBillingService';
import Logger from '../utilities/logger/logger';

// ============================================
// CONFIGURATION
// ============================================

interface SchedulerConfig {
  schedulePattern: string;
  timezone: string;
  runOnInit: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
  retryDelayMs: number;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  schedulePattern: '*/5 * * * *', // Every 5 minutes
  timezone: 'Africa/Nairobi',
  runOnInit: true,
  retryOnFailure: true,
  maxRetries: 3,
  retryDelayMs: 5000
};

// ============================================
// SCHEDULER MANAGER
// ============================================

class BillingSchedulerManager {
  private static instance: BillingSchedulerManager;
  private task: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;
  private config: SchedulerConfig;
  private lastRunTime: Date | null = null;
  private consecutiveFailures: number = 0;

  private constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<SchedulerConfig>): BillingSchedulerManager {
    if (!BillingSchedulerManager.instance) {
      BillingSchedulerManager.instance = new BillingSchedulerManager(config);
    }
    return BillingSchedulerManager.instance;
  }

  /**
   * Initialize and start the scheduler
   */
  start(): void {
    if (this.task) {
      Logger.warn('Billing scheduler already running, stopping existing...');
      this.stop();
    }

    Logger.info('🚀 Initializing mortuary charge scheduler...');
    Logger.info(`📅 Schedule pattern: ${this.config.schedulePattern}`);
    Logger.info(`🌍 Timezone: ${this.config.timezone}`);

    // Create scheduled task
    this.task = cron.schedule(
      this.config.schedulePattern,
      async () => {
        await this.executeBillingUpdate();
      },
      {
        scheduled: true,
        timezone: this.config.timezone
      }
    );

    Logger.info('✅ Mortuary charge scheduler initialized and running');

    // Run immediately on startup if configured
    if (this.config.runOnInit) {
      Logger.info('🔄 Running initial billing update on startup...');
      setTimeout(() => this.executeBillingUpdate(), 2000); // Delay 2 seconds for app to fully start
    }
  }

  /**
   * Execute billing update with retry logic
   */
  private async executeBillingUpdate(): Promise<void> {
    const timestamp = new Date().toISOString();
    
    // Prevent concurrent execution
    if (this.isRunning) {
      Logger.warn(`[${timestamp}] ⚠️ Previous billing update still running, skipping...`);
      return;
    }

    this.isRunning = true;
    this.lastRunTime = new Date();

    try {
      Logger.info(`🕔 [${timestamp}] Running mortuary charges update...`);

      // Call the billing service
      const result = await billingService.updateDeceasedCharges();

      if (result.success) {
        Logger.info(
          `✅ [${timestamp}] Mortuary charges update completed successfully. ` +
          `Updated: ${result.updated}, Skipped: ${result.skipped}, Errors: ${result.errors}`
        );
        
        // Reset failure counter on success
        this.consecutiveFailures = 0;
        
        // Log detailed results in development
        if (process.env.NODE_ENV !== 'production') {
          Logger.debug('Billing update details:', result.details);
        }
      } else {
        throw new Error('Billing update returned unsuccessful result');
      }

    } catch (err: any) {
      this.consecutiveFailures++;
      
      Logger.error(
        `❌ [${timestamp}] Failed to update mortuary charges:`,
        err.message
      );

      // Attempt retry if configured
      if (this.config.retryOnFailure && this.consecutiveFailures <= this.config.maxRetries) {
        Logger.warn(`🔄 Retry attempt ${this.consecutiveFailures}/${this.config.maxRetries} in ${this.config.retryDelayMs}ms...`);
        
        setTimeout(async () => {
          await this.executeBillingUpdate();
        }, this.config.retryDelayMs);
      } else if (this.consecutiveFailures > this.config.maxRetries) {
        Logger.error(`💥 Maximum retry attempts (${this.config.maxRetries}) reached. Manual intervention may be required.`);
        
        // Send alert (implement your alert system here)
        await this.sendFailureAlert(err.message);
      }
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Send alert for critical failures
   */
  private async sendFailureAlert(errorMessage: string): Promise<void> {
    // Implement alert mechanism (email, Slack, webhook, etc.)
    const alert = {
      type: 'BILLING_SCHEDULER_FAILURE',
      message: `Mortuary charge billing failed after ${this.config.maxRetries} attempts`,
      error: errorMessage,
      lastRunTime: this.lastRunTime,
      consecutiveFailures: this.consecutiveFailures,
      timestamp: new Date().toISOString()
    };

    Logger.error('CRITICAL: Billing scheduler failure alert:', alert);

    // Example: Send to webhook
    if (process.env.ALERT_WEBHOOK_URL) {
      try {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
      } catch (webhookError) {
        Logger.error('Failed to send webhook alert:', webhookError);
      }
    }
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      Logger.info('⏹️ Mortuary charge scheduler stopped');
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    lastRunTime: Date | null;
    consecutiveFailures: number;
    schedulePattern: string;
    nextRunTime: Date | null;
  } {
    let nextRunTime = null;
    
    if (this.task) {
      // Calculate next run time based on cron pattern
      const nextDates = cron.scheduledTasks?.get(this.task) as any;
      if (nextDates?.options?.nextDate) {
        nextRunTime = nextDates.options.nextDate;
      }
    }

    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      consecutiveFailures: this.consecutiveFailures,
      schedulePattern: this.config.schedulePattern,
      nextRunTime: nextRunTime
    };
  }

  /**
   * Manually trigger billing update
   */
  async triggerManualUpdate(): Promise<any> {
    Logger.info('🔧 Manual billing update triggered');
    
    const result = await billingService.updateDeceasedCharges();
    
    Logger.info(`Manual update completed: ${result.updated} updated, ${result.errors} errors`);
    
    return result;
  }

  /**
   * Update schedule pattern dynamically
   */
  updateSchedule(pattern: string): void {
    this.config.schedulePattern = pattern;
    
    Logger.info(`📅 Schedule pattern updated to: ${pattern}`);
    
    // Restart scheduler with new pattern
    if (this.task) {
      this.stop();
      this.start();
    }
  }
}

// ============================================
// HEALTH CHECK MIDDLEWARE
// ============================================

export const billingHealthCheck = async (req: any, res: any, next: any): Promise<void> => {
  const scheduler = BillingSchedulerManager.getInstance();
  const status = scheduler.getStatus();
  
  const health = {
    service: 'Mortuary Charge Billing',
    status: status.isRunning ? 'healthy' : 'unhealthy',
    scheduler: status,
    lastSuccessfulRun: status.lastRunTime,
    consecutiveFailures: status.consecutiveFailures,
    timestamp: new Date().toISOString()
  };

  res.json(health);
};

// ============================================
// MANUAL CONTROL API ROUTES
// ============================================

export const billingRoutes = (router: any) => {
  const scheduler = BillingSchedulerManager.getInstance();

  // Trigger manual billing update
  router.post('/api/billing/trigger', async (req: any, res: any) => {
    try {
      const result = await scheduler.triggerManualUpdate();
      res.json({
        success: true,
        message: 'Billing update triggered manually',
        result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to trigger billing update',
        error: error.message
      });
    }
  });

  // Get scheduler status
  router.get('/api/billing/status', (req: any, res: any) => {
    const status = scheduler.getStatus();
    res.json({
      success: true,
      status
    });
  });

  // Update schedule pattern
  router.post('/api/billing/schedule', (req: any, res: any) => {
    const { pattern } = req.body;
    
    if (!pattern) {
      return res.status(400).json({
        success: false,
        message: 'Schedule pattern is required'
      });
    }

    try {
      scheduler.updateSchedule(pattern);
      res.json({
        success: true,
        message: `Schedule pattern updated to: ${pattern}`,
        newPattern: pattern
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update schedule',
        error: error.message
      });
    }
  });

  // Stop scheduler
  router.post('/api/billing/stop', (req: any, res: any) => {
    scheduler.stop();
    res.json({
      success: true,
      message: 'Billing scheduler stopped'
    });
  });

  // Start scheduler
  router.post('/api/billing/start', (req: any, res: any) => {
    scheduler.start();
    res.json({
      success: true,
      message: 'Billing scheduler started'
    });
  });

  return router;
};

// ============================================
// INITIALIZATION
// ============================================

let globalScheduler: BillingSchedulerManager | null = null;

/**
 * Initialize billing scheduler with custom config
 */
export const initializeBillingScheduler = (config?: Partial<SchedulerConfig>): BillingSchedulerManager => {
  if (globalScheduler) {
    Logger.warn('Billing scheduler already initialized');
    return globalScheduler;
  }

  globalScheduler = BillingSchedulerManager.getInstance(config);
  globalScheduler.start();
  
  Logger.info('✅ Mortuary charge scheduler initialized.');
  
  return globalScheduler;
};

/**
 * Get the global scheduler instance
 */
export const getBillingScheduler = (): BillingSchedulerManager => {
  if (!globalScheduler) {
    throw new Error('Billing scheduler not initialized. Call initializeBillingScheduler() first.');
  }
  return globalScheduler;
};

/**
 * Gracefully shutdown scheduler
 */
export const shutdownBillingScheduler = (): void => {
  if (globalScheduler) {
    globalScheduler.stop();
    globalScheduler = null;
    Logger.info('Billing scheduler shut down gracefully');
  }
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  initializeBillingScheduler,
  getBillingScheduler,
  shutdownBillingScheduler,
  billingHealthCheck,
  billingRoutes,
  BillingSchedulerManager
};