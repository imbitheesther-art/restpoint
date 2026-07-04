-- Remove price fields from hearses table
-- This migration removes min_charge_ksh and max_charge_ksh fields as they are not needed

-- Drop indexes on price fields if they exist
DROP INDEX IF EXISTS idx_hearses_min_charge ON hearses;
DROP INDEX IF EXISTS idx_hearses_max_charge ON hearses;

-- Remove price columns
ALTER TABLE hearses 
DROP COLUMN IF EXISTS min_charge_ksh,
DROP COLUMN IF EXISTS max_charge_ksh;

-- Add comment to document the change
ALTER TABLE hearses 
MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'available' COMMENT 'Hearse status: available, booked, maintenance';