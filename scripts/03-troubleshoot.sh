#!/bin/bash

echo "=================================================="
echo "RestPoint - Troubleshooting Assistant"
echo "=================================================="
echo ""

# Function to show service logs
show_logs() {
  local service=$1
  echo "Showing logs for $service (last 50 lines)..."
  echo "Press Ctrl+C to stop streaming..."
  docker-compose logs -f --tail=50 "$service"
}

# Function to test service connectivity
test_service() {
  local host=$1
  local port=$2
  echo "Testing connectivity to $host:$port..."
  if docker-compose exec api-gateway wget -q -O- "http://$host:$port/health" 2>/dev/null; then
    echo "✓ $host:$port is reachable"
  else
    echo "✗ $host:$port is NOT reachable"
  fi
}

# Menu
while true; do
  echo ""
  echo "Select an option:"
  echo "1. View all running containers"
  echo "2. View logs for a specific service"
  echo "3. Test service connectivity"
  echo "4. Check Docker disk usage"
  echo "5. Restart all services"
  echo "6. View environment variables for a service"
  echo "7. Execute command in a container"
  echo "8. Exit"
  echo ""
  read -p "Enter choice [1-8]: " choice

  case $choice in
    1)
      docker-compose ps
      ;;
    2)
      echo "Available services:"
      docker-compose ps --services
      read -p "Enter service name: " service
      show_logs "$service"
      ;;
    3)
      echo "Available services:"
      docker-compose ps --services
      read -p "Enter service name: " service
      test_service "$service" "5000"
      ;;
    4)
      docker system df
      ;;
    5)
      echo "Restarting all services..."
      docker-compose restart
      echo "✓ Services restarted"
      ;;
    6)
      echo "Available services:"
      docker-compose ps --services
      read -p "Enter service name: " service
      docker-compose exec "$service" env | grep -E "^(NODE_|DB_|REDIS_|RABBITMQ_|JWT_|PORT)"
      ;;
    7)
      echo "Available services:"
      docker-compose ps --services
      read -p "Enter service name: " service
      read -p "Enter command to execute: " cmd
      docker-compose exec "$service" sh -c "$cmd"
      ;;
    8)
      exit 0
      ;;
    *)
      echo "Invalid choice"
      ;;
  esac
done
