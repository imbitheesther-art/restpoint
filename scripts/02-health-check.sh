#!/bin/bash

echo "=================================================="
echo "RestPoint - Services Health Check"
echo "=================================================="
echo ""

SERVICES=(
  "api-gateway:5000"
  "auth-service:5000"
  "tenant-service:5000"
  "deceased-service:5000"
  "marketplace-service:5000"
  "invoice-service:5000"
  "coffin-service:5000"
  "documents-service:5000"
  "edocuments-service:5000"
  "analytics-service:5000"
  "calender-service:5000"
  "mpesa-service:5000"
  "notification-service:5000"
  "qrcode-service:5000"
  "socketio-service:5000"
  "visitors-service:5000"
  "bodycheckout-service:5000"
  "extra-services:5000"
  "call-service:5000"
  "portal-service:5000"
  "chemical-service:5000"
  "billing-service:5000"
  "frontend:80"
)

HEALTHY=0
UNHEALTHY=0

for service in "${SERVICES[@]}"; do
  IFS=':' read -r name port <<< "$service"
  
  if [ "$name" = "frontend" ]; then
    url="http://localhost:8082/health"
  else
    url="http://localhost/api/health"
  fi
  
  if curl -s "$url" > /dev/null 2>&1; then
    echo "✓ $name:$port - HEALTHY"
    ((HEALTHY++))
  else
    echo "✗ $name:$port - UNHEALTHY or NOT RESPONDING"
    ((UNHEALTHY++))
  fi
done

echo ""
echo "=================================================="
echo "Summary: $HEALTHY healthy, $UNHEALTHY unhealthy"
echo "=================================================="

if [ $UNHEALTHY -eq 0 ]; then
  echo "✅ All services are healthy!"
  exit 0
else
  echo "⚠️  Some services are not responding yet. Check logs with:"
  echo "   docker-compose logs -f service-name"
  exit 1
fi
