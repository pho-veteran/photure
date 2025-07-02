.PHONY: help setup build up down restart logs clean install-fe install-be dev-fe dev-be test-fe test-be format lint check health backup restore

# Colors for output
BLUE=\033[0;34m
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

# Default target
help:
	@echo "$(BLUE)Photure - Photo Management Application$(NC)"
	@echo "$(BLUE)======================================"
	@echo ""
	@echo "$(GREEN)🚀 Main Commands:$(NC)"
	@echo "  setup          - Run the complete setup process"
	@echo "  build          - Build all Docker images"
	@echo "  up             - Start all services in production mode"
	@echo "  down           - Stop all services"
	@echo "  restart        - Restart all services"
	@echo "  clean          - Clean up containers, volumes, and images"
	@echo ""
	@echo "$(GREEN)📊 Monitoring & Logs:$(NC)"
	@echo "  logs           - Show logs for all services"
	@echo "  logs-fe        - Show frontend logs"
	@echo "  logs-be        - Show backend logs"
	@echo "  logs-db        - Show database logs"
	@echo "  logs-nginx     - Show nginx logs"
	@echo "  health         - Check service health status"
	@echo "  status         - Show service status"
	@echo ""
	@echo "$(GREEN)🛠️  Development:$(NC)"
	@echo "  install-fe     - Install frontend dependencies"
	@echo "  install-be     - Install backend dependencies"
	@echo "  dev-fe         - Run frontend in development mode"
	@echo "  dev-be         - Run backend in development mode"
	@echo "  dev            - Run both frontend and backend in dev mode"
	@echo "  shell-fe       - Open shell in frontend container"
	@echo "  shell-be       - Open shell in backend container"
	@echo "  shell-db       - Open MongoDB shell"
	@echo ""
	@echo "$(GREEN)🧪 Testing & Quality:$(NC)"
	@echo "  test           - Run all tests"
	@echo "  test-fe        - Run frontend tests"
	@echo "  test-be        - Run backend tests"
	@echo "  lint           - Run linters for all code"
	@echo "  lint-fe        - Run frontend linter"
	@echo "  lint-be        - Run backend linter"
	@echo "  format         - Format all code"
	@echo "  format-fe      - Format frontend code"
	@echo "  format-be      - Format backend code"
	@echo "  check          - Run all quality checks"
	@echo ""
	@echo "$(GREEN)💾 Data Management:$(NC)"
	@echo "  backup         - Backup MongoDB data"
	@echo "  restore        - Restore MongoDB data from backup"
	@echo "  reset-db       - Reset database (WARNING: deletes all data)"
	@echo "  seed-db        - Seed database with sample data"
	@echo ""
	@echo "$(GREEN)🔧 Maintenance:$(NC)"
	@echo "  update         - Update all dependencies"
	@echo "  security       - Run security checks"
	@echo "  size           - Show Docker image sizes"
	@echo "  prune          - Clean up unused Docker resources"

# Setup and Installation
setup:
	@echo "$(BLUE)Running Photure setup...$(NC)"
	@chmod +x setup.sh
	@./setup.sh

# Docker Management
build:
	@echo "$(BLUE)Building Docker images...$(NC)"
	@docker-compose build --no-cache

up:
	@echo "$(BLUE)Starting services...$(NC)"
	@docker-compose up -d

down:
	@echo "$(BLUE)Stopping services...$(NC)"
	@docker-compose down

restart:
	@echo "$(BLUE)Restarting services...$(NC)"
	@docker-compose restart

# Logging and Monitoring
logs:
	@docker-compose logs -f

logs-fe:
	@echo "$(BLUE)Showing frontend logs...$(NC)"
	@docker-compose logs -f frontend

logs-be:
	@echo "$(BLUE)Showing backend logs...$(NC)"
	@docker-compose logs -f backend

logs-db:
	@echo "$(BLUE)Showing database logs...$(NC)"
	@docker-compose logs -f mongodb

logs-nginx:
	@echo "$(BLUE)Showing nginx logs...$(NC)"
	@docker-compose logs -f nginx

status:
	@echo "$(BLUE)Service status:$(NC)"
	@docker-compose ps

health:
	@echo "$(BLUE)Checking service health...$(NC)"
	@echo "$(YELLOW)Frontend (Port 3000):$(NC)"
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200" && echo "$(GREEN)✓ Frontend is healthy$(NC)" || echo "$(RED)✗ Frontend is not responding$(NC)"
	@echo "$(YELLOW)Backend (Port 8000):$(NC)"
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 | grep -q "200" && echo "$(GREEN)✓ Backend is healthy$(NC)" || echo "$(RED)✗ Backend is not responding$(NC)"
	@echo "$(YELLOW)MongoDB (Port 27017):$(NC)"
	@docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1 && echo "$(GREEN)✓ MongoDB is healthy$(NC)" || echo "$(RED)✗ MongoDB is not responding$(NC)"

# Development
install-fe:
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	@cd photure-fe && npm install

install-be:
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	@cd photure-be && pip install -r requirement.txt

dev-fe:
	@echo "$(BLUE)Starting frontend development server...$(NC)"
	@cd photure-fe && npm run dev

dev-be:
	@echo "$(BLUE)Starting backend development server...$(NC)"
	@cd photure-be && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev:
	@echo "$(BLUE)Starting development environment...$(NC)"
	@echo "$(YELLOW)Starting backend in background...$(NC)"
	@cd photure-be && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
	@echo "$(YELLOW)Starting frontend...$(NC)"
	@cd photure-fe && npm run dev

# Shell Access
shell-fe:
	@echo "$(BLUE)Opening frontend container shell...$(NC)"
	@docker-compose exec frontend /bin/sh

shell-be:
	@echo "$(BLUE)Opening backend container shell...$(NC)"
	@docker-compose exec backend /bin/bash

shell-db:
	@echo "$(BLUE)Opening MongoDB shell...$(NC)"
	@docker-compose exec mongodb mongosh

# Testing
test:
	@echo "$(BLUE)Running all tests...$(NC)"
	@$(MAKE) test-fe
	@$(MAKE) test-be

test-fe:
	@echo "$(BLUE)Running frontend tests...$(NC)"
	@cd photure-fe && npm test

test-be:
	@echo "$(BLUE)Running backend tests...$(NC)"
	@cd photure-be && python -m pytest -v

# Code Quality
lint:
	@echo "$(BLUE)Running all linters...$(NC)"
	@$(MAKE) lint-fe
	@$(MAKE) lint-be

lint-fe:
	@echo "$(BLUE)Linting frontend code...$(NC)"
	@cd photure-fe && npm run lint

lint-be:
	@echo "$(BLUE)Linting backend code...$(NC)"
	@cd photure-be && python -m flake8 app/ --max-line-length=100

format:
	@echo "$(BLUE)Formatting all code...$(NC)"
	@$(MAKE) format-fe
	@$(MAKE) format-be

format-fe:
	@echo "$(BLUE)Formatting frontend code...$(NC)"
	@cd photure-fe && npm run lint --fix

format-be:
	@echo "$(BLUE)Formatting backend code...$(NC)"
	@cd photure-be && python -m black app/ --line-length 100

check:
	@echo "$(BLUE)Running all quality checks...$(NC)"
	@$(MAKE) lint
	@$(MAKE) test
	@echo "$(GREEN)✓ All checks passed!$(NC)"

# Data Management
backup:
	@echo "$(BLUE)Creating database backup...$(NC)"
	@mkdir -p backups
	@docker-compose exec -T mongodb mongodump --archive --gzip | gzip > backups/photure-backup-$(shell date +%Y%m%d-%H%M%S).gz
	@echo "$(GREEN)✓ Backup created in backups/ directory$(NC)"

restore:
	@echo "$(BLUE)Restoring database from backup...$(NC)"
	@read -p "Enter backup file path: " backup_file; \
	if [ -f "$$backup_file" ]; then \
		gunzip -c "$$backup_file" | docker-compose exec -T mongodb mongorestore --archive --gzip --drop; \
		echo "$(GREEN)✓ Database restored from $$backup_file$(NC)"; \
	else \
		echo "$(RED)✗ Backup file not found: $$backup_file$(NC)"; \
	fi

reset-db:
	@echo "$(RED)WARNING: This will delete all database data!$(NC)"
	@read -p "Are you sure? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		docker-compose exec mongodb mongosh --eval "db.dropDatabase()"; \
		echo "$(GREEN)✓ Database reset complete$(NC)"; \
	else \
		echo "$(YELLOW)Database reset cancelled$(NC)"; \
	fi

seed-db:
	@echo "$(BLUE)Seeding database with sample data...$(NC)"
	@# Add seed script here when available
	@echo "$(YELLOW)Seed script not implemented yet$(NC)"

# Maintenance
update:
	@echo "$(BLUE)Updating dependencies...$(NC)"
	@cd photure-fe && npm update
	@cd photure-be && pip install --upgrade -r requirement.txt
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

security:
	@echo "$(BLUE)Running security checks...$(NC)"
	@cd photure-fe && npm audit
	@cd photure-be && pip audit

size:
	@echo "$(BLUE)Docker image sizes:$(NC)"
	@docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep photure

prune:
	@echo "$(BLUE)Cleaning up unused Docker resources...$(NC)"
	@docker system prune -f
	@docker volume prune -f
	@echo "$(GREEN)✓ Docker cleanup complete$(NC)"

# Cleanup
clean:
	@echo "$(BLUE)Stopping and removing all containers...$(NC)"
	@docker-compose down -v --remove-orphans
	@echo "$(BLUE)Removing Docker images...$(NC)"
	@docker system prune -f --volumes
	@echo "$(GREEN)✓ Cleanup complete$(NC)" 