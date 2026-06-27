# Soft Delete Implementation Example

This document shows how to implement soft delete in your services.

## Example: Deceased Service

### 1. Update Controller

```typescript
// services/deceased-service/controllers/deceasedController.ts
import { Request, Response } from 'express';
import * as mysql from 'mysql2/promise';
import { SoftDeleteService, SOFT_DELETE_QUERIES, buildSelectQuery, SoftDeleteAuditLogger } from '../../../shared/utils/softDelete';

export class DeceasedController {
    /**
     * Get all deceased records (excludes soft-deleted by default)
     */
    async getDeceased(req: Request, res: Response): Promise<void> {
        try {
            const tenantDbName = req.headers['x-tenant-db'] as string;
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: tenantDbName
            });

            try {
                // ✅ GOOD: Automatically excludes soft-deleted records
                const query = buildSelectQuery(
                    'deceased',
                    '*',
                    'status = ?',
                    false  // exclude deleted records
                );

                const [rows] = await connection.query(query, ['active']);
                const deceasedList = rows as any[];

                res.json({
                    success: true,
                    data: deceasedList,
                    count: deceasedList.length
                });
            } finally {
                await connection.end();
            }
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch deceased records',
                error: error.message
            });
        }
    }

    /**
     * Soft delete a deceased record
     */
    async softDeleteDeceased(req: Request, res: Response): Promise<void> {
        try {
            const tenantDbName = req.headers['x-tenant-db'] as string;
            const deceasedId = req.params.id;
            const userId = req.user.userId; // From auth middleware

            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: tenantDbName
            });

            try {
                // Get record data before deletion for audit log
                const [existingRows] = await connection.query(
                    'SELECT * FROM deceased WHERE deceased_id = ? AND is_deleted = FALSE',
                    [deceasedId]
                );
                const existingRecords = existingRows as any[];

                if (existingRecords.length === 0) {
                    res.status(404).json({
                        success: false,
                        message: 'Deceased record not found or already deleted'
                    });
                    return;
                }

                const recordData = existingRecords[0];

                // ✅ GOOD: Use soft delete instead of hard delete
                const deleted = await SoftDeleteService.softDelete(
                    connection,
                    'deceased',
                    deceasedId,
                    userId,
                    'deceased_id'
                );

                if (!deleted) {
                    res.status(404).json({
                        success: false,
                        message: 'Failed to soft delete - record not found'
                    });
                    return;
                }

                // Log the soft delete operation
                await SoftDeleteAuditLogger.logSoftDelete(
                    connection,
                    userId,
                    'deceased',
                    deceasedId,
                    recordData
                );

                res.json({
                    success: true,
                    message: 'Deceased record soft deleted successfully',
                    data: {
                        deceased_id: deceasedId,
                        deleted_at: new Date(),
                        deleted_by: userId
                    }
                });
            } finally {
                await connection.end();
            }
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to soft delete deceased record',
                error: error.message
            });
        }
    }

    /**
     * Restore a soft-deleted deceased record
     */
    async restoreDeceased(req: Request, res: Response): Promise<void> {
        try {
            const tenantDbName = req.headers['x-tenant-db'] as string;
            const deceasedId = req.params.id;
            const userId = req.user.userId;

            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: tenantDbName
            });

            try {
                // Check if record is soft-deleted
                const isDeleted = await SoftDeleteService.isDeleted(
                    connection,
                    'deceased',
                    deceasedId,
                    'deceased_id'
                );

                if (!isDeleted) {
                    res.status(400).json({
                        success: false,
                        message: 'Record is not deleted'
                    });
                    return;
                }

                // Restore the record
                const restored = await SoftDeleteService.restore(
                    connection,
                    'deceased',
                    deceasedId,
                    'deceased_id'
                );

                if (!restored) {
                    res.status(404).json({
                        success: false,
                        message: 'Failed to restore record'
                    });
                    return;
                }

                // Log the restore operation
                await SoftDeleteAuditLogger.logRestore(
                    connection,
                    userId,
                    'deceased',
                    deceasedId
                );

                res.json({
                    success: true,
                    message: 'Deceased record restored successfully'
                });
            } finally {
                await connection.end();
            }
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to restore deceased record',
                error: error.message
            });
        }
    }

    /**
     * Get soft-deleted records (Admin only)
     */
    async getDeletedDeceased(req: Request, res: Response): Promise<void> {
        try {
            const tenantDbName = req.headers['x-tenant-db'] as string;
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: tenantDbName
            });

            try {
                // ✅ Get only soft-deleted records
                const deletedRecords = await SoftDeleteService.getDeletedRecords(
                    connection,
                    'deceased',
                    100
                );

                res.json({
                    success: true,
                    data: deletedRecords,
                    count: deletedRecords.length
                });
            } finally {
                await connection.end();
            }
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch deleted records',
                error: error.message
            });
        }
    }

    /**
     * ❌ BAD EXAMPLE - Don't do this!
     * Hard delete is blocked by middleware, but showing for reference
     */
    async hardDeleteDeceased(req: Request, res: Response): Promise<void> {
        // This should never be reached if preventHardDelete middleware is used
        res.status(403).json({
            success: false,
            message: 'Hard deletes are not allowed'
        });
    }
}
```

