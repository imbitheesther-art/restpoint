# Soft Delete Module Documentation

## Overview

The Soft Delete Module prevents hard deletes across your entire multi-tenant system. When a new tenant is created, all tables automatically get soft delete capabilities.

## How It Works

### Database Schema

Every table gets three additional columns:
- `is_deleted` (BOOLEAN) - Marks records as deleted (default: FALSE)
- `deleted_at` (TIMESTAMP) - Records when deletion occurred
- `deleted_by` (INT) - Tracks who performed the deletion

### Soft Delete vs Hard Delete

**Soft Delete (Recommended):**
```sql
UPDATE deceased SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = 1 WHERE deceased_id = 'D001'
```
- Record is marked as deleted but remains in database
- Can be restored later
- Preserves data integrity and audit trail
- All SELECT queries automatically exclude soft-deleted records

**Hard Delete (Blocked by Default):**
```sql
DELETE FROM deceased WHERE deceased_id = 'D001'
```
- Permanently removes record from database
- Cannot be recovered
- Should ONLY be used for compliance/legal requirements
- Requires special authorization and audit logging

## Usage in Services

### 1. Import the Module

```typescript
import { SOFT_DELETE_QUERIES, SoftDeleteService, buildSelectQuery } from '../../../shared/utils/softDelete';
```

### 2. Soft Delete a Record

```typescript
// In your controller/service
const connection = await mysql.createConnection({...});
const userId = req.user.userId; // Who is performing the delete

await SoftDeleteService.softDelete(
    connection,
    'deceased',           // table name
    'D001',              // record ID
    userId,              // who deleted it
    'deceased_id'        // primary key column
);
```

### 3. Query with Automatic Filter

```typescript
// Automatically excludes soft-deleted records
const query = buildSelectQuery(
    'deceased',           // table
    '*',                  // columns
    'status = ?',         // where clause
    false                 // include deleted? (false = exclude)
);

const [rows] = await connection.query(query, ['active']);
```

### 4. Manual Query with Filter

```typescript
// Always add this to your WHERE clause
const [rows] = await connection.query(
    `SELECT * FROM deceased 
     WHERE status = ? 
     AND is_deleted = FALSE',  // <-- Add this
    ['active']
);
```

### 5. Restore a Deleted Record

```typescript
await SoftDeleteService.restore(
    connection,
    'deceased',
    'D001',
    'deceased_id'
);
```

### 6. Get Deleted Records (Admin Only)

```typescript
const deletedRecords = await SoftDeleteService.getDeletedRecords(
    connection,
    'deceased',
    100  // limit
);
```

## Middleware

### Prevent Hard Deletes

Add this middleware to routes that should never allow hard deletes:

```typescript
import { preventHardDelete } from '../../../shared/utils/softDelete';

// In your routes
router.delete('/api/deceased/:id', preventHardDelete, deleteController.delete);
// Returns 403 error with message to use soft delete instead
```

## Migration for Existing Tenants

### Automatic (New Tenants)

Soft delete columns are automatically added when a new tenant is created.

### Manual (Existing Tenants)

Run the migration script for existing tenants:

```bash
# Run the soft delete migration script
npm run migrate:soft-delete
```

Or manually execute:

```typescript
import { getSoftDeleteMigrations } from '../../../shared/services/soft-delete-migrations';
import { MigrationService } from '../../../shared/services/migration-service';

const migrationService = new MigrationService();
const softDeleteMigrations = getSoftDeleteMigrations();

// Apply to a specific tenant database
await migrationService.runTenantMigrations(
    'tenant_mumo_funeral_home',
    softDeleteMigrations,
    connectionConfig
);
```

## Best Practices

### 1. Always Filter Deleted Records

```typescript
// ❌ BAD - May return soft-deleted records
SELECT * FROM deceased WHERE status = 'active'

// ✅ GOOD - Excludes soft-deleted records
SELECT * FROM deceased WHERE status = 'active' AND is_deleted = FALSE
```

### 2. Use Soft Delete in Controllers

```typescript
// ❌ BAD - Hard delete
await connection.query('DELETE FROM deceased WHERE deceased_id = ?', [id]);

// ✅ GOOD - Soft delete
await SoftDeleteService.softDelete(connection, 'deceased', id, userId, 'deceased_id');
```

### 3. Log All Delete Operations

```typescript
// Always log who deleted what and when
await SoftDeleteAuditLogger.logSoftDelete(
    connection,
    userId,
    'deceased',
    id,
    recordData  // snapshot of data before deletion
);
```

### 4. Restrict Hard Delete Access

```typescript
// Only super admins should have hard delete permission
if (req.user.role !== 'super_admin') {
    return res.status(403).json({
        success: false,
        message: 'Hard deletes are not allowed'
    });
}

// Log hard delete with reason
await SoftDeleteAuditLogger.logHardDelete(
    connection,
    userId,
    'deceased',
    id,
    'GDPR compliance - user request'
);
```

## Tables Protected

All tables in the system are protected:
- ✅ users
- ✅ deceased
- ✅ next_of_kin
- ✅ postmortem
- ✅ charges
- ✅ invoices
- ✅ payments
- ✅ documents
- ✅ edocuments
- ✅ marketplace_products
- ✅ orders
- ✅ events
- ✅ body_checkout
- ✅ coffins
- ✅ memorial_pages
- ✅ condolences
- ✅ qr_codes
- ✅ visitor_logs
- ✅ activity_logs
- ✅ And more...

## API Endpoints

### Soft Delete
```
PATCH /api/v1/restpoint/deceased/soft-delete/:id
```

### Restore
```
PATCH /api/v1/restpoint/deceased/restore/:id
```

### Get Deleted (Admin)
```
GET /api/v1/restpoint/deceased/deleted
```

## Monitoring

Check soft delete status:

```sql
-- Count of deleted records per table
SELECT 
    'deceased' as table_name,
    COUNT(*) as deleted_count
FROM deceased
WHERE is_deleted = TRUE

UNION ALL

SELECT 
    'users' as table_name,
    COUNT(*) as deleted_count
FROM users
WHERE is_deleted = TRUE;
```

## Troubleshooting

### Issue: Soft delete columns not found

**Solution:** Run the soft delete migration:
```bash
npm run migrate:soft-delete
```

### Issue: Hard deletes still working

**Solution:** Add the `preventHardDelete` middleware to your routes

### Issue: Deleted records still showing

**Solution:** Check your queries - you may be missing `AND is_deleted = FALSE`

## Support

For issues or questions, contact the development team.

## Version History

- **v1.0.0** (2025-01-26): Initial soft delete module implementation
  - Automatic soft delete columns for new tenants
  - Migration script for existing tenants
  - Utility functions and middleware
  - Audit logging