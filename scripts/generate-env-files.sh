#!/bin/bash
# Generate .env files for all services if missing

SERVICES=(
  "api-gateway"
  "auth-service"
  "tenant-service"
  "deceased-service"
  "marketplace-service"
  "invoice-service"
  "coffin-service"
  "documents-service"
  "edocuments-service"
  "analytics-service"
  "calender-service"
  "mpesa-service"
  "notification-service"
  "qrcode-service"
  "socketio-service"
  "visitors-service"
  "bodycheckout-service"
  "extra-services"
  "call-service"
  "portal-service"
  "chemical-service"
  "billing-service"
)

echo "Creating .env files for all services..."

for service in "${SERVICES[@]}"; do
  env_file="services/$service/.env"

  if [ -f "$env_file" ]; then
    echo "✓ $service (.env exists)"
  else
    echo "Creating $env_file..."
    mkdir -p "services/$service"
    cat > "$env_file" << EOF
# $service Configuration
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Database
DB_HOST=mariadb
DB_PORT=3306
DB_NAME=restpoint_main
DB_USER=restpoint_user
DB_PASSWORD=RestPointUser2024

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=RestPointRedis2024

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=restpoint
RABBITMQ_PASSWORD=RestPointRabbit2024

# JWT
JWT_SECRET=RestPointJWTSecret2024ChangeMe
JWT_EXPIRY=24h

# Service URLs
API_GATEWAY_URL=http://api-gateway:5000
AUTH_SERVICE_URL=http://auth-service:5000
TENANT_SERVICE_URL=http://tenant-service:5000

# Feature Flags
ENABLE_LOGGING=true
ENABLE_MONITORING=true
EOF
    echo "✓ Created $service/.env"
  fi
done

echo ""
echo "✅ All service .env files ready!"
