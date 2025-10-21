# 📖 PMO Runbook

## Overview

This runbook provides step-by-step instructions for building, testing, and deploying the PMO application with UUID support and live database integration.

## 🏗️ Build Process

### 1. Pre-Build Checklist
```bash
# Verify environment
echo $NODE_ENV
echo $DATABASE_URL

# Check dependencies
npm list --depth=0

# Verify database connection
npx prisma db pull
```

### 2. Build Commands
```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run type checking
npx tsc --noEmit

# Run linting
npm run lint

# Build application
npm run build
```

### 3. Build Verification
```bash
# Check build output
ls -la .next/

# Verify static assets
ls -la .next/static/

# Test build locally
npm run start
```

## 🧪 Testing Procedures

### 1. Unit Tests
```bash
# Run unit tests (if available)
npm test

# Run with coverage
npm run test:coverage
```

### 2. Integration Tests
```bash
# Test database connection
npx tsx database-safety-check.ts

# Test API endpoints
curl -X GET http://localhost:3000/api/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@projecthub.com","password":"admin123"}'
```

### 3. Frontend Tests
```bash
# Test build process
npm run build

# Test production server
npm run start

# Manual testing checklist:
# - [ ] Login page loads
# - [ ] Dashboard displays data
# - [ ] All navigation works
# - [ ] Forms submit correctly
# - [ ] UUIDs display properly
```

### 4. Database Tests
```bash
# Test database integrity
npx tsx database-safety-check.ts

# Test foreign key constraints
psql -d pmo_db -c "
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
"

# Test UUID format
psql -d pmo_db -c "
SELECT 
  table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as valid_uuids
FROM (
  SELECT 'tbl_users' as table_name, id FROM tbl_users
  UNION ALL
  SELECT 'tbl_projects' as table_name, id FROM tbl_projects
  UNION ALL
  SELECT 'tbl_tasks' as table_name, id FROM tbl_tasks
) t
GROUP BY table_name;
"
```

## 🚀 Deployment Procedures

### 1. Development Deployment
```bash
# Start development server
npm run dev

# Run in background
nohup npm run dev > dev.log 2>&1 &

# Check process
ps aux | grep "npm run dev"

# Monitor logs
tail -f dev.log
```

### 2. Production Deployment

#### Environment Setup
```bash
# Set production environment
export NODE_ENV=production

# Set production database
export DATABASE_URL="postgresql://prod_user:secure_password@prod_host:5432/pmo_db"

# Set production secrets
export JWT_SECRET="your-super-secure-jwt-secret-min-32-chars"
```

#### Build and Deploy
```bash
# Install production dependencies
npm ci --production

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Start production server
npm run start

# Run in background with PM2 (recommended)
pm2 start npm --name "pmo-app" -- run start
```

#### PM2 Process Management
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "pmo-app" -- run start

# Monitor processes
pm2 status
pm2 logs pmo-app

# Restart application
pm2 restart pmo-app

# Stop application
pm2 stop pmo-app

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Docker Deployment (Optional)

#### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "run", "start"]
```

#### Docker Commands
```bash
# Build image
docker build -t pmo-app .

# Run container
docker run -d \
  --name pmo-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/pmo_db" \
  -e JWT_SECRET="your-secret" \
  pmo-app

# Check logs
docker logs pmo-app

# Stop container
docker stop pmo-app
```

## 🔍 Monitoring & Health Checks

### 1. Application Health
```bash
# Check application status
curl -f http://localhost:3000/api/health || echo "Application down"

# Check database connection
curl -f http://localhost:3000/api/health/db || echo "Database connection failed"

# Check memory usage
ps aux | grep "npm run start" | awk '{print $4, $6}'
```

### 2. Database Health
```bash
# Check database status
psql -d pmo_db -c "SELECT version();"

# Check connection count
psql -d pmo_db -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'pmo_db';"

# Check database size
psql -d pmo_db -c "SELECT pg_size_pretty(pg_database_size('pmo_db'));"
```

### 3. Log Monitoring
```bash
# Application logs
tail -f dev.log
tail -f server.log

# PM2 logs
pm2 logs pmo-app

# System logs
journalctl -u postgresql -f
```

## 🛠️ Maintenance Tasks

### 1. Daily Tasks
```bash
# Check application status
curl -f http://localhost:3000/api/health

# Check database integrity
npx tsx database-safety-check.ts

# Monitor logs for errors
grep -i error dev.log | tail -10
```

### 2. Weekly Tasks
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Backup database
pg_dump pmo_db > backup_$(date +%Y%m%d).sql

# Clean old logs
find . -name "*.log" -mtime +7 -delete
```

