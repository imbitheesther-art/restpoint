-- =====================================================
-- RESTPOINT DATABASE INITIALIZATION
-- Creates the tenant_tracking database and required tables
-- =====================================================

-- Create tenant_tracking database if it doesn't exist
CREATE DATABASE IF NOT EXISTS tenant_tracking;

-- Use tenant_tracking database
USE tenant_tracking;

-- =====================================================
-- TENANTS TABLE - Main tenant registry
-- =====================================================
CREATE TABLE IF NOT EXISTS tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_slug VARCHAR(255) NOT NULL UNIQUE,
    db_name VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    subscription_plan ENUM('basic', 'free', 'premium') DEFAULT 'basic',
    subscription_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    subscription_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_slug (tenant_slug),
    INDEX idx_db_name (db_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- BRANCHES TABLE - For multi-branch tenant support
-- =====================================================
CREATE TABLE IF NOT EXISTS branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_slug VARCHAR(255) NOT NULL,
    branch_slug VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    branch_db_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_slug) REFERENCES tenants(tenant_slug) ON DELETE CASCADE,
    UNIQUE KEY unique_branch (tenant_slug, branch_slug),
    INDEX idx_tenant_slug (tenant_slug),
    INDEX idx_branch_slug (branch_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SYSTEM SHARED TENANT - Default tenant for system operations
-- =====================================================
INSERT IGNORE INTO tenants (tenant_slug, db_name, organization_name, status)
VALUES ('system_shared', 'restpoint_main', 'System Shared Database', 'active');

-- =====================================================
-- GRANT PRIVILEGES TO restpoint_user
-- =====================================================
-- Grant access to tenant_tracking database
GRANT ALL PRIVILEGES ON tenant_tracking.* TO 'restpoint_user'@'%';

-- Grant access to restpoint_main database (default tenant database)
CREATE DATABASE IF NOT EXISTS restpoint_main;
GRANT ALL PRIVILEGES ON restpoint_main.* TO 'restpoint_user'@'%';

-- Grant access to any future tenant databases
GRANT ALL PRIVILEGES ON `tenant_%`.* TO 'restpoint_user'@'%';
GRANT ALL PRIVILEGES ON `restpoint_%`.* TO 'restpoint_user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- =====================================================
-- CREATE DEFAULT TENANT DATABASE (restpoint_main)
-- =====================================================
USE restpoint_main;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'manager', 'staff', 'user', 'driver', 'workshop_manager', 'hr', 'accounts', 'mortician', 'supervisor', 'technician') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deceased table
CREATE TABLE IF NOT EXISTS deceased (
    deceased_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    admission_number VARCHAR(100) UNIQUE,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    date_of_death TIMESTAMP NULL,
    date_admitted TIMESTAMP NULL,
    cause_of_death TEXT NULL,
    county VARCHAR(100) NULL,
    location TEXT NULL,
    portal_slug VARCHAR(255) UNIQUE NULL,
    status ENUM('active', 'pending', 'completed', 'archived') DEFAULT 'active',
    total_mortuary_charge DECIMAL(10, 2) DEFAULT 0,
    coffin_status VARCHAR(50),
    dispatch_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_admission_number (admission_number),
    INDEX idx_date_of_death (date_of_death)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Next of Kin table
CREATE TABLE IF NOT EXISTS next_of_kin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deceased_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    contact VARCHAR(20),
    email VARCHAR(255),
    alternative_phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
    INDEX idx_deceased_id (deceased_id),
    INDEX idx_relationship (relationship)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    deceased_id VARCHAR(50) NOT NULL,
    order_id INT,
    invoice_number VARCHAR(50) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NULL,
    paid_date TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
    INDEX idx_deceased_id (deceased_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_status (status),
    INDEX idx_issue_date (issue_date),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    deceased_id VARCHAR(50) NOT NULL,
    invoice_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'mobile_money', 'check') DEFAULT 'cash',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_number VARCHAR(100),
    status ENUM('pending', 'confirmed', 'failed', 'refunded') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
    INDEX idx_deceased_id (deceased_id),
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_reference_number (reference_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    deceased_id VARCHAR(50) NOT NULL,
    document_type VARCHAR(100),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INT,
    uploaded_by VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected', 'archived') DEFAULT 'pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
    INDEX idx_deceased_id (deceased_id),
    INDEX idx_document_type (document_type),
    INDEX idx_status (status),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deceased_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
    INDEX idx_deceased_id (deceased_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_token (token(255)),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Body checkout table
CREATE TABLE IF NOT EXISTS body_checkout (
    id INT AUTO_INCREMENT PRIMARY KEY,
    checkout_id VARCHAR(50) NOT NULL UNIQUE,
    deceased_id VARCHAR(50) NOT NULL,
    checkout_type ENUM('burial', 'cremation', 'transfer', 'release', 'autopsy') NOT NULL,
    checkout_status ENUM('pending', 'approved', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
    requested_by INT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    completed_by INT,
    completed_at TIMESTAMP NULL,
    checkout_date TIMESTAMP NOT NULL,
    release_to VARCHAR(255) NOT NULL,
    release_to_relationship VARCHAR(100),
    release_to_contact VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (completed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_checkout_id (checkout_id),
    INDEX idx_deceased_id (deceased_id),
    INDEX idx_checkout_status (checkout_status),
    INDEX idx_checkout_date (checkout_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrations table
CREATE TABLE IF NOT EXISTS migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INITIALIZATION COMPLETE
-- =====================================================
SELECT 'Database initialization complete' as status;