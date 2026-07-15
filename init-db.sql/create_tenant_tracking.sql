-- =====================================================
-- CREATE TENANT_TRACKING DATABASE AND TABLES
-- Run this script if tenant_tracking database doesn't exist
-- =====================================================

-- Create tenant_tracking database if it doesn't exist
CREATE DATABASE IF NOT EXISTS tenant_tracking;

-- Use tenant_tracking database
USE tenant_tracking;

-- =====================================================
-- PROVISIONING STATUS TABLE - Track tenant provisioning progress
-- =====================================================
CREATE TABLE IF NOT EXISTS provisioning_status (
    tenant_slug VARCHAR(255) PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'pending',
    progress INT DEFAULT 0,
    details TEXT,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Grant access to any future tenant databases
GRANT ALL PRIVILEGES ON `tenant_%`.* TO 'restpoint_user'@'%';
GRANT ALL PRIVILEGES ON `restpoint_%`.* TO 'restpoint_user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'tenant_tracking database and tables created successfully' as status;