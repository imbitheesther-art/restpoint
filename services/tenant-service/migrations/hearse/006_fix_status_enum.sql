-- Fix hearse_bookings status ENUM to include all required values
-- This migration updates the status column to support all booking statuses

-- First, let's check the current ENUM definition
-- Then update it to include all status values

ALTER TABLE hearse_bookings 
MODIFY COLUMN status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'booked', 'in_transit', 'postponed', 'maintenance') DEFAULT 'pending';

-- Verify the change
DESCRIBE hearse_bookings;