# API Route Normalization - Restart Instructions

## IMPORTANT: Restart All Services in Order

After the code changes, you MUST restart the services in this specific order:

### 1. Stop All Services
Press `Ctrl+C` in each terminal to stop:
- API Gateway (port 5000)
- Hearse Service (port 5002)
- All other services

### 2. Start Services in This Order:

#### Step 1: Start API Gateway FIRST
```bash
cd services/api-gateway
npm run dev
```

**Expected output:**
```
[DEBUG] [PROXY] http://127.0.0.1:5001 (strip: /api/v1/restpoint)
[DEBUG] [PROXY] http://127.0.0.1:5002 (strip: /api/v1/restpoint)
...
[INFO] ========================================
[INFO]   restpoint-gateway v2.0.0
[INFO]   Running on http://0.0.0.0:5000
```

#### Step 2: Start Hearse Service
```bash
cd services/hearse-service
npm run dev
```

**Expected output:**
```
 Registered Routes:
   POST  /hearses
   PUT  /hearses/:id
   DELETE  /hearses/:id
   GET  /hearses
   GET  /hearses/available
   GET  /hearses/available/cross-branch
   GET  /hearse-bookings/availability
   POST  /hearse-bookings
   GET  /hearse-bookings
   ...

🚀 Server running on http://0.0.0.0:5002
```

**NOTE:** The routes should show `/hearses`, NOT `/api/v1/restpoint/hearses`. The debug print in server.js line 175 adds a misleading prefix, but the actual routes are clean.

#### Step 3: Start Other Services
```bash
# In separate terminals:
cd services/coffin-service && npm run dev
cd services/chemical-service && npm run dev
cd services/deceased-service && npm run dev
cd services/support-service && npm run dev
cd services/tenant-service && npm run dev
```

### 3. Test the Fix

Open your browser and try to register a hearse:
```
POST http://localhost:5000/api/v1/restpoint/hearses
```

**Expected flow:**
1. Frontend sends: `POST http://localhost:5000/api/v1/restpoint/hearses`
2. Gateway receives at `/api/v1/restpoint/*` middleware
3. Gateway extracts `hearses` from path → routes to port 5002
4. Gateway proxies to: `http://localhost:5002/hearses`
5. Hearse service matches: `router.post('/hearses', handler)` ✅

### Troubleshooting

If you still get 404:

1. **Check Gateway is running new code:**
   - Look for `[DEBUG] [PROXY] http://127.0.0.1:5002` in gateway logs
   - If you see `[PROXY] http://localhost:5002 (strip: /api/v1/restpoint/hearses)`, that's OLD code
   - You should see `[DEBUG] [PROXY] http://127.0.0.1:5002` (no strip path)

2. **Check Hearse Service routes:**
   - Look for `POST  /hearses` (NOT `POST  /api/v1/restpoint/hearses`)
   - The debug print adds a misleading prefix, but the actual path is `/hearses`

3. **Verify Gateway dynamic routing:**
   - Gateway should have ONE middleware at `/api/v1/restpoint`
   - It should extract first path segment and route dynamically
   - Old code had multiple `app.use('/api/v1/restpoint/hearses', ...)` entries

4. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R`
   - Or open incognito window

### Key Changes Made

**Before:**
- Gateway mounted separate middleware: `app.use('/api/v1/restpoint/hearses', proxy)`
- This stripped `/hearses` from the path, forwarding `/available` instead of `/hearses/available`
- Backend route `router.get('/hearses/available')` didn't match `/available` → 404

**After:**
- Gateway mounts ONE middleware: `app.use('/api/v1/restpoint', dynamicRouter)`
- Express strips only `/api/v1/restpoint`, leaving `/hearses/available`
- Dynamic router extracts `hearses` → proxies to hearse service
- Backend receives `/hearses/available` → matches `router.get('/hearses/available')` ✅