# 🚀 PMO Application - Deployment Guide ke VPS Rocky Linux

**Repository**: https://github.com/Tahatra21/pmohub.git
**OS**: Rocky Linux 8.x / 9.x
**Status**: ✅ Ready for Production Deployment

---

## 📋 Prerequisites

Sebelum memulai deployment, pastikan VPS Anda memiliki:

### 1. Server Requirements
```
✓ Rocky Linux 8.x atau 9.x
✓ Minimum 2GB RAM (4GB recommended)
✓ Minimum 20GB Storage
✓ Root access atau sudo privileges
✓ Public IP address
```

### 2. Software yang Dibutuhkan
```
✓ Node.js v18+
✓ PostgreSQL 14+
✓ Git
✓ PM2 (process manager)
✓ Nginx (reverse proxy)
```

---

## 🔧 Step 1: Setup Initial Server

### 1.1 Update Server
```bash
sudo dnf update -y
sudo dnf install -y epel-release
```

### 1.2 Install Essential Tools
```bash
sudo dnf install -y curl wget git firewalld
```

### 1.3 Setup Firewall
```bash
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Open ports
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 🟢 Step 2: Install Node.js

### 2.1 Install Node.js v18
```bash
# Install NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Install Node.js
sudo dnf install -y nodejs
```

### 2.2 Verify Installation
```bash
node --version  # Should show v18.x or higher
npm --version
```

### 2.3 Install PM2 Globally
```bash
sudo npm install -g pm2
```

---

## 🐘 repositories - Install PostgreSQL

### 3.1 Install PostgreSQL
```bash
# Install PostgreSQL
sudo dnf install -y postgresql15-server postgresql15

# Initialize database
sudo postgresql-setup --initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.2 Setup PostgreSQL User
```bash
sudo -u postgres psql
```

cular in psql console:
```sql
-- Create database user
CREATE USER pmouser WITH PASSWORD 'your_strong_password_here';

-- Create database
CREATE DATABASE pmohub;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pmohub TO pmouser;
GRANT ALL ON SCHEMA public TO pmouser;

-- Exit
\q
```

### 3.3 Configure PostgreSQL Authentication
```bash
# Edit pg_hba.conf
sudo nano /var/lib/pgsql/data/pg_hba.conf
```

pastikan line ini ada:
```
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## 📥 Step 4: Clone Application

### 4.1 Create Application Directory
```bash
sudo mkdir -p /var/www
cd /var/www
```

### 4.2 Clone Repository
```bash
sudo git clone https://github.com/Tahatra21/pmohub.git
cd pmohub
```

### 4.3 Set Permissions
```bash
sudo chown -R $USER:$USER /var/www/pmohub
```

---

##plication

### 5.1 Install Dependencies
```bash
cd /var/www/pmohub
npm install
```

### 5.2 Configure Environment Variables
```bash
cp .env.example .env
nano .env
```

Update dengan konfigurasi berikut:
```env
# Database
DATABASE_URL="postgresql://pmouser:your_strong_password_here@localhost:5432/pmohub?schema=public"

# JWT Secret (generate strong random string)
JWT_SECRET="your_super_secret_jwt_key_change_this"

# App URL
NEXT_PUBLIC_APP_URL="http://your-vps-ip"
NEXT_PUBLIC_API_URL="http://your-vps-ip"

# Environment
NODE_ENV="production"
```

**Generate JWT Secret** (jika perlu):
```bash
openssl rand -base64 32
```

### 5.3 Setup Prisma Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

---

## 🗄️ Step 6: Database Setup

### 6.1 Run Prisma Migrations
```bash
cd /var/www/pmohub
npx prisma migrate deploy
```

### 6.2 Seed Database (Optional)
```bash
# If you have seed data
npx prisma db seed
```

---

## 🏗️ Step 7: Build Application

### 7.1 Create Build
```bash
cd /var/www/pmohub
npm run build
```

### 7.2 Verify Build
```bash
ls -la .next
```

---

## 🔄 Step 8: Setup PM2

### 8.1 PM2 Config already exists in repo
The `ecosystem.config.js` file is already in the repository

### 8.2 Create Log Directory
```bash
mkdir -p logs
```

### 8.3 Start PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

---

## 🌐 Step 9: Install & Configure Nginx

### 9.1 Install Nginx
```bash
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 9.2 Create Nginx Configuration
```bash
sudo nano /etc/nginx/conf.d/pmohub.conf
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 9.3 Test & Restart
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Step 10: SSL Setup (Optional)

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🧪 Step 11: Testing

```bash
# Check all services
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql

# Test application
curl http://localhost:3000
```

---

## 🎉 Complete!

Your application is now accessible at:
- http://your-vps-ip
- https://your-domain.com (with SSL)

---

**Repository**: https://github.com/Tahatra21/pmohub.git
**Status**: ✅ Production Ready for Rocky Linux

