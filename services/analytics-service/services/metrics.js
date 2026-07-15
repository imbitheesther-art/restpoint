const client = require('prom-client');
const { logger } = require('@montezuma/shared-logger');

// Create a registry specific to this service (default registry can also be used)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Gauges for queue counts by state
const gaugeQueueWaiting = new client.Gauge({ name: 'analytics_queue_waiting', help: 'Number of waiting jobs in analytics queue' });
const gaugeQueueActive = new client.Gauge({ name: 'analytics_queue_active', help: 'Number of active jobs in analytics queue' });
const gaugeQueueDelayed = new client.Gauge({ name: 'analytics_queue_delayed', help: 'Number of delayed jobs in analytics queue' });
const gaugeQueueCompleted = new client.Gauge({ name: 'analytics_queue_completed', help: 'Number of completed jobs in analytics queue' });
const gaugeQueueFailed = new client.Gauge({ name: 'analytics_queue_failed', help: 'Number of failed jobs in analytics queue' });

// Job metrics — labeled by tenant to allow per-tenant observability while warning about cardinality
// WARNING: Adding labels increases Prometheus time-series cardinality. Only use tenant labels if
// you expect a small-to-moderate number of tenants. High cardinality (thousands of tenants)
// can cause performance and storage issues in Prometheus.
const histogramJobDuration = new client.Histogram({ name: 'analytics_job_duration_seconds', help: 'Histogram of analytics job durations in seconds', labelNames: ['tenant'], buckets: [1, 5, 10, 30, 60, 120, 300, 600] });
const counterJobSuccess = new client.Counter({ name: 'analytics_job_success_total', help: 'Total number of successful analytics jobs', labelNames: ['tenant'] });
const counterJobFailure = new client.Counter({ name: 'analytics_job_failure_total', help: 'Total number of failed analytics jobs', labelNames: ['tenant'] });

// Register metrics
register.registerMetric(gaugeQueueWaiting);
register.registerMetric(gaugeQueueActive);
register.registerMetric(gaugeQueueDelayed);
register.registerMetric(gaugeQueueCompleted);
register.registerMetric(gaugeQueueFailed);
register.registerMetric(histogramJobDuration);
register.registerMetric(counterJobSuccess);
register.registerMetric(counterJobFailure);

let analyticsQueue = null;
let monitorInterval = null;

function init(queue, intervalMs = 5000) {
  analyticsQueue = queue;
  // start background interval to poll queue counts
  if (monitorInterval) clearInterval(monitorInterval);
  monitorInterval = setInterval(async () => {
    try {
      if (!analyticsQueue) return;
      // bullmq provides getJobCounts
      const counts = await analyticsQueue.getJobCounts();
      // counts example: { waiting: X, active: Y, completed: Z, failed: A, delayed: B }
      gaugeQueueWaiting.set(counts.waiting || 0);
      gaugeQueueActive.set(counts.active || 0);
      gaugeQueueDelayed.set(counts.delayed || 0);
      gaugeQueueCompleted.set(counts.completed || 0);
      gaugeQueueFailed.set(counts.failed || 0);
    } catch (err) {
      logger.error('Error updating analytics queue metrics', err.message || err);
    }
  }, intervalMs);
}

function _sanitizeTenantLabel(tenant) {
  try {
    if (!tenant) return 'unknown';
    let t = String(tenant);
    // replace characters that may produce odd label values
    t = t.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    // limit length to avoid extremely long label values
    if (t.length > 64) t = t.substring(0, 64);
    return t;
  } catch (err) {
    return 'unknown';
  }
}

function observeJobDuration(seconds, tenant) {
  try {
    const t = _sanitizeTenantLabel(tenant);
    histogramJobDuration.labels(t).observe(seconds);
  } catch (err) {
    logger.error('Error observing job duration', err.message || err);
  }
}

function incrementSuccess(tenant) {
  try { counterJobSuccess.labels(_sanitizeTenantLabel(tenant)).inc(); } catch (err) { logger.error('Error incrementing success counter', err.message || err); }
}

function incrementFailure(tenant) {
  try { counterJobFailure.labels(_sanitizeTenantLabel(tenant)).inc(); } catch (err) { logger.error('Error incrementing failure counter', err.message || err); }
}

async function metricsEndpoint(req, res) {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
  } catch (err) {
    logger.error('Error generating metrics endpoint', err.message || err);
    res.status(500).send(err.message || 'error');
  }
}

module.exports = {
  init,
  observeJobDuration,
  incrementSuccess,
  incrementFailure,
  metricsEndpoint,
  _register: register,
};
