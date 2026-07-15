/**
 * @file shared/services/index.ts
 *
 * Barrel export for all shared services.
 *
 * NOTE: Migrations are now managed from the tenant-service.
 * Import MigrationService and ALL_SERVICE_MIGRATIONS from there directly.
 *
 * Usage:
 *   import { MigrationService, ALL_SERVICE_MIGRATIONS } from '../services/tenant-service/services';
 *
 * These re-exports are kept for backward compatibility but will redirect
 * to the canonical location within the tenant service.
 */
export { MigrationService } from './migration-service';
export type { DatabaseConfig, Migration, MigrationResult } from './migration-service';
export { ALL_SERVICE_MIGRATIONS, getMainTenantMigrations, getBranchMigrations } from './all-service-migrations';
//# sourceMappingURL=index.d.ts.map