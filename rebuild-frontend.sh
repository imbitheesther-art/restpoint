#!/bin/bash
# Rebuild and redeploy frontend with fixed asset paths

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
echo "🌐 Visit https://restpoint.co.ke to verify the fix"