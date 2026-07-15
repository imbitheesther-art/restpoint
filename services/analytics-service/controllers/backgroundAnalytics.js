const asyncHandler = require('express-async-handler');
const AnalyticsService = require('../services/analyticsService');
const backgroundJob = require('../services/backgroundJob');
const { logger } = require('@montezuma/shared-logger');

// Start a background dashboard job
exports.startDashboardBackground = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.body || req.query || {};
    const tenantId = req.tenant?.id || 'default';

    const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const payload = { tenantId, startDate: start, endDate: end };

    const jobId = await backgroundJob.addJob(payload, { removeOnComplete: { age: 3600 }, removeOnFail: { age: 86400 } });

    const statusUrl = `/api/v1/analytics/background/jobs/${jobId}`;

    logger.info(`Enqueued analytics dashboard job ${jobId} for tenant ${tenantId}`);

    res.status(202).json({
      success: true,
      message: 'Analytics job enqueued',
      jobId,
      statusUrl,
    });
  } catch (error) {
    logger.error('Error enqueuing analytics job', error);
    res.status(500).json({ success: false, message: 'Failed to enqueue job', error: error.message });
  }
});

// Get job status/result
exports.getJobStatus = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await backgroundJob.getJob(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.state === 'completed') {
      return res.status(200).json({ success: true, status: job.state, result: job.result, metadata: { processedOn: job.processedOn, finishedOn: job.finishedOn, timestamp: job.timestamp } });
    }

    if (job.state === 'failed') {
      return res.status(500).json({ success: false, status: job.state, error: job.failedReason, metadata: { processedOn: job.processedOn, finishedOn: job.finishedOn, timestamp: job.timestamp } });
    }

    // waiting or active or delayed
    return res.status(202).json({ success: true, status: job.state, metadata: { processedOn: job.processedOn, timestamp: job.timestamp } });
  } catch (error) {
    logger.error('Error fetching job status', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job status', error: error.message });
  }
});
