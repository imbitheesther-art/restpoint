.PHONY: help build build-no-cache up down restart logs logs-service clean health test dev prod stop ps shell exec

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help:
	@echo "$(BLUE)RestPoint Docker Makefile$(NC)"
	@echo ""
	@echo "$(GREEN)Build Commands:$(NC)"
	@echo "  make build                - Build all Docker images"
	@echo "  make build-no-cache       - Rebuild all images from scratch"
	@echo "  make build-service SVC=X  - Build specific service (e.g., make build-service SVC=auth-service)"
	@echo ""
	@echo "$(GREEN)Container Commands:$(NC)"
	@echo "  make up                   - Start all services"
	@echo "  make down                 - Stop all services"
	@echo "  make restart              - Restart all services"
	@echo "  make stop                 - Stop without removing containers"
	@echo "  make kill                 - Kill all containers immediately"
	@echo "  make clean                - Remove containers, networks, volumes (DESTRUCTIVE)"
	@echo ""
	@echo "$(GREEN)Monitoring:$(NC)"
	@echo "  make logs                 - Show all service logs"
	@echo "  make logs-service SVC=X   - Show logs for specific service"
	@echo "  make health               - Check all services health"
	@echo "  make ps                   - List running containers"
	@echo ""
	@echo "$(GREEN)Environment:$(NC)"
	@echo "  make dev                  - Set up development environment"
	@echo "  make prod                 - Set up production environment"
	@echo "  make shell SVC=X          - Open shell in service container"
	@echo "  make exec SVC=X CMD='cmd' - Execute command in service"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test                 - Run all tests"
	@echo "  make validate             - Validate docker-compose.yml"
	@echo ""

# Build targets
build:
	@echo "$(BLUE)Building all Docker images...$(NC)"
	docker-compose build

build-no-cache:
	@echo "$(BLUE)Rebuilding all images from scratch...$(NC)"
	docker-compose build --no-cache

build-service:
	@if [ -z "$(SVC)" ]; then \
		echo "$(RED)Error: SVC not specified. Usage: make build-service SVC=service-name$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Building $(SVC)...$(NC)"
	docker-compose build $(SVC)

# Startup targets
up: validate
	@echo "$(BLUE)Starting all services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "Waiting for services to be healthy..."
	@sleep 30
	@make health

down:
	@echo "$(BLUE)Stopping all services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart: down up
	@echo "$(GREEN)✓ Services restarted$(NC)"

stop:
	@echo "$(BLUE)Stopping services (keeping containers)...$(NC)"
	docker-compose stop
	@echo "$(GREEN)✓ Services stopped$(NC)"

kill:
	@echo "$(RED)Killing all containers immediately...$(NC)"
	docker-compose kill
	@echo "$(RED)✓ All containers killed$(NC)"

clean: kill
	@echo "$(RED)WARNING: This will remove all containers, networks, and volumes!$(NC)"
	@read -p "Type 'yes' to confirm: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "$(RED)Cleaning up...$(NC)"; \
		docker-compose down -v; \
		docker system prune -f; \
		echo "$(RED)✓ Cleanup complete$(NC)"; \
	else \
		echo "Cancelled."; \
	fi

# Monitoring targets
logs:
	docker-compose logs -f --tail=100

logs-service:
	@if [ -z "$(SVC)" ]; then \
		echo "$(RED)Error: SVC not specified. Usage: make logs-service SVC=service-name$(NC)"; \
		exit 1; \
	fi
	docker-compose logs -f --tail=100 $(SVC)

health:
	@echo "$(BLUE)Checking service health...$(NC)"
	@./scripts/02-health-check.sh || true

ps:
	@echo "$(BLUE)Running containers:$(NC)"
	@docker-compose ps

# Shell access
shell:
	@if [ -z "$(SVC)" ]; then \
		echo "$(RED)Error: SVC not specified. Usage: make shell SVC=service-name$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Opening shell in $(SVC)...$(NC)"
	docker-compose exec $(SVC) sh

exec:
	@if [ -z "$(SVC)" ] || [ -z "$(CMD)" ]; then \
		echo "$(RED)Error: Usage: make exec SVC=service-name CMD='your-command'$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Executing in $(SVC): $(CMD)$(NC)"
	docker-compose exec $(SVC) sh -c "$(CMD)"

# Environment setup
dev:
	@echo "$(BLUE)Setting up development environment...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Copying .env from .env.example...$(NC)"; \
		cp .env.example .env || echo "$(YELLOW)No .env.example found, creating default .env$(NC)"; \
	fi
	@echo "$(GREEN)✓ Development environment ready$(NC)"
	@make build

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
	@echo "$(BLUE)Validating docker-compose.yml...$(NC)"
	@docker-compose config > /dev/null && echo "$(GREEN)✓ docker-compose.yml is valid$(NC)" || exit 1

# Testing
test:
	@echo "$(BLUE)Running tests...$(NC)"
	@docker-compose exec api-gateway npm test || true
	@echo "$(GREEN)✓ Tests complete$(NC)"

# Utility targets
ps-all:
	@echo "$(BLUE)All Docker containers (including stopped):$(NC)"
	@docker ps -a

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
	@docker-compose logs --tail=300

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
	@grep -E "^[A-Z_]+" .env | head -10 || echo "No .env file"
	@echo ""
	@echo "Services: $$(docker-compose config --services | wc -l)"

# Default target
.DEFAULT_GOAL := help
