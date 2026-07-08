-- Migration: Update hearse_bookings status ENUM to include all status values
-- This migration updates existing databases that have the old ENUM definition
-- Run this migration if you get "Data truncated for column 'status'" errors

-- Update the status column to include all possible status values
ALTER TABLE hearse_bookings 
MODIFY COLUMN status ENUM(
    'pending', 
    'confirmed', 
    'in_progress', 
    'completed', 
    'cancelled', 
    'booked', 
    'in_transit', 
    'postponed', 
    'maintenance'
) DEFAULT 'pending';

-- Verify the change
SELECT COLUMN_NAME, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'hearse_bookings' 
AND COLUMN_NAME = 'status';