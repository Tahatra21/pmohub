# 🚀 PMO Database Setup Guide

This guide provides step-by-step instructions to set up the PMO (Project Management Office) database and application.

## 📋 Prerequisites

- macOS (tested on macOS 24.6.0)
- Homebrew package manager
- Node.js 18+ (will be installed if not present)
- Terminal/Command line access

## 🎯 Quick Start (Recommended)

### Option 1: Full Automated Setup

```bash
# Make the script executable
chmod +x setup-database.sh

# Run the complete setup
./setup-database.sh
```

This script will:
- ✅ Install PostgreSQL
- ✅ Create database and user
- ✅ Install dependencies
- ✅ Setup Prisma
- ✅ Seed database with initial data
- ✅ Verify everything is working

### Option 2: PostgreSQL Only Setup

```bash
# Make the script executable
chmod +x setup-postgres-only.sh

# Run PostgreSQL setup only
./setup-postgres-only.sh

# Then manually run:
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

## 🔧 Manual Setup Steps

If you prefer to run commands manually:

### 1. Install PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql
```

### 2. Create Database and User

```bash
# Connect to PostgreSQL
psql postgres

# Run these SQL commands:
CREATE USER postgres WITH PASSWORD 'postgres';
ALTER USER postgres WITH SUPERUSER;
CREATE DATABASE pmo_db;
GRANT ALL PRIVILEGES ON DATABASE pmo_db TO postgres;
\q
```

### 3. Setup Environment

```bash
# Copy environment template
cp env.example .env.local

# The .env.local file will contain:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pmo_db"
# JWT_SECRET="pmo-super-secret-jwt-key-2024-change-this-in-production"
# NODE_ENV="development"
```

### 4. Install Dependencies and Setup Database

```bash
# Install npm packages
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with initial data
npm run db:seed
```

### 5. Start Application

```bash
# Start the development server
npm run dev
```

## 🧪 Testing Your Setup

```bash
# Make the test script executable
chmod +x test-database.sh

# Run database tests
./test-database.sh
```

This will verify:
- ✅ PostgreSQL service is running
- ✅ Database connection works
- ✅ All tables exist
- ✅ Data is properly seeded
- ✅ Environment configuration is correct

## 🔄 Database Management

### Backup Database

```bash
# Make backup script executable
chmod +x backup-database.sh

# Create backup
./backup-database.sh
```

This creates:
- Full database backup
- Schema-only backup
- Data-only backup
- Compressed backup
- Automatically cleans old backups (keeps last 10)

### Restore Database

```bash
# Make restore script executable
chmod +x restore-database.sh

# Restore from latest backup
./restore-database.sh

# Or restore from specific backup
./restore-database.sh backups/pmo_db_backup_20241201_120000.sql
```

## 🚫 Troubleshooting

### Port 3000 Already in Use

```bash
# Make kill script executable
chmod +x kill-port-3000.sh

# Kill processes on port 3000
./kill-port-3000.sh

# Then start your application
npm run dev
```

### PostgreSQL Connection Issues

```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql

# Check if you can connect
psql postgres
```

### Database Reset

```bash
# Reset database completely
npm run db:reset

# Or manually drop and recreate
psql postgres -c "DROP DATABASE IF EXISTS pmo_db;"
psql postgres -c "CREATE DATABASE pmo_db;"
npm run db:push
npm run db:seed
```

## 📊 Default Login Credentials

After setup, you can login with:

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@projecthub.com | admin123 |
| Project Manager | pm@projecthub.com | pm123 |
| Field Engineer | engineer@projecthub.com | engineer123 |
| IT Developer | developer@projecthub.com | developer123 |
| Client | client@projecthub.com | client123 |

## 🌐 Application Access

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## 📁 File Structure

```
pmo/
├── setup-database.sh          # Full automated setup
├── setup-postgres-only.sh     # PostgreSQL setup only
├── test-database.sh           # Database testing
├── backup-database.sh         # Database backup
├── restore-database.sh        # Database restore
├── kill-port-3000.sh          # Kill port 3000 processes
├── env.example                # Environment template
├── .env.local                 # Environment config (created)
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
└── backups/                   # Database backups (created)
```

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Use strong database passwords in production
- Enable SSL for database connections in production
- Regular database backups are recommended

## 🆘 Getting Help

If you encounter issues:

1. Run `./test-database.sh` to diagnose problems
2. Check the logs in `dev.log` or `next-dev.log`
3. Verify PostgreSQL is running: `brew services list | grep postgresql`
4. Check port 3000 is free: `lsof -i:3000`

## 🎉 Success!

Once everything is set up, you should see:

```
✅ PMO Database Setup Complete!
🚀 To start the application: npm run dev
🌐 Application will be available at: http://localhost:3000
```

Happy coding! 🚀
