/**
 * Workshop Service - Database Connection
 * Uses shared dbConfig for multi-tenant support
 */

import { safeTenantQuery, safeTenantExecute, getTenantDB } from '../../shared/dbConfig';

// Re-export for use in controllers
export { safeTenantQuery, safeTenantExecute, getTenantDB };

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