-- ============================================
-- COFFIN INVENTORY MANAGEMENT SYSTEM
-- Complete schema for branches, coffins, bookings, and cross-branch requests
-- ============================================

-- ============================================
-- BRANCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_slug VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    email VARCHAR(255),
    color VARCHAR(20) DEFAULT '#0d9488',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_slug (tenant_slug),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COFFINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS coffins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coffin_id VARCHAR(50) UNIQUE NOT NULL,
    tenant_slug VARCHAR(100) NOT NULL,
    branch_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    material VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_tenant_slug (tenant_slug),
    INDEX idx_branch_id (branch_id),
    INDEX idx_sku (sku),
    INDEX idx_stock (stock),
    INDEX idx_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COFFIN IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS coffin_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coffin_id VARCHAR(50) NOT NULL,
    tenant_slug VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coffin_id) REFERENCES coffins(coffin_id) ON DELETE CASCADE,
    INDEX idx_coffin_id (coffin_id),
    INDEX idx_tenant_slug (tenant_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_slug VARCHAR(100) NOT NULL,
    branch_id INT NOT NULL,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    deceased_name VARCHAR(255) NOT NULL,
    coffin_id VARCHAR(50) NOT NULL,
    service_date DATE NOT NULL,
    notes TEXT,
    paid BOOLEAN DEFAULT FALSE,
    specifications JSON,
    status ENUM('pending', 'booked', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (coffin_id) REFERENCES coffins(coffin_id) ON DELETE RESTRICT,
    INDEX idx_tenant_slug (tenant_slug),
    INDEX idx_branch_id (branch_id),
    INDEX idx_coffin_id (coffin_id),
    INDEX idx_status (status),
    INDEX idx_service_date (service_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STOCK REQUESTS TABLE (Cross-branch)
-- ============================================
CREATE TABLE IF NOT EXISTS stock_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_slug VARCHAR(100) NOT NULL,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    from_branch_id INT NOT NULL,
    to_branch_id INT NOT NULL,
    coffin_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    client_name VARCHAR(255),
    client_phone VARCHAR(50),
    deceased_name VARCHAR(255) NOT NULL,
    service_date DATE,
    notes TEXT,
    specifications JSON,
    status ENUM('pending', 'approved', 'rejected', 'transferring', 'delivered') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (to_branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (coffin_id) REFERENCES coffins(coffin_id) ON DELETE RESTRICT,
    INDEX idx_tenant_slug (tenant_slug),
    INDEX idx_from_branch (from_branch_id),
    INDEX idx_to_branch (to_branch_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STOCK REQUEST TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stock_request_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) NOT NULL,
    tenant_slug VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES stock_requests(request_id) ON DELETE CASCADE,
    INDEX idx_request_id (request_id),
    INDEX idx_tenant_slug (tenant_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGERS FOR AUTO-GENERATING IDs
-- ============================================

-- Trigger for booking_id
DELIMITER //
CREATE TRIGGER before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_id IS NULL OR NEW.booking_id = '' THEN
        SET NEW.booking_id = CONCAT('BK-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 10000), 4, '0'));
    END IF;
END //
DELIMITER ;

-- Trigger for request_id
DELIMITER //
CREATE TRIGGER before_stock_request_insert
BEFORE INSERT ON stock_requests
FOR EACH ROW
BEGIN
    IF NEW.request_id IS NULL OR NEW.request_id = '' THEN
        SET NEW.request_id = CONCAT('SR-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 10000), 4, '0'));
    END IF;
END //
DELIMITER ;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample branches
INSERT INTO branches (tenant_slug, name, location, contact_person, contact_phone, email, color) VALUES
('default', 'Main Chapel', '123 Main Street', 'John Smith', '+1-555-0101', 'main@eternityrest.com', '#0d9488'),
('default', 'Westside Memorial', '456 West Ave', 'Sarah Johnson', '+1-555-0102', 'westside@eternityrest.com', '#2563eb'),
('default', 'Harmony Gardens', '789 Garden Rd', 'Mike Davis', '+1-555-0103', 'harmony@eternityrest.com', '#d97706'),
('default', 'Sunset Rest', '321 Sunset Blvd', 'Lisa Wilson', '+1-555-0104', 'sunset@eternityrest.com', '#dc2626')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert sample coffins
INSERT INTO coffins (coffin_id, tenant_slug, branch_id, name, sku, type, material, price, stock, notes) VALUES
('COF-240715-A3F5E8D9', 'default', 1, 'Mahogany Heritage', 'MH-001', 'Traditional', 'Solid Mahogany', 4950.00, 8, 'Premium velvet, 24k gold handles'),
('COF-240715-B4G6H9J2', 'default', 1, 'Oak Serenity', 'OS-002', 'Traditional', 'Oak', 3500.00, 5, 'Classic design, Brass fittings'),
('COF-240715-C5I7K0L3', 'default', 1, 'Steel Sentinel', 'SS-003', 'Modern', 'Steel', 2200.00, 12, 'Brushed steel'),
('COF-240715-D6J8M1N4', 'default', 1, 'Pine Gentle Rest', 'PG-004', 'Eco-Friendly', 'Pine', 1200.00, 3, 'Untreated pine, Biodegradable'),
('COF-240715-E7K9O2P5', 'default', 1, 'Sacred Cross', 'SC-005', 'Religious', 'Oak', 4200.00, 6, 'Ornate cross, White satin'),
('COF-240715-F8L0P3Q6', 'default', 1, 'Little Angel', 'LA-006', 'Child', 'White Pine', 950.00, 2, 'Angel motif'),
('COF-240715-G9M1Q4R7', 'default', 1, 'Veteran Honor', 'VH-007', 'Veteran', 'Solid Mahogany', 5500.00, 4, 'Flag rail, Military emblems'),
('COF-240715-H0N2R5S8', 'default', 1, 'Grand Monument', 'GM-012', 'Traditional', 'Solid Mahogany', 8500.00, 1, 'Glass panel'),
('COF-240715-I1O3S6T9', 'default', 2, 'Mahogany Heritage', 'MH-001B', 'Traditional', 'Solid Mahogany', 4950.00, 6, 'Premium velvet'),
('COF-240715-J2P4T7U0', 'default', 2, 'Walnut Renaissance', 'WR-008', 'Traditional', 'Walnut', 4800.00, 4, 'Hand-carved'),
('COF-240715-K3Q5U8V1', 'default', 2, 'Bamboo Peace', 'BP-009', 'Eco-Friendly', 'Bamboo', 1800.00, 0, 'Sustainable'),
('COF-240715-L4R6V9W2', 'default', 2, 'Cherry Blossom', 'CB-010', 'Modern', 'Cherry', 3900.00, 7, 'Rose gold'),
('COF-240715-M5S7W0X3', 'default', 3, 'Sacred Cross', 'SC-005C', 'Religious', 'Oak', 4200.00, 3, 'Cross overlay'),
('COF-240715-N6T8X1Y4', 'default', 3, 'Willow Grace', 'WG-011', 'Eco-Friendly', 'Willow', 1500.00, 10, 'Handwoven'),
('COF-240715-O7U9Y2Z5', 'default', 3, 'Steel Sentinel', 'SS-003D', 'Modern', 'Steel', 2200.00, 5, 'Brushed steel'),
('COF-240715-P8V0Z3A6', 'default', 3, 'Little Angel', 'LA-006E', 'Child', 'White Pine', 950.00, 1, 'Angel motif'),
('COF-240715-Q9W1A4B7', 'default', 4, 'Oak Serenity', 'OS-002F', 'Traditional', 'Oak', 3500.00, 9, 'Classic design'),
('COF-240715-R0X2B5C8', 'default', 4, 'Pine Gentle Rest', 'PG-004G', 'Eco-Friendly', 'Pine', 1200.00, 4, 'Biodegradable'),
('COF-240715-S1Y3C6D9', 'default', 4, 'Veteran Honor', 'VH-007H', 'Veteran', 'Solid Mahogany', 5500.00, 2, 'Flag rail'),
('COF-240715-T2Z4D7E0', 'default', 2, 'Simple Dignity', 'SD-013', 'Traditional', 'Pine', 800.00, 0, 'No ornamentation')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================
-- VIEWS FOR EASY ACCESS
-- ============================================

-- View for coffin inventory with branch info
CREATE OR REPLACE VIEW v_coffin_inventory AS
SELECT 
    c.coffin_id,
    c.tenant_slug,
    c.branch_id,
    b.name as branch_name,
    b.color as branch_color,
    c.name as coffin_name,
    c.sku,
    c.type,
    c.material,
    c.price,
    c.stock,
    c.notes,
    CASE 
        WHEN c.stock <= 0 THEN 'Out of Stock'
        WHEN c.stock <= 2 THEN 'Low Stock'
        ELSE 'Available'
    END as stock_status,
    COUNT(ci.id) as image_count,
    GROUP_CONCAT(DISTINCT ci.image_url) as image_urls
FROM coffins c
LEFT JOIN branches b ON c.branch_id = b.id AND c.tenant_slug = b.tenant_slug
LEFT JOIN coffin_images ci ON c.coffin_id = ci.coffin_id AND c.tenant_slug = ci.tenant_slug
WHERE c.is_deleted = FALSE
GROUP BY c.coffin_id
ORDER BY c.created_at DESC;

-- View for bookings with full details
CREATE OR REPLACE VIEW v_bookings AS
SELECT 
    b.*,
    br.name as branch_name,
    br.color as branch_color,
    c.name as coffin_name,
    c.sku as coffin_sku,
    c.type as coffin_type,
    c.material as coffin_material,
    c.price as coffin_price,
    GROUP_CONCAT(DISTINCT ci.image_url) as coffin_images
FROM bookings b
LEFT JOIN branches br ON b.branch_id = br.id AND b.tenant_slug = br.tenant_slug
LEFT JOIN coffins c ON b.coffin_id = c.coffin_id AND b.tenant_slug = c.tenant_slug
LEFT JOIN coffin_images ci ON b.coffin_id = ci.coffin_id AND b.tenant_slug = ci.tenant_slug
GROUP BY b.id
ORDER BY b.created_at DESC;

-- View for stock requests
CREATE OR REPLACE VIEW v_stock_requests AS
SELECT 
    sr.*,
    b_from.name as from_branch_name,
    b_from.color as from_branch_color,
    b_to.name as to_branch_name,
    b_to.color as to_branch_color,
    c.name as coffin_name,
    c.sku as coffin_sku,
    c.type as coffin_type,
    c.material as coffin_material,
    GROUP_CONCAT(DISTINCT ci.image_url) as coffin_images
FROM stock_requests sr
LEFT JOIN branches b_from ON sr.from_branch_id = b_from.id AND sr.tenant_slug = b_from.tenant_slug
LEFT JOIN branches b_to ON sr.to_branch_id = b_to.id AND sr.tenant_slug = b_to.tenant_slug
LEFT JOIN coffins c ON sr.coffin_id = c.coffin_id AND sr.tenant_slug = c.tenant_slug
LEFT JOIN coffin_images ci ON sr.coffin_id = ci.coffin_id AND sr.tenant_slug = ci.tenant_slug
GROUP BY sr.id
ORDER BY sr.created_at DESC;