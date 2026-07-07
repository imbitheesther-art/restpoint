/**
 * @file shared/utils/softDelete.ts
 * SOFT DELETE UTILITY MODULE
 *
 * This module provides utilities to enforce soft deletes across all services.
 * It prevents hard deletes and ensures all queries automatically filter out
 * soft-deleted records.
 *
 * Usage:
 * 1. Import SOFT_DELETE_QUERIES for query building
 * 2. Use softDelete() instead of DELETE queries
 * 3. Always add WHERE is_deleted = FALSE to SELECT queries
 * 4. Use restore() to undo soft deletes (admin only)
 */
import { Request, Response, NextFunction } from 'express';
/**
 * SQL Query builders for soft delete operations
 */
export declare const SOFT_DELETE_QUERIES: {
    /**
     * Soft delete a record
     * @param tableName - The table name
     * @param primaryKey - The primary key column name (default: 'id')
     * @returns SQL query string with placeholders
     */
    softDelete: (tableName: string, primaryKey?: string) => string;
    /**
     * Restore a soft-deleted record
     * @param tableName - The table name
     * @param primaryKey - The primary key column name (default: 'id')
     * @returns SQL query string with placeholders
     */
    restore: (tableName: string, primaryKey?: string) => string;
    /**
     * Permanently delete a record (HARD DELETE - use with extreme caution!)
     * This should ONLY be used by super admins and requires special audit logging
     * @param tableName - The table name
     * @param primaryKey - The primary key column name (default: 'id')
     * @returns SQL query string with placeholders
     */
    hardDelete: (tableName: string, primaryKey?: string) => string;
    /**
     * Filter clause to exclude soft-deleted records
     * Use this in WHERE clauses for SELECT queries
     * @param tableName - Optional table name prefix (e.g., 'd.' for deceased)
     * @returns WHERE clause fragment
     */
    excludeDeleted: (tableName?: string) => string;
    /**
     * Filter clause to get ONLY soft-deleted records
     * @param tableName - Optional table name prefix
     * @returns WHERE clause fragment
     */
    onlyDeleted: (tableName?: string) => string;
    /**
     * No filter - includes both deleted and non-deleted records
     * @returns WHERE clause fragment that's always true
     */
    includeDeleted: () => string;
};
/**
 * Soft Delete Service - Provides high-level soft delete operations
 */
export declare class SoftDeleteService {
    /**
     * Soft delete a record with audit logging
     */
    static softDelete(connection: any, tableName: string, recordId: any, deletedBy: number, primaryKey?: string): Promise<boolean>;
    /**
     * Restore a soft-deleted record
     */
    static restore(connection: any, tableName: string, recordId: any, primaryKey?: string): Promise<boolean>;
    /**
     * Permanently delete a record (HARD DELETE)
     * WARNING: This bypasses soft delete and permanently removes data!
     * Only use for compliance/legal requirements with proper authorization
     */
    static hardDelete(connection: any, tableName: string, recordId: any, primaryKey?: string): Promise<boolean>;
    /**
     * Check if a record is soft-deleted
     */
    static isDeleted(connection: any, tableName: string, recordId: any, primaryKey?: string): Promise<boolean>;
    /**
     * Get soft-deleted records
     */
    static getDeletedRecords(connection: any, tableName: string, limit?: number): Promise<any[]>;
    /**
     * Permanently delete multiple records (HARD DELETE - use with caution!)
     * This is for cleanup operations only
     */
    static hardDeleteMultiple(connection: any, tableName: string, recordIds: any[], primaryKey?: string): Promise<number>;
}
/**
 * Middleware to prevent hard DELETE requests
 * This middleware intercepts DELETE requests and returns an error
 * directing users to use soft delete instead
 */
export declare function preventHardDelete(req: Request, res: Response, next: NextFunction): void;
/**
 * Middleware to automatically filter out soft-deleted records
 * This adds WHERE is_deleted = FALSE to all queries
 * Note: This is a conceptual middleware - actual implementation depends on your ORM/query builder
 */
export declare function filterDeletedRecords(req: Request, res: Response, next: NextFunction): void;
/**
 * Helper to build SELECT query with automatic soft delete filter
 */
export declare function buildSelectQuery(tableName: string, columns?: string, whereClause?: string, includeDeleted?: boolean): string;
/**
 * Helper to build UPDATE query that respects soft delete
 * Prevents updates to soft-deleted records
 */
export declare function buildUpdateQuery(tableName: string, updates: Record<string, any>, whereClause: string, allowUpdateDeleted?: boolean): {
    query: string;
    params: any[];
};
/**
 * Audit logger for soft delete operations
 */
export declare class SoftDeleteAuditLogger {
    /**
     * Log soft delete operation
     */
    static logSoftDelete(connection: any, userId: number, tableName: string, recordId: any, recordData: any): Promise<void>;
    /**
     * Log restore operation
     */
    static logRestore(connection: any, userId: number, tableName: string, recordId: any): Promise<void>;
    /**
     * Log hard delete operation (CRITICAL - requires special logging)
     */
    static logHardDelete(connection: any, userId: number, tableName: string, recordId: any, reason: string): Promise<void>;
}
/**
 * Migration helper to add soft delete columns to existing tables
 * Use this for existing databases that need soft delete support
 */
export declare class SoftDeleteMigrationHelper {
    /**
     * Add soft delete columns to a table
     */
    static addSoftDeleteColumns(connection: any, tableName: string): Promise<void>;
    /**
     * Check if table has soft delete columns
     */
    static hasSoftDeleteColumns(connection: any, tableName: string): Promise<boolean>;
}
declare const _default: {
    SOFT_DELETE_QUERIES: {
        /**
         * Soft delete a record
         * @param tableName - The table name
         * @param primaryKey - The primary key column name (default: 'id')
         * @returns SQL query string with placeholders
         */
        softDelete: (tableName: string, primaryKey?: string) => string;
        /**
         * Restore a soft-deleted record
         * @param tableName - The table name
         * @param primaryKey - The primary key column name (default: 'id')
         * @returns SQL query string with placeholders
         */
        restore: (tableName: string, primaryKey?: string) => string;
        /**
         * Permanently delete a record (HARD DELETE - use with extreme caution!)
         * This should ONLY be used by super admins and requires special audit logging
         * @param tableName - The table name
         * @param primaryKey - The primary key column name (default: 'id')
         * @returns SQL query string with placeholders
         */
        hardDelete: (tableName: string, primaryKey?: string) => string;
        /**
         * Filter clause to exclude soft-deleted records
         * Use this in WHERE clauses for SELECT queries
         * @param tableName - Optional table name prefix (e.g., 'd.' for deceased)
         * @returns WHERE clause fragment
         */
        excludeDeleted: (tableName?: string) => string;
        /**
         * Filter clause to get ONLY soft-deleted records
         * @param tableName - Optional table name prefix
         * @returns WHERE clause fragment
         */
        onlyDeleted: (tableName?: string) => string;
        /**
         * No filter - includes both deleted and non-deleted records
         * @returns WHERE clause fragment that's always true
         */
        includeDeleted: () => string;
    };
    SoftDeleteService: typeof SoftDeleteService;
    preventHardDelete: typeof preventHardDelete;
    filterDeletedRecords: typeof filterDeletedRecords;
    buildSelectQuery: typeof buildSelectQuery;
    buildUpdateQuery: typeof buildUpdateQuery;
    SoftDeleteAuditLogger: typeof SoftDeleteAuditLogger;
    SoftDeleteMigrationHelper: typeof SoftDeleteMigrationHelper;
};
export default _default;
//# sourceMappingURL=softDelete.d.ts.map