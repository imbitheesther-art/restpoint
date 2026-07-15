import { Migration } from './migration-service';
/**
 * Soft delete migrations for tables that don't already have soft delete support
 * These migrations add is_deleted, deleted_at, and deleted_by columns
 */
export declare const SOFT_DELETE_MIGRATIONS: Migration[];
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