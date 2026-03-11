# Photure — Cloud Photo Management Platform

A self-hosted photo management platform built with a Python microservices backend, React frontend, and a full GitLab CI/CD pipeline targeting DigitalOcean.

> Academic project developed by a university student for learning and demonstration purposes.

---

## Description

Photure lets authenticated users upload, browse, and delete personal photos through a clean React SPA. Each user's data is fully isolated at the backend level. The application itself is intentionally simple — the main focus of this project is the **deployment pipeline**: containerizing a multi-service application with Docker, automating build/test/deploy stages with GitLab CI/CD, provisioning a Linux server from scratch with a Bash script, and safely serving the app through Nginx on a DigitalOcean droplet.

---

## Tech Stack

**Frontend**
- [React 19](https://react.dev) + TypeScript 5, [Vite 7](https://vitejs.dev)
- Tailwind CSS 4, Radix UI (shadcn/ui-style primitives)
- [Clerk](https://clerk.com) — authentication widgets and protected routes
- Zustand — global state, Axios — HTTP client

**Backend**
- Python 3.11 + [FastAPI 0.110](https://fastapi.tiangolo.com) — four independent microservices
- Motor 3.6 — async MongoDB driver, Pydantic 2 — schema validation
- clerk-backend-api — server-side JWT verification, httpx — inter-service calls

**Database**
- MongoDB 7.0

**Deployment & CI/CD**
- Docker + Docker Compose (separate dev and prod configs)
- GitLab CI/CD — build, lint, security scan, image push, and deploy stages
- GitLab Container Registry — stores built Docker images
- Nginx Alpine — reverse proxy + static SPA hosting
- DigitalOcean Ubuntu 22.04 droplet
- Bash — server provisioning script (`scripts/setup-droplet.sh`)

---

## Features

- Sign up / sign in via Clerk (email, OAuth)
- Drag-and-drop batch photo upload with per-file progress toasts
- Responsive photo gallery with sorting and category filters
- Full-screen photo modal viewer and photo download
- Per-user data isolation enforced on every backend query
- Dark / light theme toggle
- Swagger UI at `/docs` for all API endpoints

---

## CI/CD Pipeline

This is the core learning objective of the project. The pipeline is defined in `.gitlab-ci.yml` and runs automatically on every push to `main`.

### Pipeline Stages

| Stage | What it does |
|---|---|
| **build** | `npm ci && npm run build` (frontend), install Python deps (backend) |
| **test** | ESLint + TypeScript checks (frontend), Flake8 linting (backend) |
| **security** | `npm audit` (frontend), `safety check` on Python dependencies |
| **build-images** | Builds Docker images for all 6 services, pushes to GitLab Container Registry |
| **deploy** | SSH into production, pulls new images, restarts services (manual trigger) |

### How Deployment Works

```
git push origin main
        │
        ▼
GitLab CI/CD pipeline
        │
        ├─ build & test code
        ├─ build Docker images
        ├─ push images → registry.gitlab.com/.../photure
        │
        └─ [manual trigger] SSH → DigitalOcean droplet
                                    │
                                    ├─ docker-compose pull
                                    └─ docker-compose up -d
```

Production images are pulled from the GitLab registry — the server itself never builds anything. `api-gateway` and MongoDB both bind to `127.0.0.1` only; Nginx is the only public-facing port (80).

### Required GitLab CI/CD Variables

Set these under **Settings → CI/CD → Variables** in your GitLab project:

```bash
PRODUCTION_HOST          # DigitalOcean droplet IP
DEPLOY_USER              # deploy  (created by setup-droplet.sh)
SSH_PRIVATE_KEY          # private key matching the deploy user's authorized_keys

CLERK_SECRET_KEY         # Clerk server-side secret
VITE_CLERK_PUBLISHABLE_KEY
VITE_APP_URL             # https://your-domain.com/
MONGO_ROOT_PASSWORD      # strong MongoDB root password
CI_REGISTRY_PASSWORD     # GitLab personal access token (read/write registry)
```

GitLab automatically provides `CI_REGISTRY`, `CI_REGISTRY_IMAGE`, and `CI_COMMIT_SHA`.

---

## Server Provisioning

`scripts/setup-droplet.sh` automates the full server setup on a fresh Ubuntu 22.04 droplet:

- Installs Docker CE + Docker Compose plugin
- Creates a non-root `deploy` user, adds it to the `docker` group
- Copies root's SSH `authorized_keys` to the deploy user so the same key works
- Grants `deploy` passwordless `sudo` for docker commands only
- Creates `/opt/photure/` with subdirectories for MongoDB data and uploads
- Configures `ufw` firewall (allow SSH, HTTP, HTTPS; deny everything else)
- Disables the system Nginx to free port 80 for the Docker container

```bash
# Run once on a fresh droplet as root
scp scripts/setup-droplet.sh root@YOUR_SERVER_IP:/tmp/
ssh root@YOUR_SERVER_IP "chmod +x /tmp/setup-droplet.sh && /tmp/setup-droplet.sh"
```

---

## Installation (Local Development)

**Prerequisites:** Docker Desktop ≥ 24, a free [Clerk](https://dashboard.clerk.dev/) account.

```bash
# 1. Clone the repository
git clone https://github.com/pho-veteran/photure.git
cd photure

# 2. Configure environment
cp env.local.example .env
# Edit .env — set CLERK_SECRET_KEY and VITE_CLERK_PUBLISHABLE_KEY

# 3. Build and start all services
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d

# Web app  →  http://localhost
# API docs →  http://localhost:8000/docs
```

**Frontend only (without Docker):**
```bash
cd photure-fe
npm install
npm run dev   # Vite dev server on :5173
```

---

## Project Structure

```
photure/
├── scripts/
│   └── setup-droplet.sh        # One-shot server provisioning script
├── nginx/
│   ├── Dockerfile               # Builds React SPA into an nginx image
│   └── nginx.conf               # Proxy /api → api-gateway; serve static SPA
├── services/
│   ├── common/                  # Shared Python library (config, schemas, MongoDB)
│   ├── api_gateway/             # Public entry point, JWT validation (port 8000)
│   ├── auth_service/            # Clerk JWT verification (port 8010)
│   ├── gallery_service/         # Photo metadata CRUD, MongoDB (port 8020)
│   └── media_service/           # Binary file storage (port 8030)
├── photure-fe/                  # React + TypeScript SPA
├── docker-compose.dev.yml       # Local dev — builds images from source
├── docker-compose.prod.yml      # Production — pulls images from GitLab registry
├── env.local.example            # Environment variable template
└── docs/
    └── DEPLOYMENT_GUIDE.md      # Step-by-step GitLab + DigitalOcean setup guide
```

---

## Author

Developed by **pho-veteran** as a university student project.  
GitHub: [github.com/pho-veteran](https://github.com/pho-veteran)
