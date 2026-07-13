



CREATE TABLE IF NOT EXISTS coffins (

  coffin_id VARCHAR(255) PRIMARY KEY,

  custom_id VARCHAR(255),

  tenant_id VARCHAR(255),

  type VARCHAR(255),

  material VARCHAR(255),

  exact_price DECIMAL(10,2),

  currency VARCHAR(10),

  price_usd DECIMAL(10,2),

  exchange_rate DECIMAL(10,2),

  quantity INT DEFAULT 1,

  supplier VARCHAR(255),

  origin VARCHAR(255),

  color VARCHAR(255),

  size VARCHAR(255),

  category VARCHAR(255),

  created_by VARCHAR(255),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  is_deleted BOOLEAN DEFAULT FALSE,

  INDEX idx_tenant (tenant_id),

  INDEX idx_custom_id (custom_id)

);
STAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` BOOLEAN DEFAULT FALSE,
  
  PRIMARY KEY (`coffin_id`),
  UNIQUE KEY `unique_custom_id_per_tenant` (`tenant_slug`, `custom_id`),
  INDEX `idx_tenant_id` (`tenant_slug`),
  INDEX `idx_type` (`type`),
  INDEX `idx_category` (`category`),
  INDEX `idx_quantity` (`quantity`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_created_at` (`created_at`),
  
  FOREIGN KEY (`tenant_slug`) REFERENCES `tenants`(`tenant_slug`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Coffins with tenant isolation';

-- Coffin Images table with tenant isolation
CREATE TABLE IF NOT EXISTS `coffin_images` (
  `image_id` INT NOT NULL AUTO_INCREMENT,
  `coffin_id` INT NOT NULL,
  `tenant_slug` VARCHAR(100) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `image_name` VARCHAR(255),
  `display_order` INT DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`image_id`),
  INDEX `idx_coffin_id` (`coffin_id`),
  INDEX `idx_tenant_id` (`tenant_slug`),
  INDEX `idx_created_at` (`created_at`),
  
  FOREIGN KEY (`coffin_id`) REFERENCES `coffins`(`coffin_id`) ON DELETE CASCADE,
  FOREIGN KEY (`tenant_slug`) REFERENCES `tenants`(`tenant_slug`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Coffin images with tenant isolation';

-- Coffin Purchases/Usage table for tracking sales
CREATE TABLE IF NOT EXISTS `coffin_usage` (
  `usage_id` INT NOT NULL AUTO_INCREMENT,
  `coffin_id` INT NOT NULL,
  `tenant_slug` VARCHAR(100) NOT NULL,
  `deceased_id` VARCHAR(100),
  `quantity_used` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(15,2) NOT NULL,
  `total_price` DECIMAL(15,2) NOT NULL,
  `invoice_id` VARCHAR(100),
  `used_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT,
  `created_by` INT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`usage_id`),
  INDEX `idx_coffin_id` (`coffin_id`),
  INDEX `idx_tenant_slug` (`tenant_slug`),
  INDEX `idx_deceased_id` (`deceased_id`),
  INDEX `idx_invoice_id` (`invoice_id`),
  INDEX `idx_used_at` (`used_at`),
  
  FOREIGN KEY (`coffin_id`) REFERENCES `coffins`(`coffin_id`) ON DELETE CASCADE,
  FOREIGN KEY (`tenant_slug`) REFERENCES `tenants`(`tenant_slug`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Coffin usage tracking for invoicing';

-- Deceased Coffin Assignment table with tenant isolation
CREATE TABLE IF NOT EXISTS `deceased_coffin` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `deceased_id` VARCHAR(100) NOT NULL,
  `coffin_id` INT NOT NULL,
  `tenant_id` VARCHAR(50) NOT NULL,
  `assigned_by_username` VARCHAR(100) DEFAULT NULL,
  `assigned_date` DATE NOT NULL,
  `rfid` VARCHAR(100) UNIQUE COMMENT 'RFID tag for tracking',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_deceased_id` (`deceased_id`),
  INDEX `idx_coffin_id` (`coffin_id`),
  INDEX `idx_tenant_id` (`tenant_id`),
  INDEX `idx_assigned_date` (`assigned_date`),
  UNIQUE KEY `unique_deceased_coffin` (`deceased_id`, `coffin_id`),
  FOREIGN KEY (`coffin_id`) REFERENCES `coffins`(`coffin_id`) ON DELETE RESTRICT,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`slug`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some default coffin types
