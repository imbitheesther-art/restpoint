/**
 * Tenant database configuration wrapper
 * Uses shared config exports
 */
import { pool, safeQuery, safeQueryOne } from '@montezuma/shared-config';

// Helper to get tenant-specific database connection
const getTenantDB = async (tenantSlug: string) => {
  // If you have tenant-specific database connections, implement here
  // Otherwise, use the default pool
  return pool;
};

// Safe tenant query wrapper
const safeTenantQuery = async (query: string, params: any[]) => {
  return safeQuery(query, params);
};

// Safe tenant execute wrapper
const safeTenantExecute = async (query: string, params: any[]) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(query, params);
    return result;
  } finally {
    connection.release();
  }
};

// Create a wrapper that matches the expected interface
export const tenantDB = {
  async getConnection(tenantSlug: string) {
    const dbPool = await getTenantDB(tenantSlug);
    return {
      async execute(sql: string, params: any[]) {
        const [rows] = await dbPool.query(sql, params);
        return [rows];
      },
      release() {
        // Connection is managed by the pool
      }
    };
  }
};

export { getTenantDB, safeTenantQuery, safeTenantExecute };