#!/bin/bash
set -e

echo "=================================================="
echo "RestPoint - Starting All Services"
echo "=================================================="

echo ""
echo "Step 1: Validating docker-compose.yml..."
docker-compose config > /dev/null && echo "✓ docker-compose.yml is valid"

echo ""
echo "Step 2: Building Docker images..."
docker-compose build --no-cache 2>&1 | grep -E "^(Building|Successfully)" || true

echo ""
echo "Step 3: Starting infrastructure (MariaDB, Redis, RabbitMQ)..."
docker-compose up -d mariadb redis rabbitmq
echo "✓ Waiting for infrastructure to be healthy..."
sleep 20

echo ""
echo "Step 4: Starting API services..."
docker-compose up -d api-gateway auth-service tenant-service
echo "✓ Waiting for core services to be healthy..."
sleep 30

echo ""
echo "Step 5: Starting all remaining services..."
docker-compose up -d

echo ""
echo "Step 6: Verifying all services are running..."
docker-compose ps

echo ""
echo "=================================================="
echo "✅ All services are starting!"
echo "=================================================="
echo ""
echo "Service URLs:"
echo "  API Gateway:  http://localhost:5000"
echo "  Frontend:     http://localhost:8082"
echo "  RabbitMQ:     http://localhost:15672"
echo ""
echo "Next step: Run ./scripts/03-health-check.sh to verify all services"
echo ""
