import mysql from 'mysql2/promise';

export class TenantSettingsService {
  private logger: any;
  private dbConfig: any;

  constructor(logger: any) {
    this.logger = logger;
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'tenant_tracking'
    };
  }

  async getAllTenants(): Promise<any[]> {
    const connection = await mysql.createConnection(this.dbConfig);
    try {
      const [rows] = await connection.execute(`
        SELECT tenant_slug, tenant_name, is_active
        FROM tenants
        WHERE is_active = 1
      `);
      return rows as any[];
    } finally {
      await connection.end();
    }
  }

  async getTenantSettings(tenantSlug: string): Promise<any> {
    const connection = await mysql.createConnection(this.dbConfig);
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM tenant_settings WHERE tenant_slug = ?
      `, [tenantSlug]);
      const settings = (rows as any[]);
      return settings.length > 0 ? settings[0] : null;
    } finally {
      await connection.end();
    }
  }

  async logBillingJob(
    jobType: string,
    tenantsProcessed: number,
    totalProcessed: number,
    succeeded: number,
    failed: number,
    details: any
  ): Promise<void> {
    const connection = await mysql.createConnection(this.dbConfig);
    try {
      await connection.execute(`
        INSERT INTO billing_job_logs
          (job_type, tenants_processed, total_processed, succeeded, failed, details, executed_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [jobType, tenantsProcessed, totalProcessed, succeeded, failed, JSON.stringify(details)]);
    } finally {
      await connection.end();
    }
  }

  async getJobLogs(limit: number = 50): Promise<any[]> {
    const connection = await mysql.createConnection(this.dbConfig);
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM billing_job_logs
        ORDER BY executed_at DESC
        LIMIT ?
      `, [limit]);
      return rows as any[];
    } finally {
      await connection.end();
    }
  }

  async updateTenantSettings(tenantSlug: string, settings: any): Promise<void> {
    const connection = await mysql.createConnection(this.dbConfig);
    try {
      await connection.execute(`
        UPDATE tenant_settings
        SET daily_rate = ?, embalming_rate = ?, storage_rate = ?, updated_at = NOW()
        WHERE tenant_slug = ?
      `, [settings.daily_rate, settings.embalming_rate, settings.storage_rate, tenantSlug]);
    } finally {
      await connection.end();
    }
  }
}
