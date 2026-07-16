# Deployment Instructions for Routing Fixes

## Date: 2026-07-16

## Overview
The routing issues have been fixed in the codebase. This document provides instructions to deploy these fixes to your production server at restpoint.co.ke.

## Files Modified
1. `services/leave-service/leaveRoutes.js` - Fixed import path
2. `services/auth-service/server.js` - Fixed route mounting
3. `services/auth-service/routes/authRoutes.js` - Removed unnecessary wrapper

## Deployment Options

### Option 1: Deploy via Git (Recommended)

If your server is set up to pull from this repository:

```bash
# On your local machine - commit the changes
git add services/leave-service/leaveRoutes.js services/auth-service/server.js services/auth-service/routes/authRoutes.js
git commit -m "fix: resolve routing issues - auth 404 and leave service module not found"
git push origin main

# On your production server - pull and restart
ssh user@your-server
cd /path/to/restpoint
git pull origin main
docker-compose restart auth-service leave-service
```

### Option 2: Manual File Update

If you need to manually update files on the server:

#### Step 1: Update leave-service/leaveRoutes.js
```bash
# On production server
nano services/leave-service/leaveRoutes.js
```

Change line 14 from:
```javascript
const { protect, authorizeAny } = require('../../services/app-global/middlewares/authMiddleware');
```

To:
```javascript
const { protect, authorizeAny } = require('../services/app-global/middlewares/authMiddleware');
```

#### Step 2: Update auth-service/server.js
```bash
nano services/auth-service/server.js
```

Find line 69:
```javascript
app.use('/', authRoutes);
```

Change to:
```javascript
app.use('/auth', authRoutes);
```

#### Step 3: Update auth-service/routes/authRoutes.js
```bash
nano services/auth-service/routes/authRoutes.js
```

Remove these lines at the end (lines 44-47):
```javascript
// Mount all routes under /auth prefix to match frontend expectations
// This allows frontend to call /api/v1/restpoint/auth/login
const authRouter = express.Router();
authRouter.use(router);

module.exports = authRouter;
```

Replace with:
```javascript
module.exports = router;
```

#### Step 4: Restart Services
```bash
docker-compose restart auth-service leave-service
```

### Option 3: Using Docker Rebuild

If the services need to be rebuilt:

```bash
# Rebuild and restart specific services
docker-compose up -d --build auth-service leave-service

# Or rebuild all services
docker-compose up -d --build
```

## Verification Steps

### 1. Check Service Status
```bash
docker-compose ps
```

Expected output should show both services as "Up" (not restarting or exited):
```
restpoint_auth_service      Up
restpoint_leave_service     Up
```

### 2. Check Logs for Errors
```bash
# Check auth service logs
docker logs restpoint_auth_service --tail 50

# Check leave service logs
docker logs restpoint_leave_service --tail 50
```

**Expected:** No `MODULE_NOT_FOUND` errors in leave service logs

### 3. Test Health Endpoints
```bash
# Test auth service health
curl https://restpoint.co.ke/api/v1/restpoint/auth/health

# Expected response:
# {"status":"OK","service":"auth-service","timestamp":"..."}
```

### 4. Test Login Endpoint
```bash
curl -X POST https://restpoint.co.ke/api/v1/restpoint/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "accessToken": "...",
  "user": {...},
  "tenantId": "...",
  "tenantSlug": "..."
}
```

**Before Fix (404 Not Found):**
```json
{
  "success": false,
  "message": "Route POST /api/v1/restpoint/auth/login not found"
}
```

### 5. Test from Browser
1. Open https://restpoint.co.ke/login
2. Open Developer Tools (F12) → Network tab
3. Try to log in
4. Check that the login request returns 200 (not 404)

## Troubleshooting

### If services won't start:

```bash
# Check detailed logs
docker logs restpoint_auth_service
docker logs restpoint_leave_service

# Common issues:
# 1. Port already in use
docker-compose down
docker-compose up -d

# 2. Database connection issues
# Check if database is running
docker-compose ps mariadb

# 3. Permission issues
# Check file permissions
ls -la services/auth-service/server.js
ls -la services/leave-service/leaveRoutes.js
```

### If still getting 404:

```bash
# Verify the files were actually updated
grep "app.use('/auth', authRoutes)" services/auth-service/server.js
grep "require('../services/app-global/middlewares/authMiddleware')" services/leave-service/leaveRoutes.js

# If not found, the files weren't updated correctly
# Re-apply the fixes manually
```

### If login works but other endpoints fail:

The gateway routing table in `services/api-gateway/server.js` maps service names to URLs. Verify that 'auth' is mapped correctly:

```bash
grep -A 5 "SERVICE_ROUTES" services/api-gateway/server.js | head -20
```

Should show:
```javascript
'auth': SERVICE_URLS.auth,
'login': SERVICE_URLS.auth,
```

## Quick Deployment Script

Create a deployment script on your server:

```bash
#!/bin/bash
# deploy-routing-fix.sh

echo "Pulling latest code..."
git pull origin main

echo "Restarting auth-service..."
docker-compose restart auth-service

echo "Restarting leave-service..."
docker-compose restart leave-service

echo "Waiting for services to start..."
sleep 10

echo "Checking service health..."
curl -s https://restpoint.co.ke/api/v1/restpoint/auth/health

echo ""
echo "Deployment complete!"
```

Make it executable and run:
```bash
chmod +x deploy-routing-fix.sh
./deploy-routing-fix.sh
```

## Rollback Procedure

If issues occur after deployment:

```bash
# Rollback to previous version
git checkout HEAD~1 services/leave-service/leaveRoutes.js services/auth-service/server.js services/auth-service/routes/authRoutes.js

# Restart services
docker-compose restart auth-service leave-service

# Verify rollback
curl https://restpoint.co.ke/api/v1/restpoint/auth/health
```

## Support

If you encounter issues:
1. Check the full logs: `docker logs restpoint_auth_service` and `docker logs restpoint_leave_service`
2. Verify file changes were applied correctly
3. Ensure Docker containers were restarted after changes
4. Check that no other errors are occurring (database, network, etc.)

## Summary

These fixes resolve:
- ✅ Leave service crashing with MODULE_NOT_FOUND
- ✅ Auth endpoints returning 404 (login, register, refresh, logout)
- ✅ All other endpoints that depend on these services

The changes are minimal and focused on the root causes:
1. Correct import path in leave service
2. Proper route mounting in auth service to match gateway expectations