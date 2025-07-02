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

2. **Run the automated setup:**
   ```bash
   make setup
   ```

3. **Configure Clerk Authentication:**
   
   The setup will prompt you to configure Clerk. Follow these steps:
   
   - Go to [Clerk Dashboard](https://dashboard.clerk.dev/)
   - Create a new application or select existing one
   - Copy your API keys from the **API Keys** section
   - Update the `.env` file with your credentials:
   
   ```env
   CLERK_SECRET_KEY=sk_test_your_secret_key_here
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

4. **Access the application:**
   
   Once setup is complete, access your application at:
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Backend API:** [http://localhost:8000](http://localhost:8000)

## 🛠️ Development

### Local Development Setup

For local development without Docker:

1. **Install dependencies:**
   ```bash
   make install-fe  # Install frontend dependencies
   make install-be  # Install backend dependencies
   ```

2. **Start development servers:**
   ```bash
   # Option 1: Start both services
   make dev
   
   # Option 2: Start individually
   make dev-fe  # Frontend on http://localhost:5173
   make dev-be  # Backend on http://localhost:8000
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

### Common Commands

```bash
# Setup and Management
make setup          # Complete setup process
make build          # Build Docker images
make up             # Start all services
make down           # Stop all services
make restart        # Restart all services

# Development
make dev            # Start development environment
make dev-fe         # Start frontend development server
make dev-be         # Start backend development server

# Monitoring
make logs           # View all service logs
make logs-fe        # View frontend logs
make logs-be        # View backend logs
make health         # Check service health
make status         # Show service status

# Testing and Quality
make test           # Run all tests
make lint           # Run all linters
make format         # Format all code
make check          # Run all quality checks

# Database Management
make backup         # Backup database
make restore        # Restore from backup
make reset-db       # Reset database (WARNING: destructive)

# Maintenance
make clean          # Clean up containers and volumes
make update         # Update dependencies
make security       # Run security audits
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

## 🧪 Testing

### Running Tests

```bash
# Run all tests
make test

# Run specific test suites
make test-fe        # Frontend tests
make test-be        # Backend tests
```

### Test Structure

- **Frontend Tests:** Located in `photure-fe/src/__tests__/`
- **Backend Tests:** Located in `photure-be/tests/`

### Adding Tests

For frontend (React Testing Library + Vitest):
```javascript
// photure-fe/src/__tests__/component.test.tsx
import { render, screen } from '@testing-library/react';
import Component from '../components/Component';

test('renders component', () => {
  render(<Component />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

For backend (pytest):
```python
# photure-be/tests/test_main.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Photure API is running"}
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
   make build
   make up
   ```

### Health Monitoring

The application includes health check endpoints:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000/`
- Database: MongoDB ping command

Monitor with:
```bash
make health
```

## 🐛 Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check service status
make status

# View logs
make logs

# Clean and rebuild
make clean
make build
make up
```

**Authentication issues:**
- Verify Clerk credentials in `.env`
- Check Clerk application configuration
- Ensure JWT tokens are valid

**Database connection issues:**
- Verify MongoDB is running: `make logs-db`
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
