/**
 * Tenant database configuration for per-branch architecture.
 * 
 * Provides a global query executor that automatically resolves the correct database
 * from the x-slug header (single-branch or multi-branch).
 * 
 * USAGE:
 *   const result = await tenantDB.query('SELECT * FROM deceased WHERE id = ?', [id]);
 *   // Automatically uses the correct database based on x-slug header
 */
import mysql from 'mysql2/promise';
import { lookupTenantDatabase, safeTenantQuery, safeTenantExecute } from '../../shared/dbConfig';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

// Cache for branch database resolutions
const branchDbCache = new Map<string, string>();

/**
 * Resolve the correct database from a unified x-slug header.
 * 
 * x-slug can be:
 *   - "pamoja-funeral-home" → single-branch mode (main tenant DB)
 *   - "pamoja-funeral-home-nairobi" → multi-branch mode (branch DB)
 * 
 * @param slug - The slug from x-slug header
 * @returns The database name to use
 */
export async function resolveDatabase(slug: string): Promise<string | null> {
  if (!slug || slug === 'system_shared') {
    console.error('❌ Invalid slug provided');
    return null;
  }
  
  console.log(`🔍 Resolving database for slug: ${slug}`);
  
  // Step 1: Try as a main tenant slug (single-branch mode)
  const mainDbName = await lookupTenantDatabase(slug);
  if (mainDbName) {
    console.log(`📁 Single-branch mode: using main tenant DB: ${mainDbName}`);
    return mainDbName;
  }
  
  // Step 2: Not a main tenant → try branch mode
  // Branch slug format: {tenant_slug}-{branch_name}
  const lastDashIndex = slug.lastIndexOf('-');
  if (lastDashIndex > 0) {
    const possibleTenantSlug = slug.substring(0, lastDashIndex);
    const branchName = slug.substring(lastDashIndex + 1);
    
    console.log(`🔍 Trying branch mode: tenant="${possibleTenantSlug}", branch="${branchName}"`);
    
    const tenantDbName = await lookupTenantDatabase(possibleTenantSlug);
    if (tenantDbName) {
      // Look up branch in tenant's branches table by name
      try {
        const conn = await mysql.createConnection({
          ...DB_CONFIG,
          database: tenantDbName,
        });
        
        try {
          const [rows] = await conn.query(
            `SELECT branch_db_name FROM branches 
             WHERE (branch_slug LIKE ? OR branch_name LIKE ?) AND is_active = TRUE 
             LIMIT 1`,
            [`%${branchName}%`, `%${branchName}%`]
          );
          const list = rows as any[];
          if (list.length > 0) {
            const branchDbName = list[0].branch_db_name;
            console.log(`📁 Multi-branch mode: using branch DB: ${branchDbName}`);
            return branchDbName;
          }
        } finally {
          await conn.end();
        }
      } catch (err) {
        console.warn(`⚠️ Error looking up branch, falling back to main DB: ${tenantDbName}`);
        return tenantDbName;
      }
      
      // Branch not found but tenant exists → use main DB as fallback
      console.warn(`⚠️ Branch "${branchName}" not found, using main DB: ${tenantDbName}`);
      return tenantDbName;
    }
  }
  
  // Step 3: Nothing worked
  console.error(`❌ Could not resolve database for slug: ${slug}`);
  return null;
}

/**
 * Global Tenant Database Executor
 * 
 * Automatically resolves the correct database from x-slug header and executes queries.
 * Use this instead of manually calling lookupTenantDatabase + safeTenantQuery.
 * 
 * @param req - Express request object (reads x-slug header)
 * @param sql - SQL query with ? placeholders
 * @param params - Parameter values for placeholders
 * @returns Array of result rows
 * 
 * @example
 *   const rows = await tenantDB.query(req, 'SELECT * FROM deceased WHERE id = ?', [id]);
 */
export async function query(req: any, sql: string, params: any[] = []): Promise<any[]> {
  const slug = req.headers['x-slug'] || req.headers['x-tenant-slug'];
  if (!slug) {
    throw new Error('Missing x-slug or x-tenant-slug header');
  }
  
  const dbName = await resolveDatabase(slug as string);
  if (!dbName) {
    throw new Error(`No database configured for: ${slug}`);
  }
  
  return safeTenantQuery(dbName, sql, params);
}

/**
 * Global Tenant Database Executor for INSERT/UPDATE/DELETE
 * 
 * @param req - Express request object (reads x-slug header)
 * @param sql - SQL statement with ? placeholders
 * @param params - Parameter values for placeholders
 * @returns ResultSetHeader with insertId, affectedRows, etc.
 */
export async function execute(req: any, sql: string, params: any[] = []): Promise<mysql.ResultSetHeader> {
  const slug = req.headers['x-slug'] || req.headers['x-tenant-slug'];
  if (!slug) {
    throw new Error('Missing x-slug or x-tenant-slug header');
  }
  
  const dbName = await resolveDatabase(slug as string);
  if (!dbName) {
    throw new Error(`No database configured for: ${slug}`);
  }
  
  return safeTenantExecute(dbName, sql, params);
}

/**
 * Get a raw connection to the tenant's database.
 * Caller is responsible for releasing the connection.
 * 
 * @param req - Express request object (reads x-slug header)
 * @returns mysql.Connection
 */
export async function getConnection(req: any): Promise<mysql.Connection> {
  const slug = req.headers['x-slug'] || req.headers['x-tenant-slug'];
  if (!slug) {
    throw new Error('Missing x-slug or x-tenant-slug header');
  }
  
  const dbName = await resolveDatabase(slug as string);
  if (!dbName) {
    throw new Error(`No database configured for: ${slug}`);
  }
  
  const pool = await safeTenantQuery(dbName, 'SELECT 1', []); // Ensure pool exists
  // Get a connection from the pool
  const rootPool = await getRootPool();
  return rootPool.getConnection();
}

// Re-export for backwards compatibility
export { lookupTenantDatabase, safeTenantQuery, safeTenantExecute };

// Import getRootPool for getConnection
import { getRootPool } from '../../shared/dbConfig';