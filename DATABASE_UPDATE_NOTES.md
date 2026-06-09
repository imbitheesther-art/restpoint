# Database Update - Matching Existing Structure

**Date:** June 2, 2026
**Status:** ✅ UPDATED TO MATCH EXISTING DATABASE

## Changes Made

### 1. Auth Service (apps/auth-service/server.ts) - COMPLETELY REWRITTEN

**Updated to match your database structure:**

#### Field Name Changes
```diff
- first_name, last_name  →  full_name
- status (enum: 'active', 'inactive', 'suspended')  →  is_active (tinyint)
- email_verified (boolean)  →  is_verified (tinyint)
- role enum('admin', 'staff', 'viewer')  →  role enum('admin', 'manager', 'staff')
```

#### Database Naming
```diff
- restpoint_${slug}  →  mortuary_${slug}_${timestamp}
Example: mortuary_mumo_feuneral_home_1780381103619
```

#### New Database Tables Created
The auth service now creates:
1. `users` - staff accounts (full_name, is_active, is_verified)
2. `refresh_tokens` - token management
3. `mortuary_settings` - tenant configuration

#### Login Flow (NEW)
```
1. Search all active tenants in master_db
2. Query each tenant's database for user with email
3. If found: verify password, generate JWT
4. JWT includes: userId, tenantId, tenantSlug, email, role, fullName
```

**Why this approach?**
- ✅ Works with your existing mortuary_* databases
- ✅ No need for master_users table
- ✅ Supports multiple tenants
- ✅ Matches your schema exactly

### 2. Environment Configuration (.env.production)

**Updated credentials:**
```diff
- DB_USER=restpoint_user  →  DB_USER=root
- DB_PASSWORD=...  →  DB_PASSWORD=  (empty for local)
```

**Now matches:** Your local MariaDB setup with root user

### 3. JWT Token Payload

**Updated to include fullName:**
```json
{
  "userId": 1,
  "tenantId": 47,
  "tenantSlug": "mumo_feuneral_home",
  "email": "admin@mumo.com",
  "role": "admin",
  "fullName": "Admin User",
  "iat": 1717324843,
  "exp": 1717929643
}
```

### 4. User Registration Response

**Now creates:**
- ✅ Tenant record in master_db
- ✅ New database: mortuary_${slug}_${timestamp}
- ✅ Users table with correct schema
- ✅ Refresh_tokens table
- ✅ Mortuary_settings table
- ✅ Admin user record
- ✅ JWT with all context

## Testing the Updated System

### 1. Verify Master Database
```bash
mysql -u root master_db
SHOW TABLES;
DESCRIBE tenants;
```

Expected output:
```
Tables_in_master_db
tenants
```

### 2. Verify Tenant Database Structure
```bash
mysql -u root mortuary_mumo_feuneral_home_1780381103619
SHOW TABLES;
DESCRIBE users;
```

Expected output:
```
Tables_in_mortuary_mumo_feuneral_home_1780381103619
users
refresh_tokens
mortuary_settings
```

### 3. Test Login with Existing Tenant

```bash
curl -X POST http://localhost:8000/api/v1/restpoint/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mumo.com",
    "password": "your-password"
  }'
```

Expected response:
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "userId": 1,
    "email": "admin@mumo.com",
    "fullName": "Admin Name",
    "role": "admin"
  },
  "tenant": {
    "tenantId": 47,
    "tenantSlug": "mumo_feuneral_home",
    "tenantName": "Mumo Funeral Home",
    "dbName": "mortuary_mumo_feuneral_home_1780381103619"
  }
}
```

### 4. Test Registration with New Tenant

```bash
curl -X POST http://localhost:8000/api/v1/restpoint/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Test Funeral Home",
    "email": "admin@test.com",
    "password": "SecurePass123!",
    "fullName": "Test Admin"
  }'
