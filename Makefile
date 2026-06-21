.PHONY: help build build-no-cache build-service up down restart logs logs-service clean health test dev prod stop ps shell exec deploy-prod deploy-staging backup restore

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[0;33m
NC := \033[0m # No Color

# Environment
COMPOSE := docker-compose
COMPOSE_PROD := docker-compose -f docker-compose.prod.yml

# Default target
.DEFAULT_GOAL := help

help:
	@echo "$(BLUE)RestPoint Docker Makefile - Production Grade$(NC)"
	@echo ""
	@echo "$(GREEN)Build Commands:$(NC)"
	@echo "  make build                - Build all Docker images (dev)"
	@echo "  make build-no-cache       - Rebuild all images from scratch"
	@echo "  make build-service SVC=X  - Build specific service"
	@echo "  make build-all            - Build all services with no cache"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make up                   - Start all services (dev)"
	@echo "  make down                 - Stop all services"
	@echo "  make restart              - Restart all services"
	@echo "  make dev                  - Set up dev environment"
	@echo ""
	@echo "$(GREEN)Production Deployment:$(NC)"
	@echo "  make deploy-prod          - Deploy to production (docker-compose.prod.yml)"
	@echo "  make deploy-staging       - Deploy to staging"
	@echo "  make prod-up              - Start production services"
	@echo "  make prod-down            - Stop production services"
	@echo "  make prod-logs            - Production logs"
	@echo ""
	@echo "$(GREEN)Operations:$(NC)"
	@echo "  make backup               - Backup database and data"
	@echo "  make restore              - Restore from backup"
	@echo "  make logs                 - Show all logs"
	@echo "  make logs-service SVC=X   - Show logs for service"
	@echo "  make health               - Check all services"
	@echo "  make ps                   - List containers"
	@echo "  make shell SVC=X          - Shell into service"
	@echo "  make exec SVC=X CMD='cmd' - Execute command"
	@echo "  make stats                - Docker resource usage"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make clean                - Remove containers & volumes (DESTRUCTIVE)"
	@echo "  make validate             - Validate docker-compose files"
	@echo "  make prune                - Remove unused resources"
	@echo ""

# Build targets
build:
	@echo "$(BLUE)Building all Docker images...$(NC)"
	@$(COMPOSE) build

build-no-cache:
	@echo "$(BLUE)Rebuilding all images from scratch...$(NC)"
	@$(COMPOSE) build --no-cache

build-all:
	@echo "$(BLUE)Building all services with no cache...$(NC)"
	@$(COMPOSE) build --no-cache
	@echo "$(GREEN)✓ Build complete$(NC)"

build-service:
	@if [ -z "$(SVC)" ]; then \
		echo "$(RED)Error: SVC not specified. Usage: make build-service SVC=service-name$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Building $(SVC)...$(NC)"
	@$(COMPOSE) build --no-cache $(SVC)
	@echo "$(GREEN)✓ $(SVC) built successfully$(NC)"

# Startup targets
up: validate
	@echo "$(BLUE)Stopping old containers and starting fresh...$(NC)"
	@$(COMPOSE) down --remove-orphans 2>/dev/null || true
	@echo "$(BLUE)Starting all services...$(NC)"
	@$(COMPOSE) up -d --remove-orphans
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "Waiting for services to be healthy..."
	@sleep 30
	@make health

up-force:
	@echo "$(BLUE)Force recreating all containers...$(NC)"
	@$(COMPOSE) down --remove-orphans 2>/dev/null || true
	@$(COMPOSE) up -d --remove-orphans --force-recreate
	@echo "$(GREEN)✓ Services recreated$(NC)"
	@sleep 30
	@make health

down:
	@echo "$(BLUE)Stopping all services...$(NC)"
	@$(COMPOSE) down --remove-orphans
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart:
	@echo "$(BLUE)Restarting all services...$(NC)"
	@$(COMPOSE) down --remove-orphans
	@echo "$(BLUE)Starting fresh...$(NC)"
	@$(COMPOSE) up -d --remove-orphans
	@echo "$(GREEN)✓ Services restarted$(NC)"

stop:
	@echo "$(BLUE)Stopping services (keeping containers)...$(NC)"
	@$(COMPOSE) stop
	@echo "$(GREEN)✓ Services stopped$(NC)"

kill:
	@echo "$(RED)Killing all containers immediately...$(NC)"
	@$(COMPOSE) kill
	@echo "$(RED)✓ All containers killed$(NC)"

clean: kill
	@echo "$(RED)WARNING: This will remove all containers, networks, and volumes!$(NC)"
	@read -p "Type 'yes' to confirm: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "$(RED)Cleaning up...$(NC)"; \
		$(COMPOSE) down -v; \
		docker system prune -f; \
		echo "$(RED)✓ Cleanup complete$(NC)"; \
	else \
		echo "Cancelled."; \
	fi

clean-full:
	@echo "$(RED)WARNING: This will remove ALL containers, volumes, networks, and images!$(NC)"
	@read -p "Type 'yes' to confirm: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "$(RED)Cleaning up everything...$(NC)"; \
		$(COMPOSE) down -v --rmi all; \
		docker system prune -a -f; \
		echo "$(RED)✓ Complete cleanup done$(NC)"; \
	else \
		echo "Cancelled."; \
	fi

# Monitoring targets
logs:
	@$(COMPOSE) logs -f --tail=100

logs-service:
	@if [ -z "$(SVC)" ]; then \
		echo "$(RED)Error: SVC not specified. Usage: make logs-service SVC=service-name$(NC)"; \
		exit 1; \
	fi
	@$(COMPOSE) logs -f --tail=100 $(SVC)

health:
	@echo "$(BLUE)Checking service health...$(NC)"
	@if [ -f ./scripts/02-health-check.sh ]; then \
		./scripts/02-health-check.sh || true; \
	else \
		echo "$(YELLOW)Health check script not found, checking with curl...$(NC)"; \
		@curl -s http://localhost:5000/health || echo "$(RED)Gateway not healthy$(NC)"; \
		@curl -s http://localhost:5002/health || echo "$(RED)Tenant service not healthy$(NC)"; \
	fi

ps:
	@echo "$(BLUE)Running containers:$(NC)"
	@$(COMPOSE) ps

ps-all:
	@echo "$(BLUE)All containers (including stopped):$(NC)"
	@docker ps -a | grep restpoint

# Shell access
shell:
	@if [ -z "$(SVC)" ]; then \
		echo "$(RED)Error: SVC not specified. Usage: make shell SVC=service-name$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Opening shell in $(SVC)...$(NC)"
	@$(COMPOSE) exec $(SVC) sh

exec:
	@if [ -z "$(SVC)" ] || [ -z "$(CMD)" ]; then \
		echo "$(RED)Error: Usage: make exec SVC=service-name CMD='your-command'$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Executing in $(SVC): $(CMD)$(NC)"
	@$(COMPOSE) exec $(SVC) sh -c "$(CMD)"

# Environment setup
dev:
	@echo "$(BLUE)Setting up development environment...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env from .env.example...$(NC)"; \
		if [ -f .env.example ]; then \
			cp .env.example .env; \
		else \
			echo "$(YELLOW)Creating default .env file...$(NC)"; \
			echo "DB_ROOT_PASSWORD=rootpassword" > .env; \
			echo "DB_NAME=master_db" >> .env; \
			echo "DB_USER=appuser" >> .env; \
			echo "DB_PASSWORD=apppassword" >> .env; \
			echo "JWT_SECRET=your-jwt-secret-key" >> .env; \
			echo "JWT_REFRESH_SECRET=your-refresh-secret" >> .env; \
			echo "RABBITMQ_USER=guest" >> .env; \
			echo "RABBITMQ_PASSWORD=guest" >> .env; \
			echo "REDIS_PASSWORD=" >> .env; \
			echo "CORS_ORIGIN=http://localhost:3000,http://localhost:5000,http://localhost:8082" >> .env; \
		fi; \
	fi
	@echo "$(GREEN)✓ Development environment ready$(NC)"
	@make build

# Production targets
prod:
	@echo "$(BLUE)Setting up production environment...$(NC)"
	@if [ ! -f .env.prod ]; then \
		echo "$(RED)Error: .env.prod not found!$(NC)"; \
		exit 1; \
	fi
	@cp .env.prod .env
	@echo "$(GREEN)✓ Production environment configured$(NC)"
	@make build-no-cache

# Validation
validate:
	@echo "$(BLUE)Validating docker-compose files...$(NC)"
	@$(COMPOSE) config > /dev/null 2>&1 && echo "$(GREEN)✓ docker-compose.yml is valid$(NC)" || echo "$(RED)✗ docker-compose.yml invalid$(NC)"
	@if [ -f docker-compose.prod.yml ]; then \
		$(COMPOSE_PROD) config > /dev/null 2>&1 && echo "$(GREEN)✓ docker-compose.prod.yml is valid$(NC)" || echo "$(RED)✗ docker-compose.prod.yml invalid$(NC)"; \
	fi

validate-dockerfiles:
	@echo "$(BLUE)Validating all Dockerfiles...$(NC)"
	@for dockerfile in $$(find ./services -name "Dockerfile" 2>/dev/null); do \
		echo "Checking $$dockerfile..."; \
		docker build -t test-build --no-cache -f $$dockerfile . > /dev/null 2>&1; \
		if [ $$? -eq 0 ]; then \
			echo "$(GREEN)✓ $$dockerfile is valid$(NC)"; \
		else \
			echo "$(RED)✗ $$dockerfile has errors$(NC)"; \
		fi; \
	done

# Production Deployment Targets
deploy-prod: validate
	@echo "$(BLUE)Deploying to PRODUCTION...$(NC)"
	@if [ ! -f .env.production ]; then \
		echo "$(RED)Error: .env.production not found!$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Configuring production environment...$(NC)"
	@cp .env.production .env
	@echo "$(BLUE)Building production images...$(NC)"
	@$(COMPOSE_PROD) build --no-cache
	@echo "$(GREEN)✓ Production build complete$(NC)"
	@echo "$(BLUE)Starting production services...$(NC)"
	@$(COMPOSE_PROD) up -d
	@echo "$(GREEN)✓ Production deployment complete$(NC)"
	@echo "Waiting 30s for services to stabilize..."
	@sleep 30
	@$(COMPOSE_PROD) ps

deploy-staging:
	@echo "$(BLUE)Deploying to STAGING...$(NC)"
	@$(COMPOSE) build
	@$(COMPOSE) up -d
	@echo "$(GREEN)✓ Staging deployment complete$(NC)"

prod-up: validate
	@echo "$(BLUE)Starting production services (docker-compose.prod.yml)...$(NC)"
	@$(COMPOSE_PROD) up -d
	@echo "$(GREEN)✓ Production services started$(NC)"
	@sleep 30
	@$(COMPOSE_PROD) ps

prod-down:
	@echo "$(BLUE)Stopping production services...$(NC)"
	@$(COMPOSE_PROD) down
	@echo "$(GREEN)✓ Production services stopped$(NC)"

prod-logs:
	@$(COMPOSE_PROD) logs -f --tail=100

# Backup & Recovery
backup:
	@echo "$(BLUE)Creating backup...$(NC)"
	@mkdir -p ./backups
	@BACKUP_FILE="./backups/restpoint_$$(date +%Y%m%d_%H%M%S).tar.gz"; \
	docker-compose exec -T mariadb mysqldump -uroot -p$${DB_ROOT_PASSWORD:-rootpassword} --all-databases 2>/dev/null | gzip > $$BACKUP_FILE; \
	if [ $$? -eq 0 ]; then \
		echo "$(GREEN)✓ Database backup created: $$BACKUP_FILE$(NC)"; \
	else \
		echo "$(RED)✗ Backup failed$(NC)"; \
	fi

restore:
	@echo "$(RED)WARNING: This will overwrite the current database!$(NC)"
	@read -p "Enter backup file path: " backup_file; \
	if [ -f "$$backup_file" ]; then \
		echo "$(BLUE)Restoring from $$backup_file...$(NC)"; \
		gunzip -c $$backup_file | docker-compose exec -T mariadb mysql -uroot -p$${DB_ROOT_PASSWORD:-rootpassword}; \
		if [ $$? -eq 0 ]; then \
			echo "$(GREEN)✓ Restore complete$(NC)"; \
		else \
			echo "$(RED)✗ Restore failed$(NC)"; \
		fi; \
	else \
		echo "$(RED)Backup file not found: $$backup_file$(NC)"; \
		exit 1; \
	fi

# Testing
test:
	@echo "$(BLUE)Running tests...$(NC)"
	@if docker-compose exec api-gateway npm test 2>/dev/null; then \
		echo "$(GREEN)✓ Tests complete$(NC)"; \
	else \
		echo "$(YELLOW)No tests found or service not running$(NC)"; \
	fi

# Utility targets
ps-images:
	@echo "$(BLUE)Docker images:$(NC)"
	@docker images | grep restpoint || echo "No RestPoint images found"

prune:
	@echo "$(YELLOW)Removing unused Docker resources...$(NC)"
	@docker system prune -f
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

stats:
	@echo "$(BLUE)Docker resource usage:$(NC)"
	@docker stats --no-stream

# Advanced targets
rebuild: clean build up
	@echo "$(GREEN)✓ Full rebuild complete$(NC)"

reset: clean dev
	@echo "$(GREEN)✓ Reset to development state complete$(NC)"

logs-all:
	@echo "$(BLUE)All container logs (last 300 lines):$(NC)"
	@$(COMPOSE) logs --tail=300

check-deps:
	@echo "$(BLUE)Checking dependencies...$(NC)"
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)✗ Docker not installed$(NC)"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "$(RED)✗ Docker Compose not installed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ All dependencies found$(NC)"

version:
	@echo "$(BLUE)Version Information:$(NC)"
	@echo "Docker: $$(docker --version)"
	@echo "Docker Compose: $$(docker-compose --version)"

info:
	@echo "$(BLUE)RestPoint System Information:$(NC)"
	@echo "Status: "; @make ps
	@echo ""
	@echo "Configuration:"
	@if [ -f .env ]; then \
		grep -E "^[A-Z_]+" .env | head -10; \
	else \
		echo "No .env file"; \
	fi
	@echo ""
	@echo "Services: $$(docker-compose config --services | wc -l)"

# Fix missing services - start specific services
start-all:
	@echo "$(BLUE)Starting all services including missing ones...$(NC)"
	@$(COMPOSE) up -d --remove-orphans
	@echo "$(GREEN)✓ All services started$(NC)"
	@sleep 10
	@make ps

# Start just the essential services
start-essential:
	@echo "$(BLUE)Starting essential services (gateway, tenant, auth, database)...$(NC)"
	@$(COMPOSE) up -d mariadb redis rabbitmq tenant-service api-gateway auth-service
	@echo "$(GREEN)✓ Essential services started$(NC)"
	@sleep 10
	@make ps

# Fix tenant service specifically
fix-tenant:
	@echo "$(BLUE)Checking tenant service...$(NC)"
	@docker ps -a | grep tenant-service
	@echo "$(BLUE)Removing and rebuilding tenant service...$(NC)"
	@docker rm -f restpoint_tenant_service 2>/dev/null || true
	@$(COMPOSE) build --no-cache tenant-service
	@$(COMPOSE) up -d tenant-service
	@echo "$(GREEN)✓ Tenant service rebuilt and started$(NC)"
	@docker logs restpoint_tenant_service --tail=20

# Fix gateway specifically
fix-gateway:
	@echo "$(BLUE)Checking gateway...$(NC)"
	@docker ps -a | grep gateway
	@echo "$(BLUE)Removing and rebuilding gateway...$(NC)"
	@docker rm -f restpoint_api_gateway 2>/dev/null || true
	@$(COMPOSE) build --no-cache api-gateway
	@$(COMPOSE) up -d api-gateway
	@echo "$(GREEN)✓ Gateway rebuilt and started$(NC)"
	@docker logs restpoint_api_gateway --tail=20

# Fix all services
fix-all:
	@echo "$(BLUE)Fixing all services...$(NC)"
	@$(COMPOSE) down --remove-orphans
	@$(COMPOSE) build --no-cache
	@$(COMPOSE) up -d --remove-orphans
	@echo "$(GREEN)✓ All services rebuilt and started$(NC)"
	@sleep 30
	@make ps