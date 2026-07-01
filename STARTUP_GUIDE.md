# RestPoint Services Startup Guide

## Prerequisites
Ensure these are running before starting services:
- **MariaDB/MySQL** database (port 3306)
- **Redis** server (port 6379)

## Quick Start (Windows)

### Option 1: Using Docker Compose (Recommended)
```bash
# From the root directory (d:\restpoint)
docker-compose up -d

# This starts: MariaDB, Redis, and all microservices
```

### Option 2: Manual Service Startup

If running services manually, start them in this order:

#### 1. Start Database Services
```bash
# Ensure MariaDB is running on port 3306
# Ensure Redis is running on port 6379
```

#### 2. Start Backend Services (in separate terminals)

```bash
# Terminal 1: API Gateway
cd services/api-gateway
npm run dev
# Should run on port 5000

# Terminal 2: Auth Service
cd services/auth-service
npm run dev
# Should run on port 5001

# Terminal 3: Tenant Service
cd services/tenant-service
npm run dev
# Should run on port 5002

# Terminal 4: Socket.io Service
cd services/socketio-service
npm run dev
# Should run on port 5018 (configured in .env)

# Terminal 5: Other services as needed...
```

#### 3. Start Frontend
```bash
cd FrontendClient/client
npm run dev
# Should run on port 5173
```

## Common Issues & Solutions

### Issue 1: Socket.io Service - Port Permission Denied
**Error:** `Error: listen EACCES: permission denied 0.0.0.0:8010`

**Solution:** 
- The service now reads PORT from `.env` file
- Ensure `services/socketio-service/.env` has `PORT=5018`
- Or run: `netstat -ano | findstr :8010` to check if port is in use
- Kill conflicting process or change port in `.env`

### Issue 2: Login Timeout (30 seconds)
**Error:** `AxiosError: timeout of 30000ms exceeded`

**Causes:**
- Backend services not running
- Database not connected
- Wrong API URL configuration

**Solution:**
1. Verify API Gateway is running on port 5000
2. Check database connection in service logs
3. Verify `FrontendClient/client/src/config/env.js` has correct API_URL

### Issue 3: Auth Service Request Aborted
**Error:** `BadRequestError: request aborted`

**Causes:**
- Database connection issues
- Service crashing during request processing

**Solution:**
1. Check database is running and accessible
2. Review auth-service logs for database connection errors
3. Ensure tenant database exists and migrations are run

## Verification Steps

### 1. Check if services are running:
```bash
# API Gateway
curl http://localhost:5000/health

# Auth Service
curl http://localhost:5001/health

# Socket.io Service
curl http://localhost:5018/health
```

### 2. Check database connection:
```bash
# Test MariaDB connection
mysql -u root -p -h localhost

# Verify tenant database exists
SHOW DATABASES LIKE 'tenant_%';
```

### 3. Check Redis connection:
```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

## Environment Configuration

### Frontend (.env in FrontendClient/client)
```env
VITE_API_URL=http://localhost:5000
VITE_API_GATEWAY_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5018
```

### Backend Services
Each service has its own `.env` file in its directory:
- `services/auth-service/.env`
- `services/tenant-service/.env`
- `services/socketio-service/.env`
- etc.

## Service Dependencies

```
Frontend (5173)
    ↓
API Gateway (5000)
    ↓
    ├→ Auth Service (5001)
    ├→ Tenant Service (5002)
    ├→ Socket.io Service (5018)
    └→ [Other microservices...]
    ↓
MariaDB (3306) + Redis (6379)
```

## Troubleshooting

### View service logs:
```bash
# Each service logs to its terminal
# Look for:
# - Database connection errors
# - Port binding errors
# - Redis connection errors
```

### Common port conflicts:
```bash
# Check what's using a port
netstat -ano | findstr :5000
netstat -ano | findstr :5018

# Kill process (Windows)
taskkill /PID <pid> /F
```

### Database issues:
```bash
# Run migrations
cd services/tenant-service
npm run migrate

# Or use the init script
node scripts/initMasterDb.ts
```

## Quick Health Check

Run this to verify all services:
```bash
# Check all service health endpoints
curl http://localhost:5000/health  # API Gateway
curl http://localhost:5001/health  # Auth Service
curl http://localhost:5018/health  # Socket.io Service
curl http://localhost:5002/health  # Tenant Service
```

All should return JSON with `"status": "UP"`