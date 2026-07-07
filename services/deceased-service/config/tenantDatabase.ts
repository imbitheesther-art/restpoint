/**
 * Deceased Service - Database Connection
 * Uses shared dbConfig for multi-tenant support
 */

// @ts-ignore - Shared module loaded at runtime (JavaScript)
const { safeTenantQuery, safeTenantExecute, getTenantDB, query, execute } = require('../../shared/dbConfig');

// Re-export for use in controllers
export { safeTenantQuery, safeTenantExecute, getTenantDB, query, execute };

// Legacy pool interface for compatibility with existing code
export const pool = {
    query: async (sql: string, params?: any[]) => {
        // This is a compatibility wrapper - controllers should migrate to safeTenantQuery
        throw new Error('Direct pool.query() not supported. Use safeTenantQuery() or safeTenantExecute() from dbConfig');
    },
    getConnection: async () => {
        throw new Error('Direct pool.getConnection() not supported. Use safeTenantQuery() or safeTenantExecute() from dbConfig');
    }
};