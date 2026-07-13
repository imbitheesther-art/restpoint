-- Fix role column to support all role types
-- This migration fixes the "Data truncated for column 'role'" error
-- Issue: VARCHAR(50) was too small for roles like 'system_administrator', 'workshop_manager', etc.
-- Solution: Change role column to VARCHAR(100) to accept any role value

ALTER TABLE users MODIFY COLUMN role VARCHAR(100) DEFAULT 'user' COMMENT 'User role (admin, manager, staff, user, driver, workshop_manager, HR, accounts, mortician, supervisor, technician, system_administrator, receptionist, hearse_driver, etc.)';
