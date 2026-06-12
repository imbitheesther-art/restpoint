/**
 * @file shared/services/index.ts
 * 
 * Barrel export for all shared services.
 * Import from this module to access shared service functionality.
 * 
 * Usage:
 *   import { MigrationService, ALL_SERVICE_MIGRATIONS } from '../shared/services';
 */

export { MigrationService } from './migration-service';
export type { DatabaseConfig, Migration, MigrationResult } from './migration-service';

export { ALL_SERVICE_MIGRATIONS } from './all-service-migrations';