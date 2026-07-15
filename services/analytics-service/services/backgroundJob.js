const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const { logger } = require('@montezuma/shared-logger');

// Redis connection URL (env override)
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL);

// Create a BullMQ queue for analytics jobs
const analyticsQueue = new Queue('analytics-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 60000 },
  },
});

// Wrapper functions
async function addJob(data, opts = {}) {
  // use a named job type
  const job = await analyticsQueue.add('analytics-job', data, opts);
  return job.id.toString();
}

async function getJob(jobId) {
  const job = await analyticsQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  const returnValue = job.returnvalue || null;
  const failedReason = job.failedReason || null;

  return {
    id: job.id.toString(),
    state,
    data: job.data,
    result: returnValue,
    failedReason,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn,
    timestamp: job.timestamp,
  };
}

// Cleanup helper: remove old completed/failed jobs (grace in seconds)
async function cleanupOldJobs(completedGraceSeconds = 3600, failedGraceSeconds = 86400) {
  try {
    const completedGraceMs = completedGraceSeconds * 1000;
    const failedGraceMs = failedGraceSeconds * 1000;
    // clean completed jobs older than completedGraceMs
    await analyticsQueue.clean(completedGraceMs, 'completed');
    // clean failed jobs older than failedGraceMs
    await analyticsQueue.clean(failedGraceMs, 'failed');
  } catch (err) {
    logger.error('Error cleaning old jobs', err);
  }
}

// Schedule periodic cleanup if enabled
if (process.env.ENABLE_JOB_CLEANUP !== 'false') {
  const cleanupIntervalMs = parseInt(process.env.JOB_CLEANUP_INTERVAL_MS || (60 * 60 * 1000), 10); // default 1 hour
  setInterval(() => {
    cleanupOldJobs().catch(err => logger.error('cleanupOldJobs error', err));
  }, cleanupIntervalMs);
}

module.exports = {
  queue: analyticsQueue,
  addJob,
  getJob,
  cleanupOldJobs,
};
