-- ============================================
-- FLORIST SERVICE - Flower Bookings Tables
-- Multi-tenant: Each funeral home gets its own database
-- ============================================

-- Main bookings table
CREATE TABLE IF NOT EXISTS flower_bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    flower_type VARCHAR(100) NOT NULL,
    flower_description TEXT,
    service_type VARCHAR(50) NOT NULL,
    customer VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    deceased_name VARCHAR(255),
    branch VARCHAR(100) NOT NULL,
    branch_id INT,
    delivery_date DATE NOT NULL,
    delivery_time TIME NOT NULL,
    delivery_address TEXT,
    invoice_number VARCHAR(50) UNIQUE,
    amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('pending', 'confirmed', 'preparing', 'delivered', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    urgent BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_status (status),
    INDEX idx_delivery_date (delivery_date),
    INDEX idx_customer (customer),
    INDEX idx_branch (branch),
    INDEX idx_created_at (created_at)
);

-- Customers table for repeat customers
CREATE TABLE IF NOT EXISTS flower_customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    branch_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_phone (phone),
    INDEX idx_name (name)
);

-- Flower types/packages catalog
CREATE TABLE IF NOT EXISTS flower_packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    package_name VARCHAR(255) NOT NULL,
    package_code VARCHAR(50) UNIQUE,
    description TEXT,
    flower_types TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default flower packages
INSERT INTO flower_packages (package_name, package_code, description, flower_types, price, is_active) VALUES
('Basic Wreath', 'FLW-BASIC', 'Simple wreath with seasonal flowers', 'Roses, Carnations, Baby breath', 3500.00, TRUE),
('Premium Wreath', 'FLW-PREMIUM', 'Premium wreath with mixed flowers', 'Roses, Lilies, Carnations, Baby breath', 7500.00, TRUE),
('Casket Spray', 'FLW-CASKET', 'Full casket spray arrangement', 'Roses, Lilies, Orchids', 15000.00, TRUE),
('Standing Spray', 'FLW-STANDING', 'Large standing spray for funeral home', 'Mixed seasonal flowers', 12000.00, TRUE),
('Bouquet', 'FLW-BOUQUET', 'Hand-tied bouquet for family', 'Roses, Carnations', 2500.00, TRUE),
('Urgent Same-Day', 'FLW-URGENT', 'Same-day urgent delivery', 'Assorted premium flowers', 20000.00, TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Delivery zones/pricing
CREATE TABLE IF NOT EXISTS delivery_zones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    zone_name VARCHAR(100) NOT NULL,
    areas TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    estimated_minutes INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default delivery zones
INSERT INTO delivery_zones (zone_name, areas, delivery_fee, estimated_minutes, is_active) VALUES
('Local - Same Area', 'Within 5km radius', 500.00, 30, TRUE),
('Local - Extended', '5-15km radius', 1000.00, 60, TRUE),
('Regional', '15-30km radius', 2000.00, 90, TRUE),
('National', 'Over 30km / Other cities', 5000.00, 240, TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;