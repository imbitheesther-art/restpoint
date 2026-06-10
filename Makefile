# Rest Point Production Makefile
# All services use the 'restpoint' network

.PHONY: help up down logs build clean rebuild migrate seed restart frontend backend

# Default target
help:
	@echo "Rest Point Production Commands"
	@echo "================================"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Commands:"
	@echo "  up          - Start all services (backend + frontend)"
	@echo "  up-backend  - Start only backend services"
	@echo "  up-frontend - Start only frontend"
	@echo "  down        - Stop all services"
	@echo "  logs        - View logs (tail -f)"
	@echo "  logs-backend- View backend logs"
	@echo "  logs-frontend- View frontend logs"
	@echo "  build       - Build all services"
	@echo "  build-backend - Build only backend services"
	@echo "  build-frontend - Build only frontend"
	@echo "  rebuild     - Rebuild and restart all services"
	@echo "  migrate     - Run database migrations"
	@echo "  seed        - Seed database with default data"
	@echo "  clean       - Remove all containers and volumes"
	@echo "  restart     - Restart all services"
	@echo "  ps          - Show running containers"
	@echo "  shell       - Open shell in a service (usage: make shell service=auth-service)"
	@echo ""
	@echo "Default Admin Credentials:"
	@echo "  Email: infowelttallis@gmail.com"
	@echo "  Password: 40045355"
	@echo ""
	@echo "Production Domain: app.restpoint.co.ke"

# Create restpoint network if it doesn't exist
network:
	@docker network create restpoint 2>/dev/null || true

# Start all services
up: network
	@echo "Starting all Rest Point services..."
	@docker-compose -f docker-compose.prod.yml up -d
	@echo ""
	@echo "✓ All services started!"
	@echo "  Frontend: http://app.restpoint.co.ke (or http://localhost:80)"
	@echo "  Admin Login: infowelttallis@gmail.com / 40045355"
	@echo ""
	@echo "Run 'make logs' to view logs"

# Start only backend services
up-backend: network
	@echo "Starting backend services..."
	@docker-compose -f docker-compose.prod.yml up -d $$(docker-compose -f docker-compose.prod.yml config --services | grep -v frontend)
	@echo "✓ Backend services started!"

# Start only frontend
up-frontend: network
	@echo "Starting frontend..."
	@docker-compose -f docker-compose.prod.yml up -d frontend
	@echo "✓ Frontend started!"

# Stop all services
down:
	@echo "Stopping all services..."
	@docker-compose -f docker-compose.prod.yml down
	@echo "✓ All services stopped!"

# View logs
logs:
	@docker-compose -f docker-compose.prod.yml logs -f --tail=50

# View backend logs
logs-backend:
	@docker-compose -f docker-compose.prod.yml logs -f --tail=50 $$(docker-compose -f docker-compose.prod.yml config --services | grep -v frontend | tr '\n' ' ')

# View frontend logs
logs-frontend:
	@docker-compose -f docker-compose.prod.yml logs -f --tail=50 frontend

# Build all services
build:
	@echo "Building all services..."
	@docker-compose -f docker-compose.prod.yml build --no-cache
	@echo "✓ All services built!"

# Build only backend services
build-backend:
	@echo "Building backend services..."
	@docker-compose -f docker-compose.prod.yml build --no-cache $$(docker-compose -f docker-compose.prod.yml config --services | grep -v frontend | tr '\n' ' ')
	@echo "✓ Backend services built!"

# Build only frontend
build-frontend:
	@echo "Building frontend..."
	@docker-compose -f docker-compose.prod.yml build --no-cache frontend
	@echo "✓ Frontend built!"

# Rebuild and restart all services
rebuild: down build up

# Run database migrations
migrate:
	@echo "Running database migrations..."
	@docker-compose -f docker-compose.prod.yml run --rm tenant-service node dist/scripts/migrate.js
	@echo "✓ Migrations completed!"

# Seed database with default data
seed:
	@echo "Seeding database with default data..."
	@docker-compose -f docker-compose.prod.yml run --rm tenant-service node dist/scripts/seed.js
	@echo "✓ Database seeded!"
	@echo ""
	@echo "Default Admin Credentials:"
	@echo "  Email: infowelttallis@gmail.com"
	@echo "  Password: 40045355"

# Remove all containers and volumes
clean:
	@echo "Cleaning up all containers and volumes..."
	@docker-compose -f docker-compose.prod.yml down -v --rmi all
	@docker network rm restpoint 2>/dev/null || true
	@echo "✓ Cleanup completed!"

# Restart all services
restart:
	@docker-compose -f docker-compose.prod.yml restart
	@echo "✓ All services restarted!"

# Show running containers
ps:
	@docker-compose -f docker-compose.prod.yml ps

# Open shell in a service
shell:
	@if [ -z "$(service)" ]; then \
		echo "Error: Please specify a service (e.g., make shell service=auth-service)"; \
		exit 1; \
	fi
	@docker-compose -f docker-compose.prod.yml exec $(service) /bin/sh

# Production deployment
deploy: build up migrate seed
	@echo ""
	@echo "============================================"
	@echo "  Rest Point Production Deployment Complete"
	@echo "============================================"
	@echo ""
	@echo "  Domain: http://app.restpoint.co.ke"
	@echo "  Admin Email: infowelttallis@gmail.com"
	@echo "  Admin Password: 40045355"
	@echo ""
	@echo "  Run 'make logs' to monitor services"
	@echo "============================================"

# Development mode (with hot reload)
dev:
	@echo "Starting development mode..."
	@docker-compose -f docker-compose.dev.yml up --build