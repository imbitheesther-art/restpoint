#!/bin/bash

echo "=== Fixing Docker Deployment Issues ==="
echo ""

# Stop all running containers
echo "1. Stopping all containers..."
docker-compose down --volumes --remove-orphans 2>/dev/null || docker compose down --volumes --remove-orphans 2>/dev/null

# Remove old images that might have ContainerConfig issues
echo "2. Removing old images..."
docker rmi restpoint_hearse-service:latest 2>/dev/null || true
docker rmi restpoint_frontend:latest 2>/dev/null || true
docker rmi restpoint_visitors-service:latest 2>/dev/null || true

# Clean up dangling images and build cache
echo "3. Cleaning up Docker cache..."
docker system prune -f --filter "until=24h" 2>/dev/null || true

# Rebuild without cache
echo "4. Rebuilding services..."
docker-compose build --no-cache 2>/dev/null || docker compose build --no-cache 2>/dev/null

# Start services
echo "5. Starting services..."
docker-compose up -d 2>/dev/null || docker compose up -d 2>/dev/null

echo ""
echo "=== Deployment Complete ==="
echo "Check status with: docker-compose ps"
echo "View logs with: docker-compose logs -f"