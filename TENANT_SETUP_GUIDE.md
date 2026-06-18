# Tenant Setup & Configuration Guide

## Multi-Tenant Architecture

RestPoint uses complete database isolation where each tenant has a dedicated MariaDB database and user account with restricted permissions.

## How It Works

RestPoint Master Database
├── Tenant 1 Database (restpoint_tenant_001)
│   └── User: tenant_001 (restricted access)
├── Tenant 2 Database (restpoint_tenant_002)
│   └── User: tenant_002 (restricted access)
└── Tenant N Database (restpoint_tenant_00N)
    └── User: tenant_00N (restricted access)

## Tenant Onboarding

When a new tenant registers:

1. Tenant fills out onboarding form
   - Mortuary name
   - Contact information
   - Services offered (embalming, cremation, chapel, etc.)

2. System creates dedicated database
   - Database: restpoint_tenant_{tenantId}
   - User: tenant_{tenantId}
   - Password: auto-generated (32 chars, stored in secure vault)

3. Tenant configuration initialized
   - Operating hours
   - Service settings
   - Capacity limits
   - Custom branding

## Tenant Settings Page

Tenants can configure:
- Operating hours (start/end time)
- Services offered
- Daily capacity
- Custom branding (logo, colors)
- Staff management
- Integration settings

## Data Isolation

Each tenant:
- Has isolated database (no cross-tenant queries possible)
- Uses dedicated DB user with limited permissions
- Cannot access other tenants data
- Has encrypted backups stored separately

## Account Deletion

1. Tenant requests deletion
2. Email confirmation sent
3. 30-day waiting period
4. Automatic deletion after confirmation
5. Data retained for compliance (encrypted, anonymized)

## Security: Midnight-4AM Block

Access restrictions for high-profile roles (Admin, Director, Finance):
- Cannot login between 00:00 - 04:00
- Protects sensitive mortuary data
- All attempts logged for audit
- Can be configured per-tenant

## Terms of Service

Data Retention:
- Active tenant data: indefinite
- Deleted records: 90 days (soft delete)
- Backups: 30 days (active), 7 years (legal)
- Access logs: 2 years

## Implementation Status

✓ Tenant database manager (services/tenant-service/tenant-db-manager.js)
✓ Auth security guard (services/auth-service/auth-security-guard.js)
⏳ Onboarding page (FrontendClient/client/pages/onboarding.jsx)
⏳ Settings page (FrontendClient/client/pages/tenant-settings.jsx)
⏳ Deletion request API (services/tenant-service/deletion.js)
⏳ Terms of service document
