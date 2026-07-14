# Frontend Fixes - Asset Path 404 Errors & Multi-Tenant Routing

## Problem Description

Two issues were identified:

### Issue 1: Asset Path 404 Errors
The frontend UI was showing a blank page with multiple 404 errors for assets:

```
GET https://restpoint.co.ke/tenant/monezuma-monalisa-funeral-home-nairobi/assets/index-DOHXHoIe.js net::ERR_ABORTED 404 (Not Found)
GET https://restpoint.co.ke/tenant/monezuma-monalisa-funeral-home-nairobi/assets/chunk-BU7E37iJ.js net::ERR_ABORTED 404 (Not Found)
GET https://restpoint.co.ke/tenant/monezuma-monalisa-funeral-home-nairobi/assets/css/ui-vendor-CqLr8KVv.css net::ERR_ABORTED 404 (Not Found)
```

### Issue 2: Multi-Tenant Routing Not Working
The backend correctly returned `"deploymentType": "multi"` in the login response, but the frontend was still showing single-tenant UI layout instead of multi-tenant layout.

Example login response:
```json
{
  "success": true,
  "deploymentType": "multi",
  "user": { ... },
  "tenant": {
    "tenantId": 2,
    "tenantSlug": "monezuma-monalisa-funeral-home-nairobi",
    "dbName": "monezuma-monalisa-funeral-home-nairobi"
  }
}
```

## Root Causes

### Issue 1: Asset Path Problem
The Vite build configuration had `base: './'` which generates **relative asset paths**. 

When the application is accessed at a nested URL like:
```
https://restpoint.co.ke/tenant/monezuma-monalisa-funeral-home-nairobi/
```

The browser resolves relative paths from the current directory, causing assets to be requested from:
```
/tenant/monezuma-monalisa-funeral-home-nairobi/assets/...
```

However, nginx serves these assets from the root directory:
```
/assets/...
```

This mismatch causes all asset requests to return 404, resulting in a blank UI.

### Issue 2: Multi-Tenant Routing Problem
In `FrontendClient/client/src/routes/AppRouter.jsx`, the `TenantResolver` component was overriding the backend's `deploymentType` setting with client-side branch detection logic:

```javascript
// BEFORE (incorrect - overrides backend setting)
deploymentType: isMultiBranch ? 'multi' : (settings?.deploymentType || data?.deploymentType || 'single'),
```

This logic prioritized branch detection over the backend's explicit `deploymentType` setting, causing multi-tenant deployments to be treated as single-tenant.

## Solutions

### Fix 1: Asset Path Configuration
Changed the Vite base path from relative to absolute in `FrontendClient/client/vite.config.js`:

```javascript
// BEFORE (incorrect - relative paths)
base: './',

// AFTER (correct - absolute paths from root)
base: '/',
```

**Impact:** With `base: '/'`, Vite generates asset references like:
- `/assets/index-DOHXHoIe.js` (absolute path from root)
- `/assets/chunk-BU7E37iJ.js`
- `/assets/css/ui-vendor-CqLr8KVv.css`

These paths correctly resolve to the nginx root directory where assets are served.

### Fix 2: Multi-Tenant Routing Logic
Updated the deployment type priority in `FrontendClient/client/src/routes/AppRouter.jsx` (line 247):

```javascript
// AFTER (correct - respects backend setting first)
deploymentType: settings?.deploymentType || data?.deploymentType || (isMultiBranch ? 'multi' : 'single'),
```

**Impact:** The frontend now:
1. **First priority**: Uses `deploymentType` from backend settings API
2. **Second priority**: Uses `deploymentType` from backend branding API
3. **Fallback**: Uses branch detection only if backend doesn't provide deploymentType

This ensures the backend's explicit multi-tenant configuration is respected.

## Deployment

To apply both fixes, rebuild and redeploy the frontend:

### On Linux/Mac:
```bash
chmod +x rebuild-frontend.sh
./rebuild-frontend.sh
```

### On Windows (PowerShell):
```powershell
.\rebuild-frontend.ps1
```

### Manual deployment:
```bash
docker-compose build frontend
docker-compose stop frontend
docker-compose rm -f frontend
docker-compose up -d frontend
```

## Verification

After deployment, verify both fixes:

### For Asset Path Fix:
1. Visit `https://restpoint.co.ke/tenant/monezuma-monalisa-funeral-home-nairobi/`
2. Open browser DevTools → Network tab
3. Confirm all asset requests return 200 status codes (not 404)
4. Verify the UI loads correctly (no blank page)

### For Multi-Tenant Routing:
1. Login with credentials for a multi-tenant deployment
2. Verify the UI shows the multi-tenant layout (with sidebar navigation)
3. Check that the tenant slug appears in the URL: `/tenant/monezuma-monalisa-funeral-home-nairobi/`
4. Verify the sidebar shows tenant-specific navigation items

## Additional Notes

- The nginx configuration is already correct and doesn't need changes
- These fixes apply to all tenant subdirectories, not just the reported one
- The fixes are backward compatible with the root domain (`restpoint.co.ke`)
- No backend changes are required
- The multi-tenant fix ensures that the backend's database configuration is the single source of truth for deployment type

## Files Modified

1. `FrontendClient/client/vite.config.js` - Changed `base: './'` to `base: '/'`
2. `FrontendClient/client/src/routes/AppRouter.jsx` - Fixed deploymentType priority logic

## Files Created

- `rebuild-frontend.sh` - Linux/Mac deployment script
- `rebuild-frontend.ps1` - Windows PowerShell deployment script
- `ASSET_PATH_FIX_SUMMARY.md` - This documentation file
