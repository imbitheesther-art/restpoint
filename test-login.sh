#!/bin/bash

# Test RestPoint Login Flow

echo "🧪 Testing RestPoint Login System"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
GATEWAY_URL="http://localhost:8000"
TENANT_SERVICE="http://localhost:8002"
AUTH_SERVICE="http://localhost:8001"

# Test data
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

echo -e "${YELLOW}1. Testing Tenant Service Health${NC}"
curl -s "$TENANT_SERVICE/health" | jq . || echo "❌ Tenant service not responding"
echo ""

echo -e "${YELLOW}2. Testing Auth Service Health${NC}"
curl -s "$AUTH_SERVICE/health" | jq . || echo "❌ Auth service not responding"
echo ""

echo -e "${YELLOW}3. Testing API Gateway Health${NC}"
curl -s "$GATEWAY_URL/health" | jq . || echo "❌ API Gateway not responding"
echo ""

echo -e "${YELLOW}4. Testing Login via API Gateway${NC}"
curl -X POST "$GATEWAY_URL/api/v1/restpoint/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}" \
  | jq . || echo "❌ Login failed"
echo ""

echo -e "${YELLOW}5. Testing Auth Service Directly${NC}"
curl -s "$AUTH_SERVICE/api/v1/restpoint/auth/login" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"identifier\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}" \
  | jq . || echo "❌ Direct auth service call failed"
echo ""

echo "✅ Test complete!"
