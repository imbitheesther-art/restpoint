import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const logLevel = process.env.LOG_LEVEL || 'info';

// Loki configuration
const lokiUrl = process.env.LOKI_URL || 'http://restpoint_loki:3100';
const serviceName = process.env.SERVICE_NAME || 'unknown-service';

const targets: pino.TransportTargetOptions[] = [];

// Always send to stdout for Docker/Promtail
targets.push({
  target: 'pino/file',
  level: logLevel,
  options: {},
});

// Optionally send directly to Loki via pino-loki
if (process.env.LOKI_ENABLED === 'true') {
  targets.push({
    target: 'pino-loki',
    level: logLevel,
    options: {
      host: lokiUrl,
      labels: {
        service_name: serviceName,
        app: 'restpoint'
      },
      batching: true,
      interval: 5,
    },
  });
}

const transport = pino.transport({
  targets,
});

const logger = pino({
  level: logLevel,
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
}, transport);

export default logger;
export { logger };