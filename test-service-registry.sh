#!/bin/bash

# =============================================================================
# Service Registry Test Script
# =============================================================================
# This script tests the Consul service registry setup

echo "========================================"
echo "  Service Registry Test Suite"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Test function
test_check() {
    local description=$1
    local command=$2
    
    echo -n "Testing: $description... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        ((FAIL++))
        return 1
    fi
}

# =============================================================================
# Pre-flight Checks
# =============================================================================

echo "Pre-flight Checks:"
echo "-------------------"

test_check "Docker is installed" "docker --version"
test_check "Docker Compose is installed" "docker-compose --version"
test_check "Consul container exists" "docker ps | grep restpoint_consul"
test_check "API Gateway is running" "docker ps | grep restpoint_api_gateway"

echo ""
echo "Consul Health Checks:"
echo "---------------------"

# Test 1: Consul is running
test_check "Consul HTTP API is accessible" "curl -s http://localhost:8500/v1/status/leader | grep -q '.'"

# Test 2: Consul has a leader
test_check "Consul has elected a leader" "curl -s http://localhost:8500/v1/status/leader | grep -v '\"\"'"

echo ""
echo "Service Registration Checks:"
echo "----------------------------"

# Test 3: List all services
echo "Registered services:"
curl -s http://localhost:8500/v1/catalog/services | jq '.' 2>/dev/null || curl -s http://localhost:8500/v1/catalog/services

echo ""

# Test 4: Check specific services
SERVICES=("api-gateway" "auth-service" "tenant-service" "deceased-service" "billing-service")

for service in "${SERVICES[@]}"; do
    test_check "$service is registered" "curl -s http://localhost:8500/v1/catalog/service/$service | jq -e '.[0].Service.ServiceName' > /dev/null 2>&1"
done

echo ""
echo "Service Health Checks:"
echo "----------------------"

# Test 5: Check service health
for service in "${SERVICES[@]}"; do
    test_check "$service health check passing" "curl -s 'http://localhost:8500/v1/health/service/$service?passing=true' | jq -e '.[0].Checks | all(.Status == \"passing\")' > /dev/null 2>&1"
done

echo ""
echo "API Gateway Integration:"
echo "------------------------"

# Test 6: API Gateway health endpoint
test_check "API Gateway health endpoint" "curl -s http://localhost:5000/health | jq -e '.success == true'"

# Test 7: API Gateway service discovery status
test_check "API Gateway service discovery initialized" "curl -s http://localhost:5000/api/v1/health | jq -e '.serviceDiscovery.initialized == true'"

# Test 8: API Gateway debug routes
test_check "API Gateway debug routes endpoint" "curl -s http://localhost:5000/api/v1/debug/routes | jq -e '.success == true'"

# Test 9: API Gateway health check
test_check "API Gateway health check endpoint" "curl -s http://localhost:5000/api/v1/debug/health-check | jq -e '.success == true'"

echo ""
echo "Service Discovery Tests:"
echo "------------------------"

# Test 10: Discover a service via API
test_check "Discover auth-service via API" "curl -s http://localhost:5000/api/v1/debug/routes | jq -e '.services.auth != null'"

# Test 11: Service URL resolution
test_check "Service URLs are resolved" "curl -s http://localhost:5000/api/v1/debug/routes | jq -e 'all(.services[]; . != null)'"

echo ""
echo "Consul Web UI:"
echo "--------------"
echo "Consul Web UI should be available at: http://localhost:8500"
echo ""

# =============================================================================
# Summary
# =============================================================================

echo "========================================"
echo "  Test Summary"
echo "========================================"
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open Consul Web UI: http://localhost:8500"
    echo "2. View services: http://localhost:8500/ui/dc1/services"
    echo "3. Check API Gateway: http://localhost:5000/api/v1/debug/routes"
    echo "4. Read documentation: SERVICE_REGISTRY.md"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check Consul logs: docker-compose logs consul"
    echo "2. Check service logs: docker-compose logs <service-name>"
    echo "3. Verify Consul is running: curl http://localhost:8500/v1/status/leader"
    echo "4. See SERVICE_REGISTRY.md for more help"
    exit 1
fi