/**
 * @file shared/services/all-service-migrations.ts
 * PRODUCTION-READY: All Service Migrations
 *
 * Centralized registry of ALL database migrations for ALL services.
 * Every tenant database receives ALL these migrations.
 *
 * Usage:
 *   import { ALL_TENANT_MIGRATIONS } from './all-service-migrations';
 *   const result = await migrationService.runTenantMigrations(dbName, ALL_TENANT_MIGRATIONS, config);
 *
 * NOTE: Leave Management has its own migration system (leave-service).
 * NOTE: EDocuments has been removed - unnecessary module.
 * NOTE: JWT secrets managed in tenant_tracking DB by Tenant.model.ts.
 */
import { Migration } from './migration-service';
declare const TENANT_SERVICE_MIGRATIONS: Migration[];
declare const DECEASED_SERVICE_MIGRATIONS: Migration[];
declare const BILLING_SERVICE_MIGRATIONS: Migration[];
declare const INVOICE_SERVICE_MIGRATIONS: Migration[];
declare const NOTIFICATIONS_SERVICE_MIGRATIONS: Migration[];
declare const BODY_CHECKOUT_SERVICE_MIGRATIONS: Migration[];
declare const COFFIN_SERVICE_MIGRATIONS: Migration[];
declare const CHEMICALS_SERVICE_MIGRATIONS: Migration[];
declare const HEARSE_SERVICE_MIGRATIONS: Migration[];
declare const WORKSHOP_SERVICE_MIGRATIONS: Migration[];
declare const EXTRA_SERVICES_MIGRATIONS: Migration[];
export declare const ALL_TENANT_MIGRATIONS: Migration[];
export declare const BRANCH_MIGRATIONS: Migration[];
export declare const SINGLE_TENANT_MIGRATIONS: Migration[];
export { TENANT_SERVICE_MIGRATIONS, DECEASED_SERVICE_MIGRATIONS, INVOICE_SERVICE_MIGRATIONS, NOTIFICATIONS_SERVICE_MIGRATIONS, BODY_CHECKOUT_SERVICE_MIGRATIONS, COFFIN_SERVICE_MIGRATIONS, CHEMICALS_SERVICE_MIGRATIONS, HEARSE_SERVICE_MIGRATIONS, WORKSHOP_SERVICE_MIGRATIONS, EXTRA_SERVICES_MIGRATIONS, BILLING_SERVICE_MIGRATIONS, };
export declare function getCoreMigrations(): Migration[];
export declare function getOptionalMigrations(): Migration[];
export declare function getMainTenantMigrations(): Migration[];
export declare function getBranchMigrations(): Migration[];
export declare function getSingleTenantMigrations(): Migration[];
export declare function getAllTenantMigrations(): Migration[];
//# sourceMappingURL=all-service-migrations.d.ts.map