-- Add branch_id column to hearses table for multi-branch support
-- This enables tracking which branch owns each hearse

-- Add branch_id column
ALTER TABLE hearses 
ADD COLUMN IF NOT EXISTS branch_id INT DEFAULT 1 COMMENT 'Branch that owns this hearse' 
AFTER id;

-- Add index for faster branch-based queries
CREATE INDEX IF NOT EXISTS idx_hearses_branch_id ON hearses(branch_id);

-- Add foreign key constraint if branches table exists
-- (Comment out if branches table is in a different database)
-- ALTER TABLE hearses
-- ADD CONSTRAINT fk_hearses_branch 
-- FOREIGN KEY (branch_id) REFERENCES branches(id) 
-- ON DELETE CASCADE;

-- Update existing hearses to branch 1 (default/main branch)
UPDATE hearses SET branch_id = 1 WHERE branch_id IS NULL;

-- Verify the changes
SELECT 
    h.id,
    h.number_plate,
    h.model,
    h.status,
    h.branch_id,
    COUNT(*) OVER (PARTITION BY h.branch_id) as hearses_per_branch
FROM hearses h
ORDER BY h.branch_id, h.created_at DESC;