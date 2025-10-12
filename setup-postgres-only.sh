#!/bin/bash

# PostgreSQL Only Setup Script
# This script only sets up PostgreSQL without the full application setup

set -e  # Exit on any error

echo "🐘 PostgreSQL Setup for PMO"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_step "1. Installing PostgreSQL..."

# Install PostgreSQL if not already installed
if ! command -v psql &> /dev/null; then
    print_status "Installing PostgreSQL via Homebrew..."
    brew install postgresql
else
    print_status "PostgreSQL is already installed"
fi

print_step "2. Starting PostgreSQL service..."

# Stop any existing PostgreSQL service
brew services stop postgresql 2>/dev/null || true

# Start PostgreSQL service
print_status "Starting PostgreSQL service..."
brew services start postgresql

# Wait for service to start
print_status "Waiting for PostgreSQL to start..."
sleep 5

# Check if PostgreSQL is running
if ! brew services list | grep postgresql | grep -q "started"; then
    print_error "Failed to start PostgreSQL service"
    exit 1
fi

print_step "3. Configuring PostgreSQL..."

# Check if we can connect to PostgreSQL
if ! psql postgres -c "SELECT 1;" > /dev/null 2>&1; then
    print_warning "Cannot connect to PostgreSQL. Trying to fix..."
    
    # Try to reset PostgreSQL data directory
    print_status "Resetting PostgreSQL data directory..."
    brew services stop postgresql
    rm -rf $(brew --prefix)/var/postgres
    initdb $(brew --prefix)/var/postgres
    brew services start postgresql
    sleep 5
fi

print_step "4. Creating PMO database and user..."

# Create user and database
print_status "Creating postgres user with password..."
psql postgres -c "DO \$\$ BEGIN CREATE USER postgres WITH PASSWORD 'postgres'; EXCEPTION WHEN duplicate_object THEN null; END \$\$;" || true

print_status "Granting superuser privileges..."
psql postgres -c "ALTER USER postgres WITH SUPERUSER;" || true

print_status "Creating pmo_db database..."
psql postgres -c "SELECT 'CREATE DATABASE pmo_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pmo_db')\gexec" || true

print_status "Granting privileges to postgres user..."
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE pmo_db TO postgres;" || true

print_step "5. Testing database connection..."

# Test database connection
if psql "postgresql://postgres:postgres@localhost:5432/pmo_db" -c "SELECT version();" > /dev/null 2>&1; then
    print_status "Database connection successful!"
else
    print_error "Database connection failed!"
    exit 1
fi

print_step "6. Creating environment file..."

# Create .env.local file
if [ ! -f ".env.local" ]; then
    print_status "Creating .env.local file..."
    cat > .env.local << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pmo_db"

# JWT Secret (Change this in production!)
JWT_SECRET="pmo-super-secret-jwt-key-2024-change-this-in-production"

# Environment
NODE_ENV="development"
EOF
    print_status ".env.local created successfully"
else
    print_warning ".env.local already exists, skipping..."
fi

echo ""
echo "=================================="
echo -e "${GREEN}✅ PostgreSQL Setup Complete!${NC}"
echo "=================================="
echo ""
echo "📊 Database Information:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: pmo_db"
echo "   User: postgres"
echo "   Password: postgres"
echo ""
echo "🔗 Connection String:"
echo "   postgresql://postgres:postgres@localhost:5432/pmo_db"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: npm install"
echo "   2. Run: npm run db:generate"
echo "   3. Run: npm run db:push"
echo "   4. Run: npm run db:seed"
echo "   5. Run: npm run dev"
echo ""