### 3. Monthly Tasks
```bash
# Review database performance
psql -d pmo_db -c "SELECT * FROM pg_stat_user_tables ORDER BY n_tup_ins DESC;"

# Check disk usage
df -h

# Review security settings
grep -r "JWT_SECRET" .env*
```

## 🚨 Troubleshooting

### 1. Application Issues

#### Application Won't Start
```bash
# Check port availability
lsof -i :3000

# Check environment variables
printenv | grep -E "(DATABASE|JWT|NODE)"

# Check dependencies
npm list --depth=0

# Check Prisma client
npx prisma generate
```

#### Database Connection Errors
```bash
# Check PostgreSQL status
brew services list | grep postgresql
sudo systemctl status postgresql

# Test connection
psql -d pmo_db -c "SELECT 1;"

# Check connection string
echo $DATABASE_URL
```

#### Build Failures
```bash
# Clear cache
rm -rf .next/
rm -rf node_modules/.cache/

# Reinstall dependencies
rm -rf node_modules/
npm install

# Check TypeScript errors
npx tsc --noEmit
```

### 2. Database Issues

#### Foreign Key Violations
```bash
# Check for orphaned records
npx tsx database-safety-check.ts

# Fix orphaned records (example)
psql -d pmo_db -c "
UPDATE tbl_tasks 
SET \"assigneeId\" = NULL 
WHERE \"assigneeId\" NOT IN (SELECT id FROM tbl_users);
"
```

#### UUID Format Issues
```bash
# Check UUID format
psql -d pmo_db -c "
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE column_name = 'id' AND data_type != 'text';
"

# Fix UUID format (if needed)
psql -d pmo_db -c "
ALTER TABLE tbl_users ALTER COLUMN id TYPE TEXT;
"
```

### 3. Performance Issues

#### Slow Queries
```bash
# Enable query logging
export DATABASE_LOG_LEVEL="query"

# Check slow queries
grep "slow" dev.log

# Add indexes
psql -d pmo_db -c "
CREATE INDEX CONCURRENTLY idx_projects_status ON tbl_projects(status);
CREATE INDEX CONCURRENTLY idx_tasks_assignee ON tbl_tasks(\"assigneeId\");
"
```

#### Memory Issues
```bash
# Check memory usage
ps aux | grep node

# Restart application
pm2 restart pmo-app

# Check for memory leaks
node --inspect server.js
```

## 🔄 Backup & Recovery

### 1. Database Backup
```bash
# Full backup
pg_dump pmo_db > backup_full_$(date +%Y%m%d_%H%M%S).sql

# Schema only
pg_dump -s pmo_db > backup_schema_$(date +%Y%m%d_%H%M%S).sql

# Data only
pg_dump -a pmo_db > backup_data_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump pmo_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 2. Application Backup
```bash
# Backup source code
tar -czf pmo_source_$(date +%Y%m%d_%H%M%S).tar.gz src/ prisma/ package.json

# Backup configuration
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
```

### 3. Recovery Procedures
```bash
# Restore database
psql pmo_db < backup_full_20241201_120000.sql

# Restore from compressed backup
gunzip -c backup_20241201_120000.sql.gz | psql pmo_db

# Restore application
tar -xzf pmo_source_20241201_120000.tar.gz
npm install
npx prisma generate
npm run build
```

## 📊 Performance Optimization

### 1. Database Optimization
```sql
-- Analyze tables
ANALYZE;

-- Update statistics
UPDATE pg_stat_user_tables SET last_analyze = now();

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename IN ('tbl_users', 'tbl_projects', 'tbl_tasks');
```

### 2. Application Optimization
```bash
# Enable compression
export COMPRESSION=true

# Set cache headers
export CACHE_TTL=3600

# Optimize build
npm run build -- --experimental-build-mode=compile
```

## 🔒 Security Hardening

### 1. Environment Security
```bash
# Secure environment file
chmod 600 .env

# Use strong secrets
openssl rand -base64 32

# Rotate secrets regularly
# Update JWT_SECRET monthly
```

### 2. Database Security
```sql
-- Create application user
CREATE USER pmo_app WITH PASSWORD 'secure_password';

-- Grant minimal permissions
GRANT CONNECT ON DATABASE pmo_db TO pmo_app;
GRANT USAGE ON SCHEMA public TO pmo_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pmo_app;
```

### 3. Application Security
```bash
# Enable HTTPS (production)
export HTTPS=true
export SSL_CERT_PATH=/path/to/cert.pem
export SSL_KEY_PATH=/path/to/key.pem

# Set security headers
export SECURITY_HEADERS=true
```

---

**Note**: This runbook should be customized based on your specific deployment environment and requirements. Always test procedures in a staging environment before applying to production.
