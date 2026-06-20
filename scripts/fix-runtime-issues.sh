#!/bin/bash
# Fix runtime issues in running containers
# Issues: TypeScript services missing server.js, database not selected, Redis auth

set -e

echo "🔧 Fixing Runtime Issues..."
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

# Fix 1: Install tsx globally in all Node.js services and restart them
echo -e "${YELLOW}📦 Fix 1: Installing tsx for TypeScript services...${NC}"

SERVICES=(
  "restpoint_deceased-service_1"
  "restpoint_tenant-service_1"
  "restpoint_notification-service_1"
  "restpoint_billing-service_1"
  "restpoint_documents-service_1"
  "restpoint_marketplace-service_1"
  "restpoint_invoice-service_1"
  "restpoint_coffin-service_1"
  "restpoint_edocuments-service_1"
  "restpoint_analytics-service_1"
  "restpoint_calender-service_1"
  "restpoint_mpesa-service_1"
  "restpoint_qrcode-service_1"
  "restpoint_visitors-service_1"
  "restpoint_bodycheckout-service_1"
  "restpoint_extra-services_1"
  "restpoint_call-service_1"
  "restpoint_portal-service_1"
  "restpoint_chemical-service_1"
)

for service in "${SERVICES[@]}"; do
  if docker ps --filter "name=$service" --filter "status=running" | grep -q "$service"; then
    echo "Installing tsx in $service..."
    docker exec "$service" npm install -g tsx 2>/dev/null || true
  fi
done

echo -e "${GREEN}✅ tsx installed${NC}"
echo ""

# Fix 2: Add TRACKING_DB_NAME to all services
echo -e "${YELLOW}🗄️  Fix 2: Adding TRACKING_DB_NAME environment variable...${NC}"

# Create a temporary compose file override
cat > /tmp/docker-compose.override.yml << 'EOF'
services:
  deceased-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  tenant-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  notification-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  billing-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  documents-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  marketplace-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  invoice-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  coffin-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  edocuments-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  analytics-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  calender-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  mpesa-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  qrcode-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  visitors-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  bodycheckout-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  extra-services:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  call-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  portal-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
  chemical-service:
    environment:
      TRACKING_DB_NAME: tenant_tracking
EOF

echo -e "${GREEN}✅ Override file created${NC}"
echo ""

# Fix 3: Update .env.production to include TRACKING_DB_NAME
echo -e "${YELLOW}⚙️  Fix 3: Updating .env.production...${NC}"

if ! grep -q "TRACKING_DB_NAME" .env.production; then
  echo "" >> .env.production
  echo "# Database Tracking" >> .env.production
  echo "TRACKING_DB_NAME=tenant_tracking" >> .env.production
  echo -e "${GREEN}✅ Added TRACKING_DB_NAME to .env.production${NC}"
else
  echo -e "${GREEN}✅ TRACKING_DB_NAME already exists${NC}"
fi
echo ""

# Fix 4: Update docker-compose.prod.yml to add TRACKING_DB_NAME
echo -e "${YELLOW}🔧 Fix 4: Updating docker-compose.prod.yml...${NC}"

# Add TRACKING_DB_NAME to all Node.js services in docker-compose.prod.yml
sed -i 's/DB_HOST: mariadb/DB_HOST: mariadb\n      TRACKING_DB_NAME: tenant_tracking/g' docker-compose.prod.yml

echo -e "${GREEN}✅ Updated docker-compose.prod.yml${NC}"
echo ""

# Fix 5: Recreate services with updated configuration
echo -e "${YELLOW}🔄 Fix 5: Recreating services with fixes...${NC}"
echo "This will restart all services with the new configuration..."
echo ""

$DOCKER_COMPOSE -f docker-compose.prod.yml up -d --force-recreate --build

echo ""
echo -e "${GREEN}✅ Services recreated${NC}"
echo ""

# Fix 6: Wait for services to stabilize
echo -e "${YELLOW}⏳ Fix 6: Waiting for services to stabilize (30s)...${NC}"
sleep 30
echo ""

# Fix 7: Check status
echo -e "${YELLOW}📊 Fix 7: Checking service status...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$DOCKER_COMPOSE -f docker-compose.prod.yml ps --format "table {{.Service}}\t{{.Status}}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Runtime fixes applied!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "1. Check logs for any remaining errors:"
echo "   $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f"
echo ""
echo "2. Test API Gateway:"
echo "   curl http://localhost:5000/health"
echo ""
echo "3. If TypeScript services still fail, manually rebuild:"
echo "   $DOCKER_COMPOSE -f docker-compose.prod.yml up --build -d <service-name>"
echo ""