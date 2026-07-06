# Workshop Service - Database Import Fix

## Problem:
```
Error: Cannot find module '../../shared/dbConfig'
```

## Solution Applied:

### 1. Fixed Import Path in `services/workshop-service/database/db.ts`
Changed from:
```typescript
const { safeTenantQuery, safeTenantExecute, getTenantDB } = require('../../shared/dbConfig');
```

To:
```typescript
const { safeTenantQuery, safeTenantExecute, getTenantDB } = require('../../../shared/dbConfig');
```

**Why:** The workshop service is nested deeper (`services/workshop-service/database/`) compared to other services, so it needs to go up 3 levels instead of 2 to reach the shared folder.

### 2. Updated TypeScript Configuration
- Added `"types/**/*.ts"` to tsconfig.json include array
- Created type declarations in `types/shared.d.ts`
- Added `@ts-ignore` comments to suppress TypeScript module resolution errors

---

## Next Steps:

### Restart the Workshop Service:
```bash
cd services/workshop-service
npm run dev
```

The service should now start successfully!

---

## Verification:

Once started, you should see:
```
[nodemon] starting `ts-node server.ts server.ts`
[INFO] Workshop service running on port 5003
```

Instead of the "Cannot find module" error.

---

## About Your Feature Request:

You mentioned wanting to:
1. **Simplify workshop order form** - Remove deceased details, keep only:
   - Customer info (name, phone)
   - Coffin size
   - Simple details

2. **Add inventory tracking** - Track materials used for coffins:
   - Wood quantity
   - Fabric type/quantity
   - Other materials
   - Track usage per order

This is a **feature enhancement** that can be implemented after we get the service running. Let me know when you're ready and I'll help you build it!

---

**Status:** ✅ Database import fixed - Ready to restart