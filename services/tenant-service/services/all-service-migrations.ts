/**
 * @file services/tenant-service/services/all-service-migrations.ts
 * PRODUCTION-READY: All Service Migrations
 * 
 * Centralized registry of all database migrations for all services.
 * All migrations are managed from the tenant service.
 * Each migration is an object with a unique name and SQL statement.
 * 
 * Migrations are organized by service and executed in order.
 * The migration name must be unique across all services.
 * 
 * ARCHITECTURE: Per-Branch Database Model
 * - Main tenant DB: users, branches (with branch_db_name), settings, refresh_tokens, activity_logs
 * - Each branch gets its OWN database: deceased, charges, marketplace, chemicals, etc.
 * - Branch DB name format: {tenant_slug}_{branch_slug}
 */

import { Migration } from './migration-service';

// ─── Schema Migrations Tracking ───────────────────────────────────────────────

const SCHEMA_MIGRATIONS_TABLE: Migration = {
  name: '000_create_schema_migrations_table',
  sql: `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      version VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      duration_ms INT DEFAULT 0,
      success BOOLEAN DEFAULT TRUE,
      error_message TEXT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
};

// ─── Main Tenant Migrations (users, settings, branch tracking) ────────────────

const MAIN_TENANT_MIGRATIONS: Migration[] = [
  {
    name: 'main_001_create_users_table',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('admin', 'manager', 'staff', 'user') DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT FALSE,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'main_002_create_branches_table',
    sql: `
      CREATE TABLE IF NOT EXISTS branches (
        branch_id INT AUTO_INCREMENT PRIMARY KEY,
        branch_name VARCHAR(255) NOT NULL,
        branch_slug VARCHAR(255) NOT NULL UNIQUE,
        branch_db_name VARCHAR(255) NOT NULL UNIQUE,
        branch_location TEXT,
        branch_phone VARCHAR(20),
        branch_email VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_branch_slug (branch_slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'main_003_create_mortuary_settings_table',
    sql: `
      CREATE TABLE IF NOT EXISTS mortuary_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_setting_key (setting_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'main_004_create_refresh_tokens_table',
    sql: `
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_token (token(255)),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'main_005_create_activity_logs_table',
    sql: `
      CREATE TABLE IF NOT EXISTS activity_logs (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_created_at (created_at),
        INDEX idx_action (action)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
];

// ─── Branch-Only Migrations (each branch gets its own database) ───────────────

const BRANCH_ONLY_MIGRATIONS: Migration[] = [
  {
    name: 'branch_001_create_deceased_table',
    sql: `
      CREATE TABLE IF NOT EXISTS deceased (
        deceased_id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        age INT,
        gender ENUM('Male', 'Female', 'Other'),
        date_of_birth DATE,
        date_of_death DATE NOT NULL,
        cause_of_death TEXT,
        id_number VARCHAR(50),
        religion VARCHAR(100),
        burial_location TEXT,
        burial_date DATE,
        next_of_kin_name VARCHAR(255),
        next_of_kin_phone VARCHAR(20),
        next_of_kin_relationship VARCHAR(100),
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (full_name),
        INDEX idx_date_of_death (date_of_death),
        INDEX idx_nok_phone (next_of_kin_phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_002_create_base_charges_table',
    sql: `
      CREATE TABLE IF NOT EXISTS base_charges (
        charge_id INT AUTO_INCREMENT PRIMARY KEY,
        charge_name VARCHAR(255) NOT NULL,
        charge_description TEXT,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        charge_category ENUM('collection', 'storage', 'embalming', 'documentation', 'transport', 'casket', 'burial', 'cremation', 'other') DEFAULT 'other',
        is_mandatory BOOLEAN DEFAULT FALSE,
        is_percentage BOOLEAN DEFAULT FALSE,
        tax_percentage DECIMAL(5,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (charge_category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_003_create_charge_overrides_table',
    sql: `
      CREATE TABLE IF NOT EXISTS charge_overrides (
        override_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id INT NOT NULL,
        charge_id INT NOT NULL,
        override_amount DECIMAL(12,2),
        is_waived BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        FOREIGN KEY (charge_id) REFERENCES base_charges(charge_id) ON DELETE CASCADE,
        UNIQUE KEY unique_deceased_charge (deceased_id, charge_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_004_create_marketplace_products_table',
    sql: `
      CREATE TABLE IF NOT EXISTS marketplace_products (
        product_id INT AUTO_INCREMENT PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,2) NOT NULL,
        category ENUM('flowers', 'catering', 'keepsakes', 'caskets', 'transport', 'clothing', 'music', 'photography', 'other') DEFAULT 'other',
        stock_quantity INT DEFAULT 0,
        is_available BOOLEAN DEFAULT TRUE,
        image_url VARCHAR(500),
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_available (is_available)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_005_create_marketplace_orders_table',
    sql: `
      CREATE TABLE IF NOT EXISTS marketplace_orders (
        order_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id INT,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(255),
        order_status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
        total_amount DECIMAL(12,2) DEFAULT 0.00,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE SET NULL,
        INDEX idx_status (order_status),
        INDEX idx_customer_phone (customer_phone),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_006_create_marketplace_order_items_table',
    sql: `
      CREATE TABLE IF NOT EXISTS marketplace_order_items (
        item_id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES marketplace_orders(order_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES marketplace_products(product_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_007_create_chemicals_table',
    sql: `
      CREATE TABLE IF NOT EXISTS chemicals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'embalming',
        unit VARCHAR(50) NOT NULL DEFAULT 'liters',
        current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
        min_stock_level DECIMAL(10,2) DEFAULT 0,
        unit_cost DECIMAL(10,2) DEFAULT 0,
        supplier VARCHAR(255) DEFAULT NULL,
        batch_number VARCHAR(100) DEFAULT NULL,
        expiry_date DATE DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_chemicals_category (category),
        INDEX idx_chemicals_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_008_create_chemical_transactions_table',
    sql: `
      CREATE TABLE IF NOT EXISTS chemical_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chemical_id INT NOT NULL,
        transaction_type ENUM('received', 'consumed', 'adjusted', 'wasted') NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit VARCHAR(50) NOT NULL DEFAULT 'liters',
        previous_stock DECIMAL(10,2) NOT NULL,
        new_stock DECIMAL(10,2) NOT NULL,
        reference_type VARCHAR(50) DEFAULT NULL,
        reference_id INT DEFAULT NULL,
        performed_by INT DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE,
        INDEX idx_transactions_chemical (chemical_id),
        INDEX idx_transactions_type (transaction_type),
        INDEX idx_transactions_date (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_009_create_deceased_chemical_usage_table',
    sql: `
      CREATE TABLE IF NOT EXISTS deceased_chemical_usage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id INT NOT NULL,
        chemical_id INT NOT NULL,
        quantity_used DECIMAL(10,2) NOT NULL,
        unit VARCHAR(50) NOT NULL DEFAULT 'liters',
        transaction_id INT DEFAULT NULL,
        used_by INT DEFAULT NULL,
        usage_notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE,
        FOREIGN KEY (transaction_id) REFERENCES chemical_transactions(id) ON DELETE SET NULL,
        INDEX idx_usage_deceased (deceased_id),
        INDEX idx_usage_chemical (chemical_id),
        INDEX idx_usage_date (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_010_create_chemical_alerts_table',
    sql: `
      CREATE TABLE IF NOT EXISTS chemical_alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chemical_id INT NOT NULL,
        alert_threshold DECIMAL(10,2) DEFAULT NULL,
        is_triggered TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE,
        UNIQUE KEY uk_chemical_alert (chemical_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_011_create_funeral_arrangements_table',
    sql: `
      CREATE TABLE IF NOT EXISTS funeral_arrangements (
        arrangement_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id INT NOT NULL,
        arrangement_type ENUM('burial', 'cremation', 'memorial') DEFAULT 'burial',
        funeral_date DATE,
        funeral_location TEXT,
        clergy_name VARCHAR(255),
        special_instructions TEXT,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_012_create_body_checkout_table',
    sql: `
      CREATE TABLE IF NOT EXISTS body_checkout (
        id INT AUTO_INCREMENT PRIMARY KEY,
        checkout_id VARCHAR(50) NOT NULL UNIQUE,
        deceased_id INT NOT NULL,
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
        INDEX idx_checkout_id (checkout_id),
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_checkout_status (checkout_status),
        INDEX idx_checkout_date (checkout_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_013_create_documents_table',
    sql: `
      CREATE TABLE IF NOT EXISTS documents (
        document_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id INT NOT NULL,
        document_type VARCHAR(100),
        file_name VARCHAR(255),
        file_path VARCHAR(500),
        file_size INT,
        uploaded_by INT,
        status ENUM('pending', 'approved', 'rejected', 'archived') DEFAULT 'pending',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_document_type (document_type),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_014_create_invoices_table',
    sql: `
      CREATE TABLE IF NOT EXISTS invoices (
        invoice_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id INT NOT NULL,
        order_id INT,
        invoice_number VARCHAR(50) UNIQUE,
        amount DECIMAL(12,2) NOT NULL,
        status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
        issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP NULL,
        paid_date TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        INDEX idx_invoice_number (invoice_number),
        INDEX idx_status (status),
        INDEX idx_due_date (due_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_015_create_payments_table',
    sql: `
      CREATE TABLE IF NOT EXISTS payments (
        payment_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id INT NOT NULL,
        invoice_id INT,
        amount DECIMAL(12,2) NOT NULL,
        payment_method ENUM('cash', 'card', 'bank_transfer', 'mobile_money', 'check') DEFAULT 'cash',
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reference_number VARCHAR(100),
        status ENUM('pending', 'confirmed', 'failed', 'refunded') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE SET NULL,
        INDEX idx_payment_date (payment_date),
        INDEX idx_reference_number (reference_number),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_016_create_notifications_table',
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id INT,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        INDEX idx_type (type),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_017_create_qr_codes_table',
    sql: `
      CREATE TABLE IF NOT EXISTS qr_codes (
        qr_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id INT,
        qr_data TEXT NOT NULL,
        qr_image_url VARCHAR(500),
        is_scanned BOOLEAN DEFAULT FALSE,
        scanned_at TIMESTAMP NULL,
        scanned_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        INDEX idx_deceased_id (deceased_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_018_create_events_table',
    sql: `
      CREATE TABLE IF NOT EXISTS events (
        event_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_type ENUM('funeral', 'viewing', 'memorial', 'burial', 'cremation', 'other') DEFAULT 'other',
        event_date TIMESTAMP NOT NULL,
        event_location TEXT,
        status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        INDEX idx_event_date (event_date),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_019_create_coffin_tracking_table',
    sql: `
      CREATE TABLE IF NOT EXISTS coffin_tracking (
        coffin_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id INT,
        coffin_type VARCHAR(100) NOT NULL,
        coffin_material VARCHAR(100),
        dimensions VARCHAR(100),
        supplier VARCHAR(255),
        cost DECIMAL(12,2) DEFAULT 0.00,
        assigned_date TIMESTAMP NULL,
        status ENUM('in_stock', 'assigned', 'used', 'damaged') DEFAULT 'in_stock',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_deceased_id (deceased_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_020_create_visitor_logs_table',
    sql: `
      CREATE TABLE IF NOT EXISTS visitor_logs (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id INT,
        visitor_name VARCHAR(255) NOT NULL,
        visitor_phone VARCHAR(20),
        visitor_email VARCHAR(255),
        relationship VARCHAR(100),
        id_number VARCHAR(50),
        check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        check_out TIMESTAMP NULL,
        purpose TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_visitor_phone (visitor_phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'branch_021_create_search_logs_table',
    sql: `
      CREATE TABLE IF NOT EXISTS search_logs (
        search_id INT AUTO_INCREMENT PRIMARY KEY,
        search_term VARCHAR(255) NOT NULL,
        search_type ENUM('deceased', 'next_of_kin', 'user', 'invoice', 'order') DEFAULT 'deceased',
        results_count INT DEFAULT 0,
        searched_by INT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_search_term (search_term),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
];

// ─── Default Settings Seeds ───────────────────────────────────────────────────

const DEFAULT_SETTINGS_MIGRATION: Migration = {
  name: 'main_100_seed_default_settings',
  sql: `
    INSERT IGNORE INTO mortuary_settings (setting_key, setting_value) VALUES 
      ('timezone', 'Africa/Nairobi'),
      ('currency', 'KES'),
      ('date_format', 'YYYY-MM-DD'),
      ('time_format', '24h'),
      ('default_country', 'Kenya'),
      ('auto_create_deceased_number', 'true'),
      ('require_deceased_approval', 'false'),
      ('notification_enabled', 'true'),
      ('max_storage_days', '30'),
      ('storage_rate_per_day', '500.00');
  `,
};

// ─── Exported Migrations ──────────────────────────────────────────────────────

/**
 * Returns migrations for the main tenant database (users, settings, branch tracking).
 * The main DB stores users, branch-to-database mapping, and global settings.
 */
export function getMainTenantMigrations(): Migration[] {
  return [
    SCHEMA_MIGRATIONS_TABLE,
    ...MAIN_TENANT_MIGRATIONS,
    DEFAULT_SETTINGS_MIGRATION,
  ];
}

/**
 * Returns migrations for a branch-specific database (deceased, charges, marketplace, etc.).
 * Each branch gets its own isolated database so data never mixes.
 */
export function getBranchMigrations(): Migration[] {
  return [
    SCHEMA_MIGRATIONS_TABLE,
    ...BRANCH_ONLY_MIGRATIONS,
  ];
}

/**
 * Returns all migrations (both main and branch) for backwards compatibility.
 */
export function getAllTenantMigrations(): Migration[] {
  return [
    SCHEMA_MIGRATIONS_TABLE,
    ...MAIN_TENANT_MIGRATIONS,
    ...BRANCH_ONLY_MIGRATIONS,
    DEFAULT_SETTINGS_MIGRATION,
  ];
}

/**
 * Returns all migrations grouped by category for reporting.
 */
export function getMigrationsByCategory(): Record<string, Migration[]> {
  return {
    schema: [SCHEMA_MIGRATIONS_TABLE],
    mainTenant: MAIN_TENANT_MIGRATIONS,
    branch: BRANCH_ONLY_MIGRATIONS,
    seeds: [DEFAULT_SETTINGS_MIGRATION],
  };
}

export { getMainTenantMigrations, getBranchMigrations };
export default getAllTenantMigrations;