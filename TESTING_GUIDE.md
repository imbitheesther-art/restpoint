# Testing Guide - RestPoint Platform

## Quick Start: Verify Onboarding is Fixed

### 1. Start Services
```bash
# Terminal 1: Tenant Service
cd apps/tenant-service
npm install
npm start
# Expected: ✅ Tenant Service running on port 8002
# Expected: ✅ Database migrations completed

# Terminal 2: API Gateway
cd apps/api-gateway
npm start
# Expected: ✅ API Gateway running on port 8000
```

### 2. Test Onboarding Registration

```bash
# Create new tenant
curl -X POST http://localhost:8000/api/onboarding/organization \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "Lee Funeral Home",
    "email": "admin@lee.com",
    "password": "SecurePassword123",
    "full_name": "Lee Manager",
    "phone": "+254712345678",
    "location": "Nairobi, Kenya"
  }'

# Expected Response (✅ SUCCESS):
{
  "success": true,
  "message": "Organization registered successfully",
  "tenant": {
    "tenant_id": 1,
    "tenant_name": "Lee Funeral Home",
    "tenant_slug": "lee-funeral-home",
    "email": "admin@lee.com",
    "status": "active",
    "subscription_status": "trial"
  },
  "user": {
    "user_id": 1,
    "email": "admin@lee.com",
    "role": "admin"
  },
  "token": "eyJhbGc..."
}
```

### 3. Test Deceased Service

```bash
# Start Deceased Service
cd apps/deceased-service
npm start
# Expected: ✅ Deceased service is running on port 8103

# Create deceased record
curl -X POST http://localhost:8000/api/v1/restpoint/deceased/register-deceased \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "x-tenant-slug: lee-funeral-home" \
  -d '{
    "full_name": "John Doe",
    "national_id": "123456789",
    "date_of_birth": "1960-01-15",
    "date_of_death": "2026-06-01",
    "gender": "Male",
    "place_of_death": "Nairobi Hospital",
    "county": "Nairobi",
    "admission_number": "ADM-2026-001"
  }'

# Expected Response:
{
  "success": true,
  "deceased": {
    "id": 1,
    "deceased_id": "LEE_FUNERAL_HOME_2026_0001",
    "full_name": "John Doe",
    "national_id": "123456789",
    "admission_status": "admitted",
    "release_status": "pending",
    "created_at": "2026-06-02T10:30:00Z"
  }
}
```

### 4. Test Invoice Service

```bash
# Start Invoice Service
cd apps/invoice-service
npm start
# Expected: ✅ invoice-service is running on port 8106

# Create invoice
curl -X POST http://localhost:8000/api/v1/restpoint/invoices/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "x-tenant-slug: lee-funeral-home" \
  -d '{
    "deceased_id": "LEE_FUNERAL_HOME_2026_0001",
    "service_date": "2026-06-02",
    "items": [
      {
        "service_type": "embalming",
        "service_description": "Professional Embalming Service",
        "quantity": 1,
        "unit_price": 15000,
        "tax_rate": 16
      },
      {
        "service_type": "coffin",
        "service_description": "Premium Wooden Coffin",
        "quantity": 1,
        "unit_price": 25000,
        "tax_rate": 16
      }
    ]
  }'

# Expected Response:
{
  "success": true,
  "invoice": {
    "invoice_id": 1,
    "invoice_number": "INV-2026-00001",
    "deceased_id": "LEE_FUNERAL_HOME_2026_0001",
    "status": "draft",
    "subtotal": 40000,
    "tax_amount": 6400,
    "total": 46400,
    "balance_due": 46400
  }
}
```

### 5. Test Socket.io Real-Time

```bash
# Start Socket.io Service
cd apps/socketio-service
npm start
# Expected: ⚡ Socket.IO Service running on port 8010

# In browser console or Node.js client:
const io = require('socket.io-client');
const socket = io('http://localhost:8010');

socket.on('connect', () => {
  console.log('Connected!');
  
  // Join tenant room
  socket.emit('join-tenant', {
    tenantSlug: 'lee-funeral-home',
    userId: 1,
    userRole: 'admin'
  });
});

socket.on('notification:deceased-admitted', (data) => {
  console.log('🔔 Notification:', data);
});

socket.on('joined', (data) => {
  console.log('✅ Joined room:', data.room);
});

// Emit event from service
socket.emit('deceased-admitted', {
  tenantSlug: 'lee-funeral-home',
  deceasedId: 'LEE_FUNERAL_HOME_2026_0001',
  fullName: 'John Doe',
  admissionNumber: 'ADM-2026-001'
});
```

### 6. Test Extra Charges

