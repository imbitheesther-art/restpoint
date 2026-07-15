const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const backgroundJob = require('../services/backgroundJob');
const AnalyticsService = require('../services/analyticsService');
const metrics = require('../services/metrics');
const { logger } = require('@montezuma/shared-logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL);

// Initialize metrics polling for queue
try {
  metrics.init(backgroundJob.queue);
} catch (err) {
  logger.warn('Could not initialize metrics polling', err.message || err);
}

// Create a BullMQ worker to process analytics jobs
const worker = new Worker('analytics-jobs', async (job) => {
  const { tenantId, startDate, endDate } = job.data || {};
  const requestId = Math.random().toString(36).substring(7);
  logger.info(`[${requestId}] Processing analytics job ${job.id} for tenant ${tenantId}`);

  const start = Date.now();
  try {
    const data = await AnalyticsService.getDashboardData(tenantId, startDate, endDate);
    const durationSec = (Date.now() - start) / 1000.0;
    metrics.observeJobDuration(durationSec, tenantId);
    metrics.incrementSuccess(tenantId);
    return { jobId: job.id.toString(), period: { startDate, endDate }, data };
  } catch (error) {
    const durationSec = (Date.now() - start) / 1000.0;
    metrics.observeJobDuration(durationSec, tenantId);
    metrics.incrementFailure(tenantId);
    logger.error(`Job ${job.id} failed during processing`, error);
    throw error; // let BullMQ mark job as failed and handle retries
  }
}, { connection, concurrency: 2 });

worker.on('completed', (job, returnvalue) => {
  logger.info(`Analytics job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`Analytics job ${job && job.id} failed: ${err && err.message}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await worker.close();
    connection.disconnect();
    logger.info('Analytics worker shut down gracefully');
    process.exit(0);
  } catch (err) {
    logger.error('Error shutting down worker', err);
    process.exit(1);
  }
});
