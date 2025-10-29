#!/bin/bash

# PMO Application - Quick Deployment Script for VPS
# Run with: bash scripts/deploy.sh

set -e

echo "🚀 PMO Application Deployment Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run with sudo${NC}"
   exit 1
fi

echo -e "${GREEN}Step 1: Updating system...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}Step 2: Installing essential packages...${NC}"
apt install -y curl wget git ufw nginx postgresql postgresql-contrib

echo -e "${GREEN}Step 3: Installing Node.js v18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo -e "${GREEN}Step 4: Installing PM2...${NC}"
npm install -g pm2

echo -e "${GREEN}Step 5: Configuring firewall...${NC}"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo -e "${GREEN}Step 6: Setting up PostgreSQL database...${NC}"
echo "Please set a strong password for the database user"
read -sp "Enter database password: " DB_PASSWORD
echo

# Create database user and database
sudo -u postgres psql << EOF
CREATE USER pmouser WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE pmohub;
GRANT ALL PRIVILEGES ON DATABASE pmohub TO pmouser;
GRANT ALL ON SCHEMA public TO pmouser;
EOF

echo -e "${GREEN}Step 7: Cloning application...${NC}"
mkdir -p /var/www
cd /var/www

if [ -d "pmohub" ]; then
    echo -e "${YELLOW}Directory exists, pulling latest changes...${NC}"
    cd pmohub
    git pull origin main
else
    echo -e "${GREEN}Cloning repository...${NC}"
    git clone https://github.com/Tahatra21/pmohub.git
    cd pmohub
fi

echo -e "${GREEN}Step 8: Installing dependencies...${NC}"
npm install

echo -e "${GREEN}Step 9: Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Please edit .env file with your database credentials"
    echo "DATABASE_URL=\"postgresql://pmouser:${DB_PASSWORD}@localhost:5432/pmohub?schema=public\""
    read -p "Press enter to continue after editing .env file..."
fi

echo -e "${GREEN}Step 10: Setting up Prisma database...${NC}"
npx prisma generate
npx prisma migrate deploy

echo -e "${GREEN}Step 11: Building application...${NC}"
npm run build

echo -e "${GREEN}Step 12: Setting up PM2...${NC}"
mkdir -p logs
pm2 start ecosystem.config.js || pm2 restart ecosystem.config.js
pm2 save
pm2 startup

echo -e "${GREEN}Step 13: Configuring Nginx...${NC}"
echo "Please edit /etc/nginx/sites-available/pmohub with your domain/IP"
read -p "Press enter to continue..."

if [ ! -f /etc/nginx/sites-available/pmohub ]; then
    echo "Creating Nginx configuration..."
    # You need to add your Nginx config here
    echo "Please configure Nginx manually according to deployment guide"
fi

echo -e "${GREEN}Step 14: Testing configuration...${NC}"
nginx -t
systemctl restart nginx

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo "Your application should now be accessible at http://your-server-ip"
echo ""
echo "Useful commands:"
echo "  - View logs: pm2 logs pmo-app"
echo "  - Restart app: pm2 restart pmo-app"
echo "  - Check status: pm2 status"
echo ""
echo -e "${YELLOW}Don't forget to:${NC}"
echo "  1. Configure SSL with Let's Encrypt (recommended)"
echo "  2. Update firewall rules if needed"
echo "  3. Set up regular backups"

