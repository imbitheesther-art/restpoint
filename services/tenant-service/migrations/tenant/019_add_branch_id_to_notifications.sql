-- =====================================================
-- Migration: 019_add_branch_id_to_notifications
-- Description: Add branch_id to notifications for branch-specific notifications
-- Each branch/funeral home stores its own notifications
-- =====================================================

-- Add branch_id column to notifications table
ALTER TABLE `notifications`
  ADD COLUMN `branch_id` VARCHAR(50) NULL COMMENT 'Branch ID for branch-specific notifications' AFTER `deceased_id`,
  ADD INDEX `idx_branch_id` (`branch_id`),
  ADD INDEX `idx_branch_read` (`branch_id`, `is_read`);

-- Update the unread_notifications_view to include branch_id
CREATE OR REPLACE VIEW `unread_notifications_view` AS
SELECT 
    n.id,
    n.deceased_id,
    n.branch_id,
    d.full_name as deceased_name,
    n.type,
    n.message,
    n.created_at
FROM notifications n
LEFT JOIN deceased d ON n.deceased_id = d.deceased_id
WHERE n.is_read = FALSE
ORDER BY n.created_at DESC;

-- Update the recent_notifications_view to include branch_id
CREATE OR REPLACE VIEW `recent_notifications_view` AS
SELECT 
    n.id,
    n.deceased_id,
    n.branch_id,
    d.full_name as deceased_name,
    n.type,
    n.message,
    n.is_read,
    n.created_at
FROM notifications n
LEFT JOIN deceased d ON n.deceased_id = d.deceased_id
ORDER BY n.created_at DESC
LIMIT 100;

-- =====================================================
-- Migration Complete
-- =====================================================