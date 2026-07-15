"use strict";
// Soft delete migrations removed
// The soft-delete migrations module was intentionally removed per project policy.
// Export a noop function to preserve any imports but prevent any soft-delete SQL changes.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOFT_DELETE_QUERIES = exports.SOFT_DELETE_MIGRATIONS = void 0;
exports.getSoftDeleteMigrations = getSoftDeleteMigrations;
exports.getSoftDeleteMigrations = getSoftDeleteMigrations;
function getSoftDeleteMigrations() {
    return [];
}
/**
 * Soft delete migrations for tables that don't already have soft delete support
 * These migrations add is_deleted, deleted_at, and deleted_by columns
 */
exports.SOFT_DELETE_MIGRATIONS = [
    // ─── Tenant Service Tables ───────────────────────────────────────────────────
    {
        name: '001_add_soft_delete_to_users',
        sql: `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at),
      ADD FOREIGN KEY (deleted_by) REFERENCES users(user_id) ON DELETE SET NULL
    `,
    },
    {
        name: '002_add_soft_delete_to_organizations',
        sql: `
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '003_add_soft_delete_to_branches',
        sql: `
      ALTER TABLE branches 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Deceased Service Tables ─────────────────────────────────────────────────
    {
        name: '004_add_soft_delete_to_deceased',
        sql: `
      ALTER TABLE deceased 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '005_add_soft_delete_to_next_of_kin',
        sql: `
      ALTER TABLE next_of_kin 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '006_add_soft_delete_to_postmortem',
        sql: `
      ALTER TABLE postmortem 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '007_add_soft_delete_to_charges',
        sql: `
      ALTER TABLE charges 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '008_add_soft_delete_to_portal_tracking',
        sql: `
      ALTER TABLE portal_tracking 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Marketplace Service Tables ──────────────────────────────────────────────
    {
        name: '009_add_soft_delete_to_marketplace_products',
        sql: `
      ALTER TABLE marketplace_products 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '010_add_soft_delete_to_shopping_cart',
        sql: `
      ALTER TABLE shopping_cart 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '011_add_soft_delete_to_orders',
        sql: `
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '012_add_soft_delete_to_order_items',
        sql: `
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Invoice & Payments Service Tables ───────────────────────────────────────
    {
        name: '013_add_soft_delete_to_invoices',
        sql: `
      ALTER TABLE invoices 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '014_add_soft_delete_to_payments',
        sql: `
      ALTER TABLE payments 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Documents Service Tables ────────────────────────────────────────────────
    {
        name: '015_add_soft_delete_to_documents',
        sql: `
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Notifications Service Tables ────────────────────────────────────────────
    {
        name: '016_add_soft_delete_to_notifications',
        sql: `
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Calendar / Events Service Tables ────────────────────────────────────────
    {
        name: '017_add_soft_delete_to_events',
        sql: `
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '018_add_soft_delete_to_event_attendees',
        sql: `
      ALTER TABLE event_attendees 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '019_add_soft_delete_to_event_reminders',
        sql: `
      ALTER TABLE event_reminders 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '020_add_soft_delete_to_event_categories',
        sql: `
      ALTER TABLE event_categories 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '021_add_soft_delete_to_event_logs',
        sql: `
      ALTER TABLE event_logs 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Body Checkout Service Tables ────────────────────────────────────────────
    {
        name: '022_add_soft_delete_to_body_checkout',
        sql: `
      ALTER TABLE body_checkout 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Coffin Service Tables ───────────────────────────────────────────────────
    {
        name: '023_add_soft_delete_to_coffins',
        sql: `
      ALTER TABLE coffins 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '024_add_soft_delete_to_coffin_images',
        sql: `
      ALTER TABLE coffin_images 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '025_add_soft_delete_to_coffin_usage',
        sql: `
      ALTER TABLE coffin_usage 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '026_add_soft_delete_to_deceased_coffin',
        sql: `
      ALTER TABLE deceased_coffin 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Portal / Memorial Service Tables ────────────────────────────────────────
    {
        name: '027_add_soft_delete_to_memorial_pages',
        sql: `
      ALTER TABLE memorial_pages 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '028_add_soft_delete_to_condolences',
        sql: `
      ALTER TABLE condolences 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '029_add_soft_delete_to_virtual_candles',
        sql: `
      ALTER TABLE virtual_candles 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '030_add_soft_delete_to_memories_tributes',
        sql: `
      ALTER TABLE memories_tributes 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── QR Code Service Tables ──────────────────────────────────────────────────
    {
        name: '031_add_soft_delete_to_qr_codes',
        sql: `
      ALTER TABLE qr_codes 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Analytics Service Tables ────────────────────────────────────────────────
    {
        name: '032_add_soft_delete_to_search_logs',
        sql: `
      ALTER TABLE search_logs 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    {
        name: '033_add_soft_delete_to_search_index',
        sql: `
      ALTER TABLE search_index 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── EDocuments Service Tables ───────────────────────────────────────────────
    {
        name: '034_add_soft_delete_to_edocuments',
        sql: `
      ALTER TABLE edocuments 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Visitors Service Tables ─────────────────────────────────────────────────
    {
        name: '035_add_soft_delete_to_visitor_logs',
        sql: `
      ALTER TABLE visitor_logs 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Activity Logs (CRITICAL - should never be deleted) ──────────────────────
    {
        name: '036_add_soft_delete_to_activity_logs',
        sql: `
      ALTER TABLE activity_logs 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Refresh Tokens ──────────────────────────────────────────────────────────
    {
        name: '037_add_soft_delete_to_refresh_tokens',
        sql: `
      ALTER TABLE refresh_tokens 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
    // ─── Mortuary Settings ───────────────────────────────────────────────────────
    {
        name: '038_add_soft_delete_to_mortuary_settings',
        sql: `
      ALTER TABLE mortuary_settings 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
      ADD INDEX idx_is_deleted (is_deleted),
      ADD INDEX idx_deleted_at (deleted_at)
    `,
    },
];
/**
 * Get all soft delete migrations
 * These should be run AFTER all main table migrations when creating a new tenant
 */
function getSoftDeleteMigrations() {
    return exports.SOFT_DELETE_MIGRATIONS;
}
/**
 * Soft delete helper queries that can be used in services
 */
exports.SOFT_DELETE_QUERIES = {
    /**
     * Soft delete a record
     */
    softDelete: (tableName, primaryKey = 'id') => `UPDATE ${tableName} SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ? WHERE ${primaryKey} = ? AND is_deleted = FALSE`,
    /**
     * Restore a soft-deleted record
     */
    restore: (tableName, primaryKey = 'id') => `UPDATE ${tableName} SET is_deleted = FALSE, deleted_at = NULL, deleted_by = NULL WHERE ${primaryKey} = ? AND is_deleted = TRUE`,
    /**
     * Permanently delete a record (use with caution - requires special permission)
     */
    hardDelete: (tableName, primaryKey = 'id') => `DELETE FROM ${tableName} WHERE ${primaryKey} = ?`,
    /**
     * Filter query to exclude soft-deleted records
     */
    excludeDeleted: (tableName = '') => `${tableName ? tableName + '.' : ''}is_deleted = FALSE`,
    /**
     * Get only soft-deleted records
     */
    onlyDeleted: (tableName = '') => `${tableName ? tableName + '.' : ''}is_deleted = TRUE`,
    /**
     * Get all records including soft-deleted
     */
    includeDeleted: () => '1=1',
};
//# sourceMappingURL=soft-delete-migrations.js.map