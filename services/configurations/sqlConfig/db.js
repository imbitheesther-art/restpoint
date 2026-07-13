/**
 * Global Database Configuration for Portal Service
 * Multi-Tenant SaaS - Each tenant has their own database
 * Looked up from tenant_tracking.tenants table
 * 
 * ⚠️ DEPRECATED — This file has moved to shared/config/db.js
 * Please update imports from '../../configurations/sqlConfig/db' 
 * to '../../shared/config/db' to ensure correct module resolution.
 * 
 * This shim exists for backward compatibility only.
 */
const migrated = require('../../../shared/config/db');
module.exports = migrated;