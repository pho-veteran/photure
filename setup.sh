#!/bin/bash

# Photure Setup Script
# ===================
# This script sets up the Photure photo management application
# including all dependencies, configurations, and initial setup.

set -e  # Exit on any error

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Header
print_header "🎨 Photure - Photo Management Application Setup"
print_header "=============================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check minimum Docker version
check_docker_version() {
    local required_version="20.10.0"
    local current_version=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    
    if [ "$(printf '%s\n' "$required_version" "$current_version" | sort -V | head -n1)" = "$required_version" ]; then
        return 0
    else
        return 1
    fi
}

# Function to check if port is available
check_port() {
    local port=$1
    if command_exists netstat; then
        if netstat -tuln | grep -q ":$port "; then
            return 1
        fi
    elif command_exists ss; then
        if ss -tuln | grep -q ":$port "; then
            return 1
        fi
    fi
    return 0
}

# System requirements check
print_status "Checking system requirements..."

# Check Docker
if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker Desktop from:"
    print_error "https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check Docker version
if ! check_docker_version; then
    print_warning "Docker version might be outdated. Recommended version: 20.10.0 or higher"
fi

print_success "Docker is installed"

# Check Docker Compose
if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
    print_error "Docker Compose is not available. Please ensure Docker Compose is installed."
    exit 1
fi

print_success "Docker Compose is available"

# Check if Docker daemon is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

print_success "Docker daemon is running"

# Check required ports
print_status "Checking port availability..."
ports=(3000 8000 27017 80 443)
for port in "${ports[@]}"; do
    if ! check_port $port; then
        print_warning "Port $port is already in use. This may cause conflicts."
    fi
done

# Node.js check (optional, for local development)
if command_exists node; then
    NODE_VERSION=$(node --version | grep -oE '[0-9]+' | head -1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_warning "Node.js version should be 18 or higher for local development"
    else
        print_success "Node.js $(node --version) detected"
    fi
fi

# Python check (optional, for local development)
if command_exists python3; then
    print_success "Python $(python3 --version) detected"
fi

echo ""

# Environment Configuration
print_header "🔧 Environment Configuration"
print_header "============================"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp env.example .env
    print_success ".env file created"
    
    echo ""
    print_warning "⚠️  IMPORTANT: You need to configure Clerk authentication!"
    echo ""
    echo "1. Go to https://dashboard.clerk.dev/"
    echo "2. Create a new application or use an existing one"
    echo "3. Copy your keys from the API Keys section"
    echo "4. Update the following in your .env file:"
    echo ""
    echo "   CLERK_SECRET_KEY=your_clerk_secret_key_here"
    echo "   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here"
    echo ""
    
    read -p "Press Enter after updating the .env file with your Clerk credentials..."
else
    print_success ".env file already exists"
fi

# Validate .env file
if grep -q "your_clerk_secret_key_here" .env || grep -q "your_clerk_publishable_key_here" .env; then
    print_error "Please update the Clerk credentials in .env file before continuing"
    print_error "Replace 'your_clerk_secret_key_here' and 'your_clerk_publishable_key_here' with actual values"
    exit 1
fi

print_success "Environment configuration validated"

# Create necessary directories
print_status "Creating required directories..."
mkdir -p nginx/ssl
mkdir -p mongodb-init
mkdir -p photure-be/uploads
print_success "Directories created"

echo ""

# Docker Setup
print_header "🐳 Docker Setup"
print_header "==============="

# Clean up any existing containers
print_status "Cleaning up existing containers..."
docker-compose down -v --remove-orphans 2>/dev/null || true

# Build images
print_status "Building Docker images... (this may take a few minutes)"
if docker-compose build --no-cache; then
    print_success "Docker images built successfully"
else
    print_error "Failed to build Docker images"
    exit 1
fi

# Start services
print_status "Starting services..."
if docker-compose up -d; then
    print_success "Services started"
else
    print_error "Failed to start services"
    exit 1
fi

# Wait for services to be ready
print_status "Waiting for services to initialize..."
sleep 15

# Health checks
print_status "Performing health checks..."

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
    print_success "MongoDB is ready"
else
    print_warning "MongoDB health check failed, but it might still be starting"
fi

# Check Backend
backend_health=false
for i in {1..30}; do
    if curl -s http://localhost:8000/ >/dev/null 2>&1; then
        backend_health=true
        break
    fi
    sleep 1
done

if [ "$backend_health" = true ]; then
    print_success "Backend API is ready"
else
    print_warning "Backend API health check failed"
fi

# Check Frontend
frontend_health=false
for i in {1..30}; do
    if curl -s http://localhost:3000/ >/dev/null 2>&1; then
        frontend_health=true
        break
    fi
    sleep 1
done

if [ "$frontend_health" = true ]; then
    print_success "Frontend is ready"
else
    print_warning "Frontend health check failed"
fi

echo ""

# Show service status
print_header "📊 Service Status"
print_header "=================="
docker-compose ps

echo ""

# Setup complete
print_header "🎉 Setup Complete!"
print_header "=================="
echo ""
print_success "Photure has been successfully set up and is running!"
echo ""
echo "📱 Access your application:"
echo "   🌐 Frontend:        http://localhost:3000"
echo "   🚀 Backend API:     http://localhost:8000"
echo "   📚 API Docs:        http://localhost:8000/docs"
echo "   🗄️  MongoDB:        localhost:27017 (admin/admin123)"
echo ""
echo "🛠️  Useful commands:"
echo "   View logs:          make logs"
echo "   Stop services:      make down"
echo "   Restart services:   make restart"
echo "   Rebuild:            make build && make up"
echo "   Development:        make dev-fe  or  make dev-be"
echo ""
echo "🐛 Troubleshooting:"
echo "   • Check service logs: docker-compose logs [service-name]"
echo "   • Ensure Clerk credentials are correct in .env"
echo "   • Verify ports 3000, 8000, and 27017 are available"
echo "   • For development mode, ensure Node.js 18+ and Python 3.11+ are installed"
echo ""
print_success "Happy photo managing! 📸" 