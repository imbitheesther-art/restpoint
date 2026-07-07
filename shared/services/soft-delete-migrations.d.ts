/**
 * @file shared/services/soft-delete-migrations.ts
 * SOFT DELETE MODULE - Prevents hard deletes across all tenant databases
 *
 * This module adds soft delete capabilities to all tables in the system.
 * When a new tenant is created, these migrations automatically add:
 * - is_deleted (BOOLEAN) - marks records as deleted
 * - deleted_at (TIMESTAMP) - records when deletion occurred
 * - deleted_by (INT) - tracks who performed the deletion
 *
 * All DELETE operations are converted to UPDATE operations that set is_deleted = TRUE
 * All SELECT operations automatically filter out is_deleted = TRUE records
 */
import { Migration } from './migration-service';
/**
 * Soft delete migrations for tables that don't already have soft delete support
 * These migrations add is_deleted, deleted_at, and deleted_by columns
 */
export declare const SOFT_DELETE_MIGRATIONS: Migration[];
/**
 * Get all soft delete migrations
 * These should be run AFTER all main table migrations when creating a new tenant
 */
export declare function getSoftDeleteMigrations(): Migration[];
/**
 * Soft delete helper queries that can be used in services
 */
export declare const SOFT_DELETE_QUERIES: {
    /**
     * Soft delete a record
     */
    softDelete: (tableName: string, primaryKey?: string) => string;
    /**
     * Restore a soft-deleted record
     */
    restore: (tableName: string, primaryKey?: string) => string;
    /**
     * Permanently delete a record (use with caution - requires special permission)
     */
    hardDelete: (tableName: string, primaryKey?: string) => string;
    /**
     * Filter query to exclude soft-deleted records
     */
    excludeDeleted: (tableName?: string) => string;
    /**
     * Get only soft-deleted records
     */
    onlyDeleted: (tableName?: string) => string;
    /**
     * Get all records including soft-deleted
     */
    includeDeleted: () => string;
};
//# sourceMappingURL=soft-delete-migrations.d.ts.map