-- Fix role column from ENUM to VARCHAR to support all role types
-- This migration fixes the "Data truncated for column 'role'" error
-- Issue: ENUM only allowed specific values, causing truncation for roles like 'system_administrator', 'receptionist', etc.
-- Solution: Change role column to VARCHAR(50) to accept any role value

ALTER TABLE users MODIFY COLUMN role VARCHAR(50) DEFAULT 'user';

-- Add comment to document the change
ALTER TABLE users MODIFY COLUMN role VARCHAR(50) DEFAULT 'user' COMMENT 'User role (admin, manager, staff, user, driver, workshop_manager, HR, accounts, mortician, supervisor, technician, system_administrator, receptionist, hearse_driver, etc.)';