# RestPoint System Recovery - Deploy Instructions

## ✅ CONFIGURATION FIXES COMPLETED

### Files Fixed:
1. `services/api-gateway/server.js` — All 22 routes registered
2. `docker-compose.yml` — Ports corrected: gateway=5000, socketio=5013, frontend=8082
3. `docker-compose.prod.yml` — Removed obsolete `version:` key, added healthchecks
4. `nginx.conf` — Fixed proxy targets, added events/http wrapper
5. `.env` — Frontend URLs corrected to match ports
6. `.env.production` — Production frontend URLs corrected
7. `services/deceased-service/controllers/deceasedControl.ts` — Fixed import path
8. `services/notification-service/routes/supportTickets.js` — Fixed import path

## 🚀 SERVER DEPLOYMENT (Run on Linux server)

```bash
cd /opt/restpoint

# 1. Pull latest code
git pull origin main

# 2. Stop all services
docker compose -f docker-compose.yml down --remove-orphans

# 3. Rebuild all images
docker compose -f docker-compose.yml build --no-cache

# 4. Start infrastructure first (if not already running)
docker compose -f docker-compose.yml up -d redis rabbitmq mariadb
sleep 20

# 5. Start all services
docker compose -f docker-compose.yml up -d

# 6. Verify
sleep 10
docker compose -f docker-compose.yml ps
curl -s http://localhost:5000/health
curl -s http://localhost:5000/api/v1/debug/routes | jq '.serviceCount'
curl -s http://localhost:8082/health || echo "Frontend: loading..."
```

## 🔧 IF SERVICES STILL RESTARTING

SSH into server and fix these files:

### 1. Auth Service — Add missing env vars
Edit `/opt/restpoint/.env`:
```bash
REFRESH_TOKEN_SECRET=RestPointRefreshTokenSecret2024!ChangeMe
JWT_SECRET=RestPointJWTSecret2024ChangeMe!SuperSecureInProduction
```

### 2. Fix permissions on scripts
```bash
chmod +x /opt/restpoint/scripts/*.sh
```

### 3. Rebuild specific services if needed
```bash
docker compose -f docker-compose.yml up -d --build api-gateway
docker compose -f docker-compose.yml up -d --build auth-service
docker compose -f docker-compose.yml up -d --build deceased-service
docker compose -f docker-compose.yml up -d --build notification-service
docker compose -f docker-compose.yml up -d --build socketio-service
```

## 🌐 NGINX DEPLOYMENT (Host level, not Docker)

```bash
# Copy nginx config to server
sudo cp scripts/nginx-restpoint.conf /etc/nginx/sites-available/restpoint
sudo ln -sf /etc/nginx/sites-available/restpoint /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

## 📊 EXPECTED RESULTS

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 5000 | http://localhost:5000 |
| Frontend | 8082 | http://localhost:8082 |
| Socket.IO | 5013 | http://localhost:5013 |
| Auth | 5002 | via gateway |
| Deceased | 5001 | via gateway |
| Billing | 5003 | via gateway |
| Scanner | 2024 | http://localhost:2024 |

## 🧪 TEST COMMANDS

```bash
# Test API Gateway
curl http://localhost:5000/health
curl http://localhost:5000/api/v1/debug/routes | jq '.serviceCount'

# Test Auth
curl -X POST http://localhost:5000/v1/restpoint/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"pbuild209@gmail.com","password":"40000000"}'

# Test Frontend
curl http://localhost:8082/health

# Test Socket.IO health
curl http://localhost:5013/health