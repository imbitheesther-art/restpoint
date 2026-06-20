/**
 * Minimal Logger for marketplace-service
 * Provides fallback if the more complex logger module is missing
 */
const logLevels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = process.env.LOG_LEVEL || 'info';

function shouldLog(level) {
  return (logLevels[level] || 0) <= (logLevels[currentLevel] || 2);
}

const Logger = {
  error: (msg, data) => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${msg}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
  warn: (msg, data) => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${msg}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
  info: (msg, data) => {
    if (shouldLog('info')) {
      console.log(`[INFO] ${msg}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
  debug: (msg, data) => {
    if (shouldLog('debug')) {
      console.log(`[DEBUG] ${msg}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
};

module.exports = Logger;
