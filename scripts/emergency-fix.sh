#!/bin/bash
# Emergency fix for port conflicts and database errors
# Issues: Auth service on port 5000 conflicts, database not selected, Redis auth

set -e

echo "🚨 Emergency Fix - Port Conflicts & Database Errors"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Detect docker compose command
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
else
  DOCKER_COMPOSE="docker compose"
fi

# CRITICAL FIX 1: Port Conflicts
# API Gateway must run on 5000, NOT auth service
echo -e "${RED}⚠️  CRITICAL: Port Conflict Fix${NC}"
echo "Auth service should NOT run on port 5000 (API Gateway needs it)"
echo ""

# Check current port mappings
echo "Current port mappings:"
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E "auth|api-gateway" || true
echo ""

# FIX 2: Update .env with TRACKING_DB_NAME
echo -e "${YELLOW}📝 Fix 1: Updating .env with required variables...${NC}"

if ! grep -q "^TRACKING_DB_NAME=" .env; then
  echo "" >> .env
  echo "# Database Configuration (REQUIRED)" >> .env
  echo "TRACKING_DB_NAME=tenant_tracking" >> .env
  echo "DB_NAME=restpoint_main" >> .env
  echo -e "${GREEN}✅ Added TRACKING_DB_NAME and DB_NAME to .env${NC}"
else
  echo -e "${GREEN}✅ TRACKING_DB_NAME already exists${NC}"
fi

# Ensure DB_HOST is set correctly
if ! grep -q "^DB_HOST=" .env; then
  echo "DB_HOST=mariadb" >> .env
  echo -e "${GREEN}✅ Added DB_HOST to .env${NC}"
fi

if ! grep -q "^DB_PORT=" .env; then
  echo "DB_PORT=3306" >> .env
  echo -e "${GREEN}✅ Added DB_PORT to .env${NC}"
fi

echo ""

# FIX 3: Stop all services
echo -e "${YELLOW}🛑 Fix 2: Stopping all services...${NC}"
$DOCKER_COMPOSE -f docker-compose.yml down --remove-orphans 2>/dev/null || true
$DOCKER_COMPOSE -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
echo -e "${GREEN}✅ Services stopped${NC}"
echo ""

# FIX 4: Remove old containers with port conflicts
echo -e "${YELLOW}🗑️  Fix 3: Removing old containers...${NC}"
docker rm -f restpoint_auth-service_1 restpoint_api-gateway_1 restpoint_notification-service_1 2>/dev/null || true
echo -e "${GREEN}✅ Old containers removed${NC}"
echo ""

# FIX 5: Verify port 5000 is free
echo -e "${YELLOW}🔍 Fix 4: Verifying port 5000 is available...${NC}"
if docker ps --filter "publish=5000" --format "{{.Names}}" | grep -q .; then
  echo -e "${RED}❌ Port 5000 is still in use!${NC}"
  docker ps --filter "publish=5000" --format "{{.Names}}\t{{.Ports}}"
else
  echo -e "${GREEN}✅ Port 5000 is free${NC}"
fi
echo ""

# FIX 6: Start infrastructure first
echo -e "${YELLOW}🔨 Fix 5: Starting infrastructure services...${NC}"
$DOCKER_COMPOSE -f docker-compose.yml up -d mariadb redis rabbitmq

echo "Waiting for infrastructure (30s)..."
sleep 30

# Check infrastructure health
echo "Infrastructure status:"
docker ps --filter "name=restpoint_mariadb" --format "{{.Names}}: {{.Status}}"
docker ps --filter "name=restpoint_redis" --format "{{.Names}}: {{.Status}}"
docker ps --filter "name=restpoint_rabbitmq" --format "{{.Names}}: {{.Status}}"
echo ""

# FIX 7: Start API Gateway (must be on port 5000)
echo -e "${YELLOW}🌐 Fix 6: Starting API Gateway on port 5000...${NC}"
$DOCKER_COMPOSE -f docker-compose.yml up -d api-gateway

sleep 10

# Check if API Gateway started
if docker ps --filter "name=restpoint_api_gateway" --filter "status=running" | grep -q "restpoint_api_gateway"; then
  echo -e "${GREEN}✅ API Gateway started on port 5000${NC}"
else
  echo -e "${RED}❌ API Gateway failed to start${NC}"
  docker logs restpoint_api_gateway --tail 20
fi
echo ""

# FIX 8: Start auth service (now on port 5001, NOT 5000)
echo -e "${YELLOW}🔐 Fix 7: Starting Auth Service on port 5001...${NC}"
$DOCKER_COMPOSE -f docker-compose.yml up -d auth-service

sleep 10

# Check if auth service started
if docker ps --filter "name=restpoint_auth_service" --filter "status=running" | grep -q "restpoint_auth_service"; then
  echo -e "${GREEN}✅ Auth Service started on port 5001${NC}"
else
  echo -e "${RED}❌ Auth Service failed to start${NC}"
  docker logs restpoint_auth_service --tail 20
fi
echo ""

# FIX 9: Start remaining services
echo -e "${YELLOW}🔧 Fix 8: Starting remaining services...${NC}"
$DOCKER_COMPOSE -f docker-compose.yml up -d

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 Service Status${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
$DOCKER_COMPOSE -f docker-compose.yml ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo -e "${YELLOW}🔍 Testing connectivity...${NC}"
sleep 5

# Test API Gateway
if docker exec restpoint_api_gateway wget -q --timeout=3 --spider http://localhost:5000/health 2>/dev/null; then
  echo -e "${GREEN}✅ API Gateway: http://localhost:5000/health${NC}"
else
  echo -e "${RED}❌ API Gateway not responding${NC}"
fi

# Test Auth Service
if docker exec restpoint_auth_service wget -q --timeout=3 --spider http://localhost:5000/health 2>/dev/null; then
  echo -e "${GREEN}✅ Auth Service: http://localhost:5000/health (internal)${NC}"
else
  echo -e "${RED}❌ Auth Service not responding${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Emergency Fix Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Port assignments:"
echo "  • API Gateway:    localhost:5000 → container:5000"
echo "  • Auth Service:   localhost:5001 → container:5000"
echo "  • Tenant Service: localhost:5002 → container:5000"
echo ""
echo "Test login:"
echo '  curl -X POST http://localhost:5000/api/v1/restpoint/auth/login \'
echo '    -H "Content-Type: application/json" \'
echo '    -d "{\"identifier\":\"test@email.com\",\"password\":\"test123\"}"'
echo ""
echo "Check logs if issues persist:"
echo "  docker compose -f docker-compose.yml logs -f api-gateway"
echo "  docker compose -f docker-compose.yml logs -f auth-service"
echo "  docker compose -f docker-compose.yml logs -f notification-service"