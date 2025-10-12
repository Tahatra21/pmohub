#!/bin/bash

# PMO Database Test Script
# This script tests the database connection and verifies setup

set -e  # Exit on any error

echo "🧪 PMO Database Test"
echo "==================="

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

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_fail() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
DB_NAME="pmo_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
CONNECTION_STRING="postgresql://$DB_USER:postgres@$DB_HOST:$DB_PORT/$DB_NAME"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "PASSED"
        ((TESTS_PASSED++))
        return 0
    else
        print_fail "FAILED"
        ((TESTS_FAILED++))
        return 1
    fi
}

print_step "1. Testing PostgreSQL Service..."

# Test if PostgreSQL service is running
if brew services list | grep postgresql | grep -q "started"; then
    print_success "PostgreSQL service is running"
else
    print_error "PostgreSQL service is not running"
    echo "Run: brew services start postgresql"
    exit 1
fi

print_step "2. Testing Database Connection..."

# Test basic connection
run_test "Basic connection" "psql '$CONNECTION_STRING' -c 'SELECT 1;'"

# Test if database exists
run_test "Database exists" "psql '$CONNECTION_STRING' -c 'SELECT current_database();'"

print_step "3. Testing Database Schema..."

# Test if tables exist
run_test "Users table exists" "psql '$CONNECTION_STRING' -c 'SELECT 1 FROM tbl_users LIMIT 1;'"
run_test "Roles table exists" "psql '$CONNECTION_STRING' -c 'SELECT 1 FROM tbl_roles LIMIT 1;'"
run_test "Projects table exists" "psql '$CONNECTION_STRING' -c 'SELECT 1 FROM tbl_projects LIMIT 1;'"
run_test "Tasks table exists" "psql '$CONNECTION_STRING' -c 'SELECT 1 FROM tbl_tasks LIMIT 1;'"
run_test "Milestones table exists" "psql '$CONNECTION_STRING' -c 'SELECT 1 FROM tbl_milestones LIMIT 1;'"
run_test "Resources table exists" "psql '$CONNECTION_STRING' -c 'SELECT 1 FROM tbl_resources LIMIT 1;'"
run_test "Budgets table exists" "psql '$CONNECTION_STRING' -c 'SELECT 1 FROM tbl_budgets LIMIT 1;'"
run_test "Risks table exists" "psql '$CONNECTION_STRING' -c 'SELECT 1 FROM tbl_risks LIMIT 1;'"
run_test "Documents table exists" "psql '$CONNECTION_STRING' -c 'SELECT 1 FROM tbl_documents LIMIT 1;'"
run_test "Activity logs table exists" "psql '$CONNECTION_STRING' -c 'SELECT 1 FROM tbl_activity_logs LIMIT 1;'"

print_step "4. Testing Database Data..."

# Test if data exists
run_test "Users data exists" "psql '$CONNECTION_STRING' -c 'SELECT COUNT(*) FROM tbl_users;'"
run_test "Roles data exists" "psql '$CONNECTION_STRING' -c 'SELECT COUNT(*) FROM tbl_roles;'"

print_step "5. Testing Database Performance..."

# Test query performance
run_test "Simple query performance" "psql '$CONNECTION_STRING' -c 'EXPLAIN SELECT * FROM tbl_users LIMIT 1;'"

print_step "6. Testing Database Permissions..."

# Test if user can create tables
run_test "Create permission" "psql '$CONNECTION_STRING' -c 'CREATE TEMP TABLE test_table (id INT);'"

# Test if user can insert data
run_test "Insert permission" "psql '$CONNECTION_STRING' -c 'INSERT INTO test_table VALUES (1) ON CONFLICT DO NOTHING;'"

# Test if user can select data
run_test "Select permission" "psql '$CONNECTION_STRING' -c 'SELECT * FROM test_table;'"

print_step "7. Testing Environment Configuration..."

# Test if .env.local exists
if [ -f ".env.local" ]; then
    print_success ".env.local file exists"
    ((TESTS_PASSED++))
else
    print_fail ".env.local file missing"
    ((TESTS_FAILED++))
fi

# Test if DATABASE_URL is set
if grep -q "DATABASE_URL" .env.local 2>/dev/null; then
    print_success "DATABASE_URL is configured"
    ((TESTS_PASSED++))
else
    print_fail "DATABASE_URL is not configured"
    ((TESTS_FAILED++))
fi

# Test if JWT_SECRET is set
if grep -q "JWT_SECRET" .env.local 2>/dev/null; then
    print_success "JWT_SECRET is configured"
    ((TESTS_PASSED++))
else
    print_fail "JWT_SECRET is not configured"
    ((TESTS_FAILED++))
fi

print_step "8. Testing Prisma Configuration..."

# Test if Prisma schema exists
if [ -f "prisma/schema.prisma" ]; then
    print_success "Prisma schema exists"
    ((TESTS_PASSED++))
else
    print_fail "Prisma schema missing"
    ((TESTS_FAILED++))
fi

# Test if Prisma client can be generated
run_test "Prisma client generation" "npm run db:generate"

print_step "9. Testing Application Dependencies..."

# Test if node_modules exists
if [ -d "node_modules" ]; then
    print_success "Node modules installed"
    ((TESTS_PASSED++))
else
    print_fail "Node modules not installed"
    ((TESTS_FAILED++))
fi

# Test if package.json exists
if [ -f "package.json" ]; then
    print_success "Package.json exists"
    ((TESTS_PASSED++))
else
    print_fail "Package.json missing"
    ((TESTS_FAILED++))
fi

print_step "10. Database Statistics..."

# Get database statistics
echo ""
print_status "Database Statistics:"
echo "========================"

# Get table counts
USER_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_users;" | xargs)
ROLE_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_roles;" | xargs)
PROJECT_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_projects;" | xargs)
TASK_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_tasks;" | xargs)
MILESTONE_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_milestones;" | xargs)
RESOURCE_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_resources;" | xargs)
BUDGET_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_budgets;" | xargs)
RISK_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_risks;" | xargs)
DOCUMENT_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_documents;" | xargs)
ACTIVITY_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_activity_logs;" | xargs)

echo "   Users: $USER_COUNT"
echo "   Roles: $ROLE_COUNT"
echo "   Projects: $PROJECT_COUNT"
echo "   Tasks: $TASK_COUNT"
echo "   Milestones: $MILESTONE_COUNT"
echo "   Resources: $RESOURCE_COUNT"
echo "   Budgets: $BUDGET_COUNT"
echo "   Risks: $RISK_COUNT"
echo "   Documents: $DOCUMENT_COUNT"
echo "   Activity Logs: $ACTIVITY_COUNT"

# Get database size
DB_SIZE=$(psql "$CONNECTION_STRING" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" | xargs)
echo "   Database Size: $DB_SIZE"

echo ""
echo "=================================="
echo "📊 Test Results Summary"
echo "=================================="
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Database is ready.${NC}"
    echo ""
    echo "🚀 You can now start the application with:"
    echo "   npm run dev"
    echo ""
    echo "🌐 Application will be available at:"
    echo "   http://localhost:3000"
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Please check the errors above.${NC}"
    echo ""
    echo "🔧 Common fixes:"
    echo "   1. Run: ./setup-database.sh"
    echo "   2. Run: npm run db:push"
    echo "   3. Run: npm run db:seed"
fi

echo ""
