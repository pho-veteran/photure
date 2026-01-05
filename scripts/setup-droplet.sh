#!/bin/bash

# DigitalOcean Droplet Setup Script for Photure

set -e

echo "Setting up DigitalOcean droplet for Photure application..."

# Update system
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install essential packages
echo "Installing essential packages..."
apt-get install -y \
    curl \
    wget \
    git \
    ufw \
    fail2ban \
    htop \
    certbot \
    python3-certbot-nginx \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
echo "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Install Docker Compose standalone
echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create deploy user
echo "Creating deploy user..."
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
usermod -aG sudo deploy

# Setup SSH for deploy user
echo "Setting up SSH for deploy user..."
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chown deploy:deploy /home/deploy/.ssh

# Create application directory
echo "Creating application directory..."
mkdir -p /opt/photure
chown deploy:deploy /opt/photure

# Create data directories
echo "Creating data directories..."
mkdir -p /opt/photure/data/mongodb
mkdir -p /opt/photure/data/uploads
mkdir -p /opt/photure/logs
chown -R deploy:deploy /opt/photure/data
chown -R deploy:deploy /opt/photure/logs

# Configure firewall
echo "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

echo "DigitalOcean droplet setup completed!"
echo ""
echo "Next steps:"
echo "1. Add your SSH public key to /home/deploy/.ssh/authorized_keys"
echo "2. Clone your repository to /opt/photure"
echo "3. Copy .env.production to /opt/photure/.env and update variables"
echo "4. Setup SSL certificate with: certbot --nginx -d your-domain.com"
echo "5. Run: docker-compose -f docker-compose.prod.yml up -d"