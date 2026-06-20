import mysql from 'mysql2/promise';
import { DeceasedCharge, BillingResult } from '../models/Billing';

export class BillingCalculator {
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

  async getActiveDeceased(tenantSlug: string): Promise<any[]> {
    const connection = await mysql.createConnection(this.dbConfig);
    try {
      const [rows] = await connection.execute(`
        SELECT id, deceased_id, full_name, date_admitted, status, tenant_slug
        FROM deceased
        WHERE tenant_slug = ? AND status IN ('admitted', 'active')
      `, [tenantSlug]);
      return rows as any[];
    } finally {
      await connection.end();
    }
  }

  async calculateAndSaveCharges(deceasedId: number, tenantSlug: string): Promise<void> {
    const charges = await this.calculateDeceasedCharges(deceasedId, tenantSlug);
    
    const connection = await mysql.createConnection(this.dbConfig);
    try {
      await connection.beginTransaction();

      // Save to daily_billing table
      await connection.execute(`
        INSERT INTO daily_billing
          (deceased_id, tenant_slug, days_admitted, daily_rate, base_charges, additional_charges, total_charge, billing_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), NOW())
        ON DUPLICATE KEY UPDATE
          days_admitted = VALUES(days_admitted),
          base_charges = VALUES(base_charges),
          additional_charges = VALUES(additional_charges),
          total_charge = VALUES(total_charge),
          updated_at = NOW()
      `, [
        charges.deceasedId,
        tenantSlug,
        charges.daysAdmitted,
        charges.dailyRate,
        charges.baseCharges,
        charges.additionalCharges,
        charges.totalDailyCharge
      ]);

      // Update deceased total_mortuary_charge
      await connection.execute(`
        UPDATE deceased
        SET total_mortuary_charge = total_mortuary_charge + ?
        WHERE id = ?
      `, [charges.totalDailyCharge, deceasedId]);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  }

  async calculateDeceasedCharges(deceasedId: number, tenantSlug: string): Promise<DeceasedCharge> {
    const connection = await mysql.createConnection(this.dbConfig);
    try {
      // Get deceased details
      const [deceasedRows] = await connection.execute(`
        SELECT date_admitted, full_name
        FROM deceased
        WHERE id = ? AND tenant_slug = ?
      `, [deceasedId, tenantSlug]);

      if (!Array.isArray(deceasedRows) || deceasedRows.length === 0) {
        throw new Error(`Deceased not found: ${deceasedId}`);
      }

      const deceased = (deceasedRows as any[])[0];
      const daysAdmitted = Math.max(1, Math.ceil((new Date().getTime() - new Date(deceased.date_admitted).getTime()) / (1000 * 60 * 60 * 24)));

      // Get tenant settings
      const [settingsRows] = await connection.execute(`
        SELECT daily_rate, embalming_rate, storage_rate
        FROM tenant_settings
        WHERE tenant_slug = ?
      `, [tenantSlug]);

      let dailyRate = 1500;
      let embalmingRate = 3000;
      let storageRate = 500;

      if (Array.isArray(settingsRows) && settingsRows.length > 0) {
        const settings = (settingsRows as any[])[0];
        dailyRate = settings.daily_rate;
        embalmingRate = settings.embalming_rate;
        storageRate = settings.storage_rate;
      }

      // Calculate charges
      const baseCharges = daysAdmitted * dailyRate;
      const additionalCharges = 0; // TODO: Add embalming/storage logic
      const totalDailyCharge = baseCharges + additionalCharges;

      return {
        deceasedId,
        tenantSlug,
        daysAdmitted,
        dailyRate,
        baseCharges,
        additionalCharges,
        totalDailyCharge,
        calculatedAt: new Date().toISOString()
      };
    } finally {
      await connection.end();
    }
  }

  async needsHourlyUpdate(deceasedId: number): Promise<boolean> {
    // For now, always return true - can be optimized later with last_calculated timestamp
    return true;
  }

  async getBillingHistory(tenantSlug: string, startDate?: string, endDate?: string, limit: number = 100): Promise<any> {
    const connection = await mysql.createConnection(this.dbConfig);
    try {
      let query = `
        SELECT * FROM daily_billing
        WHERE tenant_slug = ?
      `;
      const params: any[] = [tenantSlug];

      if (startDate) {
        query += ' AND billing_date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND billing_date <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY billing_date DESC LIMIT ?';
      params.push(limit);

      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      await connection.end();
    }
  }
}
