#!/bin/bash
# Deploy with network fixes - removes old networks and recreates single network
set -e

echo "🚀 Deploying RestPoint with Network Fixes..."
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Stop all running containers
echo -e "${YELLOW}📦 Step 1: Stopping all running containers...${NC}"
docker compose down --remove-orphans 2>/dev/null || docker-compose down --remove-orphans 2>/dev/null || true
echo -e "${GREEN}✅ Containers stopped${NC}"
echo ""

# Step 2: Remove old networks
echo -e "${YELLOW}🌐 Step 2: Removing old networks...${NC}"
docker network rm restpoint_mortuary-network 2>/dev/null || true
docker network rm restpoint_restpoint_net 2>/dev/null || true
docker network rm mortuary-network 2>/dev/null || true
echo -e "${GREEN}✅ Old networks removed${NC}"
echo ""

# Step 3: Remove old containers with _1 suffix
echo -e "${YELLOW}🗑️  Step 3: Removing old containers with _1 suffix...${NC}"
docker ps -a --filter "name=_1" --format "{{.Names}}" | while read container; do
  if [ ! -z "$container" ]; then
    echo "Removing $container..."
    docker rm -f "$container" 2>/dev/null || true
  fi
done
echo -e "${GREEN}✅ Old containers removed${NC}"
echo ""

# Step 4: Prune unused networks
echo -e "${YELLOW}🧹 Step 4: Pruning unused networks...${NC}"
docker network prune -f
echo -e "${GREEN}✅ Networks pruned${NC}"
echo ""

# Step 5: Verify single network exists
echo -e "${YELLOW}🔍 Step 5: Verifying restpoint_network...${NC}"
if docker network ls | grep -q "restpoint_network"; then
  echo -e "${GREEN}✅ restpoint_network exists${NC}"
else
  echo -e "${YELLOW}⚠️  restpoint_network not found, will be created by docker-compose${NC}"
fi
echo ""

# Step 6: Build and start services
echo -e "${YELLOW}🔨 Step 6: Building and starting services...${NC}"
echo "This may take several minutes on first run..."
echo ""

# Use docker-compose.prod.yml
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
else
  DOCKER_COMPOSE="docker compose"
fi

$DOCKER_COMPOSE -f docker-compose.prod.yml up --build -d

echo ""
echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Step 7: Wait for services to be healthy
echo -e "${YELLOW}⏳ Step 7: Waiting for services to be healthy...${NC}"
echo "This may take 2-3 minutes..."
echo ""

sleep 30

# Check service health
echo "Service Health Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$DOCKER_COMPOSE -f docker-compose.prod.yml ps --format "table {{.Service}}\t{{.Status}}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 8: Verify network connectivity
echo -e "${YELLOW}🔗 Step 8: Verifying network connectivity...${NC}"
API_GATEWAY_CONTAINER="restpoint_api_gateway"

if docker ps --filter "name=$API_GATEWAY_CONTAINER" --filter "status=running" | grep -q "$API_GATEWAY_CONTAINER"; then
  echo "Testing DNS resolution from API Gateway..."
  
  # Test service name resolution
  SERVICES_TO_TEST=(
    "auth-service:5000"
    "tenant-service:5000"
    "deceased-service:5000"
    "marketplace-service:5000"
    "invoice-service:5000"
    "coffin-service:5000"
    "documents-service:5000"
    "mpesa-service:5000"
    "notification-service:5000"
    "portal-service:5000"
    "billing-service:5000"
  )
  
  for service in "${SERVICES_TO_TEST[@]}"; do
    host="${service%:*}"
    port="${service#*:}"
    
    if docker exec "$API_GATEWAY_CONTAINER" sh -c "wget -q --timeout=2 --spider http://$host:$port/health 2>&1" | grep -q "200 OK"; then
      echo -e "${GREEN}✅ $host reachable${NC}"
    else
      echo -e "${RED}❌ $host NOT reachable${NC}"
    fi
  done
else
  echo -e "${RED}⚠️  API Gateway not running, skipping connectivity tests${NC}"
fi
echo ""

# Step 9: Display access information
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 Access Information:"
echo "  • API Gateway:  http://localhost:5000"
echo "  • API Health:    http://localhost:5000/health"
echo "  • API Routes:    http://localhost:5000/api/v1/debug/routes"
echo "  • Frontend:      http://localhost:8082"
echo ""
echo "🔍 Useful Commands:"
echo "  • View logs:     $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f"
echo "  • Service logs:  $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f [service-name]"
echo "  • Stop all:      $DOCKER_COMPOSE -f docker-compose.prod.yml down"
echo "  • Restart:       $DOCKER_COMPOSE -f docker-compose.prod.yml restart [service-name]"
echo "  • Status:        $DOCKER_COMPOSE -f docker-compose.prod.yml ps"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"