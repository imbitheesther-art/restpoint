#!/bin/bash

# Fix Docker build timeouts for all services
# This script updates all service Dockerfiles to use increased network timeouts

echo "Fixing Docker build timeouts for all services..."

# List of all service Dockerfiles
services=(
    "services/tenant-service/Dockerfile"
    "services/auth-service/Dockerfile"
    "services/deceased-service/Dockerfile"
    "services/hearse-service/Dockerfile"
    "services/invoice-service/Dockerfile"
    "services/workshop-service/Dockerfile"
    "services/chemical-service/Dockerfile"
    "services/leave-service/Dockerfile"
    "services/documents-service/Dockerfile"
    "services/support-service/Dockerfile"
    "services/billing-service/Dockerfile"
    "services/bodycheckout-service/Dockerfile"
    "services/coffin-service/Dockerfile"
    "services/extra-services/Dockerfile"
    "services/scanner-service/Dockerfile"
    "services/notification-service/Dockerfile"
    "services/analytics-service/Dockerfile"
    "services/calender-service/Dockerfile"
    "services/mpesa-service/Dockerfile"
    "services/visitors-service/Dockerfile"
    "services/edocuments-service/Dockerfile"
    "FrontendClient/Dockerfile"
)

for dockerfile in "${services[@]}"; do
    if [ -f "$dockerfile" ]; then
        echo "Updating $dockerfile..."
        
        # Replace yarn install line with timeout-enabled version
        sed -i 's/RUN yarn install --no-lockfile && yarn cache clean/RUN yarn config set network-timeout 600000 \&\& yarn install --no-lockfile --network-timeout 600000 \&\& yarn cache clean/g' "$dockerfile"
        
        # Also handle npm install if present
        sed -i 's/RUN npm install --production/RUN npm config set fetch-retry-maxtimeout 600000 \&\& npm install --production/g' "$dockerfile"
        
        echo "  ✓ Updated $dockerfile"
    else
        echo "  ⚠ Skipping $dockerfile (not found)"
    fi
done

echo ""
echo "All Dockerfiles updated with increased network timeouts (600 seconds)"
echo ""
echo "To rebuild, run:"
echo "  docker-compose build --no-cache"
echo ""
echo "Or for individual service:"
echo "  docker-compose build workshop-service"