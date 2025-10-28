# Deployment & Maintenance Guide

## Overview

This document provides comprehensive guidance for deploying, maintaining, and troubleshooting the PMO application. It covers production deployment, monitoring, backup procedures, and common maintenance tasks.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Production Deployment](#production-deployment)
3. [Database Management](#database-management)
4. [Monitoring & Logging](#monitoring--logging)
5. [Backup & Recovery](#backup--recovery)
6. [Security Maintenance](#security-maintenance)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance Schedule](#maintenance-schedule)

## System Requirements

### Server Requirements
- **OS**: Ubuntu 20.04 LTS or CentOS 8+
- **CPU**: 4 cores minimum, 8 cores recommended
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 100GB SSD minimum, 500GB recommended
- **Network**: Stable internet connection

### Software Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **PostgreSQL**: v13.0 or higher
- **Redis**: v6.0 or higher (for caching)
- **Nginx**: v1.18 or higher (reverse proxy)

### Development Tools
- **Git**: v2.30 or higher
- **Docker**: v20.10 or higher (optional)
- **PM2**: v5.0 or higher (process manager)

## Production Deployment

### 1. Server Setup

#### Install Node.js
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Install PostgreSQL
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE pmo_db;
CREATE USER pmo_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE pmo_db TO pmo_user;
\q
```

#### Install Nginx
```bash
# Install Nginx
sudo apt-get install nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Application Deployment

#### Clone Repository
```bash
# Clone the repository
git clone https://github.com/Tahatra21/pmo.git
cd pmo

# Install dependencies
npm install

# Build the application
npm run build
```

#### Environment Configuration
```bash
# Create production environment file
cp .env.example .env.production

# Edit environment variables
nano .env.production
```

**Production Environment Variables**:
```env
# Database
DATABASE_URL="postgresql://pmo_user:secure_password@localhost:5432/pmo_db"

# JWT Secret
JWT_SECRET="your-super-secure-jwt-secret-key"

# Application
NODE_ENV="production"
PORT=3000

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="your-session-secret"

# Email (if using email features)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

#### Database Migration
```bash
# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed initial data (if needed)
npx prisma db seed
```

#### Process Management with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'pmo-app',
    script: 'server.ts',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 3. Nginx Configuration

#### Create Nginx Configuration
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/pmo
```

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static files
    location /_next/static/ {
        alias /path/to/pmo/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
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

    # Application routes
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
}
```

#### Enable Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/pmo /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Database Management

### Database Maintenance

#### Regular Maintenance Tasks
```bash
# Connect to database
psql -U pmo_user -d pmo_db

# Analyze tables for query optimization
ANALYZE;

# Vacuum to reclaim storage
VACUUM;

# Reindex for performance
REINDEX DATABASE pmo_db;
```

#### Database Monitoring
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('pmo_db'));

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Database Backup

#### Automated Backup Script
```bash
# Create backup script
cat > /opt/scripts/backup-db.sh << 'EOF'
#!/bin/bash

# Configuration
DB_NAME="pmo_db"
DB_USER="pmo_user"
DB_HOST="localhost"
BACKUP_DIR="/opt/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/pmo_db_backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/pmo_db_backup_$DATE.sql"

# Remove old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: pmo_db_backup_$DATE.sql.gz"
EOF

# Make script executable
chmod +x /opt/scripts/backup-db.sh

# Add to crontab for daily backups
echo "0 2 * * * /opt/scripts/backup-db.sh" | crontab -
```

#### Manual Backup
```bash
# Full database backup
pg_dump -U pmo_user -d pmo_db --format=custom --compress=9 > backup.sql

# Schema only backup
pg_dump -U pmo_user -d pmo_db --schema-only > schema.sql

# Data only backup
pg_dump -U pmo_user -d pmo_db --data-only > data.sql
```

#### Database Restore
```bash
# Restore from backup
pg_restore -U pmo_user -d pmo_db backup.sql

# Restore schema only
psql -U pmo_user -d pmo_db < schema.sql

# Restore data only
psql -U pmo_user -d pmo_db < data.sql
```

## Monitoring & Logging

### Application Monitoring

#### PM2 Monitoring
```bash
# Monitor application status
pm2 status

# View logs
pm2 logs pmo-app

# Monitor resources
pm2 monit

# Restart application
pm2 restart pmo-app

# Stop application
pm2 stop pmo-app
```

#### System Monitoring
```bash
# Install monitoring tools
sudo apt-get install htop iotop nethogs

# Monitor system resources
htop

# Monitor disk I/O
sudo iotop

# Monitor network usage
sudo nethogs
```

### Log Management

#### Log Rotation
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/pmo
```

**Logrotate Configuration**:
```
/opt/pmo/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 pmo pmo
    postrotate
        pm2 reload pmo-app
    endscript
}
```

#### Log Analysis
```bash
# View error logs
tail -f /opt/pmo/logs/err.log

# Search for specific errors
grep -i "error" /opt/pmo/logs/combined.log

# Count error occurrences
grep -c "ERROR" /opt/pmo/logs/combined.log
```

## Backup & Recovery

### Application Backup

#### Full Application Backup
```bash
# Create backup script
cat > /opt/scripts/backup-app.sh << 'EOF'
#!/bin/bash

APP_DIR="/opt/pmo"
BACKUP_DIR="/opt/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

# Create application backup
tar -czf "$BACKUP_DIR/pmo_app_backup_$DATE.tar.gz" \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=logs \
  -C $APP_DIR .

# Remove old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Application backup completed: pmo_app_backup_$DATE.tar.gz"
EOF

chmod +x /opt/scripts/backup-app.sh
```

#### Disaster Recovery Plan
1. **Database Recovery**: Restore from latest backup
2. **Application Recovery**: Deploy from backup or source
3. **Configuration Recovery**: Restore environment files
4. **SSL Certificate**: Reissue if needed
5. **DNS Configuration**: Update if server changed

## Security Maintenance

### Security Updates
```bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade

# Update Node.js dependencies
cd /opt/pmo
npm audit
npm audit fix

# Update PM2
npm install -g pm2@latest
```

### Security Monitoring
```bash
# Check for failed login attempts
grep "Failed password" /var/log/auth.log

# Monitor system logs
journalctl -f

# Check open ports
netstat -tulpn

# Check running processes
ps aux | grep -v grep
```

### Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3000  # Block direct access to app port
```

## Performance Optimization

### Database Optimization
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_users_email ON tbl_users(email);
CREATE INDEX idx_users_role ON tbl_users(roleId);
CREATE INDEX idx_tasks_project ON tbl_tasks(projectId);
CREATE INDEX idx_tasks_assignee ON tbl_tasks(assigneeId);

-- Update table statistics
ANALYZE tbl_users;
ANALYZE tbl_tasks;
ANALYZE tbl_projects;
```

### Application Optimization
```bash
# Enable gzip compression in Nginx
# (Already configured in Nginx setup)

# Optimize Node.js performance
export NODE_OPTIONS="--max-old-space-size=4096"

# Use PM2 cluster mode
pm2 start ecosystem.config.js --instances max
```

### Caching Strategy
```bash
# Install Redis for caching
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
```

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs pmo-app

# Check port availability
netstat -tulpn | grep 3000

# Check environment variables
pm2 show pmo-app
```

#### Database Connection Issues
```bash
# Test database connection
psql -U pmo_user -d pmo_db -c "SELECT 1;"

# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

#### High Memory Usage
```bash
# Check memory usage
free -h
htop

# Check PM2 memory usage
pm2 monit

# Restart application
pm2 restart pmo-app
```

#### Slow Performance
```bash
# Check database performance
psql -U pmo_user -d pmo_db -c "SELECT * FROM pg_stat_activity;"

# Check slow queries
psql -U pmo_user -d pmo_db -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;"

# Check system resources
iostat -x 1
```

### Emergency Procedures

#### Application Down
1. Check PM2 status: `pm2 status`
2. Restart application: `pm2 restart pmo-app`
3. Check logs: `pm2 logs pmo-app`
4. Check system resources: `htop`
5. Check database: `sudo systemctl status postgresql`

#### Database Issues
1. Check PostgreSQL status: `sudo systemctl status postgresql`
2. Check database logs: `sudo tail -f /var/log/postgresql/postgresql-13-main.log`
3. Test connection: `psql -U pmo_user -d pmo_db -c "SELECT 1;"`
4. Restart PostgreSQL: `sudo systemctl restart postgresql`

#### Security Incident
1. Check logs for suspicious activity
2. Review failed login attempts
3. Check for unauthorized access
4. Update passwords if compromised
5. Review firewall rules

## Maintenance Schedule

### Daily Tasks
- [ ] Check application status (`pm2 status`)
- [ ] Monitor system resources (`htop`)
- [ ] Check error logs (`pm2 logs pmo-app`)
- [ ] Verify database connectivity

### Weekly Tasks
- [ ] Review application logs for errors
- [ ] Check disk space usage
- [ ] Update system packages
- [ ] Review security logs
- [ ] Test backup restoration

### Monthly Tasks
- [ ] Update Node.js dependencies (`npm audit`)
- [ ] Review and optimize database performance
- [ ] Update SSL certificates
- [ ] Review user access and permissions
- [ ] Test disaster recovery procedures

### Quarterly Tasks
- [ ] Security audit and penetration testing
- [ ] Performance optimization review
- [ ] Backup strategy review
- [ ] Update documentation
- [ ] Review and update monitoring tools

---

**Last Updated**: October 21, 2025  
**Version**: 1.0  
**Maintainer**: PMO Development Team
