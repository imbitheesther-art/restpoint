-- Fix coffin_images table (missing from database)
CREATE TABLE IF NOT EXISTS `coffin_images` (
  `image_id` INT NOT NULL AUTO_INCREMENT,
  `coffin_id` VARCHAR(255) NOT NULL,
  `tenant_id` VARCHAR(255) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `image_name` VARCHAR(255),
  `display_order` INT DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`image_id`),
  INDEX `idx_coffin_id` (`coffin_id`),
  INDEX `idx_tenant_id` (`tenant_id`),
  INDEX `idx_created_at` (`created_at`),
  
  FOREIGN KEY (`coffin_id`) REFERENCES `coffins`(`coffin_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Coffin images';

-- Create deceased_coffin table for assignments
CREATE TABLE IF NOT EXISTS `deceased_coffin` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `deceased_id` VARCHAR(100) NOT NULL,
  `coffin_id` VARCHAR(255) NOT NULL,
  `tenant_id` VARCHAR(255) NOT NULL,
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
  FOREIGN KEY (`coffin_id`) REFERENCES `coffins`(`coffin_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;