### 2. Update Routes

```typescript
// services/deceased-service/routes/deceasedRoutes.ts
import { Router } from 'express';
import { DeceasedController } from '../controllers/deceasedController';
import { preventHardDelete } from '../../../shared/utils/softDelete';

const router = Router();
const controller = new DeceasedController();

// ✅ GOOD: Regular GET - automatically excludes deleted records
router.get('/deceased', controller.getDeceased);

// ✅ GOOD: Soft delete endpoint
router.patch('/deceased/soft-delete/:id', controller.softDeleteDeceased);

// ✅ GOOD: Restore endpoint
router.patch('/deceased/restore/:id', controller.restoreDeceased);

// ✅ GOOD: Get deleted records (admin only)
router.get('/deceased/deleted', controller.getDeletedDeceased);

// ❌ BLOCKED: This will return 403 error
router.delete('/deceased/:id', preventHardDelete, controller.hardDeleteDeceased);

export default router;
```

### 3. Update Service Layer (Optional)

```typescript
// services/deceased-service/services/deceasedService.ts
import * as mysql from 'mysql2/promise';
import { SoftDeleteService, buildSelectQuery } from '../../../shared/utils/softDelete';

export class DeceasedService {
    /**
     * Get deceased with custom filters
     */
    static async getDeceased(
        connection: mysql.Connection,
        filters: {
            status?: string;
            branchId?: number;
            searchTerm?: string;
            includeDeleted?: boolean;
        } = {}
    ): Promise<any[]> {
        const conditions: string[] = [];
        const params: any[] = [];

        // Build WHERE clause
        if (filters.status) {
            conditions.push('status = ?');
            params.push(filters.status);
        }

        if (filters.branchId) {
            conditions.push('branch_id = ?');
            params.push(filters.branchId);
        }

        if (filters.searchTerm) {
            conditions.push('(full_name LIKE ? OR admission_number LIKE ?)');
            params.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
        }

        const whereClause = conditions.join(' AND ');

        // ✅ GOOD: Use buildSelectQuery helper
        const query = buildSelectQuery(
            'deceased',
            '*',
            whereClause,
            filters.includeDeleted || false  // Don't include deleted by default
        );

        const [rows] = await connection.query(query, params);
        return rows as any[];
    }

    /**
     * Create deceased record
     */
    static async createDeceased(connection: mysql.Connection, data: any): Promise<string> {
        const deceasedId = data.admission_number || `D${Date.now()}`;
        
        const [result] = await connection.query(
            `INSERT INTO deceased 
             (deceased_id, full_name, email, phone_number, date_of_death, date_admitted, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                deceasedId,
                data.full_name,
                data.email || null,
                data.phone_number || null,
                data.date_of_death || null,
                data.date_admitted || new Date(),
                'active'
            ]
        );

        return deceasedId;
    }

    /**
     * Update deceased record
     */
    static async updateDeceased(
        connection: mysql.Connection,
        deceasedId: string,
        updates: any
    ): Promise<boolean> {
        // ✅ GOOD: buildUpdateQuery automatically adds is_deleted = FALSE
        const { query, params } = buildUpdateQuery(
            'deceased',
            updates,
            'deceased_id = ?',
            false  // Don't allow updates to deleted records
        );

        const [result] = await connection.query(query, [...params, deceasedId]);
        return (result as any).affectedRows > 0;
    }
}
```

## Example: Users Service

### 1. Controller with Soft Delete

```typescript
// services/auth-service/controllers/userController.ts
import { Request, Response } from 'express';
import * as mysql from 'mysql2/promise';
import { SoftDeleteService, SoftDeleteAuditLogger } from '../../../shared/utils/softDelete';

export class UserController {
    /**
     * Soft delete a user (Admin only)
     */
    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const tenantDbName = req.headers['x-tenant-db'] as string;
            const userId = req.params.id;
            const currentUserId = req.user.userId;
            const currentUserRole = req.user.role;

