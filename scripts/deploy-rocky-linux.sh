#!/bin/bash

# PMO Application - Quick Deployment Script for Rocky Linux VPS
# Run with: bash scripts/deploy-rocky-linux.sh

set -e

echo "🚀 PMO Application Deployment Script for Rocky Linux"
echo "===================================================="

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
dnf update -y
dnf install -y epel-release

echo -e "${GREEN}Step 2: Installing essential packages...${NC}"
dnf install -y curl wget git firewalld nginx postgresql15-server postgresql15

echo -e "${GREEN}Step 3: Installing Node.js v18...${NC}"
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

echo -e "${GREEN}Step 4: Installing PM2...${NC}"
npm install -g pm2

echo -e "${GREEN}Step 5: Configuring firewall...${NC}"
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

echo -e "${GREEN}Step 6: Setting up PostgreSQL database...${NC}"
# Initialize database
postgresql-setup --initdb
systemctl start postgresql
systemctl enable postgresql

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

echo -e "${GREEN}Configuring PostgreSQL authentication...${NC}"
# Backup original pg_hba.conf
cp /var/lib/pgsql/data/pg_hba.conf /var/lib/pgsql/data/pg_hba.conf.backup

# Edit pg_hba.conf to allow local connections
sed -i 's/# IPv4 local connections:/host    all             all             127.0.0.1\/32            scram-sha-256/' /var/lib/pgsql/data/pg_hba.conf

systemctl restart postgresql

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
    echo "DATABASE_URL=\"postgresql://pmouser:${DB_PASSWORD}@localhost:5432/pmohub?schema=public\"" >> .env
    echo "JWT_SECRET=\"$(openssl rand -base64 32)\"" >> .env
    echo "NEXT_PUBLIC_APP_URL=\"http://$(hostname -I | awk '{print $1}')\"" >> .env
    echo "NEXT_PUBLIC_API_URL=\"http://$(hostname -I | awk '{print $1}')\"" >> .env
    echo "NODE_ENV=\"production\"" >> .env
    echo "Environment file created. Please review and edit if needed:"
    echo "  nano /var/www/pmohub/.env"
    read -p "Press enter to continue..."
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
pm2 startup systemd

echo -e "${GREEN}Step 13: Configuring Nginx...${NC}"
# Start Nginx
systemctl start nginx
systemctl enable nginx

# Create Nginx config
cat > /etc/nginx/conf.d/pmohub.conf << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 100M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Test and restart Nginx
nginx -t
systemctl restart nginx

echo -e "${GREEN}Step 14: Configuring SELinux (if enforced)...${NC}"
if [ "$(getenforce)" == "Enforcing" ]; then
    echo "SELinux is enforcing. Configuring policies..."
    setsebool -P httpd_can_network_connect 1
    if ! dnf list installed | grep -q "policycoreutils-python-utils"; then
        dnf install -y policycoreutils-python-utils
    fi
fi

echo -e "${GREEN}Step 15: Testing configuration...${NC}"
sleep 5
curl -s http://localhost:3000 > /dev/null && echo "✓ Application is running" || echo "✗ Application not responding"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo "Your application should now be accessible at http://$(hostname -I | awk '{print $1}')"
echo ""
echo "Useful commands:"
echo "  - View logs: pm2 logs pmo-app"
echo "  - Restart app: pm2 restart pmo-app"
echo "  - Check status: pm2 status"
echo "  - Check SELinux: getenforce"
echo "  - View firewall: firewall-cmd --list-all"
echo ""
echo -e "${YELLOW}Don't forget to:${NC}"
echo "  1. Configure SSL with Let's Encrypt (recommended)"
echo "  2. Update firewall rules if needed"
echo "  3. Set up regular backups"
echo "  4. Review and secure .env file"

