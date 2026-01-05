# CI/CD Deployment Guide - Photure với GitLab & DigitalOcean

## Tổng quan Architecture

```
Developer Push → GitLab CI/CD → Docker Registry → DigitalOcean Droplet
                    ↓
              Build & Test Pipeline
                    ↓
           Automated Production Deployment
```

## 🚀 Bước 1: Setup DigitalOcean Droplet

### Tạo Droplet
1. Tạo Ubuntu 22.04 droplet (ít nhất 4GB RAM, 2 vCPU)
2. Chọn region gần người dùng
3. Add SSH key cho bảo mật

### Chạy Setup Script
```bash
# Upload và chạy setup script
scp scripts/setup-droplet.sh root@YOUR_SERVER_IP:/tmp/
ssh root@YOUR_SERVER_IP
chmod +x /tmp/setup-droplet.sh
./tmp/setup-droplet.sh
```

### Cấu hình DNS
- Trỏ domain của bạn đến IP của droplet
- Cấu hình A record: `your-domain.com → SERVER_IP`
- Cấu hình CNAME: `www.your-domain.com → your-domain.com`

## 🔧 Bước 2: Cấu hình GitLab CI/CD

### GitLab Variables (Settings > CI/CD > Variables)

**Required Variables:**
```bash
# Production Server
PRODUCTION_HOST=your-server-ip
DEPLOY_USER=deploy
SSH_PRIVATE_KEY=<private-key-content>

# GitLab Registry
CI_REGISTRY_USER=<your-gitlab-username>
CI_REGISTRY_PASSWORD=<access-token>

# Application Environment
VITE_APP_URL=https://your-domain.com/
VITE_CLERK_PUBLISHABLE_KEY=<clerk-public-key>
CLERK_SECRET_KEY=<clerk-secret-key>
MONGO_ROOT_PASSWORD=<strong-mongodb-password>
```

### Tạo GitLab Access Token
1. GitLab → User Settings → Access Tokens
2. Tạo token với quyền: `read_registry`, `write_registry`
3. Copy token vào `CI_REGISTRY_PASSWORD`

### Generate SSH Key Pair
```bash
# Trên máy local
ssh-keygen -t rsa -b 4096 -f ~/.ssh/photure_deploy
cat ~/.ssh/photure_deploy.pub  # Copy public key
cat ~/.ssh/photure_deploy      # Copy private key cho GitLab variable
```

## 🏗️ Bước 3: Setup Production Server

### SSH Access
```bash
# Add public key to server
ssh deploy@YOUR_SERVER_IP
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Clone Repository
```bash
cd /opt/photure
git clone https://gitlab.com/your-username/photure.git .
```

### Environment Setup
```bash
# Copy và chỉnh sửa environment file
cp .env.production .env
nano .env

# Update các giá trị:
# - MONGO_ROOT_PASSWORD
# - CLERK_SECRET_KEY
# - VITE_CLERK_PUBLISHABLE_KEY
# - VITE_APP_URL
# - CI_REGISTRY_IMAGE
```



## 📦 Bước 4: Deployment Process

### Automatic Deployment
1. Push code lên main branch
2. GitLab CI sẽ tự động:
   - Build và test code
   - Build Docker images
   - Push images lên registry
   - Deploy lên production (manual trigger)

### Manual Deployment
```bash
# Trên production server
cd /opt/photure
./scripts/deploy.sh
```

### View logs
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Monitor system
htop
docker stats
```

## 🔍 CI/CD Pipeline Stages

### 1. Build Stage
- **Frontend**: `npm ci && npm run build`
- **Backend**: Install Python dependencies

### 2. Test Stage
- **Frontend**: ESLint, TypeScript checks
- **Backend**: Flake8 linting, safety checks

### 3. Security Stage
- `npm audit` cho frontend
- `safety check` cho backend dependencies

### 4. Build Images Stage (Main branch only)
- Build Docker images cho tất cả services
- Push lên GitLab Container Registry

### 5. Deploy Stage (Manual trigger)
- SSH vào production server
- Pull latest images
- Update services với zero-downtime