            // Only admins can delete users
            if (currentUserRole !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Only admins can delete users'
                });
                return;
            }

            // Prevent self-deletion
            if (parseInt(userId) === currentUserId) {
                res.status(400).json({
                    success: false,
                    message: 'Cannot delete your own account'
                });
                return;
            }

            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: tenantDbName
            });

            try {
                // Get user data before deletion
                const [userRows] = await connection.query(
                    'SELECT * FROM users WHERE user_id = ? AND is_deleted = FALSE',
                    [userId]
                );
                const users = userRows as any[];

                if (users.length === 0) {
                    res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                    return;
                }

                const userData = users[0];

                // Soft delete the user
                const deleted = await SoftDeleteService.softDelete(
                    connection,
                    'users',
                    userId,
                    currentUserId,
                    'user_id'
                );

                if (!deleted) {
                    res.status(404).json({
                        success: false,
                        message: 'Failed to delete user'
                    });
                    return;
                }

                // Also soft delete user's refresh tokens
                await connection.query(
                    'UPDATE refresh_tokens SET is_deleted = TRUE, deleted_at = NOW() WHERE user_id = ? AND is_deleted = FALSE',
                    [userId]
                );

                // Log the deletion
                await SoftDeleteAuditLogger.logSoftDelete(
                    connection,
                    currentUserId,
                    'users',
                    userId,
                    { email: userData.email, full_name: userData.full_name, role: userData.role }
                );

                res.json({
                    success: true,
                    message: 'User deleted successfully'
                });
            } finally {
                await connection.end();
            }
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete user',
                error: error.message
            });
        }
    }

    /**
     * Restore a soft-deleted user (Admin only)
     */
    async restoreUser(req: Request, res: Response): Promise<void> {
        try {
            const tenantDbName = req.headers['x-tenant-db'] as string;
            const userId = req.params.id;
            const currentUserId = req.user.userId;

            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: tenantDbName
            });

            try {
                // Restore user
                const restored = await SoftDeleteService.restore(
                    connection,
                    'users',
                    userId,
                    'user_id'
                );

                if (!restored) {
                    res.status(404).json({
                        success: false,
                        message: 'User not found or not deleted'
                    });
                    return;
                }

                // Restore user's refresh tokens
                await connection.query(
                    'UPDATE refresh_tokens SET is_deleted = FALSE, deleted_at = NULL WHERE user_id = ? AND is_deleted = TRUE',
                    [userId]
                );

                // Log the restore
                await SoftDeleteAuditLogger.logRestore(
                    connection,
                    currentUserId,
                    'users',
                    userId
                );

                res.json({
                    success: true,
                    message: 'User restored successfully'
                });
            } finally {
                await connection.end();
            }
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to restore user',
                error: error.message
            });
        }
    }
}
```

## Key Points

### ✅ DO:
1. **Always filter deleted records**: Use `buildSelectQuery()` or add `AND is_deleted = FALSE`
2. **Use soft delete**: Call `SoftDeleteService.softDelete()` instead of DELETE queries
3. **Log deletions**: Use `SoftDeleteAuditLogger` to track who deleted what
4. **Add middleware**: Use `preventHardDelete` on routes that should never hard delete
5. **Check before operations**: Verify record exists and is not deleted before updates

### ❌ DON'T:
1. **Never use DELETE queries**: Always use soft delete
2. **Don't forget the filter**: Always exclude deleted records in SELECT queries
3. **Don't allow hard deletes**: Block DELETE HTTP methods with middleware
4. **Don't skip audit logging**: Always log delete operations
5. **Don't update deleted records**: Use `buildUpdateQuery()` to prevent this

## Testing

```typescript
// Test soft delete functionality
describe('Soft Delete', () => {
    it('should soft delete a deceased record', async () => {
        const deceasedId = 'D001';
        const userId = 1;

        // Soft delete
        const result = await SoftDeleteService.softDelete(
            connection,
            'deceased',
            deceasedId,
            userId,
            'deceased_id'
        );

        expect(result).toBe(true);

        // Verify it's marked as deleted
        const isDeleted = await SoftDeleteService.isDeleted(
            connection,
            'deceased',
            deceasedId,
            'deceased_id'
        );

        expect(isDeleted).toBe(true);
    });

    it('should exclude soft-deleted records from queries', async () => {
        const query = buildSelectQuery('deceased', '*', '', false);
        const [rows] = await connection.query(query);

        const deceasedList = rows as any[];
        const hasDeleted = deceasedList.some(d => d.is_deleted === true);
        expect(hasDeleted).toBe(false);
    });

    it('should restore soft-deleted records', async () => {
        const deceasedId = 'D001';

        // Restore
        const result = await SoftDeleteService.restore(
            connection,
            'deceased',
            deceasedId,
            'deceased_id'
        );

        expect(result).toBe(true);

        // Verify it's restored
        const isDeleted = await SoftDeleteService.isDeleted(
            connection,
            'deceased',
            deceasedId,
            'deceased_id'
        );

        expect(isDeleted).toBe(false);
    });
});
```

## Migration Checklist

When adding soft delete to an existing service:

- [ ] Import soft delete utilities
- [ ] Update all SELECT queries to exclude deleted records
- [ ] Replace DELETE queries with soft delete
- [ ] Add soft delete endpoints (PATCH /soft-delete/:id)
- [ ] Add restore endpoints (PATCH /restore/:id)
- [ ] Add get deleted endpoints for admins (GET /deleted)
- [ ] Add preventHardDelete middleware to routes
- [ ] Add audit logging for all delete operations
- [ ] Update API documentation
- [ ] Test soft delete, restore, and filtering
- [ ] Run migration script for existing tenants