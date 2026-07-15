# RestPoint Monorepo - Docker Production Fix Summary

## Critical Issues Found and Fixed

### 1. Import Path Errors (MODULE_NOT_FOUND)

#### Issue: Hearse Service
**File:** `services/hearse-service/controllers/restpoint/hearseController.js`
**Problem:** Wrong relative path depth - `../../../configurations/sqlConfig/db`
**Error:** `Cannot find module '../../../configurations/sqlConfig/db'`
**Fix:** Changed to `../../../../configurations/sqlConfig/db`
**Root Cause:** The controller is nested 4 levels deep from root, requiring 4 parent directory traversals

#### Issue: Invoice Service  
**File:** `services/invoice-service/controllers/invoice.ts`
**Problem:** Wrong relative path depth - `../../shared/config/db`
**Error:** `Cannot find module '../../shared/config/db'`
**Fix:** Changed to `../../../shared/config/db`
**Root Cause:** The controller is nested 3 levels deep from root, requiring 3 parent directory traversals

#### Issue: Analytics Service
**File:** `services/analytics-service/server.js`
**Problem:** Wrong module path - `../../shared/database`
**Error:** Module not found
**Fix:** Changed to `../../shared/config/db`
**Root Cause:** The module is named `db.js` not `database.js`

### 2. Function Name Mismatch

#### Issue: Notification Service
**File:** `services/notification-service/server.js`
**Problem:** Imported function name `lookupTenantDatabase` doesn't exist
**Error:** `lookupTenantDatabase is not a function`
**Fix:** Changed all occurrences to `lookupTenantDb` (3 locations)
**Root Cause:** The actual exported function is named `lookupTenantDb` in `shared/config/db.js`

### 3. Dockerfile Issues

#### Issue: Hearse Service Dockerfile
**File:** `services/hearse-service/Dockerfile`
**Problem 1:** Used `tsx` directly in CMD without npx
**Problem 2:** Missing source code COPY before build
**Fix:** 
- Changed CMD from `["tsx", ...]` to `["npx", "tsx", ...]`
- Added COPY commands for source code before building shared packages
**Root Cause:** Global tsx installation happens before USER switch, making it unavailable at runtime

#### Issue: Invoice Service Dockerfile
**File:** `services/invoice-service/Dockerfile`
**Problem 1:** Used `npm install --legacy-peer-deps` instead of `npm ci`
**Problem 2:** Didn't build shared packages
**Fix:**
- Changed to `npm ci --omit=optional` for consistent installs
- Added shared package build steps
**Root Cause:** Inconsistent with other Dockerfiles and missing critical build step for TypeScript packages

### 4. Build Order Issues

**Problem:** Shared TypeScript packages not built before services
**Impact:** Services importing from `packages/shared-utils/dist/` fail at runtime
**Fix:** All Dockerfiles now build shared packages in correct order:
1. shared-config
2. shared-logger  
3. shared-services
4. shared-utils

## Files Modified

1. `services/hearse-service/controllers/restpoint/hearseController.js` - Fixed import path
2. `services/invoice-service/controllers/invoice.ts` - Fixed import path
3. `services/notification-service/server.js` - Fixed function name (3 occurrences)
4. `services/analytics-service/server.js` - Fixed module path
5. `services/hearse-service/Dockerfile` - Fixed CMD and build order
6. `services/invoice-service/Dockerfile` - Fixed install method and build order

## Root Causes Summary

1. **Incorrect relative paths:** Services nested at different directory depths used wrong number of `../` traversals
2. **Function name mismatch:** Import statement used different name than actual export
3. **Module path error:** Referenced non-existent module name
4. **Docker build order:** Shared TypeScript packages not compiled before service compilation
5. **Inconsistent Docker patterns:** Different services used different install/build approaches

## Verification Steps

After rebuilding Docker images, verify:

```bash
# 1. Check for import errors in logs
docker compose logs hearse-service | grep "Cannot find module"
docker compose logs invoice-service | grep "Cannot find module"
docker compose logs notification-service | grep "lookupTenantDatabase"

# 2. Verify shared packages are built
docker compose exec hearse-service ls -la /usr/src/app/packages/shared-utils/dist/
docker compose exec invoice-service ls -la /usr/src/app/packages/shared-utils/dist/

# 3. Test health endpoints
curl http://localhost:5023/health  # hearse-service
curl http://localhost:5005/health  # invoice-service
curl http://localhost:8111/health  # notification-service
curl http://localhost:5009/health  # analytics-service
```

## Recommended Build Command

```bash
# Clean build from scratch
docker compose down
docker compose build --no-cache
docker compose up -d

# Or use the Makefile
make docker:rebuild
```

## Additional Recommendations

1. **Standardize all Dockerfiles** to follow the same pattern:
   - Use `npm ci` consistently
   - Build shared packages in every service Dockerfile
   - Use `npx tsx` for TypeScript services

2. **Add path validation** to CI/CD pipeline to catch import errors early

3. **Consider using TypeScript project references** instead of manual shared package builds

4. **Add integration tests** that verify module resolution in Docker builds

5. **Document the directory structure** so future developers understand path depths