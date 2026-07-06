# API Route Normalization - Task Progress

## ✅ COMPLETED - ALL CHANGES IMPLEMENTED

### Backend Changes:
- [x] **hearse-service/server.js** - Mount at `/` instead of `/api/v1/restpoint`
- [x] **coffin-service/server.js** - Mount at `/` instead of 5 different paths
- [x] **chemical-service/server.js** - Mount at `/` instead of `/api/v1/restpoint/chemicals`
- [x] **deceased-service/server.ts** - Mount at `/` instead of 4 different paths, simplified route imports
- [x] **support-service/server.js** - Mount at `/` instead of `/api/v1/restpoint/support`
- [x] **tenant-service/server.ts** - Mount at `/` instead of 8+ different paths
- [x] **api-gateway/server.js** - Complete rewrite: single unified proxy strategy, no more full-path vs clean-path duality

### Frontend Changes:
- [x] **config/env.js** - Removed `HEARSE_SERVICE_URL` and `HEARSE_API_URL` (bypass no longer needed)
- [x] **api/endpoints.js** - Fixed HEARSE endpoints to match actual backend routes (/hearses, /hearses/available, etc.)
- [x] **api/chemicalsApi.js** - Uses centralized `env.FULL_API_URL` instead of hardcoded `http://localhost:5016/api/v1/restpoint/chemicals`
- [x] **services/documentService.js** - Uses centralized `env.FULL_API_URL` instead of hardcoded `http://localhost:5000/api`
- [x] **components/modals/financialdetailsmodal.jsx** - Uses centralized `env.FULL_API_URL` instead of hardcoded `http://localhost:5000/api/v1/restpoint/deceased`

---

## BEFORE vs AFTER ROUTE MAPPING

### Backend Service Mount Points

| Service | BEFORE | AFTER | Notes |
|---------|--------|-------|-------|
| Auth | Mount at `/` | Mount at `/` | Already correct, kept unchanged |
| Hearse | Mount at `/api/v1/restpoint` | Mount at `/` | Simplified |
| Coffin | Mount at 5 paths | Mount at `/` | Simplified from 5 to 1 |
| Chemical | Mount at `/api/v1/restpoint/chemicals` | Mount at `/` | Simplified |
| Deceased | Mount at 4 paths | Mount at `/` | Simplified from 4 to 1 |
| Support | Mount at `/api/v1/restpoint/support` | Mount at `/` | Simplified |
| Tenant | Mount at 8+ paths | Mount at `/` | Simplified from 8+ to 1 |

### API Gateway Proxy Strategy

| Aspect | BEFORE | AFTER |
|--------|--------|-------|
| Proxy Types | 2 (full-path + clean-path) | 1 (clean-path only) |
| Path Rewrite | Complex conditional logic | Simple regex strip |
| Route Duplication | 3 entries per service (/api/v1/restpoint/x, /v1/restpoint/x, /x) | 1 entry per service |

### Frontend URL Resolution

| Component | BEFORE | AFTER |
|-----------|--------|-------|
| chemicalsApi.js | `http://localhost:5016/api/v1/restpoint/chemicals` | `env.FULL_API_URL/chemicals` |
| documentService.js | `http://localhost:5000/api` | `env.FULL_API_URL` |
| financialdetailsmodal.jsx | `http://localhost:5000/api/v1/restpoint/deceased` | `env.FULL_API_URL/deceased` |
| env.js (HEARSE_API_URL) | Bypassed gateway to port 5002 | Removed - all traffic through gateway |
| endpoints.js (HEARSE) | `/hearse/create`, `/hearse/dispatch`, `/hearse/vehicles` | `/hearses`, `/hearses/available`, `/hearses/:id` |

### Route Flow (Example: Hearse)

```
BEFORE:
  Frontend calls: http://localhost:5002/api/v1/restpoint/hearses (direct to service)
  OR
  Frontend calls: http://localhost:5000/api/v1/restpoint/hearses (via gateway)
  Gateway full-path proxy: mounts at /api/v1/restpoint/hearses, prepends path back
  Hearse service: mounts at /api/v1/restpoint, routes define /hearses
  Result: /api/v1/restpoint + /hearses = /api/v1/restpoint/hearses ✅

AFTER:
  Frontend calls: http://localhost:5000/api/v1/restpoint/hearses (always via gateway)
  Gateway clean proxy: strips /api/v1/restpoint/hearses, forwards /hearses
  Hearse service: mounts at /, routes define /hearses
  Result: /hearses ✅