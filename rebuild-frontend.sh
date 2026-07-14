#!/bin/bash
# Rebuild and redeploy frontend with fixes for:
# 1. Asset path 404 errors (vite base path)
# 2. Multi-tenant routing issue (deploymentType detection)

echo "🔨 Building frontend Docker image..."
docker-compose build frontend

echo "🚀 Stopping old frontend container..."
docker-compose stop frontend

echo "🗑️  Removing old frontend container..."
docker-compose rm -f frontend

echo "▶️  Starting new frontend container..."
docker-compose up -d frontend

echo "⏳ Waiting for frontend to be healthy..."
sleep 10

echo "✅ Frontend deployment complete!"
echo ""
echo "Fixes applied:"
echo "  1. Fixed asset paths - assets now load from root /assets/ instead of tenant subdirectory"
echo "  2. Fixed multi-tenant routing - frontend now respects backend deploymentType setting"
echo ""
echo "🌐 Visit https://restpoint.co.ke/tenant/monezuma-monalisa-funeral-home-nairobi/ to verify"
