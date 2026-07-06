-- Simplified hearse schema (no foreign keys, no branch/driver requirements)

-- Drop existing tables if they exist
DROP TABLE IF EXISTS hearse_bookings;
DROP TABLE IF EXISTS hearse_maintenance;
DROP TABLE IF EXISTS hearses;

-- Create simplified hearses table (no foreign keys)
CREATE TABLE hearses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hearse_code VARCHAR(20) UNIQUE,
    hearse_name VARCHAR(255),
    plate_number VARCHAR(50) NOT NULL UNIQUE,
    capacity INT DEFAULT 1,
    min_charge_ksh DECIMAL(10,2) DEFAULT 0,
    max_charge_ksh DECIMAL(10,2) DEFAULT 0,
    driver_id INT,
    branch_id INT DEFAULT 1,
    status ENUM('available', 'booked', 'cancelled', 'in_transit', 'maintenance', 'unavailable') DEFAULT 'available', -- ✅ Fixed: Added comma
    image_url VARCHAR(500),
    description TEXT,
    features JSON,
    make VARCHAR(100),
    model VARCHAR(100),
    year INT,
    chassis_number VARCHAR(50),
    engine_number VARCHAR(50),
    insurance_expiry DATE,
    service_due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_branch_id (branch_id),
    INDEX idx_status (status),
    INDEX idx_driver_id (driver_id),
    INDEX idx_plate_number (plate_number)
);

-- Create simplified hearse_bookings (no foreign keys)
CREATE TABLE hearse_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE,
    hearse_id INT NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    client_email VARCHAR(255),
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    destination VARCHAR(255),
    booking_date DATETIME,
    from_timestamp DATETIME, -- ✅ Added to match your controller
    to_timestamp DATETIME,   -- ✅ Added to match your controller
    from_location VARCHAR(255), -- ✅ Added to match your controller
    to_location VARCHAR(255),   -- ✅ Added to match your controller
    event_date DATE,
    event_time TIME,
    service_type ENUM('funeral', 'transfer', 'other') DEFAULT 'funeral',
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'booked') DEFAULT 'pending', -- ✅ Added 'booked' to ENUM
    driver_id INT,
    branch_id INT DEFAULT 1,
    special_requests TEXT,
    total_charge DECIMAL(10,2),
    paid_amount DECIMAL(10,2),
    payment_status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
    created_by INT, -- ✅ Added created_by field
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hearse_id (hearse_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_status (status),
    INDEX idx_booking_date (booking_date),
    INDEX idx_client_phone (client_phone)
);

-- Create simplified hearse_maintenance (no foreign keys)
CREATE TABLE hearse_maintenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hearse_id INT NOT NULL,
    maintenance_type ENUM('routine', 'repair', 'emergency', 'inspection') NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    maintenance_date DATE,
    status ENUM('scheduled', 'in_progress', 'completed') DEFAULT 'scheduled',
    technician_name VARCHAR(255),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hearse_id (hearse_id),
    INDEX idx_status (status),
    INDEX idx_date (maintenance_date)
);

-- Insert test data
INSERT INTO hearses (
    hearse_code,
    hearse_name,
    plate_number,
    capacity,
    min_charge_ksh,
    max_charge_ksh,
    driver_id,
    branch_id,
    status,
    make,
    model,
    year
) VALUES 
('HRS001', 'Mercedes Sprinter', 'KBZ 123A', 2, 5000, 15000, 1, 1, 'available', 'Mercedes', 'Sprinter', 2020),
('HRS002', 'Toyota Hiace', 'KBZ 456B', 1, 3000, 10000, 2, 1, 'available', 'Toyota', 'Hiace', 2019),
('HRS003', 'Ford Transit', 'KBZ 789C', 3, 7000, 20000, 3, 2, 'available', 'Ford', 'Transit', 2021);