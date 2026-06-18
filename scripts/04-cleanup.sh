#!/bin/bash

echo "=================================================="
echo "RestPoint - Cleanup & Reset"
echo "=================================================="
echo ""

echo "This script will remove running containers and volumes."
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "Stopping all services..."
docker-compose down

read -p "Remove volumes? (yes/no): " remove_volumes

if [ "$remove_volumes" = "yes" ]; then
  echo "Removing volumes..."
  docker-compose down -v
  echo "✓ Volumes removed"
fi

echo ""
echo "Cleanup summary:"
docker system df

echo ""
echo "✅ Cleanup complete"