```bash
# Start Extra Charges Service (if available)
# Would run on custom port, integrated via Socket.io

# Create extra charge
curl -X POST http://localhost:8000/api/v1/restpoint/extra-charges/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "x-tenant-slug: lee-funeral-home" \
  -d '{
    "deceased_id": "LEE_FUNERAL_HOME_2026_0001",
    "charge_type": "transport",
    "amount": 5000,
    "service_date": "2026-06-02",
    "notes": "Transport from hospital to mortuary"
  }'

# Expected Response:
{
  "success": true,
  "charge": {
    "charge_id": 1,
    "charge_type": "transport",
    "amount": 5000,
    "status": "pending",
    "approval_status": "pending"
  }
}

# Approve charge
curl -X PUT http://localhost:8000/api/v1/restpoint/extra-charges/1/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "x-tenant-slug: lee-funeral-home" \
  -d '{
    "approved_by": 1,
    "comments": "Approved by manager"
  }'

# Expected Response:
{
  "success": true,
  "charge": {
    "charge_id": 1,
    "status": "approved",
    "approval_status": "approved"
  }
}
```

---

## Database Verification

### Check Master DB
```bash
mysql -u root -p

USE master_db;
SHOW TABLES;

# Expected tables:
# - tenants
# - knex_migrations

SELECT * FROM tenants;
# Should show registered tenants
```

### Check Tenant DB
```bash
# Find tenant database name
SELECT db_name FROM tenants WHERE tenant_slug = 'lee-funeral-home';
# Example result: mortuary_lee_funeral_home_1717315200000

USE mortuary_lee_funeral_home_1717315200000;
SHOW TABLES;

# Expected tables:
# - users
# - deceased
# - next_of_kin
# - invoices
# - invoice_items
# - invoice_payments
# - coffins
# - coffin_images
# - coffin_usage
# - extra_charges
# - charge_types
# - charge_approvals
# - refresh_tokens
# - mortuary_settings

SELECT * FROM deceased;
SELECT * FROM invoices;
```

---

## Error Scenarios & Troubleshooting

### 1. "Unknown column 'tenant_slug'" Error
**Cause**: Master DB migration not run  
**Fix**:
```bash
cd apps/tenant-service
node scripts/migrate.js
```

### 2. "Cannot find module 'tenantDB'"
**Cause**: Missing `config/tenantDatabase.ts`  
**Fix**: Ensure config exists and connection pool is initialized

### 3. "Tenant not found" Error
**Cause**: x-tenant-slug header missing or invalid  
**Fix**: Always include header:
```bash
-H "x-tenant-slug: lee-funeral-home"
```

### 4. Socket.io "Connection refused"
**Cause**: Service not running  
**Fix**: Start Socket.io service
```bash
cd apps/socketio-service
npm start
```

---

## Load Testing Script

```bash
#!/bin/bash

# Test registration with multiple tenants
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/onboarding/organization \
    -H "Content-Type: application/json" \
    -d "{
      \"organizationName\": \"Test Mortuary $i\",
      \"email\": \"admin$i@test.mortuary\",
      \"password\": \"Password123\",
      \"full_name\": \"Admin $i\",
      \"location\": \"Location $i\"
    }"
  echo "Created tenant $i"
  sleep 1
done

# Test concurrent deceased admissions
for tenant in {1..5}; do
  for person in {1..10}; do
    curl -X POST http://localhost:8000/api/v1/restpoint/deceased/register-deceased \
      -H "Content-Type: application/json" \
      -H "x-tenant-slug: test-mortuary-$tenant" \
      -d "{
        \"full_name\": \"Person $person\",
        \"national_id\": \"ID000$person$tenant\",
        \"date_of_birth\": \"1960-01-01\",
        \"date_of_death\": \"2026-06-02\",
        \"gender\": \"Male\",
        \"place_of_death\": \"Hospital\",
        \"county\": \"Nairobi\",
        \"admission_number\": \"ADM-$person$tenant\"
      }" &
  done
done

wait
echo "All tests completed"
```

---

## Performance Benchmarks

### Expected Response Times
- Onboarding: < 500ms (creates DB + tables)
- Deceased create: < 100ms
- Invoice create: < 150ms (with items)
- Socket.io broadcast: < 50ms (in-room)
- Payment record: < 100ms (updates 2 tables)

### Database Indexing
All queries use indexed columns:
- tenant_slug (all tables)
- status, created_at (filter queries)
- deceased_id (relationships)
- invoice_number, charge_type (lookup)

---

## Automated Test Suite (Node.js)

```bash
# Install Jest or Mocha
npm install --save-dev jest

# Create test file
# tests/integration.test.js
```

### Test Example
```javascript
describe('Onboarding Flow', () => {
  it('should register new tenant', async () => {
    const response = await axios.post('http://localhost:8000/api/onboarding/organization', {
      organizationName: 'Test',
      email: 'test@test.com',
      password: 'Password123',
      full_name: 'Test User',
      location: 'Nairobi'
    });
    
    expect(response.status).toBe(201);
    expect(response.data.tenant.tenant_slug).toBeDefined();
    expect(response.data.token).toBeDefined();
  });

  it('should create deceased record', async () => {
    // Get token from registration
    // Create deceased
    // Verify deceased_id generated
    // Verify in database
  });
});
```

---

## Deployment Checklist

- [ ] Master DB migration runs successfully
- [ ] All services start without errors
- [ ] Tenant registration works
- [ ] Deceased record creation works
- [ ] Invoice creation works
- [ ] Payment recording works
- [ ] Socket.io connects and broadcasts
- [ ] Database indexes created
- [ ] Soft deletes working
- [ ] Audit trail tracking enabled
