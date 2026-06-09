import mysql from 'mysql2/promise';
import { createPool } from 'mysql2/promise';

const connectionPools: Map<string, any> = new Map();

class TenantDatabase {
  private masterPool: any;

  constructor() {
    this.initMasterPool();
  }

  private initMasterPool() {
    this.masterPool = createPool({
      host: process.env.MASTER_DB_HOST || 'localhost',
      user: process.env.MASTER_DB_USER || 'root',
      password: process.env.MASTER_DB_PASSWORD || 'root',
      database: process.env.MASTER_DB_NAME || 'master_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  async getConnection(tenantSlug: string | number) {
    // Get tenant database name from master DB
    let dbName: string;

    if (typeof tenantSlug === 'number') {
      // If it's a number (tenant_id), fetch from master DB
      const masterConn = await this.masterPool.getConnection();
      const [rows] = await masterConn.query(
        'SELECT db_name FROM tenants WHERE tenant_id = ?',
        [tenantSlug]
      );
      masterConn.release();

      if (!rows || rows.length === 0) {
        throw new Error(`Tenant not found: ${tenantSlug}`);
      }
      dbName = rows[0].db_name;
    } else {
      // If it's a string (tenant_slug), fetch from master DB
      const masterConn = await this.masterPool.getConnection();
      const [rows] = await masterConn.query(
        'SELECT db_name FROM tenants WHERE tenant_slug = ?',
        [tenantSlug]
      );
      masterConn.release();

      if (!rows || rows.length === 0) {
        throw new Error(`Tenant not found: ${tenantSlug}`);
      }
      dbName = rows[0].db_name;
    }

    // Get or create connection pool for this tenant
    if (!connectionPools.has(dbName)) {
      const pool = createPool({
        host: process.env.MASTER_DB_HOST || 'localhost',
        user: process.env.MASTER_DB_USER || 'root',
        password: process.env.MASTER_DB_PASSWORD || 'root',
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      connectionPools.set(dbName, pool);
    }

    return await connectionPools.get(dbName)!.getConnection();
  }

  async query(sql: string, params: any[], tenantSlug: string | number) {
    const conn = await this.getConnection(String(tenantSlug));
    try {
      return await conn.query(sql, params);
    } finally {
      conn.release();
    }
  }
}

export const tenantDB = new TenantDatabase();
