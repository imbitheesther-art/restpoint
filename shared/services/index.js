"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchMigrations = exports.getMainTenantMigrations = exports.ALL_SERVICE_MIGRATIONS = exports.MigrationService = void 0;
var migration_service_1 = require("./migration-service");
Object.defineProperty(exports, "MigrationService", { enumerable: true, get: function () { return migration_service_1.MigrationService; } });
var all_service_migrations_1 = require("./all-service-migrations");
Object.defineProperty(exports, "ALL_SERVICE_MIGRATIONS", { enumerable: true, get: function () { return all_service_migrations_1.ALL_SERVICE_MIGRATIONS; } });
Object.defineProperty(exports, "getMainTenantMigrations", { enumerable: true, get: function () { return all_service_migrations_1.getMainTenantMigrations; } });
Object.defineProperty(exports, "getBranchMigrations", { enumerable: true, get: function () { return all_service_migrations_1.getBranchMigrations; } });
//# sourceMappingURL=index.js.map