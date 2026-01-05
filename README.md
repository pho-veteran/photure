# Photure 📸

> A modern, cloud-ready photo management platform designed for secure, scalable photo storage and organization.

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.11-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Photure is a full-featured photo management solution that combines modern web technologies with enterprise-grade security. Built with a microservices architecture, it provides a responsive interface for uploading, viewing, and organizing photos while ensuring complete user data isolation through Clerk authentication and JWT-based authorization.

## ✨ Key Features

- 🔐 **Enterprise Authentication** - Powered by Clerk with JWT token validation and multi-factor authentication
- 📤 **Advanced Photo Upload** - Drag-and-drop interface with batch upload, progress tracking, and file type validation
- 🖼️ **Responsive Photo Gallery** - Grid and list views with lazy loading and optimized image serving
- 🗂️ **Smart Organization** - User-isolated photo management with metadata tracking and search capabilities
- 🌙 **Adaptive UI** - Dark/light theme support with system preference detection
- 📱 **Mobile-First Design** - Progressive Web App features for seamless mobile experience
- 🔒 **Data Security** - Complete user isolation with encrypted storage and secure file serving
- 🏗️ **Microservices Architecture** - Scalable service-oriented design for high availability
- 🐳 **Production-Ready Deployment** - Complete Docker containerization with load balancer support
- ⚡ **High Performance** - Async/await patterns, image optimization, and CDN-ready architecture
- 📊 **Monitoring & Observability** - Structured logging, health checks, and metrics collection
- 🔄 **CI/CD Ready** - Automated testing, building, and deployment pipelines

## 🏗️ Architecture

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Frontend** | React | 19.1.0 | UI Framework |
| | TypeScript | 5.8.3 | Type Safety |
| | Vite | 7.0.0 | Build Tool |
| | TailwindCSS | 4.1.11 | Styling |
| | Radix UI | Latest | Component Library |
| | Clerk React | 5.32.2 | Authentication |
| **Backend** | FastAPI | 0.110.0 | API Framework |
| | Python | 3.11 | Runtime |
| | Motor | 3.6.0 | Async MongoDB Driver |
| | Pydantic | 2.11.2 | Data Validation |
| | Clerk Backend API | 3.0.3 | Token Verification |
| **Database** | MongoDB | 7.0 | Document Database |
| **Infrastructure** | Docker | Latest | Containerization |
| | Docker Compose | Latest | Orchestration |
| | Nginx | Alpine | Reverse Proxy |

### System Architecture

```mermaid
graph TB
    User["👤 User"] --> Nginx["🔄 Nginx<br/>Ports 80/443<br/>Static Files + API Proxy"]
    Nginx --> ClerkAuth["🔐 Clerk Auth<br/>JWT Validation"]
    Nginx --> Frontend["⚛️ React Frontend<br/>SPA Build"]
    Nginx --> Backend["🚀 FastAPI Backend<br/>Port 8000"]
    
    Backend --> ClerkAPI["🔑 Clerk Backend API<br/>Token Verification"]
    Backend --> MongoDB["🗄️ MongoDB<br/>Port 27017<br/>Photo Metadata"]
    Backend --> FileStorage["💾 File Storage<br/>Upload Directory"]
    
    subgraph "Docker Network"
        Nginx
        Frontend
        Backend
        MongoDB
    end
    
    classDef user fill:#ff6b6b,stroke:#e55555,color:#fff
    classDef proxy fill:#ffb347,stroke:#ff9500,color:#fff
    classDef frontend fill:#4ecdc4,stroke:#26a69a,color:#fff
    classDef auth fill:#ffe66d,stroke:#ffd93d,color:#000
    classDef backend fill:#95e1d3,stroke:#81c7c1,color:#000
    classDef database fill:#a8e6cf,stroke:#88d8a3,color:#000
    classDef storage fill:#dda0dd,stroke:#da70d6,color:#fff
    
    class User user
    class Nginx proxy
    class Frontend frontend
    class ClerkAuth,ClerkAPI auth
    class Backend backend
    class MongoDB database
    class FileStorage storage
```

### Services Overview (Microservices Target)

