-- Add missing columns to hearse_bookings table
-- This migration adds columns that are referenced in the booking controller but missing from the table

-- Add booking_code column if it doesn't exist
ALTER TABLE hearse_bookings 
ADD COLUMN IF NOT EXISTS booking_code VARCHAR(50) UNIQUE AFTER id;

-- Add deceased_id column if it doesn't exist  
ALTER TABLE hearse_bookings
ADD COLUMN IF NOT EXISTS deceased_id INT AFTER hearse_id;

-- Add tenant_db_name column if it doesn't exist
ALTER TABLE hearse_bookings
ADD COLUMN IF NOT EXISTS tenant_db_name VARCHAR(255) AFTER deceased_id;

-- Add branch_code column if it doesn't exist (different from branch_id)
ALTER TABLE hearse_bookings
ADD COLUMN IF NOT EXISTS branch_code VARCHAR(50) AFTER branch_id;

-- Add indexes for better performance
ALTER TABLE hearse_bookings
ADD INDEX IF NOT EXISTS idx_booking_code (booking_code),
ADD INDEX IF NOT EXISTS idx_tenant_db_name (tenant_db_name),
ADD INDEX IF NOT EXISTS idx_branch_code (branch_code);

-- Verify the changes
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'hearse_bookings'
ORDER BY ORDINAL_POSITION;