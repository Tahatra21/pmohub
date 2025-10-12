#!/bin/bash

# PMO Application Quick Start Script
# This script kills existing processes and starts the PMO application

echo "🚀 Starting PMO Application..."
echo "============================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the PMO project root directory"
    exit 1
fi

print_step "1. Killing existing processes on port 3000..."

# Kill any existing processes on port 3000
if lsof -i:3000 > /dev/null 2>&1; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    print_status "Killed existing processes on port 3000"
    sleep 2
else
    print_status "Port 3000 is already free"
fi

print_step "2. Setting up environment..."

# Set up PostgreSQL 17 paths
export PATH="/opt/homebrew/bin:/opt/homebrew/Cellar/postgresql@17/17.6/bin:$PATH"

# Load environment variables
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    print_status "Environment variables loaded"
else
    echo "❌ .env.local file not found. Please run setup first."
    exit 1
fi

print_step "3. Testing database connection..."

# Quick database test
if psql "postgresql://postgres:postgres@localhost:5432/pmo_db" -c "SELECT 1;" > /dev/null 2>&1; then
    print_status "Database connection successful"
else
    echo "❌ Database connection failed. Please check PostgreSQL setup."
    exit 1
fi

print_step "4. Starting PMO application..."

echo ""
print_status "🎉 Application starting..."
print_status "🌐 Frontend: http://localhost:3000"
print_status "🔗 API Health: http://localhost:3000/api/health"
print_status ""
print_status "👤 Login Credentials:"
print_status "   Admin: admin@projecthub.com / admin123"
print_status "   Manager: manager@projecthub.com / manager123"
print_status "   Engineer: engineer@projecthub.com / engineer123"
print_status ""
print_status "📊 Database: Using tbl_ prefix tables"
print_status ""
print_status "Press Ctrl+C to stop the application"
echo ""

# Start the application
npm run dev