```

This will:
- Create tenant in master_db
- Create new database: mortuary_test_funeral_home_${timestamp}
- Create all tables
- Create admin user
- Return JWT

## Files Modified

| File | Changes |
|------|---------|
| `apps/auth-service/server.ts` | ✅ COMPLETELY REWRITTEN |
| `.env.production` | ✅ Updated DB credentials |
| `apps/auth-service/server.ts.bak` | Backup of old version |

## Files That Need Updating Next

### Services to Update (same pattern)

Each service needs to be updated to:
1. Use `getTenantDB()` for tenant-specific queries
2. Use correct field names: `full_name`, `is_active`, `is_verified`
3. Query correct tenant database from JWT: `req.tenantDbName`

#### Services Affected:
- [ ] `apps/users-service/server.ts`
- [ ] `apps/deceased-service/server.ts`
- [ ] `apps/invoice-service/controllers/*.ts`
- [ ] All other tenant-specific services

### Pattern to Follow

```typescript
// For querying user data in any service:
import { getTenantDB } from '../../shared/dbConfig';

app.get('/api/v1/restpoint/users', tenantMiddleware, asyncHandler(async (req, res) => {
  const tenantDbName = req.tenantDbName; // From JWT via middleware
  const tenantPool = await getTenantDB(tenantDbName);
  const conn = await tenantPool.getConnection();
  
  try {
    const [users] = await conn.query(
      'SELECT * FROM users WHERE is_active = 1'
    );
    
    res.json({ success: true, users });
  } finally {
    conn.release();
  }
}));
```

## Next Steps

### 1. Update Shared Modules
- [ ] Update `shared/tenantMiddleware.ts` to attach `tenantDbName`
- [ ] Update `shared/dbConfig.ts` documentation
- [ ] Verify connection pooling with mortuary_* databases

### 2. Test Auth Service
```bash
cd apps/auth-service
npm install
npm run dev
```

Then test login/register endpoints

### 3. Update Other Services
Each service needs the same tenant middleware pattern

### 4. Update Frontend
Ensure frontend:
- ✅ Stores JWT in memory (not localStorage)
- ✅ Sends Authorization header with all requests
- ✅ Uses `fullName` from JWT payload

## Configuration Checklist

- [ ] MySQL running: `mysql -u root` works
- [ ] Master DB exists: `master_db` database exists
- [ ] Tenant DB(s) exist: `mortuary_*` databases exist
- [ ] Users table has: `full_name`, `is_active`, `is_verified` columns
- [ ] .env.production configured with correct credentials
- [ ] Redis running on default port (6379)

## Known Issues & Solutions

### Issue: "Unknown column 'first_name'"
**Solution:** Database was created with `full_name` column. Code now updated to use it.

### Issue: "Column 'status' doesn't exist"
**Solution:** Database uses `is_active` (tinyint) instead of `status` (enum). Code updated.

### Issue: "Cannot find table 'users' in database"
**Solution:** Database name doesn't match. Check that `tenantDbName` from JWT is correct.
Example: `mortuary_mumo_feuneral_home_1780381103619`

### Issue: "Cannot find database 'restpoint_*'"
**Solution:** Your system uses `mortuary_*` prefix, not `restpoint_*`. Code now updated.

## Architecture Update

### Before (Incompatible)
```
Master DB (master_db)
└── users (NO - not in actual system)
└── tenants

Tenant DB (restpoint_${slug})
├── users (first_name, last_name, status)
├── deceased
└── invoices
```

### After (NOW COMPATIBLE) ✅
```
Master DB (master_db)
└── tenants

Tenant DB (mortuary_${slug}_${timestamp})
├── users (full_name, is_active, is_verified)
├── refresh_tokens
├── mortuary_settings
└── (other tables as added)
```

## Verification Script

Run this to verify everything is setup correctly:

```bash
#!/bin/bash

echo "🔍 Checking database structure..."

# Check master DB
mysql -u root master_db -e "SELECT COUNT(*) as tenant_count FROM tenants;" 2>/dev/null

# Check a tenant DB (adjust name as needed)
TENANT_DB=$(mysql -u root master_db -e "SELECT db_name FROM tenants LIMIT 1;" 2>/dev/null | tail -1)

echo "Checking tenant database: $TENANT_DB"
mysql -u root "$TENANT_DB" -e "DESC users;" 2>/dev/null
```

## Support

**If you encounter issues:**

1. Check database structure matches documentation
2. Verify .env.production has correct credentials
3. Test database connection: `mysql -u root master_db`
4. Check logs in `apps/auth-service/logs/`
5. Review error response from API

---

**Status:** ✅ Code updated to match existing database structure
**Next:** Update other services and test login flow
**Support:** Check PRODUCTION_IMPLEMENTATION_GUIDE.md for full reference