| Service | Port | Description | Data Ownership | Dependencies |
|---------|------|-------------|----------------|--------------|
| **api-gateway** | 8000 | Public entrypoint that validates JWTs via `auth-service`, fan-outs to downstream services, and exposes `/api/*` routes. | None (stateless) | auth, gallery, media |
| **auth-service** | 8010 | Clerk-facing adapter responsible for token verification, session introspection, and issuing service-to-service auth grants. | Session cache only | Clerk API |
| **gallery-service** | 8020 | Handles photo metadata CRUD (list, delete, tagging) and enforces per-user authorization. Talks to MongoDB for persistent photo docs. | MongoDB `photos` collection | auth, MongoDB, media (for file URLs) |
| **media-service** | 8030 | Manages binary objects (upload, serve, delete) with local file storage. Handles file uploads to server volume and provides secure file serving. | Local file storage | auth |
| **frontend** | 5173 (dev) | React SPA that consumes gateway APIs and Clerk widgets. | None | api-gateway |
| **nginx** | 80, 443 | Reverse proxy + static hosting for frontend build, forwards `/api` to `api-gateway`. | None | frontend, api-gateway |
| **mongodb** | 27017 | Document database scoped to gallery metadata; each service gets its own database/collection if expanded later. | `photos` collection | - |

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (24.0.0 or higher) with at least 4GB RAM allocated
- **Docker Compose** (v2.20.0 or higher, included with Docker Desktop)
- **Git** for cloning the repository
- **Clerk Account** ([Sign up for free](https://dashboard.clerk.dev/sign-up))
- **Web Browser** (Chrome 100+, Firefox 100+, Safari 15+, Edge 100+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pho-veteran/photure.git
   cd photure
   ```

2. **Configure Environment Variables:**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Open .env in your preferred editor
   nano .env  # or code .env for VS Code
   ```

3. **Set Up Clerk Authentication:**
   
   a. **Create Clerk Application:**
   - Visit [Clerk Dashboard](https://dashboard.clerk.dev/)
   - Click "Create Application"
   - Choose your preferred sign-in methods (Email, Google, etc.)
   - Note down your Application ID
   
   b. **Get API Keys:**
   - Navigate to **API Keys** in the sidebar
   - Copy the **Publishable Key** (starts with `pk_`)
   - Copy the **Secret Key** (starts with `sk_`)
   
   c. **Update Environment File:**
   ```env
   # Clerk Authentication Keys
   CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
   
   # Optional: Configure sign-in redirect URLs
   CLERK_SIGN_IN_URL=/sign-in
   CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
   CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
   ```

4. **Build and Launch Services:**
   ```bash
   # Build all Docker images (first time setup)
   docker-compose -f docker-compose.dev.yml build --no-cache
   
   # Start all services in the background
   docker-compose -f docker-compose.dev.yml up -d
   
   # Monitor startup logs (optional)
   docker-compose -f docker-compose.dev.yml logs -f
   ```

5. **Verify Installation:**
   ```bash
   # Check all services are running
   docker-compose -f docker-compose.dev.yml ps
   
   # Test health endpoints
   curl http://localhost:8000/health
   ```

6. **Access Your Application:**
   
   | Service | URL | Purpose |
   |---------|-----|---------|
   | **Web Application** | [http://localhost:3000](http://localhost:3000) | Main photo gallery interface |
   | **API Documentation** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive API docs (Swagger UI) |
   | **API Base URL** | [http://localhost:8000](http://localhost:8000) | Backend API endpoint |
   | **Alternative API Docs** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | ReDoc API documentation |

### First-Time Setup

After installation, follow these steps:

1. **Create Your Account:**
   - Open [http://localhost:3000](http://localhost:3000)
   - Click "Sign Up" and create your account
   - Verify your email if required

2. **Test Photo Upload:**
   - Sign in to your account
   - Use the upload area to add your first photo
   - Verify the photo appears in your gallery

3. **Explore Features:**
   - Try the dark/light theme toggle
   - Test the responsive design on different screen sizes
   - Upload multiple photos to test the gallery

## 🚀 Production Deployment

Photure includes a complete CI/CD pipeline for automated deployment to DigitalOcean droplets using GitLab CI/CD.

### Quick Production Setup

1. **Setup DigitalOcean Droplet:**
   ```bash
   # Run the automated setup script on Ubuntu 22.04 droplet
   curl -sSL https://raw.githubusercontent.com/pho-veteran/photure/main/scripts/setup-droplet.sh | bash
   ```

2. **Configure GitLab CI/CD Variables:**
   - `PRODUCTION_HOST` - Your server IP
   - `DEPLOY_USER` - `deploy`
   - `SSH_PRIVATE_KEY` - SSH private key for deployment
   - `CI_REGISTRY_PASSWORD` - GitLab access token
   - Production environment variables

3. **Deploy:**
   ```bash
   git push origin main  # Triggers automated build and deployment
   ```

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

### File Structure

- `docker-compose.dev.yml` - Development environment
- `docker-compose.prod.yml` - Production environment  
- `.gitlab-ci.yml` - CI/CD pipeline configuration
- `scripts/` - Deployment and monitoring scripts

## 🛠️ Development

### Local Development Setup

For active development and debugging:

1. **Install Development Dependencies:**
   ```bash
   # Frontend dependencies
   cd photure-fe
   npm install
   
   # Backend dependencies
   cd ../services
   pip install -r api_gateway/requirements.txt
   pip install -r auth_service/requirements.txt
   pip install -r gallery_service/requirements.txt
   pip install -r media_service/requirements.txt
   
   # Development tools (optional)
   pip install pytest black isort mypy
   ```

2. **Start Services Individually:**
   ```bash
   # Terminal 1: Start MongoDB
   docker run -d -p 27017:27017 \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
     --name photure-mongo mongo:7.0
   
   # Terminal 2: Start API Gateway
   cd services/api_gateway
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   # Terminal 3: Start Auth Service
   cd services/auth_service
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8010
   
   # Terminal 4: Start Gallery Service
   cd services/gallery_service
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8020
   
   # Terminal 5: Start Media Service
   cd services/media_service
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8030
   
   # Terminal 6: Start Frontend
   cd photure-fe
   npm run dev
   ```

3. **Development URLs:**
   - **Frontend Dev Server:** [http://localhost:5173](http://localhost:5173)
   - **API Gateway:** [http://localhost:8000](http://localhost:8000)
   - **Individual Services:** Ports 8010, 8020, 8030

### Development Tools

```bash
# Code formatting
cd photure-fe && npm run lint:fix
cd services && black . && isort .

# Type checking
cd photure-fe && npm run type-check
cd services && mypy .

# Testing
cd photure-fe && npm run test
cd services && pytest

# Build frontend
cd photure-fe && npm run build

# Preview production build
cd photure-fe && npm run preview
```

### Environment Configuration

Copy `env.example` to `.env` and configure:

```env
# Clerk Authentication (Required)
CLERK_SECRET_KEY=sk_test_your_secret_key_here
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=admin123
MONGO_DATABASE=photure
MONGODB_URL=mongodb://admin:admin123@mongodb:27017/photure?authSource=admin

# Backend Configuration
DATABASE_NAME=photure
UPLOAD_DIR=/app/uploads

# Frontend Configuration
VITE_API_URL=http://localhost:8000
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### Common Docker Commands

```bash
# 🚀 Initial setup and management
docker-compose -f docker-compose.dev.yml build --no-cache      # Clean build all services
docker-compose -f docker-compose.dev.yml up -d                 # Start services in background
docker-compose -f docker-compose.dev.yml up                    # Start with console output
docker-compose -f docker-compose.dev.yml down                  # Stop and remove containers
docker-compose -f docker-compose.dev.yml down -v               # Stop and remove data volumes

# 📊 Monitoring and logs
docker-compose -f docker-compose.dev.yml ps                    # Check service status
docker-compose -f docker-compose.dev.yml logs -f               # Follow logs for all services
docker-compose -f docker-compose.dev.yml logs -f frontend      # Frontend logs only
docker-compose -f docker-compose.dev.yml logs -f api-gateway   # API Gateway logs only
docker-compose -f docker-compose.dev.yml logs -f mongodb       # Database logs only

# 🔄 Service management
docker-compose -f docker-compose.dev.yml restart               # Restart all services
docker-compose -f docker-compose.dev.yml restart frontend      # Restart specific service
docker-compose -f docker-compose.dev.yml pull                  # Pull latest image updates
docker-compose -f docker-compose.dev.yml up -d --force-recreate # Force recreate containers

# 🧹 Maintenance and cleanup
docker-compose -f docker-compose.dev.yml down -v --remove-orphans  # Complete cleanup
docker system prune -a               # Clean up Docker system
docker volume prune                  # Remove unused volumes
docker image prune -a                # Remove unused images

# 🔍 Debugging
docker-compose -f docker-compose.dev.yml exec api-gateway bash    # Shell into API Gateway
docker-compose -f docker-compose.dev.yml exec mongodb mongosh       # Access MongoDB shell
docker-compose -f docker-compose.dev.yml exec frontend sh         # Shell into frontend container
```

### Health Checks & Observability

Monitor service health and performance:

```bash
# Service health endpoints
curl -s http://localhost:8000/health | jq .     # API Gateway
curl -s http://localhost:8010/health | jq .     # Auth Service
curl -s http://localhost:8020/health | jq .     # Gallery Service  
curl -s http://localhost:8030/health | jq .     # Media Service

# Docker container health
docker-compose -f docker-compose.dev.yml exec api-gateway curl -s http://localhost:8000/health
docker-compose -f docker-compose.dev.yml exec auth-service curl -s http://localhost:8010/health
docker-compose -f docker-compose.dev.yml exec gallery-service curl -s http://localhost:8020/health
docker-compose -f docker-compose.dev.yml exec media-service curl -s http://localhost:8030/health

# Database connectivity
docker-compose -f docker-compose.dev.yml exec mongodb mongosh --eval "db.adminCommand('ping')"

# Resource monitoring
docker stats                               # Real-time resource usage
docker-compose -f docker-compose.dev.yml exec api-gateway ps aux     # Process list in container
```

**Structured Logging:**
- All services emit JSON logs with `timestamp | level | service | message` format
- Log levels controlled via `LOG_LEVEL` environment variable (DEBUG, INFO, WARNING, ERROR)
- Centralized logging can be configured with tools like ELK stack or Grafana Loki

**Monitoring Integration:**
- Health endpoints return detailed status information
- Metrics can be collected via Prometheus (add `/metrics` endpoints)
- Ready for integration with monitoring platforms like Grafana, DataDog, or New Relic

### Testing & Quality Assurance

Comprehensive testing setup for reliable deployments:

```bash
# Install test dependencies
cd services && pip install -r requirements-test.txt
cd photure-fe && npm install

# Backend testing
cd services
pytest                              # Run all tests
pytest --cov=.                      # With coverage report
pytest -v tests/test_auth_service.py # Specific service tests
pytest -x                           # Stop on first failure

# Frontend testing
cd photure-fe
npm run test                        # Run Jest/Vitest tests
npm run test:coverage               # With coverage report
npm run test:watch                  # Watch mode for development
npm run e2e                         # End-to-end tests (if configured)

# Code quality checks
cd services
black --check .                     # Code formatting check
isort --check-only .                # Import sorting check
mypy .                              # Type checking
flake8 .                           # Linting

cd photure-fe
npm run lint                        # ESLint check
npm run type-check                  # TypeScript check
npm run format:check                # Prettier check

# Fix formatting issues
cd services && black . && isort .
cd photure-fe && npm run lint:fix && npm run format
```

**Test Structure:**
- **Unit Tests:** Individual service and component testing
- **Integration Tests:** API endpoint and database interaction testing
- **Contract Tests:** Service-to-service communication validation
- **E2E Tests:** Full user workflow testing with Playwright/Cypress

## 📚 API Documentation

### Authentication

All API endpoints (except health check and file serving) require JWT authentication via Clerk:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | Health check | ❌ |
| `POST` | `/api/upload` | Upload a photo | ✅ |
| `GET` | `/api/photos` | List user's photos | ✅ |
| `GET` | `/api/serve/{photo_id}` | Serve photo file | ❌ |
| `DELETE` | `/api/photos/{photo_id}` | Delete a photo | ✅ |

### API Usage Examples

#### Upload a Photo

```javascript
const uploadPhoto = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

#### List Photos

```javascript
const getPhotos = async (token, skip = 0, limit = 20) => {
  const response = await fetch(`/api/photos?skip=${skip}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

#### Delete a Photo

```javascript
const deletePhoto = async (photoId, token) => {
  const response = await fetch(`/api/photos/${photoId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

## 🔧 Configuration

### Docker Configuration

- **Frontend Dockerfile:** Multi-stage build with Node.js 18 Alpine
- **Backend Dockerfile:** Python 3.11 slim with optimized dependencies
- **Docker Compose:** Orchestrates all services with proper networking
- **Nginx Configuration:** Optimized for SPA routing and API proxying

### Build Configuration

- **Frontend:** Vite with TypeScript, ES modules, and optimized builds
- **Backend:** FastAPI with async/await, automatic OpenAPI documentation
- **Database:** MongoDB with authentication and data persistence

## 🚀 Deployment

### Production Deployment

#### Environment Configuration

1. **Production Environment Variables:**
   ```env
   # Clerk Production Keys
   CLERK_SECRET_KEY=sk_live_your_production_secret_key
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_publishable_key
   
   # Database Security
   MONGO_ROOT_USERNAME=photure_admin
   MONGO_ROOT_PASSWORD=super_secure_password_here
   MONGODB_URL=mongodb://photure_admin:super_secure_password_here@mongodb:27017/photure_prod?authSource=admin
   DATABASE_NAME=photure_prod
   
   # Production URLs
   VITE_API_URL=https://api.yourdomain.com
   
   # SSL and Security
   NODE_ENV=production
   LOG_LEVEL=WARNING
   
   # Performance
   UPLOAD_MAX_SIZE=50MB
   RATE_LIMIT_REQUESTS=1000
   RATE_LIMIT_WINDOW=3600
   ```

2. **SSL Certificate Setup:**
   ```bash
   # Create SSL certificate directory
   mkdir -p nginx/ssl
   
   # Option 1: Use Let's Encrypt (recommended)
   certbot certonly --webroot -w ./nginx/html -d yourdomain.com
   cp /etc/letsencrypt/live/yourdomain.com/*.pem nginx/ssl/
   
   # Option 2: Use your own certificates
   cp your-certificate.crt nginx/ssl/
   cp your-private-key.key nginx/ssl/
   ```

3. **Production Nginx Configuration:**
   Update [nginx/nginx.conf](nginx/nginx.conf) for HTTPS:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /etc/nginx/ssl/certificate.crt;
       ssl_certificate_key /etc/nginx/ssl/private.key;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       
       # Security headers
       add_header X-Frame-Options DENY;
       add_header X-Content-Type-Options nosniff;
       add_header X-XSS-Protection "1; mode=block";
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
   }
   ```

4. **Deploy to Production:**
   ```bash
   # Build and deploy
   docker-compose -f docker-compose.dev.yml -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   
   # Verify deployment
   curl -k https://yourdomain.com/health
   ```

#### Cloud Deployment Options

**Docker Swarm:**
```bash
docker swarm init
docker stack deploy -c docker-compose.prod.yml photure
```

**Kubernetes:**
```bash
# Generate Kubernetes manifests
docker-compose -f docker-compose.prod.yml config > photure-k8s.yaml
kubectl apply -f photure-k8s.yaml
```

**AWS ECS/Fargate:**
- Use the `ecs-cli` to convert docker-compose.prod.yml
- Configure Application Load Balancer for traffic distribution
- Use RDS for MongoDB or DocumentDB as managed alternative

**Digital Ocean Apps/Heroku:**
- Each service can be deployed as separate applications
- Use managed MongoDB service (MongoDB Atlas)
- Configure environment variables in platform settings

## 🐛 Troubleshooting & Support

### Common Issues & Solutions

#### 🚀 **Services Not Starting**
```bash
# Check service status and logs
docker-compose -f docker-compose.dev.yml ps
docker-compose -f docker-compose.dev.yml logs -f

# Clean rebuild if services fail to start
docker-compose -f docker-compose.dev.yml down -v --remove-orphans
docker system prune -a --volumes
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d

# Check for port conflicts
netstat -tulpn | grep -E ':(3000|8000|8010|8020|8030|27017)'
# On Windows: netstat -an | findstr ":3000 :8000 :8010 :8020 :8030 :27017"
```

#### 🔐 **Authentication Issues**
```bash
# Verify Clerk configuration
grep CLERK .env
curl -s http://localhost:8010/health | jq .clerk_status

# Test JWT token validation
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/photos

# Common fixes:
# 1. Ensure Clerk keys are from the same application
# 2. Check key format (pk_test_* for publishable, sk_test_* for secret)
# 3. Verify Clerk application is active
# 4. Check network connectivity to clerk.dev
```

#### 🗄️ **Database Connection Issues**
```bash
# Check MongoDB container
docker-compose -f docker-compose.dev.yml logs -f mongodb
docker-compose -f docker-compose.dev.yml exec mongodb mongosh --eval "db.adminCommand('ping')"

# Test database connectivity from services
docker-compose -f docker-compose.dev.yml exec api-gateway ping mongodb
docker-compose -f docker-compose.dev.yml exec api-gateway nslookup mongodb

# Verify database credentials
grep MONGO .env

# Reset database if corrupted
docker-compose -f docker-compose.dev.yml down -v
docker volume rm photure_mongodb_data
docker-compose -f docker-compose.dev.yml up -d mongodb
```

#### 📡 **Network & Port Issues**
```bash
# Check Docker network
docker network ls
docker network inspect photure_default

# Test service-to-service communication
docker-compose exec api-gateway curl -s http://auth-service:8010/health
docker-compose exec api-gateway curl -s http://gallery-service:8020/health
docker-compose exec api-gateway curl -s http://media-service:8030/health

# Alternative ports if conflicts exist
# Edit docker-compose.dev.yml ports section:
ports:
  - "3001:3000"  # Frontend on 3001
  - "8001:8000"  # API Gateway on 8001
```

#### 📤 **Upload & File Issues**
```bash
# Check upload directory permissions
docker-compose exec media-service ls -la /app/uploads
docker-compose exec media-service df -h

# Test file upload endpoint
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg" \
  http://localhost:8030/upload

# Check Nginx upload limits
docker-compose exec nginx grep client_max_body_size /etc/nginx/nginx.conf

# Increase upload limits in nginx.conf:
client_max_body_size 100M;
```

#### ⚡ **Performance Issues**

**Slow Upload/Download:**
```bash
# Check Docker resource allocation
docker stats

# Monitor disk I/O
docker-compose exec media-service iostat -x 1 5

# Increase Docker resources:
# Docker Desktop > Settings > Resources
# Memory: 8GB+, CPUs: 4+, Disk: 50GB+
```

**High Memory Usage:**
```bash
# Check individual service memory
docker-compose exec api-gateway free -h
docker-compose exec mongodb mongotop

# Optimize MongoDB for development
# Add to docker-compose.dev.yml mongodb service:
command: mongod --wiredTigerCacheSizeGB 1
```

#### 🔧 **Development Issues**

**Hot Reload Not Working:**
```bash
# Ensure file watching is working
cd photure-fe
npm run dev -- --host 0.0.0.0

# Check file permissions in containers
docker-compose exec api-gateway ls -la /app

# Windows users: Enable file sharing
# Docker Desktop > Settings > Resources > File Sharing
```

**Type Errors:**
```bash
# Update TypeScript definitions
cd photure-fe
npm run type-check
npm install @types/node@latest

# Regenerate API client types if using OpenAPI
npm run generate-api-types
```

### Getting Help

1. **Check Logs First:**
   ```bash
   docker-compose logs -f --tail=50
   ```

2. **Health Check All Services:**
   ```bash
   curl -s http://localhost:8000/health | jq
   curl -s http://localhost:8010/health | jq
   curl -s http://localhost:8020/health | jq
   curl -s http://localhost:8030/health | jq
   ```

3. **Gather System Information:**
   ```bash
   docker --version
   docker-compose --version
   uname -a  # Linux/macOS
   systeminfo | findstr /B /C:"OS Name" /C:"OS Version"  # Windows
   ```

4. **Create Support Request:**
   Include the following in issue reports:
   - Operating system and version
   - Docker & Docker Compose versions
   - Complete error logs (`docker-compose logs`)
   - Steps to reproduce the issue
   - Environment configuration (with sensitive data redacted)

5. **Community Resources:**
   - [GitHub Issues](https://github.com/pho-veteran/photure/issues)
   - [Documentation Wiki](https://github.com/pho-veteran/photure/wiki)
   - [Discord Community](https://discord.gg/photure) *(if available)*

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or sharing ideas, your help makes Photure better for everyone.

### How to Contribute

1. **Fork the Repository**
   ```bash
   gh repo fork pho-veteran/photure --clone
   cd photure
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   # or
   git checkout -b fix/important-bug-fix
   ```

3. **Development Setup**
   ```bash
   # Copy environment template
   cp env.example .env
   
   # Start development environment
   docker-compose up -d
   
   # Run tests to ensure everything works
   npm run test  # Frontend tests
   pytest        # Backend tests
   ```

4. **Make Your Changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed
   - Follow the existing code style

5. **Test Your Changes**
   ```bash
   # Frontend
   cd photure-fe
   npm run lint
   npm run type-check
   npm run test
   
   # Backend
   cd services
   black --check .
   mypy .
   pytest
   ```

6. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   git push origin feature/amazing-new-feature
   ```

7. **Create Pull Request**
   - Use our PR template
   - Provide clear description of changes
   - Link related issues
   - Ensure CI passes

### Development Guidelines

- **Code Style:** Follow Prettier (frontend) and Black (backend) formatting
- **Commit Messages:** Use conventional commits (feat, fix, docs, etc.)
- **Testing:** Maintain >80% code coverage
- **Documentation:** Update README and inline docs for API changes

### Areas for Contribution

- 🐛 Bug fixes and performance improvements
- ✨ New features (photo editing, albums, sharing)
- 📚 Documentation and tutorials
- 🧪 Test coverage improvements
- 🌐 Internationalization (i18n)
- ♿ Accessibility enhancements
- 🚀 Performance optimizations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments & Credits

Special thanks to the open-source community and the following projects that make Photure possible:

### Authentication & Security
- **[Clerk](https://clerk.dev/)** - Modern authentication and user management platform
- **[JWT](https://jwt.io/)** - Secure token-based authentication standard

### Frontend Technologies  
- **[React](https://reactjs.org/)** - Component-based UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool and dev server
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, customizable component library
- **[Lucide React](https://lucide.dev/)** - Modern icon library

### Backend Technologies
- **[FastAPI](https://fastapi.tiangolo.com/)** - High-performance Python API framework
- **[Pydantic](https://pydantic-docs.helpmanual.io/)** - Data validation and serialization
- **[Motor](https://motor.readthedocs.io/)** - Async MongoDB driver for Python
- **[Uvicorn](https://www.uvicorn.org/)** - Lightning-fast ASGI server

### Database & Infrastructure
- **[MongoDB](https://www.mongodb.com/)** - Flexible document database
- **[Docker](https://www.docker.com/)** - Containerization platform
- **[Nginx](https://nginx.org/)** - High-performance web server and reverse proxy

### Development Tools
- **[ESLint](https://eslint.org/)** & **[Prettier](https://prettier.io/)** - Code linting and formatting
- **[Black](https://black.readthedocs.io/)** & **[isort](https://pycqa.github.io/isort/)** - Python code formatting
- **[MyPy](https://mypy.readthedocs.io/)** - Static type checking for Python
- **[Jest](https://jestjs.io/)** & **[Pytest](https://pytest.org/)** - Testing frameworks

### Contributors

This project exists thanks to all the people who contribute:

- **[pho-veteran](https://github.com/pho-veteran)** - Project creator and maintainer
- All [contributors](https://github.com/pho-veteran/photure/contributors) who have helped improve this project

---

<div align="center">

**⭐ If Photure helps you manage your photos better, consider giving it a star!**

**🐛 Found a bug? [Open an issue](https://github.com/pho-veteran/photure/issues/new)**

**💡 Have a feature idea? [Start a discussion](https://github.com/pho-veteran/photure/discussions)**

**📧 Questions? Reach out via [GitHub Discussions](https://github.com/pho-veteran/photure/discussions)**

---

*Built with ❤️ by the Photure team*

</div>
