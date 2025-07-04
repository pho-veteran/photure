# Photure 📸

> A modern, full-stack photo management application built with React, FastAPI, and MongoDB.

[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)

Photure provides a clean and intuitive interface for uploading, viewing, and managing your photos with secure user authentication powered by Clerk. Built with modern technologies and containerized for easy deployment.

## ✨ Features

- 🔐 **Secure Authentication** - Powered by Clerk for robust user management and JWT token validation
- 📤 **Photo Upload** - Drag-and-drop interface with file validation and progress tracking
- 🖼️ **Photo Gallery** - Responsive gallery with optimized image serving
- 🗑️ **Photo Management** - Delete and organize your photos with user isolation
- 🌙 **Dark/Light Theme** - Toggle between themes for comfortable viewing
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🔒 **User Isolation** - Each user only sees and can manage their own photos
- 🐳 **Docker Support** - Complete containerization with Docker Compose
- 🚀 **Production Ready** - Nginx reverse proxy with SSL support
- ⚡ **Fast Performance** - Async backend and optimized frontend builds

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

### Services Overview

| Service | Port | Description | Dependencies |
|---------|------|-------------|--------------|
| **nginx** | 80, 443, 3000 | Reverse proxy and static file server | frontend, backend |
| **frontend** | - | React build container (files copied to nginx) | - |
| **backend** | 8000 | FastAPI REST API server | mongodb |
| **mongodb** | 27017 | Database server with authentication | - |

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (20.10.0 or higher)
- **Docker Compose** (included with Docker Desktop)
- **Clerk Account** ([Create one here](https://dashboard.clerk.dev/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd photure
   ```

2. **Configure Environment:**
   ```bash
   # Copy the example environment file
   cp env.example .env
   ```

3. **Configure Clerk Authentication:**
   
   - Go to [Clerk Dashboard](https://dashboard.clerk.dev/)
   - Create a new application or select existing one
   - Copy your API keys from the **API Keys** section
   - Update the `.env` file with your credentials:
   
   ```env
   CLERK_SECRET_KEY=sk_test_your_secret_key_here
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

4. **Build and Start the Application:**
   ```bash
   # Build Docker images
   docker-compose build

   # Start all services
   docker-compose up -d
   ```

5. **Access the application:**
   
   Once setup is complete, access your application at:
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Backend API:** [http://localhost:8000](http://localhost:8000)

## 🛠️ Development

### Local Development Setup

For local development without Docker:

1. **Install dependencies:**
   ```bash
   # Frontend dependencies
   cd photure-fe && npm install
   
   # Backend dependencies  
   cd ../photure-be && pip install -r requirement.txt
   ```

2. **Start development servers:**
   ```bash
   # Start backend (from photure-be directory)
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   # Start frontend (from photure-fe directory, in another terminal)
   npm run dev
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
VITE_API_URL=http://localhost:8000/api/
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### Common Docker Commands

```bash
# Build and start services
docker-compose build
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f                    # All services
docker-compose logs -f frontend          # Frontend only
docker-compose logs -f backend           # Backend only
docker-compose logs -f mongodb           # Database only

# Service status
docker-compose ps

# Restart services
docker-compose restart

# Clean up (removes containers and volumes)
docker-compose down -v --remove-orphans
```

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

1. **Configure environment variables for production:**
   ```env
   # Use production Clerk keys
   CLERK_SECRET_KEY=sk_live_your_production_key
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
   
   # Secure MongoDB credentials
   MONGO_ROOT_PASSWORD=strong_production_password
   
   # Production API URL
   VITE_API_URL=https://your-domain.com/api/
   ```

2. **SSL Configuration:**
   - Place SSL certificates in `nginx/ssl/`
   - Update `nginx/nginx.conf` for HTTPS

3. **Deploy:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

## 🐛 Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Clean and rebuild
docker-compose down -v --remove-orphans
docker-compose build --no-cache
docker-compose up -d
```

**Authentication issues:**
- Verify Clerk credentials in `.env`
- Check Clerk application configuration
- Ensure JWT tokens are valid

**Database connection issues:**
- Verify MongoDB is running: `docker-compose logs -f mongodb`
- Check database credentials
- Ensure network connectivity

**Port conflicts:**
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :8000
lsof -i :27017

# Stop conflicting services or change ports in docker-compose.yml
```

### Performance Issues

- **Slow uploads:** Check `client_max_body_size` in nginx.conf
- **Memory issues:** Adjust Docker resource limits
- **Database performance:** Add indexes for frequent queries

## 🙏 Acknowledgments

- [Clerk](https://clerk.dev/) for authentication services
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python framework
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for frontend tooling
- [TailwindCSS](https://tailwindcss.com/) for styling utilities
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
