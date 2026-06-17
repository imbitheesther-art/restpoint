-- Daily billing table to track charges per deceased per day
CREATE TABLE IF NOT EXISTS daily_billing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deceased_id INT NOT NULL,
  tenant_slug VARCHAR(100) NOT NULL,
  days_admitted INT NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  base_charges DECIMAL(10,2) NOT NULL,
  additional_charges DECIMAL(10,2) DEFAULT 0,
  total_charge DECIMAL(10,2) NOT NULL,
  billing_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_deceased (deceased_id),
  INDEX idx_tenant_date (tenant_slug, billing_date),
  UNIQUE KEY unique_deceased_date (deceased_id, billing_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Billing job logs to track execution
CREATE TABLE IF NOT EXISTS billing_job_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_type VARCHAR(50) NOT NULL,
  total_tenants INT NOT NULL,
  total_processed INT NOT NULL,
  total_succeeded INT NOT NULL,
  total_failed INT NOT NULL,
  results JSON,
  executed_at TIMESTAMP NOT NULL,
  INDEX idx_executed (executed_at),
  INDEX idx_job_type (job_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tenant settings for billing rates
CREATE TABLE IF NOT EXISTS tenant_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_slug VARCHAR(100) UNIQUE NOT NULL,
  daily_rate DECIMAL(10,2) DEFAULT 1500.00,
  embalming_rate DECIMAL(10,2) DEFAULT 3000.00,
  storage_rate DECIMAL(10,2) DEFAULT 500.00,
  currency VARCHAR(10) DEFAULT 'KES',
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant (tenant_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings for existing tenants
INSERT INTO tenant_settings (tenant_slug, daily_rate, embalming_rate, storage_rate)
SELECT DISTINCT tenant_slug, 1500.00, 3000.00, 500.00
FROM deceased
WHERE tenant_slug IS NOT NULL
AND tenant_slug NOT IN (SELECT tenant_slug FROM tenant_settings)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;