# ============================================
# Rest Point — Makefile v2.0
# Modern Kenyan Mortuary Management Platform
# Package Manager: Yarn
# ============================================

.PHONY: help setup dev build lint lint-fix test clean \
        docker-up docker-down docker-logs docker-restart \
        docker-rebuild ps shell \
        db-migrate db-seed db-setup db-shell \
        deploy health

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[1;33m
RESET := \033[0m

# Default target
help:
	@echo "$(BLUE)============================================$(RESET)"
	@echo "$(BLUE)  Rest Point — Management Commands$(RESET)"
	@echo "$(BLUE)============================================$(RESET)"
	@echo ""
	@echo "$(YELLOW)Setup & Development:$(RESET)"
	@echo "  make setup          - Install all dependencies (yarn install)"
	@echo "  make dev            - Start dev mode with hot reload"
	@echo "  make build          - Build all services for production"
	@echo "  make lint           - Run ESLint checks"
	@echo "  make lint-fix       - Fix lint issues automatically"
	@echo "  make test           - Run all tests"
	@echo "  make clean          - Remove node_modules and dist"
	@echo ""
	@echo "$(YELLOW)Docker Services:$(RESET)"
	@echo "  make docker-up      - Start all services (docker-compose up -d)"
	@echo "  make docker-down    - Stop all services"
	@echo "  make docker-logs    - View live logs"
	@echo "  make docker-restart - Restart all containers"
	@echo "  make docker-rebuild - Rebuild and restart everything"
	@echo "  make ps             - Show running containers"
	@echo ""
	@echo "$(YELLOW)Database:$(RESET)"
	@echo "  make db-migrate     - Run database migrations"
	@echo "  make db-seed        - Seed default data"
	@echo "  make db-setup       - Migrate + Seed"
	@echo "  make db-shell       - Open MySQL shell (requires docker)"
	@echo ""
	@echo "$(YELLOW)Production:$(RESET)"
	@echo "  make deploy         - Full production deployment"
	@echo "  make health         - Health check all services"
	@echo ""
	@echo "$(YELLOW)System Admin:$(RESET)"
	@echo "  Username: welt"
	@echo "  Password: 40045355@Welttallis"
	@echo ""
	@echo "$(YELLOW)Domains:$(RESET)"
	@echo "  App:      https://app.restpoint.co.ke"
	@echo "  API:      https://api.restpoint.co.ke"
	@echo "  Main:     https://restpoint.co.ke"
	@echo "$(BLUE)============================================$(RESET)"

# ============================================
# SETUP & DEPENDENCIES
# ============================================
setup:
	@echo "$(GREEN)Installing dependencies...$(RESET)"
	@yarn install
	@echo "$(GREEN)✓ Dependencies installed successfully!$(RESET)"

# ============================================
# DEVELOPMENT
# ============================================
dev:
	@echo "$(GREEN)Starting development mode...$(RESET)"
	@yarn dev

build:
	@echo "$(GREEN)Building all services...$(RESET)"
	@yarn build
	@echo "$(GREEN)✓ Build complete!$(RESET)"

lint:
	@echo "$(GREEN)Running ESLint...$(RESET)"
	@yarn lint

lint-fix:
	@echo "$(GREEN)Fixing lint issues...$(RESET)"
	@yarn lint:fix

test:
	@echo "$(GREEN)Running tests...$(RESET)"
	@yarn test

clean:
	@echo "$(RED)Cleaning up...$(RESET)"
	@find . -name "node_modules" -type d -prune -exec rm -rf {} +
	@find . -name "dist" -type d -prune -exec rm -rf {} +
	@find . -name "build" -type d -prune -exec rm -rf {} +
	@echo "$(GREEN)✓ Clean complete!$(RESET)"

# ============================================
# DOCKER
# ============================================
docker-up:
	@echo "$(GREEN)Starting all Rest Point services...$(RESET)"
	@docker-compose up -d
	@echo "$(GREEN)✓ All services started!$(RESET)"
	@echo ""
	@echo "  Frontend:  https://restpoint.co.ke (port 8082)"
	@echo "  API:       http://localhost:5000"
	@echo "  Portal:    http://localhost:5000"

docker-down:
	@echo "$(YELLOW)Stopping all services...$(RESET)"
	@docker-compose down
	@echo "$(GREEN)✓ All services stopped!$(RESET)"

docker-logs:
	@docker-compose logs -f --tail=100

docker-restart:
	@echo "$(YELLOW)Restarting all services...$(RESET)"
	@docker-compose restart
	@echo "$(GREEN)✓ All services restarted!$(RESET)"

docker-rebuild:
	@echo "$(YELLOW)Rebuilding all services...$(RESET)"
	@docker-compose down
	@docker-compose build --no-cache
	@docker-compose up -d
	@echo "$(GREEN)✓ Rebuild complete!$(RESET)"

ps:
	@docker-compose ps

shell:
	@if [ -z "$(service)" ]; then \
		echo "$(RED)Usage: make shell service=<service-name>$(RESET)"; \
		exit 1; \
	fi
	@docker-compose exec $(service) /bin/sh

# ============================================
# DATABASE
# ============================================
db-migrate:
	@echo "$(GREEN)Running database migrations...$(RESET)"
	@node scripts/migrate.js
	@echo "$(GREEN)✓ Migrations complete!$(RESET)"

db-seed:
	@echo "$(GREEN)Seeding database...$(RESET)"
	@node scripts/seed.js
	@echo "$(GREEN)✓ Seeding complete!$(RESET)"
	@echo ""
	@echo "  System Admin: welt / 40045355@Welttallis"

db-setup: db-migrate db-seed

db-shell:
	@docker-compose exec mariadb mysql -u root -proot restpoint_system

# ============================================
# PRODUCTION DEPLOYMENT
# ============================================
deploy:
	@echo "$(BLUE)============================================$(RESET)"
	@echo "$(BLUE)  Rest Point Production Deployment$(RESET)"
	@echo "$(BLUE)============================================$(RESET)"
	@echo ""
	@echo "$(YELLOW)Step 1: Building frontend...$(RESET)"
	@cd FrontendClient/client && docker build -t frontend .
	@echo "$(GREEN)✓ Frontend built$(RESET)"
	@echo ""
	@echo "$(YELLOW)Step 2: Starting frontend on port 8082...$(RESET)"
	@docker run -d --name restpoint-frontend -p 8082:8082 frontend
	@echo "$(GREEN)✓ Frontend running on port 8082$(RESET)"
	@echo ""
	@echo "$(YELLOW)Step 3: Starting all Docker services...$(RESET)"
	@docker-compose up -d
	@echo "$(GREEN)✓ All services started$(RESET)"
	@echo ""
	@echo "$(YELLOW)Step 4: Running migrations...$(RESET)"
	@node scripts/migrate.js
	@echo "$(GREEN)✓ Migrations complete$(RESET)"
	@echo ""
	@echo "$(YELLOW)Step 5: Seeding data...$(RESET)"
	@node scripts/seed.js
	@echo "$(GREEN)✓ Seed data loaded$(RESET)"
	@echo ""
	@echo "$(BLUE)============================================$(RESET)"
	@echo "$(GREEN)  Deployment Complete!$(RESET)"
	@echo "$(BLUE)============================================$(RESET)"
	@echo ""
	@echo "  Frontend:  https://app.restpoint.co.ke"
	@echo "  API:       https://api.restpoint.co.ke"
	@echo "  Admin:     welt / 40045355@Welttallis"
	@echo ""
	@echo "  $(YELLOW)Run 'make docker-logs' to monitor$(RESET)"

# ============================================
# HEALTH CHECK
# ============================================
health:
	@echo "$(BLUE)Checking service health...$(RESET)"
	@echo ""
	@for port in 5000 5001 5002 5003 5004 5005 5006 5007 5008 5009 5010 5011 5012 5013 5014 5015 5016 5017 5018 5019 5111 8082; do \
		status=$$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$$port/health 2>/dev/null || echo "000"); \
		if [ "$$status" != "000" ]; then \
			echo "$(GREEN)✓ Port $$port: OK ($$status)$(RESET)"; \
		else \
			echo "$(RED)✗ Port $$port: DOWN$(RESET)"; \
		fi; \
	done