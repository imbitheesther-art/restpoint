import { lookupTenantDatabase, safeTenantQuery, getTenantDB } from '../../shared/dbConfig';

/**
 * Get tenant database name from tracking database
 * Uses the shared dbConfig to look up the actual database name
 */
export const getTenantDatabaseName = async (tenantSlug: string): Promise<string> => {
  const dbName = await lookupTenantDatabase(tenantSlug);
  if (!dbName) {
    throw new Error(`Tenant database not found for: ${tenantSlug}`);
  }
  return dbName;
};

/**
 * Get a connection pool for a specific tenant database
 * @param tenantDbName - The tenant database name
 * @returns MySQL connection pool
 */
export const getTenantPool = async (tenantDbName: string) => {
  return await getTenantDB(tenantDbName);
};

/**
 * Execute a query on tenant database
 */
export const executeTenantQuery = async (
  tenantDbName: string,
  query: string,
  params: any[] = []
): Promise<any> => {
  const result = await safeTenantQuery(tenantDbName, query, params);
  return result;
};

/**
 * Close all tenant connections
 */
export const closeAllTenantConnections = async (): Promise<void> => {
  // Handled by shared dbConfig
};

export default {
  getTenantDatabaseName,
  getTenantPool,
  executeTenantQuery,
  closeAllTenantConnections
};
