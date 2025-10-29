# 🚀 PMO Application - Deployment Guide ke VPS Public

**Repository**: https://github.com/Tahatra21/pmohub.git
**Status**: ✅ Ready for Production Deployment

---

## 📋 Prerequisites

Sebelum memulai deployment, pastikan VPS Anda memiliki:

### 1. Server Requirements
```
✓ Ubuntu 20.04 LTS atau 22.04 LTS (recommended)
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
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Essential Tools
```bash
sudo apt install -y curl wget git ufw
```

### 1.3 Setup Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 🟢 Step 2: Install Node.js

### 2.1 Install Node.js v18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
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

## 🐘 Step 3: Install PostgreSQL

### 3.1 Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```

### 3.2 Start PostgreSQL
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.3 Setup PostgreSQL User
```bash
sudo -u postgres psql
```

Di dalam psql console:
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

## 🔨 Step 5: Configure Application

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

### 6.3 Verify Database
```bash
npx prisma studio
# This will open a GUI at http://localhost:5555
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
# Check if .next directory exists
ls -la .next
```

---

## 🔄 Step 8: Setup PM2

### 8.1 Create PM2 Config
```bash
nano ecosystem.config.js
```

Tambahkan config berikut:
```javascript
module.exports = {
  apps: [{
    name: 'pmo-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/pmohub',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}
```

### 8.2 Create Log Directory
```bash
mkdir -p logs
```

### 8.3 Start PM2
```bash
pm2 start ecosystem.config.js
```

### 8.4 Save PM2 Configuration
```bash
pm2 save
```

### 8.5 Setup PM2 Startup
```bash
pm2 startup
# Copy and run the command that appears
```

---

## 🌐 Step 9: Install & Configure Nginx

### 9.1 Install Nginx
```bash
sudo apt install -y nginx
```

### 9.2 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/pmohub
```

Tambahkan config berikut:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    # Increase client body size for file uploads
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

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

    # Static file caching
    location /_next/static {
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### 9.3 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/pmohub /etc/nginx/sites-enabled/
```

### 9.4 Test Nginx Config
```bash
sudo nginx -t
```

### 9.5 Restart Nginx
```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔒 Step 10: SSL Setup (Optional but Recommended)

### 10.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 10.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
# Follow the prompts
```

### 10.3 Auto-renewal
```bash
sudo certbot renew --dry-run
```

---

## 🧪 Step 11: Testing & Verification

### 11.1 Check Application Status
```bash
# PM2 Status
pm2 status

# Nginx Status
sudo systemctl status nginx

# PostgreSQL Status
sudo systemctl status postgresql
```

### 11.2 Check Logs
```bash
# PM2 Logs
pm2 logs pmo-app

# Nginx Logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Application Logs
tail -f /var/www/pmohub/logs/combined.log
```

### 11.3 Test Application
```bash
# Local test
curl http://localhost:3000

# External test
curl http://your-vps-ip
```

### 11.4 Open in Browser
```
http://your-vps-ip
# or
https://your-domain.com (if SSL configured)
```

---

## 🔄 Step 12: Maintenance Commands

### 12.1 Update Application
```bash
cd /var/www/pmohub
git pull origin main
npm install
npm run build
pm2 restart pmo-app
```

### 12.2 Database Updates
```bash
# After pulling updates
npx prisma migrate deploy
pm2 restart pmo-app
```

### 12.3 View Logs
```bash
# Application logs
pm2 logs pmo-app

# Real-time monitoring
pm2 monit
```

### 12.4 Restart Services
```bash
# Restart application
pm2 restart pmo-app

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 12.5 Stop Application
```bash
pm2 stop pmo-app
pm2 delete pmo-app
```

---

## 📊 Step 13: Security Checklist

### 13.1 Firewall Configuration
```bash
sudo ufw status
# Ensure only necessary ports are open
```

### 13.2 PostgreSQL Security
```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Ensure only local connections are allowed
```

### 13.3 Environment Variables
```bash
# Ensure .env is not accessible via web
sudo nano /etc/nginx/sites-available/pmohub
```

Tambahkan sebelum location block:
```nginx
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Application not accessible**
```bash
# Check PM2
pm2 status

# Check port
sudo netstat -tulpn | grep 3000

# Check logs
pm2 logs pmo-app --lines 50
```

**2. Database connection errors**
```bash
# Test PostgreSQL connection
sudo -u postgres psql -d pmohub -U pmouser

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

**3. Nginx errors**
```bash
# Check config
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

**4. Build errors**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build

# Check Node version
node --version
```

---

## 📝 Summary Checklist

- [ ] Server updated and secured
- [ ] Node.js v18+ installed
- [ ] PostgreSQL installed and configured
- [ ] Application cloned from GitHub
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Application built
- [ ] PM2 configured and started
- [ ] Nginx configured and started
- [ ] Firewall configured
- [ ] SSL certificate installed (optional)
- [ ] Application accessible from public
- [ ] All services running
- [ ] Logs checked

---

## 📞 Support

Jika mengalami masalah:
1. Check logs: `pm2 logs pmo-app`
2. Check application status: `pm2 status`
3. Verify database: `sudo -u postgres psql -d pmohub`
4. Review Nginx config: `sudo nginx -t`

---

## 🎉 Deployment Complete!

Setelah semua langkah selesai, aplikasi PMO Anda dapat diakses di:
- **HTTP**: `http://your-vps-ip`
- **HTTPS**: `https://your-domain.com` (jika SSL configured)

**Default Login**:
- Username: admin@example.com (atau sesuai seed data)
- Password: check seed data atau contact administrator

---

**Last Updated**: 2025-01-27
**Repository**: https://github.com/Tahatra21/pmohub.git
**Status**: ✅ Production Ready

