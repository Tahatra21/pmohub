# 🎯 Rocky Linux Deployment - Quick Reference

## 📋 Perbedaan Rocky Linux vs Ubuntu

| Feature | Ubuntu/Debian | Rocky Linux |
|---------|--------------|-------------|
| Package Manager | `apt` | `dnf` |
| Firewall | `ufw` | `firewalld` |
| SELinux | Disabled | Enforcing |
| PostgreSQL Path | `/var/lib/postgresql` | `/var/lib/pgsql` |
| Service Management | `systemctl` | `systemctl` |

---

## 🚀 Quick Start (Rocky Linux)

### 1. Clone & Install (Automated)
```bash
cd /var/www
git clone https://github.com/Tahatra21/pmohub.git
cd pmohub
bash scripts/deploy-rocky-linux.sh
```

### 2. Manual Setup
```bash
# Install essentials
sudo dnf update -y
sudo dnf install -y epel-release curl wget git

# Install Node.js
curl -fsSL https://rpm.nodesource.comグeup_18.x | sudo bash -
sudo dnf install -y nodejs

# Install PostgreSQL
sudo dnf install -y postgresql15-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql

# Install Nginx
sudo dnf install -y nginx

# Clone app
cd /var/www
sudo git clone https://github.com/Tahatra21/pmohub.git
cd pmohub
npm install

# Configure
cp .env.example .env
nano .env

# Setup database
npx prisma migrate deploy

# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

---

## 🔥 Firewall (Firewalld)

```bash
# Start firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Open ports
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Check status
sudo firewall-cmd --list-all
```

---

## 🔒 SELinux

```bash
# Check status
getenforce

# Allow Nginx to connect
sudo setsebool -P httpd_can_network_connect 1

# If Enforcing, configure policies
sudo setenforce 0  # Temporary permissive (testing)
```

---

## 📖 Full Documentation

- **Detailed Guide**: `DEPLOYMENT_GUIDE_ROCKY_LINUX.md`
- **Automated Script**: `scripts/deploy-rocky-linux.sh`
- **Ubuntu Guide**: `DEPLOYMENT_GUIDE.md` (reference)

---

## ⚡ Common Commands

```bash
# Services
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Logs
pm2 logs pmo-app
sudo tail -f /var/log/nginx/error.log

# Restart
pm2 restart pmo-app
sudo systemctl restart nginx
```

---

**Repository**: https://github.com/Tahatra21/pmohub.git

