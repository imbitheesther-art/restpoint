#!/bin/bash
# RestPoint Production Deployment Script
# Run this on the production server after pulling changes

set -e

echo "========================================="
echo "RestPoint Production Deployment"
echo "========================================="

# Pull latest changes
echo "Pulling latest changes..."
cd /opt/restpoint
git pull

# Update all Dockerfiles to reference new folder name
echo "Updating Dockerfiles..."
sed -i 's/COPY global\//COPY app-global\//g' services/*/Dockerfile

# Fix hearse-service package (remove duplicate socket-io)
echo "Fixing hearse-service package.json..."
sed -i '/"socket-io":/d' services/hearse-service/package.json

# Rebuild and deploy
echo "Rebuilding and starting services..."
docker-compose build
docker-compose up -d

echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo "Check service status with: docker-compose ps"
echo "View logs with: docker-compose logs -f [service-name]"