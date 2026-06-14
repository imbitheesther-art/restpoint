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
