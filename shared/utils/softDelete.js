"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoftDeleteMigrationHelper = exports.SoftDeleteAuditLogger = exports.SoftDeleteService = exports.SOFT_DELETE_QUERIES = void 0;
exports.preventHardDelete = preventHardDelete;
exports.filterDeletedRecords = filterDeletedRecords;
exports.buildSelectQuery = buildSelectQuery;
exports.buildUpdateQuery = buildUpdateQuery;
/**
 * SQL Query builders for soft delete operations
 */
exports.SOFT_DELETE_QUERIES = {
    /**
     * Soft delete a record
     * @param tableName - The table name
     * @param primaryKey - The primary key column name (default: 'id')
     * @returns SQL query string with placeholders
     */
    softDelete: (tableName, primaryKey = 'id') => `UPDATE ${tableName} SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ? WHERE ${primaryKey} = ? AND is_deleted = FALSE`,
    /**
     * Restore a soft-deleted record
     * @param tableName - The table name
     * @param primaryKey - The primary key column name (default: 'id')
     * @returns SQL query string with placeholders
     */
    restore: (tableName, primaryKey = 'id') => `UPDATE ${tableName} SET is_deleted = FALSE, deleted_at = NULL, deleted_by = NULL WHERE ${primaryKey} = ? AND is_deleted = TRUE`,
    /**
     * Permanently delete a record (HARD DELETE - use with extreme caution!)
     * This should ONLY be used by super admins and requires special audit logging
     * @param tableName - The table name
     * @param primaryKey - The primary key column name (default: 'id')
     * @returns SQL query string with placeholders
     */
    hardDelete: (tableName, primaryKey = 'id') => `DELETE FROM ${tableName} WHERE ${primaryKey} = ?`,
    /**
     * Filter clause to exclude soft-deleted records
     * Use this in WHERE clauses for SELECT queries
     * @param tableName - Optional table name prefix (e.g., 'd.' for deceased)
     * @returns WHERE clause fragment
     */
    excludeDeleted: (tableName = '') => `${tableName ? tableName + '.' : ''}is_deleted = FALSE`,
    /**
     * Filter clause to get ONLY soft-deleted records
     * @param tableName - Optional table name prefix
     * @returns WHERE clause fragment
     */
    onlyDeleted: (tableName = '') => `${tableName ? tableName + '.' : ''}is_deleted = TRUE`,
    /**
     * No filter - includes both deleted and non-deleted records
     * @returns WHERE clause fragment that's always true
     */
    includeDeleted: () => '1=1',
};
/**
 * Soft Delete Service - Provides high-level soft delete operations
 */
class SoftDeleteService {
    /**
     * Soft delete a record with audit logging
     */
    static async softDelete(connection, tableName, recordId, deletedBy, primaryKey = 'id') {
        try {
            const query = exports.SOFT_DELETE_QUERIES.softDelete(tableName, primaryKey);
            const [result] = await connection.query(query, [deletedBy, recordId]);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.error(`Soft delete failed for ${tableName} ${primaryKey}=${recordId}:`, error);
            throw error;
        }
    }
    /**
     * Restore a soft-deleted record
     */
    static async restore(connection, tableName, recordId, primaryKey = 'id') {
        try {
            const query = exports.SOFT_DELETE_QUERIES.restore(tableName, primaryKey);
            const [result] = await connection.query(query, [recordId]);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.error(`❌ Restore failed for ${tableName} ${primaryKey}=${recordId}:`, error);
            throw error;
        }
    }
    /**
     * Permanently delete a record (HARD DELETE)
     * WARNING: This bypasses soft delete and permanently removes data!
     * Only use for compliance/legal requirements with proper authorization
     */
    static async hardDelete(connection, tableName, recordId, primaryKey = 'id') {
        try {
            const query = exports.SOFT_DELETE_QUERIES.hardDelete(tableName, primaryKey);
            const [result] = await connection.query(query, [recordId]);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.error(`❌ Hard delete failed for ${tableName} ${primaryKey}=${recordId}:`, error);
            throw error;
        }
    }
    /**
     * Check if a record is soft-deleted
     */
    static async isDeleted(connection, tableName, recordId, primaryKey = 'id') {
        try {
            const [rows] = await connection.query(`SELECT is_deleted FROM ${tableName} WHERE ${primaryKey} = ? LIMIT 1`, [recordId]);
            const records = rows;
            return records.length > 0 && records[0].is_deleted === true;
        }
        catch (error) {
            console.error(`❌ Check delete status failed for ${tableName}:`, error);
            return false;
        }
    }
    /**
     * Get soft-deleted records
     */
    static async getDeletedRecords(connection, tableName, limit = 100) {
        try {
            const [rows] = await connection.query(`SELECT * FROM ${tableName} WHERE is_deleted = TRUE ORDER BY deleted_at DESC LIMIT ?`, [limit]);
            return rows;
        }
        catch (error) {
            console.error(`❌ Get deleted records failed for ${tableName}:`, error);
            return [];
        }
    }
    /**
     * Permanently delete multiple records (HARD DELETE - use with caution!)
     * This is for cleanup operations only
     */
    static async hardDeleteMultiple(connection, tableName, recordIds, primaryKey = 'id') {
        try {
            if (recordIds.length === 0)
                return 0;
            const placeholders = recordIds.map(() => '?').join(',');
            const query = `DELETE FROM ${tableName} WHERE ${primaryKey} IN (${placeholders}) AND is_deleted = TRUE`;
            const [result] = await connection.query(query, recordIds);
            return result.affectedRows;
        }
        catch (error) {
            console.error(`❌ Batch hard delete failed for ${tableName}:`, error);
            throw error;
        }
    }
}
exports.SoftDeleteService = SoftDeleteService;
/**
 * Middleware to prevent hard DELETE requests
 * This middleware intercepts DELETE requests and returns an error
 * directing users to use soft delete instead
 */
