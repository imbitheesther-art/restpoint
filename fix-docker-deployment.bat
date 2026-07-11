@echo off
echo === Fixing Docker Deployment Issues ===
echo.

REM Stop all running containers
echo 1. Stopping all containers...
docker-compose down --volumes --remove-orphans 2>nul || docker compose down --volumes --remove-orphans 2>nul

REM Remove old images that might have ContainerConfig issues
echo 2. Removing old images...
docker rmi restpoint_hearse-service:latest 2>nul || echo Image not found, continuing...
docker rmi restpoint_frontend:latest 2>nul || echo Image not found, continuing...
docker rmi restpoint_visitors-service:latest 2>nul || echo Image not found, continuing...

REM Clean up dangling images and build cache
echo 3. Cleaning up Docker cache...
docker system prune -f --filter "until=24h" 2>nul || echo No cache to clean

REM Rebuild without cache
echo 4. Rebuilding services...
docker-compose build --no-cache 2>nul || docker compose build --no-cache 2>nul

REM Start services
echo 5. Starting services...
docker-compose up -d 2>nul || docker compose up -d 2>nul

echo.
echo === Deployment Complete ===
echo Check status with: docker-compose ps
echo View logs with: docker-compose logs -f
pause