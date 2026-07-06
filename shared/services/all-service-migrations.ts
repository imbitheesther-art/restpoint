/**
 * @file shared/services/all-service-migrations.ts
 * PRODUCTION-READY: All Service Migrations
 * 
 * Centralized registry of all database migrations for all services.
 * Each migration is an object with a unique name and SQL statement.
 * 
 * Migrations are organized by service and executed in order.
 * The migration name must be unique across all services.
 * 
 * Usage:
 *   import { ALL_SERVICE_MIGRATIONS } from './all-service-migrations';
 *   const result = await migrationService.runTenantMigrations(dbName, ALL_SERVICE_MIGRATIONS, config);
 */

import { Migration } from './migration-service';

// ─── Tenant Service Migrations ───────────────────────────────────────────────

const TENANT_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '001_create_organizations_table',
    sql: `
      CREATE TABLE IF NOT EXISTS organizations (
        id CHAR(36) PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        organization_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        location VARCHAR(255) NOT NULL,
        logo_url VARCHAR(500) NULL,
        logo_public_id VARCHAR(255) NULL,
        terms_accepted BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT TRUE,
        subscription_plan ENUM('basic', 'free', 'premium') DEFAULT 'basic',
        subscription_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        subscription_expires_at TIMESTAMP NULL,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_slug (slug),
        INDEX idx_email (email),
        INDEX idx_organization_name (organization_name),
        INDEX idx_subscription_status (subscription_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },

  {
    name: '002_create_users_table',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('admin', 'manager', 'staff', 'user') DEFAULT 'user',
        branch_id INT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT FALSE,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_branch_id (branch_id),
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '003_create_refresh_tokens_table',
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
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '004_create_mortuary_settings_table',
    sql: `
      CREATE TABLE IF NOT EXISTS mortuary_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL UNIQUE,
        setting_value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '005_create_activity_logs_table',
    sql: `
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
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '006_create_branches_table',
    sql: `
      CREATE TABLE IF NOT EXISTS branches (
        branch_id INT PRIMARY KEY AUTO_INCREMENT,
        branch_name VARCHAR(255) NOT NULL,
        branch_slug VARCHAR(255) UNIQUE NOT NULL,
        branch_db_name VARCHAR(255),
        branch_location TEXT,
        branch_phone VARCHAR(50),
        branch_email VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_branch_slug (branch_slug),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Deceased Service Migrations ─────────────────────────────────────────────

const DECEASED_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '010_create_deceased_table',
    sql: `
      CREATE TABLE IF NOT EXISTS deceased (
        id INT NOT NULL AUTO_INCREMENT,
        deceased_id VARCHAR(100) NOT NULL COMMENT 'Unique identifier',
        admission_number VARCHAR(100) NOT NULL UNIQUE,
        cause_of_death TEXT,
        date_admitted DATETIME NULL,
        date_of_birth DATE NOT NULL,
        date_of_death DATE NULL,
        date_registered DATETIME NULL,
        full_name VARCHAR(255) NOT NULL,
        gender ENUM('Male', 'Female', 'Other') NOT NULL,
        place_of_death VARCHAR(255) NOT NULL,
        county VARCHAR(100) NOT NULL,
        national_id VARCHAR(50) NOT NULL,
        location VARCHAR(255),
        portal_slug VARCHAR(255) UNIQUE,
        created_by INT,
        status VARCHAR(50) DEFAULT 'active',
        total_mortuary_charge DECIMAL(10,2) DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'KES',
        burial_type VARCHAR(50),
        dispatch_date DATE,
        extra_charges_amount DECIMAL(10,2) DEFAULT 0,
        next_of_kin_count INT DEFAULT 0,
        is_embalmed BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_deceased_id (deceased_id),
        UNIQUE KEY unique_admission_number (admission_number),
        UNIQUE KEY unique_national_id (national_id),
        UNIQUE KEY unique_portal_slug (portal_slug),
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_national_id (national_id),
        INDEX idx_date_of_death (date_of_death),
        INDEX idx_created_at (created_at),
        INDEX idx_full_name (full_name),
        INDEX idx_status (status),
        INDEX idx_is_deleted (is_deleted),
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Deceased persons'
    `,
  },
  {
    name: '010a_alter_deceased_table_add_missing_columns',
    sql: `
      ALTER TABLE deceased
        ADD COLUMN IF NOT EXISTS date_of_birth DATE NOT NULL DEFAULT '1900-01-01' AFTER date_admitted,
        ADD COLUMN IF NOT EXISTS date_of_death DATE NULL AFTER date_of_birth,
        ADD COLUMN IF NOT EXISTS date_registered DATETIME NULL AFTER date_of_death,
        ADD COLUMN IF NOT EXISTS gender ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Other' AFTER full_name,
        ADD COLUMN IF NOT EXISTS place_of_death VARCHAR(255) NOT NULL DEFAULT 'Not specified' AFTER gender,
        ADD COLUMN IF NOT EXISTS county VARCHAR(100) NOT NULL DEFAULT 'Unknown' AFTER place_of_death,
        ADD COLUMN IF NOT EXISTS national_id VARCHAR(50) NOT NULL DEFAULT 'N/A' AFTER county,
        ADD COLUMN IF NOT EXISTS location VARCHAR(255) NULL AFTER national_id,
        ADD COLUMN IF NOT EXISTS portal_slug VARCHAR(255) UNIQUE NULL AFTER location,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' AFTER created_by,
        ADD COLUMN IF NOT EXISTS total_mortuary_charge DECIMAL(10,2) DEFAULT 0.00 AFTER status,
        ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'KES' AFTER total_mortuary_charge,
        ADD COLUMN IF NOT EXISTS burial_type VARCHAR(50) NULL AFTER currency,
        ADD COLUMN IF NOT EXISTS dispatch_date DATE NULL AFTER burial_type,
        ADD COLUMN IF NOT EXISTS extra_charges_amount DECIMAL(10,2) DEFAULT 0 AFTER dispatch_date,
        ADD COLUMN IF NOT EXISTS next_of_kin_count INT DEFAULT 0 AFTER extra_charges_amount,
        ADD COLUMN IF NOT EXISTS is_embalmed BOOLEAN DEFAULT FALSE AFTER next_of_kin_count,
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_embalmed
    `,
  },
  {
    name: '011_create_next_of_kin_table',
    sql: `
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '011a_add_next_of_kin_missing_columns',
    sql: `
      ALTER TABLE next_of_kin
        ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE AFTER email,
        ADD COLUMN IF NOT EXISTS is_notified BOOLEAN DEFAULT FALSE AFTER is_primary,
        ADD COLUMN IF NOT EXISTS notified_at DATETIME NULL AFTER is_notified,
        ADD COLUMN IF NOT EXISTS alternative_contact VARCHAR(50) NULL AFTER address,
        ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) NULL AFTER alternative_contact,
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER created_at,
        ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted,
        ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) NULL AFTER deleted_at,
        ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at
    `,
  },
  {
    name: '012_create_portal_sessions_table',
    sql: `
      CREATE TABLE IF NOT EXISTS portal_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id VARCHAR(50) NOT NULL,
        session_token VARCHAR(500),
        logged_in_at TIMESTAMP NULL,
        last_activity TIMESTAMP NULL,
        ip_address VARCHAR(50),
        user_agent VARCHAR(500),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_session_token (session_token(255)),
        INDEX idx_active (active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '013_create_postmortem_table',
    sql: `
      CREATE TABLE IF NOT EXISTS postmortem (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id VARCHAR(50) NOT NULL,
        examination_date TIMESTAMP NULL,
        examiner_name VARCHAR(255),
        findings TEXT,
        cause_of_death TEXT,
        manner_of_death VARCHAR(100),
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        report_file_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '014_create_charges_table',
    sql: `
      CREATE TABLE IF NOT EXISTS charges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id VARCHAR(50) NOT NULL,
        charge_type VARCHAR(100) NOT NULL,
        description TEXT,
        amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'paid', 'waived', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_charge_type (charge_type),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '015_create_portal_tracking_table',
    sql: `
      CREATE TABLE IF NOT EXISTS portal_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id VARCHAR(50) NOT NULL,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        remarks TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        UNIQUE KEY uk_deceased_id (deceased_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Marketplace Service Migrations ──────────────────────────────────────────

const MARKETPLACE_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '020_create_marketplace_products_table',
    sql: `
      CREATE TABLE IF NOT EXISTS marketplace_products (
        product_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category ENUM('caskets', 'flowers', 'services', 'urns', 'other') DEFAULT 'other',
        price DECIMAL(10, 2) NOT NULL,
        quantity_available INT DEFAULT 0,
        image_url VARCHAR(500),
        status ENUM('available', 'unavailable', 'discontinued') DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_price (price)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '021_create_shopping_cart_table',
    sql: `
      CREATE TABLE IF NOT EXISTS shopping_cart (
        cart_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id VARCHAR(50) NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES marketplace_products(product_id) ON DELETE CASCADE,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_product_id (product_id),
        UNIQUE KEY uk_deceased_product (deceased_id, product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '022_create_orders_table',
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        order_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id VARCHAR(50) NOT NULL,
        order_number VARCHAR(50) UNIQUE,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'confirmed', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('unpaid', 'partial', 'paid', 'refunded') DEFAULT 'unpaid',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completion_date TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_order_number (order_number),
        INDEX idx_status (status),
        INDEX idx_order_date (order_date),
        INDEX idx_payment_status (payment_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '023_create_order_items_table',
    sql: `
      CREATE TABLE IF NOT EXISTS order_items (
        item_id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255),
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES marketplace_products(product_id),
        INDEX idx_order_id (order_id),
        INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Invoice & Payments Service Migrations ───────────────────────────────────

const INVOICE_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '030_create_invoices_table',
    sql: `
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
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_invoice_number (invoice_number),
        INDEX idx_status (status),
        INDEX idx_issue_date (issue_date),
        INDEX idx_due_date (due_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '031_create_payments_table',
    sql: `
      CREATE TABLE IF NOT EXISTS payments (
        payment_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id VARCHAR(50) NOT NULL,
        invoice_id INT,
        transaction_id VARCHAR(255) UNIQUE,
        phone_number VARCHAR(20),
        amount DECIMAL(15, 2) NOT NULL,
        payment_method ENUM('cash', 'card', 'bank_transfer', 'mobile_money', 'check') DEFAULT 'cash',
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reference_number VARCHAR(100),
        receipt_number VARCHAR(100),
        status ENUM('pending', 'confirmed', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        message TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (deceased_id) REFERENCES deceased(deceased_id) ON DELETE CASCADE,
        FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_invoice_id (invoice_id),
        INDEX idx_transaction_id (transaction_id),
        INDEX idx_payment_date (payment_date),
        INDEX idx_reference_number (reference_number),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Documents Service Migrations ────────────────────────────────────────────

const DOCUMENTS_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '040_create_documents_table',
    sql: `
      CREATE TABLE IF NOT EXISTS documents (
        document_id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id VARCHAR(50) NOT NULL,
        document_type VARCHAR(100),
        title VARCHAR(255),
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Notifications Service Migrations ────────────────────────────────────────

const NOTIFICATIONS_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '050_create_notifications_table',
    sql: `
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
        INDEX idx_created_at (created_at),
        INDEX idx_deceased_read (deceased_id, is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Calendar / Events Service Migrations ────────────────────────────────────

const CALENDAR_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '060_create_events_table',
    sql: `
      CREATE TABLE IF NOT EXISTS events (
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        \`start\` TIMESTAMP NOT NULL,
        \`end\` TIMESTAMP NOT NULL,
        category ENUM('BURIAL', 'FUNERAL', 'VIEWING', 'EMBALMING', 'COLLECTION', 'MEETING', 'OTHER') DEFAULT 'OTHER',
        priority ENUM('HIGH', 'MEDIUM', 'LOW') DEFAULT 'MEDIUM',
        status ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
        staff VARCHAR(255) DEFAULT 'Unassigned',
        staff_ids TEXT,
        location VARCHAR(255),
        all_day BOOLEAN DEFAULT FALSE,
        recurring BOOLEAN DEFAULT FALSE,
        recurrence_rule VARCHAR(255),
        parent_event_id INT NULL,
        color VARCHAR(50),
        reminder_minutes INT DEFAULT 30,
        reminder_sent BOOLEAN DEFAULT FALSE,
        attachments TEXT,
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP NULL,
        deleted_by INT,
        PRIMARY KEY (id),
        INDEX idx_start_date (\`start\`),
        INDEX idx_end_date (\`end\`),
        INDEX idx_category (category),
        INDEX idx_priority (priority),
        INDEX idx_status (status),
        INDEX idx_staff (staff),
        INDEX idx_created_by (created_by),
        INDEX idx_parent_event (parent_event_id),
        INDEX idx_start_status (\`start\`, status),
        INDEX idx_created_at (created_at),
        INDEX idx_is_deleted (is_deleted),
        INDEX idx_category_status (category, status),
        INDEX idx_recurring (recurring),
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
        FOREIGN KEY (deleted_by) REFERENCES users(user_id) ON DELETE SET NULL,
        FOREIGN KEY (parent_event_id) REFERENCES events(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '061_create_event_attendees_table',
    sql: `
      CREATE TABLE IF NOT EXISTS event_attendees (
        id INT NOT NULL AUTO_INCREMENT,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(100),
        rsvp_status ENUM('pending', 'accepted', 'declined', 'maybe') DEFAULT 'pending',
        response_date TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_event_attendee (event_id, user_id),
        INDEX idx_event_id (event_id),
        INDEX idx_user_id (user_id),
        INDEX idx_rsvp_status (rsvp_status),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '062_create_event_reminders_table',
    sql: `
      CREATE TABLE IF NOT EXISTS event_reminders (
        id INT NOT NULL AUTO_INCREMENT,
        event_id INT NOT NULL,
        reminder_time TIMESTAMP NOT NULL,
        reminder_type ENUM('email', 'sms', 'push') DEFAULT 'email',
        sent BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP NULL,
        recipient VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_event_id (event_id),
        INDEX idx_reminder_time (reminder_time),
        INDEX idx_sent (sent),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '063_create_event_categories_table',
    sql: `
      CREATE TABLE IF NOT EXISTS event_categories (
        id INT NOT NULL AUTO_INCREMENT,
        category_name VARCHAR(100) NOT NULL UNIQUE,
        category_code VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(50) DEFAULT '#3B82F6',
        icon VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_category_code (category_code),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '064_seed_event_categories',
    sql: `
      INSERT IGNORE INTO event_categories (category_name, category_code, description, color, sort_order) VALUES
        ('Burial', 'BURIAL', 'Burial ceremony event', '#8B5CF6', 1),
        ('Funeral', 'FUNERAL', 'Funeral service event', '#3B82F6', 2),
        ('Viewing', 'VIEWING', 'Body viewing event', '#10B981', 3),
        ('Embalming', 'EMBALMING', 'Embalming procedure', '#F59E0B', 4),
        ('Collection', 'COLLECTION', 'Body collection event', '#EF4444', 5),
        ('Meeting', 'MEETING', 'Staff or family meeting', '#6366F1', 6),
        ('Other', 'OTHER', 'Other types of events', '#6B7280', 7)
    `,
  },
  {
    name: '065_create_event_logs_table',
    sql: `
      CREATE TABLE IF NOT EXISTS event_logs (
        log_id INT NOT NULL AUTO_INCREMENT,
        event_id INT NOT NULL,
        action ENUM('create', 'update', 'delete', 'status_change', 'reminder_sent') NOT NULL,
        action_by INT,
        old_data JSON,
        new_data JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (log_id),
        INDEX idx_event_id (event_id),
        INDEX idx_action (action),
        INDEX idx_action_by (action_by),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (action_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Body Checkout Service Migrations ────────────────────────────────────────

const BODY_CHECKOUT_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '070_create_body_checkout_table',
    sql: `
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Coffin Service Migrations ───────────────────────────────────────────────

const COFFIN_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '080_create_coffins_table',
    sql: `
      CREATE TABLE IF NOT EXISTS coffins (
        coffin_id INT NOT NULL AUTO_INCREMENT,
        custom_id VARCHAR(100) NOT NULL,
        tenant_slug VARCHAR(100) NOT NULL,
        type VARCHAR(255) NOT NULL,
        material VARCHAR(255) NOT NULL,
        exact_price DECIMAL(15, 2) NOT NULL,
        currency ENUM('KES', 'USD', 'EUR', 'GBP') DEFAULT 'KES',
        price_usd DECIMAL(15, 2) DEFAULT NULL,
        exchange_rate DECIMAL(10, 4) DEFAULT NULL,
        quantity INT DEFAULT 1,
        minimum_stock INT DEFAULT 5,
        supplier VARCHAR(255) DEFAULT NULL,
        supplier_contact VARCHAR(100) DEFAULT NULL,
        origin VARCHAR(255) DEFAULT NULL,
        color VARCHAR(100) DEFAULT NULL,
        size VARCHAR(100) DEFAULT NULL,
        description TEXT,
        category ENUM('locally_made', 'imported') DEFAULT 'locally_made',
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (coffin_id),
        INDEX idx_tenant_slug (tenant_slug),
        INDEX idx_type (type),
        INDEX idx_category (category),
        INDEX idx_quantity (quantity),
        INDEX idx_is_active (is_active),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '081_create_coffin_images_table',
    sql: `
      CREATE TABLE IF NOT EXISTS coffin_images (
        image_id INT NOT NULL AUTO_INCREMENT,
        coffin_id INT NOT NULL,
        tenant_slug VARCHAR(100) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_name VARCHAR(255),
        display_order INT DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (image_id),
        INDEX idx_coffin_id (coffin_id),
        INDEX idx_tenant_slug (tenant_slug),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (coffin_id) REFERENCES coffins(coffin_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '082_create_coffin_usage_table',
    sql: `
      CREATE TABLE IF NOT EXISTS coffin_usage (
        usage_id INT NOT NULL AUTO_INCREMENT,
        coffin_id INT NOT NULL,
        tenant_slug VARCHAR(100) NOT NULL,
        deceased_id VARCHAR(100),
        quantity_used INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(15, 2) NOT NULL,
        total_price DECIMAL(15, 2) NOT NULL,
        invoice_id VARCHAR(100),
        used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_by INT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (usage_id),
        INDEX idx_coffin_id (coffin_id),
        INDEX idx_tenant_slug (tenant_slug),
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_invoice_id (invoice_id),
        INDEX idx_used_at (used_at),
        FOREIGN KEY (coffin_id) REFERENCES coffins(coffin_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '083_create_deceased_coffin_table',
    sql: `
      CREATE TABLE IF NOT EXISTS deceased_coffin (
        id INT NOT NULL AUTO_INCREMENT,
        deceased_id VARCHAR(100) NOT NULL,
        coffin_id INT NOT NULL,
        tenant_id VARCHAR(50) NOT NULL,
        assigned_by_username VARCHAR(100) DEFAULT NULL,
        assigned_date DATE NOT NULL,
        rfid VARCHAR(100) UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_coffin_id (coffin_id),
        INDEX idx_tenant_id (tenant_id),
        INDEX idx_assigned_date (assigned_date),
        UNIQUE KEY unique_deceased_coffin (deceased_id, coffin_id),
        FOREIGN KEY (coffin_id) REFERENCES coffins(coffin_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Portal / Memorial Service Migrations ────────────────────────────────────

const PORTAL_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '090_create_memorial_pages_table',
    sql: `
      CREATE TABLE IF NOT EXISTS memorial_pages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tenant_id INT NOT NULL,
        deceased_id INT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        biography TEXT NULL,
        family_message TEXT NULL,
        tribute_message TEXT NULL,
        funeral_details JSON NULL,
        burial_details JSON NULL,
        gallery JSON NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_tenant_slug (tenant_id, slug),
        INDEX idx_deceased (deceased_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '091_create_condolences_table',
    sql: `
      CREATE TABLE IF NOT EXISTS condolences (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tenant_id INT NOT NULL,
        memorial_id INT NOT NULL,
        visitor_name VARCHAR(255) NOT NULL,
        visitor_email VARCHAR(255) NULL,
        message TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT FALSE,
        is_flagged BOOLEAN DEFAULT FALSE,
        ip_address VARCHAR(45) NULL,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_memorial_approved (memorial_id, is_approved),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '092_create_virtual_candles_table',
    sql: `
      CREATE TABLE IF NOT EXISTS virtual_candles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tenant_id INT NOT NULL,
        memorial_id INT NOT NULL,
        visitor_name VARCHAR(255) NULL DEFAULT 'Anonymous',
        visitor_email VARCHAR(255) NULL,
        message TEXT NULL,
        ip_address VARCHAR(45) NULL,
        lit_at TIMESTAMP NULL,
        INDEX idx_memorial (memorial_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '093_create_memories_tributes_table',
    sql: `
      CREATE TABLE IF NOT EXISTS memories_tributes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tenant_id INT NOT NULL,
        memorial_id INT NOT NULL,
        visitor_name VARCHAR(255) NOT NULL,
        visitor_email VARCHAR(255) NULL,
        message TEXT NULL,
        media_url VARCHAR(500) NULL,
        media_type ENUM('photo', 'video', 'text') DEFAULT 'text',
        is_approved BOOLEAN DEFAULT FALSE,
        is_flagged BOOLEAN DEFAULT FALSE,
        ip_address VARCHAR(45) NULL,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_memorial_approved (memorial_id, is_approved),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── QR Code Service Migrations ──────────────────────────────────────────────

const QRCODE_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '100_create_qr_codes_table',
    sql: `
      CREATE TABLE IF NOT EXISTS qr_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id VARCHAR(50) NOT NULL,
        qr_type VARCHAR(50) NOT NULL DEFAULT 'profile',
        qr_data TEXT NOT NULL,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        scanned_count INT DEFAULT 0,
        last_scanned_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_qr_type (qr_type),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Search / Analytics Migrations ───────────────────────────────────────────

const ANALYTICS_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '110_create_search_logs_table',
    sql: `
      CREATE TABLE IF NOT EXISTS search_logs (
        search_log_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        query VARCHAR(255) NOT NULL,
        result_count INT DEFAULT 0,
        response_time_ms INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '111_create_search_index_table',
    sql: `
      CREATE TABLE IF NOT EXISTS search_index (
        search_index_id INT PRIMARY KEY AUTO_INCREMENT,
        module_name VARCHAR(50) NOT NULL,
        record_id INT NOT NULL,
        search_text VARCHAR(500),
        indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_record (module_name, record_id),
        INDEX idx_tenant_module (module_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── EDocuments Service Migrations ───────────────────────────────────────────

const EDOCUMENTS_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '120_create_edocuments_table',
    sql: `
      CREATE TABLE IF NOT EXISTS edocuments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id VARCHAR(50) NOT NULL,
        document_type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT,
        file_path VARCHAR(500),
        file_format ENUM('pdf', 'docx', 'html', 'txt') DEFAULT 'pdf',
        status ENUM('draft', 'final', 'archived') DEFAULT 'draft',
        version INT DEFAULT 1,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_document_type (document_type),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Visitors Service Migrations ─────────────────────────────────────────────

const VISITORS_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '130_create_visitor_logs_table',
    sql: `
      CREATE TABLE IF NOT EXISTS visitor_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        visitor_name VARCHAR(255) NOT NULL,
        visitor_phone VARCHAR(20),
        visitor_email VARCHAR(255),
        visitor_id_number VARCHAR(50),
        purpose VARCHAR(255),
        deceased_id VARCHAR(50),
        branch_id INT,
        check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        check_out_time TIMESTAMP NULL,
        is_approved BOOLEAN DEFAULT FALSE,
        approved_by INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_branch_id (branch_id),
        INDEX idx_check_in_time (check_in_time),
        INDEX idx_visitor_phone (visitor_phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Hearse Service Migrations ───────────────────────────────────────────────

const HEARSE_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '150_create_hearses_table',
    sql: `
      CREATE TABLE IF NOT EXISTS hearses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plate_number VARCHAR(50) NOT NULL UNIQUE,
        hearse_name VARCHAR(255) NOT NULL,
        model VARCHAR(255),
        capacity INT DEFAULT 4,
        branch_id INT,
        branch_code VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_plate_number (plate_number),
        INDEX idx_branch_id (branch_id),
        INDEX idx_branch_code (branch_code),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '151_create_hearse_bookings_table',
    sql: `
      CREATE TABLE IF NOT EXISTS hearse_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_reference VARCHAR(100) UNIQUE,
        hearse_id INT NOT NULL,
        deceased_id VARCHAR(50) NOT NULL,
        branch_id INT NOT NULL,
        pickup_location TEXT NOT NULL,
        destination TEXT NOT NULL,
        booking_date DATETIME NOT NULL,
        completed_at DATETIME NULL,
        status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        driver_id INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_hearse_id (hearse_id),
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_branch_id (branch_id),
        INDEX idx_status (status),
        INDEX idx_booking_date (booking_date),
        FOREIGN KEY (hearse_id) REFERENCES hearses(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Chemicals Service Migrations ────────────────────────────────────────────

const CHEMICALS_SERVICE_MIGRATIONS: Migration[] = [
  {
    name: '140_create_chemicals_table',
    sql: `
      CREATE TABLE IF NOT EXISTS chemicals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chemical_name VARCHAR(255) NOT NULL,
        chemical_code VARCHAR(100) UNIQUE,
        category VARCHAR(100),
        unit VARCHAR(50),
        current_stock DECIMAL(10, 2) DEFAULT 0,
        minimum_stock DECIMAL(10, 2) DEFAULT 0,
        unit_price DECIMAL(10, 2) DEFAULT 0,
        supplier VARCHAR(255),
        expiry_date DATE,
        storage_location VARCHAR(255),
        safety_data_sheet_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_chemical_code (chemical_code),
        INDEX idx_category (category),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '141_create_chemical_transactions_table',
    sql: `
      CREATE TABLE IF NOT EXISTS chemical_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chemical_id INT NOT NULL,
        transaction_type ENUM('received', 'used', 'disposed', 'transferred', 'adjusted') NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit_price DECIMAL(10, 2),
        total_amount DECIMAL(10, 2),
        reference_number VARCHAR(100),
        deceased_id VARCHAR(50),
        used_by INT,
        approved_by INT,
        notes TEXT,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_chemical_id (chemical_id),
        INDEX idx_transaction_type (transaction_type),
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_transaction_date (transaction_date),
        FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '142_create_deceased_chemical_usage_table',
    sql: `
      CREATE TABLE IF NOT EXISTS deceased_chemical_usage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deceased_id VARCHAR(50) NOT NULL,
        chemical_id INT NOT NULL,
        quantity_used DECIMAL(10, 2) NOT NULL,
        embalming_date TIMESTAMP NULL,
        embalmed_by INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_chemical_id (chemical_id),
        INDEX idx_embalming_date (embalming_date),
        FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '143_create_chemical_alerts_table',
    sql: `
      CREATE TABLE IF NOT EXISTS chemical_alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chemical_id INT NOT NULL,
        alert_type ENUM('low_stock', 'expired', 'near_expiry') NOT NULL,
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        message TEXT,
        is_resolved BOOLEAN DEFAULT FALSE,
        resolved_by INT,
        resolved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_chemical_id (chemical_id),
        INDEX idx_alert_type (alert_type),
        INDEX idx_is_resolved (is_resolved),
        FOREIGN KEY (chemical_id) REFERENCES chemicals(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '144_create_ppe_requests_table',
    sql: `
      CREATE TABLE IF NOT EXISTS ppe_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        requester_id INT NOT NULL,
        ppe_items JSON NOT NULL,
        urgency ENUM('normal', 'urgent', 'emergency') DEFAULT 'normal',
        status ENUM('pending', 'approved', 'rejected', 'fulfilled') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        fulfilled_at TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_requester_id (requester_id),
        INDEX idx_status (status),
        INDEX idx_urgency (urgency)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: '145_create_chemical_transfers_table',
    sql: `
      CREATE TABLE IF NOT EXISTS chemical_transfers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chemical_id INT NOT NULL,
        from_branch_id INT,
        to_branch_id INT,
        quantity DECIMAL(10, 2) NOT NULL,
        transferred_by INT NOT NULL,
        approved_by INT,
        notes TEXT,
        transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_chemical_id (chemical_id),
        INDEX idx_from_branch (from_branch_id),
        INDEX idx_to_branch (to_branch_id),
        INDEX idx_transfer_date (transfer_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Export All Migrations ────────────────────────────────────────────────────

export const ALL_SERVICE_MIGRATIONS: Migration[] = [
  ...TENANT_SERVICE_MIGRATIONS,
  ...DECEASED_SERVICE_MIGRATIONS,
  ...MARKETPLACE_SERVICE_MIGRATIONS,
  ...INVOICE_SERVICE_MIGRATIONS,
  ...DOCUMENTS_SERVICE_MIGRATIONS,
  ...NOTIFICATIONS_SERVICE_MIGRATIONS,
  ...CALENDAR_SERVICE_MIGRATIONS,
  ...BODY_CHECKOUT_SERVICE_MIGRATIONS,
  ...COFFIN_SERVICE_MIGRATIONS,
  ...PORTAL_SERVICE_MIGRATIONS,
  ...QRCODE_SERVICE_MIGRATIONS,
  ...ANALYTICS_SERVICE_MIGRATIONS,
  ...EDOCUMENTS_SERVICE_MIGRATIONS,
  ...VISITORS_SERVICE_MIGRATIONS,
  ...CHEMICALS_SERVICE_MIGRATIONS,
  ...HEARSE_SERVICE_MIGRATIONS,
];

// ─── Export by Service ────────────────────────────────────────────────────────

export {
  TENANT_SERVICE_MIGRATIONS,
  DECEASED_SERVICE_MIGRATIONS,
  MARKETPLACE_SERVICE_MIGRATIONS,
  INVOICE_SERVICE_MIGRATIONS,
  DOCUMENTS_SERVICE_MIGRATIONS,
  NOTIFICATIONS_SERVICE_MIGRATIONS,
  CALENDAR_SERVICE_MIGRATIONS,
  BODY_CHECKOUT_SERVICE_MIGRATIONS,
  COFFIN_SERVICE_MIGRATIONS,
  PORTAL_SERVICE_MIGRATIONS,
  QRCODE_SERVICE_MIGRATIONS,
  ANALYTICS_SERVICE_MIGRATIONS,
  EDOCUMENTS_SERVICE_MIGRATIONS,
  VISITORS_SERVICE_MIGRATIONS,
  CHEMICALS_SERVICE_MIGRATIONS,
  HEARSE_SERVICE_MIGRATIONS,
};

// ─── Helper Functions ────────────────────────────────────────────────────────

export function getMainTenantMigrations(): Migration[] {
  return [
    ...TENANT_SERVICE_MIGRATIONS,
    ...HEARSE_SERVICE_MIGRATIONS,
  ];
}

export function getBranchMigrations(): Migration[] {
  // Branch databases get a subset of migrations (no organizations, users, branches tables)
  return [
    ...DECEASED_SERVICE_MIGRATIONS,
    ...MARKETPLACE_SERVICE_MIGRATIONS,
    ...INVOICE_SERVICE_MIGRATIONS,
    ...DOCUMENTS_SERVICE_MIGRATIONS,
    ...NOTIFICATIONS_SERVICE_MIGRATIONS,
    ...CALENDAR_SERVICE_MIGRATIONS,
    ...BODY_CHECKOUT_SERVICE_MIGRATIONS,
    ...COFFIN_SERVICE_MIGRATIONS,
    ...PORTAL_SERVICE_MIGRATIONS,
    ...QRCODE_SERVICE_MIGRATIONS,
    ...ANALYTICS_SERVICE_MIGRATIONS,
    ...EDOCUMENTS_SERVICE_MIGRATIONS,
    ...VISITORS_SERVICE_MIGRATIONS,
    ...CHEMICALS_SERVICE_MIGRATIONS,
    ...HEARSE_SERVICE_MIGRATIONS,
  ];
}

export function getSoftDeleteMigrations(): Migration[] {
  return [
    {
      name: '001_add_soft_delete_to_users',
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_active, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '002_add_soft_delete_to_organizations',
      sql: `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_active, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '003_add_soft_delete_to_branches',
      sql: `ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_active, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '004_add_soft_delete_to_deceased',
      sql: `ALTER TABLE deceased ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_embalmed, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '005_add_soft_delete_to_next_of_kin',
      sql: `ALTER TABLE next_of_kin ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER created_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(100) NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '006_add_soft_delete_to_postmortem',
      sql: `ALTER TABLE postmortem ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER status, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '007_add_soft_delete_to_charges',
      sql: `ALTER TABLE charges ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER status, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '008_add_soft_delete_to_portal_tracking',
      sql: `ALTER TABLE portal_tracking ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER status, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '009_add_soft_delete_to_marketplace_products',
      sql: `ALTER TABLE marketplace_products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER status, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '010_add_soft_delete_to_shopping_cart',
      sql: `ALTER TABLE shopping_cart ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER added_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '011_add_soft_delete_to_orders',
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER status, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '012_add_soft_delete_to_order_items',
      sql: `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER created_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '013_add_soft_delete_to_invoices',
      sql: `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER status, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '014_add_soft_delete_to_payments',
      sql: `ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER status, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '015_add_soft_delete_to_documents',
      sql: `ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER status, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '016_add_soft_delete_to_notifications',
      sql: `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_read, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '017_add_soft_delete_to_events',
      sql: `ALTER TABLE events ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '018_add_soft_delete_to_event_attendees',
      sql: `ALTER TABLE event_attendees ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER updated_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '019_add_soft_delete_to_event_reminders',
      sql: `ALTER TABLE event_reminders ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER created_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '020_add_soft_delete_to_event_categories',
      sql: `ALTER TABLE event_categories ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_active, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '021_add_soft_delete_to_event_logs',
      sql: `ALTER TABLE event_logs ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER created_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '022_add_soft_delete_to_body_checkout',
      sql: `ALTER TABLE body_checkout ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER updated_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '023_add_soft_delete_to_coffins',
      sql: `ALTER TABLE coffins ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_active, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '024_add_soft_delete_to_coffin_images',
      sql: `ALTER TABLE coffin_images ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER created_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '025_add_soft_delete_to_coffin_usage',
      sql: `ALTER TABLE coffin_usage ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER updated_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '026_add_soft_delete_to_deceased_coffin',
      sql: `ALTER TABLE deceased_coffin ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER created_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '027_add_soft_delete_to_memorial_pages',
      sql: `ALTER TABLE memorial_pages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_active, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '028_add_soft_delete_to_condolences',
      sql: `ALTER TABLE condolences ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_flagged, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '029_add_soft_delete_to_virtual_candles',
      sql: `ALTER TABLE virtual_candles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER lit_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '030_add_soft_delete_to_memories_tributes',
      sql: `ALTER TABLE memories_tributes ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_flagged, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '031_add_soft_delete_to_qr_codes',
      sql: `ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_active, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '032_add_soft_delete_to_search_logs',
      sql: `ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER created_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '033_add_soft_delete_to_search_index',
      sql: `ALTER TABLE search_index ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER indexed_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '034_add_soft_delete_to_edocuments',
      sql: `ALTER TABLE edocuments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER status, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '035_add_soft_delete_to_visitor_logs',
      sql: `ALTER TABLE visitor_logs ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER updated_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '036_add_soft_delete_to_activity_logs',
      sql: `ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER created_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '037_add_soft_delete_to_refresh_tokens',
      sql: `ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER is_active, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
    {
      name: '038_add_soft_delete_to_mortuary_settings',
      sql: `ALTER TABLE mortuary_settings ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE AFTER updated_at, ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER is_deleted, ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at, ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted)`
    },
  ];
}
