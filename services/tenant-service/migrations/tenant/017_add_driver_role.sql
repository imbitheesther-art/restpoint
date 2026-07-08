-- Migration: Add comprehensive roles to users table
-- This migration updates existing databases that have the old ENUM definition
-- Run this migration if you get "Data truncated for column 'role'" errors

-- Update the role column to include all comprehensive roles
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'manager', 'staff', 'user', 'driver', 'workshop_manager', 'hr', 'accounts', 'mortician', 'supervisor', 'technician') DEFAULT 'user';

-- Verify the change
SELECT COLUMN_NAME, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'role';