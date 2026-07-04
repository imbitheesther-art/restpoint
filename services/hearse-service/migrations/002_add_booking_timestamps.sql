-- Add from_timestamp and to_timestamp fields to hearse_bookings table
-- This migration adds timestamp fields for funeral booking scheduling

-- Add timestamp columns
ALTER TABLE hearse_bookings 
ADD COLUMN from_timestamp DATETIME NULL AFTER estimated_departure_time,
ADD COLUMN to_timestamp DATETIME NULL AFTER from_timestamp;

-- Add indexes for better query performance on timestamp ranges
CREATE INDEX idx_hearse_bookings_from_timestamp ON hearse_bookings(from_timestamp);
CREATE INDEX idx_hearse_bookings_to_timestamp ON hearse_bookings(to_timestamp);
CREATE INDEX idx_hearse_bookings_timestamps ON hearse_bookings(from_timestamp, to_timestamp);

-- Update existing records to set estimated_departure_time as from_timestamp if not set
UPDATE hearse_bookings 
SET from_timestamp = estimated_departure_time 
WHERE from_timestamp IS NULL AND estimated_departure_time IS NOT NULL;

-- Add comment to document the purpose of these fields
ALTER TABLE hearse_bookings 
MODIFY COLUMN from_timestamp DATETIME NULL COMMENT 'Start timestamp for the funeral booking period',
MODIFY COLUMN to_timestamp DATETIME NULL COMMENT 'End timestamp for the funeral booking period';