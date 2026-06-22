-- RestPoint Database Initialization Script
-- Run: mysql -h localhost -u root -pRestPoint2024! < init-db.sql

-- Create main database
CREATE DATABASE IF NOT EXISTS restpoint_main CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create tenant tracking database
CREATE DATABASE IF NOT EXISTS tenant_tracking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'restpoint_user'@'%' IDENTIFIED BY 'RestPointUser2024';

-- FIX: Grant ALL PRIVILEGES on ALL databases with GRANT OPTION
-- This is critical for tenant onboarding which creates new databases dynamically
GRANT ALL PRIVILEGES ON *.* TO 'restpoint_user'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Create tenant_tracking tables
USE tenant_tracking;

CREATE TABLE IF NOT EXISTS tenants (
    tenant_id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_name VARCHAR(255) NOT NULL,
    tenant_slug VARCHAR(255) UNIQUE NOT NULL,
    db_name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location TEXT,
    country VARCHAR(100),
    logo_url VARCHAR(500),
    jwt_secret VARCHAR(500),
    refresh_secret VARCHAR(500),
    status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
    subscription_status ENUM('active', 'trial', 'suspended', 'cancelled') DEFAULT 'trial',
    subscription_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_slug (tenant_slug),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create restpoint_main tables
USE restpoint_main;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'manager', 'staff', 'user') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS branches (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(255) NOT NULL,
    branch_slug VARCHAR(255) UNIQUE NOT NULL,
    branch_db_name VARCHAR(255),
    branch_location VARCHAR(255),
    branch_phone VARCHAR(50),
    branch_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_branch_slug (branch_slug),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mortuary_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (email, password_hash, full_name, phone, role, is_active, is_verified) 
VALUES ('admin@example.com', '$2b$10$8VzvLhU9W3vQOYZl7JLgzuOgVFp.TBv.80cCpjklKZ5pLkK.LNnXW', 'System Admin', '+254700000000', 'admin', 1, 1);

-- Insert default mortuary settings
INSERT IGNORE INTO mortuary_settings (setting_key, setting_value, description) VALUES
('mortuary_name', 'RestPoint Mortuary', 'Default mortuary name'),
('timezone', 'Africa/Nairobi', 'Default timezone'),
('currency', 'KES', 'Default currency'),
('date_format', 'YYYY-MM-DD', 'Default date format'),
('time_format', '24h', 'Default time format');

-- Insert default tenant in tenant_tracking
INSERT IGNORE INTO tenant_tracking.tenants (tenant_name, tenant_slug, db_name, email, phone, location, country, status, subscription_status)
VALUES ('Default Tenant', 'default', 'restpoint_main', 'admin@example.com', '+254700000000', 'Nairobi', 'Kenya', 'active', 'active');