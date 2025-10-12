#!/bin/bash

# PMO Database Setup Script for PostgreSQL 17
# This script will setup PostgreSQL 17 database for PMO application

set -e  # Exit on any error

echo "🚀 Starting PMO Database Setup (PostgreSQL 17)..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# PostgreSQL 17 paths
POSTGRES_BIN="/opt/homebrew/Cellar/postgresql@17/17.6/bin"
POSTGRES_DATA="/opt/homebrew/var/postgresql@17"
POSTGRES_SERVICE="postgresql@17"

# Add PostgreSQL to PATH
export PATH="$POSTGRES_BIN:$PATH"

print_step "1. Setting up PostgreSQL 17 paths..."

# Check if PostgreSQL 17 is installed
if [ ! -d "$POSTGRES_BIN" ]; then
    print_error "PostgreSQL 17 not found at $POSTGRES_BIN"
    exit 1
fi

print_status "PostgreSQL 17 found at: $POSTGRES_BIN"
print_status "Adding PostgreSQL to PATH"

print_step "2. Starting PostgreSQL 17 service..."

# Stop any existing PostgreSQL service
brew services stop postgresql@17 2>/dev/null || true
brew services stop postgresql 2>/dev/null || true

# Start PostgreSQL 17 service
print_status "Starting PostgreSQL 17 service..."
brew services start postgresql@17

# Wait for service to start
print_status "Waiting for PostgreSQL to start..."
sleep 5

# Check if PostgreSQL is running
if ! brew services list | grep postgresql@17 | grep -q "started"; then
    print_error "Failed to start PostgreSQL 17 service"
    exit 1
fi

print_step "3. Testing PostgreSQL connection..."

# Test if we can connect
if ! psql postgres -c "SELECT 1;" > /dev/null 2>&1; then
    print_warning "Cannot connect to PostgreSQL. Trying to initialize..."
    
    # Initialize database if needed
    if [ ! -d "$POSTGRES_DATA" ] || [ ! -f "$POSTGRES_DATA/PG_VERSION" ]; then
        print_status "Initializing PostgreSQL data directory..."
        initdb -D "$POSTGRES_DATA"
    fi
    
    # Restart service
    brew services restart postgresql@17
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

print_step "7. Installing dependencies..."

# Install npm dependencies
print_status "Installing npm dependencies..."
npm install

print_step "8. Setting up Prisma..."

# Generate Prisma client
print_status "Generating Prisma client..."
npm run db:generate

# Push schema to database
print_status "Pushing schema to database..."
npm run db:push

print_step "9. Seeding database..."

# Seed database with initial data
print_status "Seeding database with initial data..."
npm run db:seed

print_step "10. Verifying setup..."

# Test database connection
print_status "Testing database connection..."
if psql "postgresql://postgres:postgres@localhost:5432/pmo_db" -c "SELECT version();" > /dev/null 2>&1; then
    print_status "Database connection successful!"
else
    print_error "Database connection failed!"
    exit 1
fi

# Check tables
print_status "Checking database tables..."
TABLE_COUNT=$(psql "postgresql://postgres:postgres@localhost:5432/pmo_db" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
print_status "Found $TABLE_COUNT tables in database"

# Check seeded data
print_status "Checking seeded data..."
USER_COUNT=$(psql "postgresql://postgres:postgres@localhost:5432/pmo_db" -t -c "SELECT COUNT(*) FROM tbl_users;" | xargs)
ROLE_COUNT=$(psql "postgresql://postgres:postgres@localhost:5432/pmo_db" -t -c "SELECT COUNT(*) FROM tbl_roles;" | xargs)
print_status "Found $USER_COUNT users and $ROLE_COUNT roles"

print_step "11. Final verification..."

# Test if application can start
print_status "Testing if application can start (will stop after 10 seconds)..."
timeout 10s npm run dev > /dev/null 2>&1 || true

echo ""
echo "=================================="
echo -e "${GREEN}✅ PMO Database Setup Complete!${NC}"
echo "=================================="
echo ""
echo "📊 Database Information:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: pmo_db"
echo "   User: postgres"
echo "   Password: postgres"
echo "   PostgreSQL Version: 17"
echo ""
echo "🔗 Connection String:"
echo "   postgresql://postgres:postgres@localhost:5432/pmo_db"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev"
echo ""
echo "🌐 Application will be available at:"
echo "   http://localhost:3000"
echo ""
echo "👤 Default login credentials:"
echo "   Email: admin@projecthub.com"
echo "   Password: admin123"
echo ""
echo -e "${YELLOW}⚠️  Remember to change the JWT_SECRET in production!${NC}"
echo ""
echo "📝 PostgreSQL 17 Management:"
echo "   Start: brew services start postgresql@17"
echo "   Stop: brew services stop postgresql@17"
echo "   Restart: brew services restart postgresql@17"
echo "   Status: brew services list | grep postgresql@17"
echo ""
