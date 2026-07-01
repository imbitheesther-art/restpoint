/**
 * @file shared/database.js
 * 
 * Compatibility shim for services expecting `require('../../shared/database')`.
 * 
 * NOW POWERED BY: shared/connectionManager.ts — the bulletproof ConnectionManager
 * singleton that provides:
 *   - LRU pool eviction (idle pools closed after 5 min)
 *   - Strict connection caps (max 3 per tenant)
 *   - Keep-alive + 'SELECT 1' validation before every query
 *   - Absolute error isolation (try/catch/finally connection release)
 * 
 * Services that `require('../../shared/database')` get all these benefits
 * automatically with ZERO code changes.
 */
const connectionManager = require('./connectionManager');

// Map to legacy method names expected by services
const safeQuery = connectionManager.safeQuery;
const safeExecute = connectionManager.safeExecute;

// Also export the connection manager itself for direct use
const connectionManagerInstance = connectionManager.default;

module.exports = {
  safeQuery,
  safeExecute,
  // Export the ConnectionManager class and instance for services that need direct access
  ConnectionManager: connectionManager.ConnectionManager,
  connectionManager: connectionManagerInstance,
  // Export getHealth for monitoring endpoints
  getHealth: () => connectionManagerInstance.getHealth(),
  getActiveConnectionCount: () => connectionManagerInstance.getActiveConnectionCount(),
};
