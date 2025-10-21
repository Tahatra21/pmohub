# 🔧 Environment Setup Guide

## Overview

This guide provides comprehensive instructions for setting up the PMO (Project Management Office) application environment with UUID support and live database integration.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18+ (recommended: 20.x)
- **PostgreSQL**: 17+ (with UUID support)
- **npm**: 9+ or **yarn**: 1.22+
- **Git**: Latest version

### Development Tools (Optional)
- **VS Code**: Recommended IDE
- **PostgreSQL Client**: pgAdmin, DBeaver, or psql
- **API Testing**: Postman, Insomnia, or curl

## 🗄️ Database Setup

### 1. PostgreSQL Installation

#### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@17

# Start PostgreSQL service
brew services start postgresql@17

# Create database
createdb pmo_db
```

#### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql-17 postgresql-client-17

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb pmo_db
```

#### Windows
1. Download PostgreSQL 17 from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer with default settings
3. Use pgAdmin to create `pmo_db` database

### 2. Database Configuration

#### Connection Settings
```sql
-- Connect to PostgreSQL
psql -U postgres -d pmo_db

-- Verify UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check database
\l
\dt
```

#### User Permissions
```sql
-- Create application user (optional)
CREATE USER pmo_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE pmo_db TO pmo_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pmo_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pmo_user;
```

## 🔑 Environment Variables

### 1. Create Environment File
```bash
# Copy example file
cp env.example .env

# Edit with your values
nano .env
```

### 2. Required Variables

#### Database Configuration
```env
# Primary database connection
DATABASE_URL="postgresql://username:password@localhost:5432/pmo_db"

# Alternative connection parameters
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pmo_db
DB_USER=postgres
DB_PASSWORD=your_password
```

#### Security Configuration
```env
# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET="pmo-super-secret-jwt-key-2024-change-this-in-production"

# Session configuration
SESSION_SECRET="your-session-secret-key"
```

#### Application Configuration
```env
# Environment
NODE_ENV="development"

# Server configuration
PORT=3000
HOST=localhost

# Logging
LOG_LEVEL="info"
DATABASE_LOG_LEVEL="query"
```

#### Optional Configuration
```env
# Database pool settings
DATABASE_POOL_SIZE=10
DATABASE_POOL_TIMEOUT=30

# Caching (if implemented)
REDIS_URL="redis://localhost:6379"

# File uploads
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
```

### 3. Production Environment

#### Secure Configuration
```env
# Production database
DATABASE_URL="postgresql://prod_user:secure_password@prod_host:5432/pmo_db"

# Strong secrets
JWT_SECRET="your-super-secure-jwt-secret-min-32-chars"
SESSION_SECRET="your-super-secure-session-secret"

# Environment
NODE_ENV="production"
PORT=3000

# Security headers
CORS_ORIGIN="https://yourdomain.com"
```

## 🚀 Application Setup

### 1. Install Dependencies
```bash
# Install all packages
npm install

# Or with yarn
yarn install
```

### 2. Database Schema Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Verify schema
npx prisma db pull
```

### 3. Seed Initial Data
```bash
# Seed essential data (roles, users, etc.)
npm run db:seed

# Seed additional data (optional)
npm run hjt:seed-tables
npm run cost-estimator:seed
```

### 4. Verify Setup
```bash
# Run safety check
npx tsx database-safety-check.ts

# Start development server
npm run dev
```

## 🔍 Verification Steps

### 1. Database Verification
```bash
# Check database connection
npx prisma db pull

# Verify tables exist
psql -d pmo_db -c "\dt"

# Check UUID format
psql -d pmo_db -c "SELECT id FROM tbl_users LIMIT 1;"
```

### 2. Application Verification
```bash
# Test API endpoints
curl http://localhost:3000/api/health

# Check authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@projecthub.com","password":"admin123"}'
```

### 3. Frontend Verification
1. Open browser to `http://localhost:3000`
2. Login with default credentials
3. Navigate through all pages
4. Verify data loads correctly

## 🛠️ Development Workflow

### 1. Daily Development
```bash
# Start development server
npm run dev

# Run in background
npm run dev &

# Check logs
tail -f dev.log
```

### 2. Database Changes
```bash
# Make schema changes in prisma/schema.prisma
# Push changes
npx prisma db push

# Generate new client
npx prisma generate
```

### 3. Testing
```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Run safety check
npx tsx database-safety-check.ts
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql@17

# Check connection
psql -d pmo_db -c "SELECT version();"
```

#### Prisma Errors
```bash
# Reset Prisma client
rm -rf node_modules/.prisma
npx prisma generate

# Reset database (CAUTION: Data loss)
npx prisma migrate reset
```

#### Port Conflicts
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Use different port
PORT=3001 npm run dev
```

### Error Messages

#### "Environment variable not found: DATABASE_URL"
- Check `.env` file exists
- Verify `DATABASE_URL` is set correctly
- Ensure no extra spaces or quotes

#### "relation does not exist"
- Run `npx prisma db push`
- Check database name in connection string
- Verify user has proper permissions

#### "Invalid UUID format"
- Check if database was properly migrated
- Run `npx tsx database-safety-check.ts`
- Verify Prisma schema matches database

## 📊 Performance Optimization

### Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_projects_status ON tbl_projects(status);
CREATE INDEX idx_tasks_assignee ON tbl_tasks("assigneeId");
CREATE INDEX idx_activity_logs_user ON tbl_activity_logs("userId");
```

### Application Optimization
```bash
# Enable query logging
DATABASE_LOG_LEVEL="query"

# Monitor performance
npm run dev 2>&1 | tee dev.log
```

## 🔒 Security Considerations

### Development Security
- Use strong passwords for database
- Keep `.env` file secure (add to `.gitignore`)
- Use different secrets for development/production

### Production Security
- Use environment-specific database credentials
- Enable SSL for database connections
- Use strong JWT secrets (32+ characters)
- Implement rate limiting
- Enable CORS properly

## 📝 Maintenance

### Regular Tasks
```bash
# Weekly: Check database integrity
npx tsx database-safety-check.ts

# Monthly: Update dependencies
npm update

# Quarterly: Review security settings
# Check JWT secrets, database permissions
```

### Backup Strategy
```bash
# Create database backup
pg_dump pmo_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql pmo_db < backup_file.sql
```

## 🆘 Support

### Getting Help
1. Check application logs: `tail -f dev.log`
2. Run safety check: `npx tsx database-safety-check.ts`
3. Verify environment: `printenv | grep -E "(DATABASE|JWT|NODE)"`
4. Check database: `psql -d pmo_db -c "\dt"`

### Useful Commands
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check PostgreSQL version
psql --version

# Check database status
brew services list | grep postgresql
```

---

**Note**: This setup guide assumes a standard development environment. Adjust paths and commands based on your specific operating system and configuration.
