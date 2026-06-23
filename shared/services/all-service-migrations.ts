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
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT FALSE,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
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
        deceased_id VARCHAR(50) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        admission_number VARCHAR(100) UNIQUE,
        email VARCHAR(255),
        phone_number VARCHAR(20),
        date_of_death TIMESTAMP NULL,
        date_admitted TIMESTAMP NULL,
        cause_of_death TEXT,
        status ENUM('active', 'pending', 'completed', 'archived') DEFAULT 'active',
        total_mortuary_charge DECIMAL(10, 2) DEFAULT 0,
        coffin_status VARCHAR(50),
        dispatch_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_admission_number (admission_number),
        INDEX idx_date_of_death (date_of_death)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
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
        deceased_id VARCHAR(50) NOT NULL,
        visitor_name VARCHAR(255) NOT NULL,
        visitor_phone VARCHAR(20),
        visitor_email VARCHAR(255),
        purpose VARCHAR(255),
        check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        check_out TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_deceased_id (deceased_id),
        INDEX idx_check_in (check_in)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

// ─── Helper Functions (for main tenant vs branch database migrations) ─────────

/**
 * Returns migrations for the main tenant database.
 * CRITICAL FIX: Returns ALL migrations so that EVERYTHING goes into the tenant's main database.
 * This ensures complete data isolation - each tenant has their own database with ALL tables.
 * No data is shared between tenants.
 * 
 * Architecture:
 * - Each tenant gets ONE database (tenant_{slug})
 * - That database contains ALL tables: users, deceased, coffins, invoices, documents, etc.
 * - Branches are just logical divisions (tracked in branches table), NOT separate databases
 * - This ensures 100% data isolation between tenants
 */
export function getMainTenantMigrations(): Migration[] {
  return [
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
  ];
}

/**
 * Returns migrations for a branch-specific database.
 * CRITICAL FIX: Branch databases are no longer used.
 * All data goes into the main tenant database for complete isolation.
 * This function is kept for backwards compatibility but returns empty array.
 */
export function getBranchMigrations(): Migration[] {
  // CRITICAL FIX: Branch databases are deprecated
  // All data now goes into the main tenant database
  // This ensures complete data isolation per tenant
  console.log(`[MigrationService] ⚠️  Branch databases are deprecated - all data goes to main tenant database`);
  return [];
}

/**
 * Returns all migrations (both main and branch) for backwards compatibility.
 */
export function getAllTenantMigrations(): Migration[] {
  return ALL_SERVICE_MIGRATIONS;
}

/**
 * Returns all migrations grouped by category for reporting.
 */
export function getMigrationsByCategory(): Record<string, Migration[]> {
  return {
    tenant: TENANT_SERVICE_MIGRATIONS,
    deceased: DECEASED_SERVICE_MIGRATIONS,
    marketplace: MARKETPLACE_SERVICE_MIGRATIONS,
    invoice: INVOICE_SERVICE_MIGRATIONS,
    documents: DOCUMENTS_SERVICE_MIGRATIONS,
    notifications: NOTIFICATIONS_SERVICE_MIGRATIONS,
    calendar: CALENDAR_SERVICE_MIGRATIONS,
    bodyCheckout: BODY_CHECKOUT_SERVICE_MIGRATIONS,
    coffin: COFFIN_SERVICE_MIGRATIONS,
    portal: PORTAL_SERVICE_MIGRATIONS,
    qrcode: QRCODE_SERVICE_MIGRATIONS,
    analytics: ANALYTICS_SERVICE_MIGRATIONS,
    edocuments: EDOCUMENTS_SERVICE_MIGRATIONS,
    visitors: VISITORS_SERVICE_MIGRATIONS,
  };
}

// ─── All Service Migrations (Exported) ───────────────────────────────────────

/**
 * Complete ordered array of all migrations across all services.
 * 
 * Migration names are prefixed with a numeric order to ensure deterministic
 * execution across all tenant databases.
 * 
 * To add a new migration:
 * 1. Create it in the appropriate service migration array above
 * 2. Use the next available number prefix (e.g., 140_xxx)
 * 3. The name must be globally unique across all services
 */
export const ALL_SERVICE_MIGRATIONS: Migration[] = [
  // Tenant Service (001-009)
  ...TENANT_SERVICE_MIGRATIONS,

  // Deceased Service (010-019)
  ...DECEASED_SERVICE_MIGRATIONS,

  // Marketplace Service (020-029)
  ...MARKETPLACE_SERVICE_MIGRATIONS,

  // Invoice & Payments Service (030-039)
  ...INVOICE_SERVICE_MIGRATIONS,

  // Documents Service (040-049)
  ...DOCUMENTS_SERVICE_MIGRATIONS,

  // Notifications Service (050-059)
  ...NOTIFICATIONS_SERVICE_MIGRATIONS,

  // Calendar / Events Service (060-069)
  ...CALENDAR_SERVICE_MIGRATIONS,

  // Body Checkout Service (070-079)
  ...BODY_CHECKOUT_SERVICE_MIGRATIONS,

  // Coffin Service (080-089)
  ...COFFIN_SERVICE_MIGRATIONS,

  // Portal / Memorial Service (090-099)
  ...PORTAL_SERVICE_MIGRATIONS,

  // QR Code Service (100-109)
  ...QRCODE_SERVICE_MIGRATIONS,

  // Search / Analytics Service (110-119)
  ...ANALYTICS_SERVICE_MIGRATIONS,

  // EDocuments Service (120-129)
  ...EDOCUMENTS_SERVICE_MIGRATIONS,

  // Visitors Service (130-139)
  ...VISITORS_SERVICE_MIGRATIONS,
];

export default ALL_SERVICE_MIGRATIONS;