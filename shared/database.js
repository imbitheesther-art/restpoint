/**
 * @file shared/database.js
 * 
 * Compatibility shim for services expecting `require('../../shared/database')`.
 * Re-exports from the canonical shared/dbConfig.ts
 * 
 * Maps legacy `safeQuery` → `safeTenantQuery` for services that need it.
 */
const dbConfig = require('./dbConfig');

// Map safeQuery (legacy name) to safeTenantQuery (canonical)
const safeQuery = dbConfig.safeTenantQuery;
const safeExecute = dbConfig.safeTenantExecute;

module.exports = {
  safeQuery,
  safeExecute,
  // Also export everything from dbConfig
  ...dbConfig,
};