function preventHardDelete(req, res, next) {
    if (req.method === 'DELETE') {
        res.status(403).json({
            success: false,
            message: 'Hard deletes are not allowed. Use soft delete (PATCH /soft-delete) instead.',
            error: 'HARD_DELETE_NOT_ALLOWED',
            hint: 'Send a PATCH request to /soft-delete/:id to soft delete this record'
        });
        return;
    }
    next();
}
/**
 * Middleware to automatically filter out soft-deleted records
 * This adds WHERE is_deleted = FALSE to all queries
 * Note: This is a conceptual middleware - actual implementation depends on your ORM/query builder
 */
function filterDeletedRecords(req, res, next) {
    // This would be implemented at the query builder level
    // For raw SQL, you need to manually add WHERE is_deleted = FALSE
    next();
}
/**
 * Helper to build SELECT query with automatic soft delete filter
 */
function buildSelectQuery(tableName, columns = '*', whereClause = '', includeDeleted = false) {
    const filter = includeDeleted ? '1=1' : exports.SOFT_DELETE_QUERIES.excludeDeleted(tableName);
    let query = `SELECT ${columns} FROM ${tableName}`;
    const conditions = [];
    if (whereClause) {
        conditions.push(whereClause);
    }
    if (!includeDeleted) {
        conditions.push(filter);
    }
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }
    return query;
}
/**
 * Helper to build UPDATE query that respects soft delete
 * Prevents updates to soft-deleted records
 */
function buildUpdateQuery(tableName, updates, whereClause, allowUpdateDeleted = false) {
    const setClauses = [];
    const params = [];
    for (const [key, value] of Object.entries(updates)) {
        setClauses.push(`${key} = ?`);
        params.push(value);
    }
    const conditions = [whereClause];
    if (!allowUpdateDeleted) {
        conditions.push(exports.SOFT_DELETE_QUERIES.excludeDeleted(tableName));
    }
    const query = `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE ${conditions.join(' AND ')}`;
    return { query, params };
}
/**
 * Audit logger for soft delete operations
 */
class SoftDeleteAuditLogger {
    /**
     * Log soft delete operation
     */
    static async logSoftDelete(connection, userId, tableName, recordId, recordData) {
        try {
            await connection.query(`INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address)
                 VALUES (?, ?, ?, ?, ?, ?)`, [
                userId,
                'SOFT_DELETE',
                tableName,
                String(recordId),
                JSON.stringify({ tableName, recordId, previousData: recordData }),
                null // IP address would come from request
            ]);
        }
        catch (error) {
            console.error('Failed to log soft delete audit:', error);
            // Don't throw - audit logging should not break the main operation
        }
    }
    /**
     * Log restore operation
     */
    static async logRestore(connection, userId, tableName, recordId) {
        try {
            await connection.query(`INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address)
                 VALUES (?, ?, ?, ?, ?, ?)`, [
                userId,
                'RESTORE',
                tableName,
                String(recordId),
                JSON.stringify({ tableName, recordId }),
                null
            ]);
        }
        catch (error) {
            console.error('Failed to log restore audit:', error);
        }
    }
    /**
     * Log hard delete operation (CRITICAL - requires special logging)
     */
    static async logHardDelete(connection, userId, tableName, recordId, reason) {
        try {
            await connection.query(`INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address)
                 VALUES (?, ?, ?, ?, ?, ?)`, [
                userId,
                'HARD_DELETE',
                tableName,
                String(recordId),
                JSON.stringify({
                    tableName,
                    recordId,
                    reason,
                    warning: 'PERMANENT DELETION - Cannot be undone'
                }),
                null
            ]);
        }
        catch (error) {
            console.error('Failed to log hard delete audit:', error);
        }
    }
}
exports.SoftDeleteAuditLogger = SoftDeleteAuditLogger;
/**
 * Migration helper to add soft delete columns to existing tables
 * Use this for existing databases that need soft delete support
 */
class SoftDeleteMigrationHelper {
    /**
     * Add soft delete columns to a table
     */
    static async addSoftDeleteColumns(connection, tableName) {
        try {
            await connection.query(`
                ALTER TABLE ${tableName}
                ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
                ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
                ADD INDEX idx_is_deleted (is_deleted),
                ADD INDEX idx_deleted_at (deleted_at)
            `);
            console.log(`✅ Soft delete columns added to ${tableName}`);
        }
        catch (error) {
            console.error(`❌ Failed to add soft delete columns to ${tableName}:`, error);
            throw error;
        }
    }
    /**
     * Check if table has soft delete columns
     */
    static async hasSoftDeleteColumns(connection, tableName) {
        try {
            const [columns] = await connection.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = ? 
                AND COLUMN_NAME IN ('is_deleted', 'deleted_at', 'deleted_by')
            `, [tableName]);
            const columnList = columns;
            return columnList.length === 3;
        }
        catch (error) {
            console.error(`❌ Failed to check soft delete columns for ${tableName}:`, error);
            return false;
        }
    }
}
exports.SoftDeleteMigrationHelper = SoftDeleteMigrationHelper;
exports.default = {
    SOFT_DELETE_QUERIES: exports.SOFT_DELETE_QUERIES,
    SoftDeleteService,
    preventHardDelete,
    filterDeletedRecords,
    buildSelectQuery,
    buildUpdateQuery,
    SoftDeleteAuditLogger,
    SoftDeleteMigrationHelper
};
//# sourceMappingURL=softDelete.js.map