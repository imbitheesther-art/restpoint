-- Migration: Make optional fields nullable in deceased table
-- This fixes the "Field 'county' doesn't have a default value" error
-- Run this migration if you get errors when registering deceased persons

-- Make these columns nullable since they are optional
ALTER TABLE deceased 
    MODIFY COLUMN cause_of_death TEXT NULL,
    MODIFY COLUMN county VARCHAR(100) NULL,
    MODIFY COLUMN location TEXT NULL,
    MODIFY COLUMN portal_slug VARCHAR(255) UNIQUE NULL;

-- Verify the changes
SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'deceased' 
AND COLUMN_NAME IN ('cause_of_death', 'county', 'location', 'portal_slug');