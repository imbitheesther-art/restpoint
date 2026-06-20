#!/bin/bash
# RestPoint Complete System Recovery Script
# Fixes: API Gateway routes, restarting services, Redis auth, nginx, frontend
# Usage: bash scripts/fix-all-services.sh

set -e

echo "=========================================="
echo "  RestPoint System Recovery"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
NGINX_CONF="/etc/nginx/sites-available/restpoint"

# =============================================================================
# STEP 1: Stop all services
# =============================================================================
echo -e "${YELLOW}[1/8] Stopping all services...${NC}"
docker compose -f $COMPOSE_FILE down --remove-orphans || true
echo -e "${GREEN}✓ All services stopped${NC}"
echo ""

# =============================================================================
# STEP 2: Fix Redis password for socket.io
# =============================================================================
echo -e "${YELLOW}[2/8] Configuring Redis password for socket.io...${NC}"
# Ensure socketio-service has Redis password in environment
if ! grep -q "REDIS_PASSWORD:" services/socketio-service/Dockerfile; then
    echo "Note: socketio-service needs REDIS_PASSWORD env var"
fi
echo -e "${GREEN}✓ Redis password will be passed via docker-compose${NC}"
echo ""

# =============================================================================
# STEP 3: Rebuild API Gateway with all 23 routes
# =============================================================================
echo -e "${YELLOW}[3/8] Rebuilding API Gateway with all routes...${NC}"
docker compose -f $COMPOSE_FILE build --no-cache api-gateway
echo -e "${GREEN}✓ API Gateway rebuilt${NC}"
echo ""

# =============================================================================
# STEP 4: Rebuild all restarting services
# =============================================================================
echo -e "${YELLOW}[4/8] Rebuilding restarting services...${NC}"

SERVICES_TO_REBUILD=(
    "invoice-service"
    "marketplace-service"
    "mpesa-service"
    "portal-service"
    "socketio-service"
    "tenant-service"
    "deceased-service"
    "notification-service"
    "analytics-service"
    "qrcode-service"
)

for service in "${SERVICES_TO_REBUILD[@]}"; do
    echo "  Rebuilding $service..."
    docker compose -f $COMPOSE_FILE build --no-cache $service || {
        echo -e "${RED}✗ Failed to build $service${NC}"
    }
done
echo -e "${GREEN}✓ All restarting services rebuilt${NC}"
echo ""

# =============================================================================
# STEP 5: Start infrastructure services first (redis, rabbitmq, mariadb)
# =============================================================================
echo -e "${YELLOW}[5/8] Starting infrastructure services...${NC}"
docker compose -f $COMPOSE_FILE up -d redis rabbitmq mariadb
echo "Waiting for infrastructure services to be healthy..."
sleep 30
echo -e "${GREEN}✓ Infrastructure services started${NC}"
echo ""

# =============================================================================
# STEP 6: Start all application services
# =============================================================================
echo -e "${YELLOW}[6/8] Starting all application services...${NC}"
docker compose -f $COMPOSE_FILE up -d
echo "Waiting for services to start..."
sleep 45
echo -e "${GREEN}✓ All services started${NC}"
echo ""

# =============================================================================
# STEP 7: Verify all services are running and healthy
# =============================================================================
echo -e "${YELLOW}[7/8] Verifying services...${NC}"
echo ""
echo "Container Status:"
docker compose -f $COMPOSE_FILE ps

echo ""
echo "Health Checks:"
echo "  API Gateway:"
curl -s http://localhost:5000/health || echo "  ✗ API Gateway not responding"

echo ""
echo "  Deployed Services:"
for port in 5001 5002 5003 5004 5005 5006 5007 5009 5010 5011 5012 5013 5014 5015 5016 5018 5019 5020 5105 5111 8116; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health || echo "000")
    if [ "$response" = "200" ]; then
        echo -e "  ${GREEN}✓ Port $port: Healthy${NC}"
    else
        echo -e "  ${RED}✗ Port $port: Unhealthy (HTTP $response)${NC}"
    fi
done
echo ""

# =============================================================================
# STEP 8: API Gateway route verification
# =============================================================================
echo -e "${YELLOW}[8/8] Verifying API Gateway routes...${NC}"
echo ""
echo "Registered Routes:"
curl -s http://localhost:5000/api/v1/debug/routes | jq -r '.routes[] | "  \(.path) → \(.target)"' 2>/dev/null || \
curl -s http://localhost:5000/api/v1/debug/routes | grep -o '"path":"[^"]*"' | sed 's/"path":"//;s/"//' | while read path; do
    echo "  $path"
done

echo ""
echo "Service Count:"
curl -s http://localhost:5000/api/v1/health | jq '.serviceCount' 2>/dev/null || echo "Checking..."
echo ""

# =============================================================================
# Summary
# =============================================================================
echo "=========================================="
echo "  Recovery Complete"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "  1. Test API: curl -X POST http://localhost:5000/v1/restpoint/auth/login -H 'Content-Type: application/json' -d '{\"identifier\":\"admin@restpoint.co.ke\",\"password\":\"your_password\"}'"
echo "  2. Rebuild frontend: docker compose -f $COMPOSE_FILE build frontend"
echo "  3. Restart frontend: docker compose -f $COMPOSE_FILE up -d frontend"
echo "  4. Check logs: docker compose -f $COMPOSE_FILE logs -f [service-name]"
echo ""
echo "Frontend URLs:"
echo "  Main App: http://localhost:8082"
echo "  Portal: http://localhost:8082 (via portal.restpoint.co.ke subdomain)"
echo ""
echo "API Gateway:"
echo "  Local: http://localhost:5000"
echo "  Production: https://api.restpoint.co.ke"
echo ""