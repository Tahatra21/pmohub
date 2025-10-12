#!/bin/bash

# PMO Application Startup Script
# This script starts the PMO application with proper environment setup

echo "🚀 Starting PMO Application..."
echo "============================="

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the PMO project root directory"
    exit 1
fi

print_step "1. Setting up environment..."

# Set up PostgreSQL 17 paths
export PATH="/opt/homebrew/bin:/opt/homebrew/Cellar/postgresql@17/17.6/bin:$PATH"

# Load environment variables
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    print_status "Environment variables loaded from .env.local"
else
    print_error ".env.local file not found. Please run setup first."
    exit 1
fi

print_step "2. Checking PostgreSQL service..."

# Check if PostgreSQL is running
if ! brew services list | grep postgresql@17 | grep -q "started"; then
    print_warning "PostgreSQL 17 not running. Starting it..."
    brew services start postgresql@17
    sleep 3
fi

print_step "3. Testing database connection..."

# Test database connection
if psql "postgresql://postgres:postgres@localhost:5432/pmo_db" -c "SELECT 1;" > /dev/null 2>&1; then
    print_status "Database connection successful"
else
    print_error "Database connection failed. Please check PostgreSQL setup."
    exit 1
fi

print_step "4. Killing processes on port 3000..."

# Kill any existing processes on port 3000
if lsof -i:3000 > /dev/null 2>&1; then
    print_status "Killing existing processes on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

print_step "5. Starting PMO application..."

print_status "Application will be available at: http://localhost:3000"
print_status "API health check: http://localhost:3000/api/health"
print_status ""
print_status "Default login credentials:"
print_status "  Admin: admin@projecthub.com / admin123"
print_status "  Manager: manager@projecthub.com / manager123"
print_status "  Engineer: engineer@projecthub.com / engineer123"
print_status ""
print_status "Press Ctrl+C to stop the application"
print_status ""

# Start the application
npm run dev
