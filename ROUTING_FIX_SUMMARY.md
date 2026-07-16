# Routing Issues Fix Summary

## Date: 2026-07-16

## Issues Reported
After fixing authentication, all endpoints started returning "route not found" errors:
- Login endpoint: `POST /api/v1/restpoint/auth/login` → 404 Not Found
- Other endpoints also returning 404 errors

## Root Causes Identified

### 1. Leave Service - Incorrect Import Path
**File:** `services/leave-service/leaveRoutes.js` (Line 14)

**Problem:**
```javascript
const { protect, authorizeAny } = require('../../services/app-global/middlewares/authMiddleware');
```

**Issue:** The path had one too many `../` segments. From `services/leave-service/leaveRoutes.js`, the correct path to `services/app-global/middlewares/authMiddleware` is `../services/app-global/middlewares/authMiddleware`, not `../../services/app-global/middlewares/authMiddleware`.

**Impact:** This caused the leave service to crash on startup with `MODULE_NOT_FOUND` error, making it unavailable.

---

### 2. Auth Service - Missing `/auth` Prefix
**Files:** 
- `services/auth-service/routes/authRoutes.js`
- `services/auth-service/server.js`

**Problem:**
- Frontend was calling: `POST /api/v1/restpoint/auth/login`
- Auth service routes were defined at: `/login`, `/register`, `/refresh`, etc. (no `/auth` prefix)
- Auth service server was mounting routes at root: `app.use('/', authRoutes)`

**Issue:** When the API gateway receives a request for `/api/v1/restpoint/auth/login`:
1. Nginx rewrites it to `/api/v1/restpoint/auth/login`
2. Gateway extracts `auth` as the service name and proxies to auth service
3. Gateway forwards `/auth/login` to auth service
4. Auth service had routes at `/login` (not `/auth/login`), causing 404

**Impact:** All authentication endpoints (login, register, refresh, logout) were returning 404 errors.

---

## Fixes Applied

### Fix 1: Leave Service Import Path
**File:** `services/leave-service/leaveRoutes.js`

**Change:**
```javascript
// BEFORE (incorrect - too many ../)
const { protect, authorizeAny } = require('../../services/app-global/middlewares/authMiddleware');

// AFTER (correct)
const { protect, authorizeAny } = require('../services/app-global/middlewares/authMiddleware');
```

---

### Fix 2: Auth Service Route Mounting
**File:** `services/auth-service/server.js`

**Change:**
```javascript
// BEFORE (mounting at root - no /auth prefix)
app.use('/', authRoutes);

// AFTER (mounting at /auth to match gateway expectations)
app.use('/auth', authRoutes);
```

**File:** `services/auth-service/routes/authRoutes.js`

**Change:** Removed the unnecessary wrapper router that was added in a previous attempt:
```javascript
// REMOVED these lines:
// const authRouter = express.Router();
// authRouter.use(router);
// module.exports = authRouter;

// KEPT the original export:
module.exports = router;
```

---

## How the Routing Works (After Fix)

### Request Flow for Login:
1. **Frontend:** `POST https://restpoint.co.ke/api/v1/restpoint/auth/login`
2. **Nginx:** Matches `/api/` location, rewrites to `/api/v1/restpoint/auth/login`, proxies to `api_gateway`
3. **API Gateway:** 
   - Receives `/api/v1/restpoint/auth/login`
   - Strips `/api/v1/restpoint` prefix
   - Extracts `auth` as first segment
   - Looks up `SERVICE_ROUTES['auth']` → `http://127.0.0.1:5001`
   - Proxies to auth service with path `/auth/login`
4. **Auth Service:**
   - Receives `/auth/login`
   - Router mounted at `/auth` matches
   - Inner router has route `/login`
   - Full path `/auth/login` matches correctly
   - ✅ **Login controller executes**

---

## Testing Instructions

### 1. Rebuild and Restart Services
```bash
# Rebuild the affected services
docker-compose restart auth-service leave-service

# Or rebuild from scratch if needed
docker-compose up -d --build auth-service leave-service
```

### 2. Verify Services Are Running
```bash
# Check auth service health
curl https://restpoint.co.ke/api/v1/restpoint/auth/health

# Check leave service (via gateway)
curl https://restpoint.co.ke/api/v1/restpoint/leaves/stats/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Login Endpoint
```bash
# Test login with the correct path
curl -X POST https://restpoint.co.ke/api/v1/restpoint/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:** Should return user data and access token (not 404)

### 4. Check Service Logs
```bash
# Check auth service logs for errors
docker logs restpoint_auth_service --tail 50

# Check leave service logs for errors
docker logs restpoint_leave_service --tail 50
```

**Expected:** No `MODULE_NOT_FOUND` errors in leave service logs

---

## Additional Notes

### Rate Limiting Warning
The logs show this warning from auth service:
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**This is a warning, not an error.** The login still works. To fix this warning, you can enable trust proxy in the auth service:

**Option 1:** Add to `services/auth-service/server.js`:
```javascript
app.set('trust proxy', 1); // Trust first proxy (nginx)
```

**Option 2:** Set environment variable in docker-compose.yml:
```yaml
auth-service:
  environment:
    - TRUST_PROXY=true
```

This is optional and does not affect functionality.

---

## Files Modified

1. `services/leave-service/leaveRoutes.js` - Fixed import path
2. `services/auth-service/server.js` - Fixed route mounting
3. `services/auth-service/routes/authRoutes.js` - Removed unnecessary wrapper

---

## Verification Checklist

- [ ] Leave service starts without `MODULE_NOT_FOUND` errors
- [ ] Auth service health check returns 200 OK
- [ ] Login endpoint returns 200 (not 404)
- [ ] Other auth endpoints (register, refresh, logout) work correctly
- [ ] Frontend can successfully log in
- [ ] No 404 errors in browser network tab for API calls

---

## Rollback Instructions

If issues persist, you can rollback using git:
```bash
git checkout services/leave-service/leaveRoutes.js
git checkout services/auth-service/server.js
git checkout services/auth-service/routes/authRoutes.js
docker-compose restart auth-service leave-service