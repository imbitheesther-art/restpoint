/**
 * @file shared/services/all-service-migrations.ts
 * PRODUCTION-READY: All Service Migrations
 *
 * Centralized registry of all database migrations for all services.
 * Each migration is an object with a unique name and SQL statement.
 *
 * Migrations are organized by service and executed in order.
 * The migration name must be unique across all services.
 *
 * Usage:
 *   import { ALL_SERVICE_MIGRATIONS } from './all-service-migrations';
 *   const result = await migrationService.runTenantMigrations(dbName, ALL_SERVICE_MIGRATIONS, config);
 */
import { Migration } from './migration-service';
declare const TENANT_SERVICE_MIGRATIONS: Migration[];
declare const DECEASED_SERVICE_MIGRATIONS: Migration[];
declare const MARKETPLACE_SERVICE_MIGRATIONS: Migration[];
declare const INVOICE_SERVICE_MIGRATIONS: Migration[];
declare const DOCUMENTS_SERVICE_MIGRATIONS: Migration[];
declare const NOTIFICATIONS_SERVICE_MIGRATIONS: Migration[];
declare const CALENDAR_SERVICE_MIGRATIONS: Migration[];
declare const BODY_CHECKOUT_SERVICE_MIGRATIONS: Migration[];
declare const COFFIN_SERVICE_MIGRATIONS: Migration[];
declare const PORTAL_SERVICE_MIGRATIONS: Migration[];
declare const QRCODE_SERVICE_MIGRATIONS: Migration[];
declare const ANALYTICS_SERVICE_MIGRATIONS: Migration[];
declare const EDOCUMENTS_SERVICE_MIGRATIONS: Migration[];
declare const VISITORS_SERVICE_MIGRATIONS: Migration[];
declare const HEARSE_SERVICE_MIGRATIONS: Migration[];
declare const CHEMICALS_SERVICE_MIGRATIONS: Migration[];
export declare const ALL_SERVICE_MIGRATIONS: Migration[];
export { TENANT_SERVICE_MIGRATIONS, DECEASED_SERVICE_MIGRATIONS, MARKETPLACE_SERVICE_MIGRATIONS, INVOICE_SERVICE_MIGRATIONS, DOCUMENTS_SERVICE_MIGRATIONS, NOTIFICATIONS_SERVICE_MIGRATIONS, CALENDAR_SERVICE_MIGRATIONS, BODY_CHECKOUT_SERVICE_MIGRATIONS, COFFIN_SERVICE_MIGRATIONS, PORTAL_SERVICE_MIGRATIONS, QRCODE_SERVICE_MIGRATIONS, ANALYTICS_SERVICE_MIGRATIONS, EDOCUMENTS_SERVICE_MIGRATIONS, VISITORS_SERVICE_MIGRATIONS, CHEMICALS_SERVICE_MIGRATIONS, HEARSE_SERVICE_MIGRATIONS, };
export declare function getMainTenantMigrations(): Migration[];
export declare function getBranchMigrations(): Migration[];
export declare function getSoftDeleteMigrations(): Migration[];
//# sourceMappingURL=all-service-migrations.d.ts.map