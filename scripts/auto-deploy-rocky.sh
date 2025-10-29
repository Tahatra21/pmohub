#!/bin/bash

# PMO Application - Auto Deploy Script for Rocky Linux (RHEL-based)
# Usage: sudo bash scripts/auto-deploy-rocky.sh

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}$1${NC}"; }
warn() { echo -e "${YELLOW}$1${NC}"; }
err() { echo -e "${RED}$1${NC}"; }

require_root() {
  if [[ $EUID -ne 0 ]]; then
    err "This script must be run with sudo/root"
    exit 1
  fi
}

require_root

APP_DIR="/var/www/pmohub"
DB_NAME="pmo_db"
DB_USER="pmouser"
DB_PASS=""
PORT="3000"

read -p "Expose app on port [3000]: " PORT_INPUT || true
PORT=${PORT_INPUT:-$PORT}

read -s -p "PostgreSQL password for user '${DB_USER}' (leave blank to prompt): " DB_PASS || true
echo
if [ -z "${DB_PASS}" ]; then
  read -s -p "Enter password for '${DB_USER}': " DB_PASS
  echo
fi

log "Step 1: Update system and install repositories"
dnf update -y
if ! dnf list installed epel-release >/dev/null 2>&1; then
  dnf install -y epel-release
fi

log "Step 2: Install dependencies (curl, git, firewalld, nginx, PostgreSQL, Node.js)"
dnf install -y curl wget git firewalld nginx postgresql15-server postgresql15
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
  dnf install -y nodejs
fi
npm -v >/dev/null || (err "npm not found" && exit 1)

log "Step 3: Start and enable firewall & nginx"
systemctl enable --now firewalld
firewall-cmd --permanent --add-service=http || true
firewall-cmd --permanent --add-service=https || true
firewall-cmd --reload || true
systemctl enable --now nginx

log "Step 4: Initialize and start PostgreSQL"
if [ ! -d "/var/lib/pgsql/data/base" ]; then
  postgresql-setup --initdb
fi
systemctl enable --now postgresql

log "Step 5: Create database and user"
sudo -u postgres psql <<SQL
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
   END IF;
END
$$;

DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = '${DB_NAME}') THEN
      CREATE DATABASE ${DB_NAME};
   END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

log "Step 6: Allow local connections (pg_hba.conf)"
PG_HBA="/var/lib/pgsql/data/pg_hba.conf"
cp -n "$PG_HBA" "${PG_HBA}.bak" || true
if ! grep -q "127.0.0.1/32" "$PG_HBA"; then
  echo "host    all             all             127.0.0.1/32            scram-sha-256" >> "$PG_HBA"
fi
systemctl restart postgresql

log "Step 7: Clone or update application repo"
mkdir -p /var/www
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  cd /var/www
  git clone https://github.com/Tahatra21/pmohub.git
  cd "$APP_DIR"
fi

log "Step 8: Install app dependencies"
npm install

log "Step 9: Configure environment (.env)"
if [ ! -f .env ]; then
  cp .env.example .env || true
fi
# Write essential variables (idempotent replace or append)
if grep -q '^DATABASE_URL=' .env; then
  sed -i "s#^DATABASE_URL=.*#DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public\"#" .env
else
  echo "DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public\"" >> .env
fi
if grep -q '^NODE_ENV=' .env; then
  sed -i "s#^NODE_ENV=.*#NODE_ENV=\"production\"#" .env
else
  echo "NODE_ENV=\"production\"" >> .env
fi
if grep -q '^NEXT_PUBLIC_APP_URL=' .env; then
  sed -i "s#^NEXT_PUBLIC_APP_URL=.*#NEXT_PUBLIC_APP_URL=\"http://$(hostname -I | awk '{print $1}')\"#" .env
else
  echo "NEXT_PUBLIC_APP_URL=\"http://$(hostname -I | awk '{print $1}')\"" >> .env
fi
if grep -q '^NEXT_PUBLIC_API_URL=' .env; then
  sed -i "s#^NEXT_PUBLIC_API_URL=.*#NEXT_PUBLIC_API_URL=\"http://$(hostname -I | awk '{print $1}')\"#" .env
else
  echo "NEXT_PUBLIC_API_URL=\"http://$(hostname -I | awk '{print $1}')\"" >> .env
fi
if ! grep -q '^JWT_SECRET=' .env; then
  echo "JWT_SECRET=\"$(openssl rand -base64 32)\"" >> .env
fi

log "Step 10: Prepare database with Prisma (migrate + seed)"
npm run db:generate
npx prisma migrate deploy
# Seed to ensure users/password and initial data match repo state
npm run db:seed
# Optional domain-specific seeds (uncomment if desired)
# npm run hjt:setup
# npm run hjt:setup-tables
# npm run cost-estimator:setup

log "Step 11: Build application"
npm run build

log "Step 12: Configure PM2"
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi
mkdir -p logs
# Ensure ecosystem.config.js exists; repo includes it
if [ ! -f ecosystem.config.js ]; then
  cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'pmo-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '${APP_DIR}',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production', PORT: ${PORT} },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}
EOF
fi
pm2 start ecosystem.config.js || pm2 restart pmo-app || true
pm2 save
pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami)) >/dev/null 2>&1 || true

log "Step 13: Configure Nginx reverse proxy"
cat > /etc/nginx/conf.d/pmohub.conf <<EOF
server {
    listen 80;
    server_name _;

    client_max_body_size 100M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;

    location / {
        proxy_pass http://localhost:${PORT};
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
        proxy_pass http://localhost:${PORT};
    }

    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF
nginx -t && systemctl restart nginx

log "Step 14: SELinux adjustments (if Enforcing)"
if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" = "Enforcing" ]; then
  setsebool -P httpd_can_network_connect 1 || true
  if ! dnf list installed | grep -q policycoreutils-python-utils; then
    dnf install -y policycoreutils-python-utils || true
  fi
fi

log "Step 15: Final checks"
sleep 3
if curl -sS http://localhost:${PORT} >/dev/null; then
  log "Application is responding on localhost:${PORT}"
else
  warn "Application did not respond on localhost:${PORT}. Check PM2 logs."
fi

IP_ADDR=$(hostname -I | awk '{print $1}')
log "✅ Deployment complete. Access: http://${IP_ADDR}"
echo "Default seeded users (from repo):"
echo " - admin@projecthub.com / admin123"
echo " - manager@projecthub.com / manager123"
echo " - engineer@projecthub.com / engineer123"
