import { Request, Response } from 'express';
import { BillingCalculator } from '../services/billingCalculator';
import { TenantSettingsService } from '../services/tenantSettingsService';

export class BillingController {
  private logger: any;
  private calculator: BillingCalculator;
  private settingsService: TenantSettingsService;

  constructor(logger: any) {
    this.logger = logger;
    this.calculator = new BillingCalculator(logger);
    this.settingsService = new TenantSettingsService(logger);
  }

  async processTenantBilling(tenantSlug: string): Promise<any> {
    const result = {
      success: true,
      tenant: tenantSlug,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as any[],
      timestamp: new Date().toISOString()
    };

    try {
      // Get all active deceased for this tenant
      const deceased = await this.calculator.getActiveDeceased(tenantSlug);
      result.processed = deceased.length;

      for (const d of deceased) {
        try {
          await this.calculator.calculateAndSaveCharges(d.id, tenantSlug);
          result.succeeded++;
          this.logger.info(`✓ Billed ${d.full_name}: KES ${d.total_charge}`);
        } catch (error: any) {
          result.failed++;
          result.errors.push({
            deceasedId: d.id,
            name: d.full_name,
            error: error.message
          });
          this.logger.error(`✗ Failed to bill ${d.full_name}:`, error);
        }
      }

      // Log job execution
      await this.settingsService.logBillingJob('daily_billing', 1, result.processed, result.succeeded, result.failed, result);

    } catch (error: any) {
      result.success = false;
      result.fatalError = error.message;
      this.logger.error(`Fatal error in billing for ${tenantSlug}:`, error);
    }

    return result;
  }

  async processAllTenantsBilling(): Promise<any> {
    const result = {
      success: true,
      totalTenants: 0,
      totalProcessed: 0,
      totalSucceeded: 0,
      totalFailed: 0,
      tenantResults: [] as any[],
      timestamp: new Date().toISOString()
    };

    try {
      const tenants = await this.settingsService.getAllTenants();
      result.totalTenants = tenants.length;

      for (const tenant of tenants) {
        const tenantResult = await this.processTenantBilling(tenant.tenant_slug);
        result.tenantResults.push(tenantResult);
        result.totalProcessed += tenantResult.processed;
        result.totalSucceeded += tenantResult.succeeded;
        result.totalFailed += tenantResult.failed;
      }

      // Log job execution
      await this.settingsService.logBillingJob('daily_billing_all', result.totalTenants, result.totalProcessed, result.totalSucceeded, result.totalFailed, result);

      this.logger.info(`Daily billing completed: ${result.totalSucceeded}/${result.totalProcessed} succeeded across ${result.totalTenants} tenants`);

    } catch (error: any) {
      result.success = false;
      result.fatalError = error.message;
      this.logger.error('Fatal error in daily billing:', error);
    }

    return result;
  }

  async hourlyUpdate(): Promise<any> {
    const result = {
      success: true,
      updated: 0,
      failed: 0,
      timestamp: new Date().toISOString()
    };

    try {
      const tenants = await this.settingsService.getAllTenants();

      for (const tenant of tenants) {
        const deceased = await this.calculator.getActiveDeceased(tenant.tenant_slug);
        
        for (const d of deceased) {
          try {
            // Check if needs update (last calculated more than 1 hour ago)
            const needsUpdate = await this.calculator.needsHourlyUpdate(d.id);
            if (needsUpdate) {
              await this.calculator.calculateAndSaveCharges(d.id, tenant.tenant_slug);
              result.updated++;
            }
          } catch (error: any) {
            result.failed++;
            this.logger.warn(`Hourly update failed for ${d.full_name}:`, error.message);
          }
        }
      }

      this.logger.info(`Hourly update completed: ${result.updated} updated, ${result.failed} failed`);

    } catch (error: any) {
      result.success = false;
      result.error = error.message;
      this.logger.error('Hourly update failed:', error);
    }

    return result;
  }

  async getBillingHistory(tenantSlug: string, startDate?: string, endDate?: string, limit: number = 100): Promise<any> {
    return await this.calculator.getBillingHistory(tenantSlug, startDate, endDate, limit);
  }

  async getJobLogs(limit: number = 50): Promise<any> {
    return await this.settingsService.getJobLogs(limit);
  }
}
