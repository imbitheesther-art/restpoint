import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const logLevel = process.env.LOG_LEVEL || 'info';

// Configure Pino logger with high-performance defaults
const logger = pino({
  level: logLevel,
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});

export default logger;
export { logger };