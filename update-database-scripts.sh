#!/bin/bash

# Update Database Scripts for tbl_ prefix
# This script updates all database management scripts to use tbl_ prefix

echo "🔄 Updating Database Scripts for tbl_ prefix"
echo "=========================================="

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

print_step "1. Updating backup-database.sh..."

# Update backup script to use tbl_ prefix
sed -i '' 's/FROM users/FROM tbl_users/g' backup-database.sh
sed -i '' 's/FROM roles/FROM tbl_roles/g' backup-database.sh
sed -i '' 's/FROM projects/FROM tbl_projects/g' backup-database.sh
sed -i '' 's/FROM tasks/FROM tbl_tasks/g' backup-database.sh
sed -i '' 's/FROM milestones/FROM tbl_milestones/g' backup-database.sh
sed -i '' 's/FROM resources/FROM tbl_resources/g' backup-database.sh
sed -i '' 's/FROM budgets/FROM tbl_budgets/g' backup-database.sh
sed -i '' 's/FROM risks/FROM tbl_risks/g' backup-database.sh
sed -i '' 's/FROM documents/FROM tbl_documents/g' backup-database.sh
sed -i '' 's/FROM activity_logs/FROM tbl_activity_logs/g' backup-database.sh

print_status "Backup script updated"

print_step "2. Updating test-database.sh..."

# Update test script to use tbl_ prefix
sed -i '' 's/FROM users/FROM tbl_users/g' test-database.sh
sed -i '' 's/FROM roles/FROM tbl_roles/g' test-database.sh
sed -i '' 's/FROM projects/FROM tbl_projects/g' test-database.sh
sed -i '' 's/FROM tasks/FROM tbl_tasks/g' test-database.sh
sed -i '' 's/FROM milestones/FROM tbl_milestones/g' test-database.sh
sed -i '' 's/FROM resources/FROM tbl_resources/g' test-database.sh
sed -i '' 's/FROM budgets/FROM tbl_budgets/g' test-database.sh
sed -i '' 's/FROM risks/FROM tbl_risks/g' test-database.sh
sed -i '' 's/FROM documents/FROM tbl_documents/g' test-database.sh
sed -i '' 's/FROM activity_logs/FROM tbl_activity_logs/g' test-database.sh

print_status "Test script updated"

print_step "3. Updating restore-database.sh..."

# Update restore script to use tbl_ prefix
sed -i '' 's/FROM users/FROM tbl_users/g' restore-database.sh
sed -i '' 's/FROM roles/FROM tbl_roles/g' restore-database.sh
sed -i '' 's/FROM projects/FROM tbl_projects/g' restore-database.sh
sed -i '' 's/FROM tasks/FROM tbl_tasks/g' restore-database.sh
sed -i '' 's/FROM milestones/FROM tbl_milestones/g' restore-database.sh
sed -i '' 's/FROM resources/FROM tbl_resources/g' restore-database.sh
sed -i '' 's/FROM budgets/FROM tbl_budgets/g' restore-database.sh
sed -i '' 's/FROM risks/FROM tbl_risks/g' restore-database.sh
sed -i '' 's/FROM documents/FROM tbl_documents/g' restore-database.sh
sed -i '' 's/FROM activity_logs/FROM tbl_activity_logs/g' restore-database.sh

print_status "Restore script updated"

print_step "4. Updating setup scripts..."

# Update setup scripts to use tbl_ prefix
sed -i '' 's/FROM users/FROM tbl_users/g' setup-database.sh
sed -i '' 's/FROM roles/FROM tbl_roles/g' setup-database.sh
sed -i '' 's/FROM projects/FROM tbl_projects/g' setup-database.sh
sed -i '' 's/FROM tasks/FROM tbl_tasks/g' setup-database.sh
sed -i '' 's/FROM milestones/FROM tbl_milestones/g' setup-database.sh
sed -i '' 's/FROM resources/FROM tbl_resources/g' setup-database.sh
sed -i '' 's/FROM budgets/FROM tbl_budgets/g' setup-database.sh
sed -i '' 's/FROM risks/FROM tbl_risks/g' setup-database.sh
sed -i '' 's/FROM documents/FROM tbl_documents/g' setup-database.sh
sed -i '' 's/FROM activity_logs/FROM tbl_activity_logs/g' setup-database.sh

sed -i '' 's/FROM users/FROM tbl_users/g' setup-postgres-only.sh
sed -i '' 's/FROM roles/FROM tbl_roles/g' setup-postgres-only.sh
sed -i '' 's/FROM projects/FROM tbl_projects/g' setup-postgres-only.sh
sed -i '' 's/FROM tasks/FROM tbl_tasks/g' setup-postgres-only.sh
sed -i '' 's/FROM milestones/FROM tbl_milestones/g' setup-postgres-only.sh
sed -i '' 's/FROM resources/FROM tbl_resources/g' setup-postgres-only.sh
sed -i '' 's/FROM budgets/FROM tbl_budgets/g' setup-postgres-only.sh
sed -i '' 's/FROM risks/FROM tbl_risks/g' setup-postgres-only.sh
sed -i '' 's/FROM documents/FROM tbl_documents/g' setup-postgres-only.sh
sed -i '' 's/FROM activity_logs/FROM tbl_activity_logs/g' setup-postgres-only.sh

sed -i '' 's/FROM users/FROM tbl_users/g' setup-postgresql17.sh
sed -i '' 's/FROM roles/FROM tbl_roles/g' setup-postgresql17.sh
sed -i '' 's/FROM projects/FROM tbl_projects/g' setup-postgresql17.sh
sed -i '' 's/FROM tasks/FROM tbl_tasks/g' setup-postgresql17.sh
sed -i '' 's/FROM milestones/FROM tbl_milestones/g' setup-postgresql17.sh
sed -i '' 's/FROM resources/FROM tbl_resources/g' setup-postgresql17.sh
sed -i '' 's/FROM budgets/FROM tbl_budgets/g' setup-postgresql17.sh
sed -i '' 's/FROM risks/FROM tbl_risks/g' setup-postgresql17.sh
sed -i '' 's/FROM documents/FROM tbl_documents/g' setup-postgresql17.sh
sed -i '' 's/FROM activity_logs/FROM tbl_activity_logs/g' setup-postgresql17.sh

print_status "Setup scripts updated"

print_step "5. Updating start-pmo.sh..."

# Update start script to use tbl_ prefix
sed -i '' 's/FROM users/FROM tbl_users/g' start-pmo.sh
sed -i '' 's/FROM roles/FROM tbl_roles/g' start-pmo.sh
sed -i '' 's/FROM projects/FROM tbl_projects/g' start-pmo.sh
sed -i '' 's/FROM tasks/FROM tbl_tasks/g' start-pmo.sh
sed -i '' 's/FROM milestones/FROM tbl_milestones/g' start-pmo.sh
sed -i '' 's/FROM resources/FROM tbl_resources/g' start-pmo.sh
sed -i '' 's/FROM budgets/FROM tbl_budgets/g' start-pmo.sh
sed -i '' 's/FROM risks/FROM tbl_risks/g' start-pmo.sh
sed -i '' 's/FROM documents/FROM tbl_documents/g' start-pmo.sh
sed -i '' 's/FROM activity_logs/FROM tbl_activity_logs/g' start-pmo.sh

print_status "Start script updated"

print_step "6. Making scripts executable..."

chmod +x *.sh

print_status "All scripts are now executable"

echo ""
echo "=================================="
echo -e "${GREEN}✅ Database Scripts Updated!${NC}"
echo "=================================="
echo ""
echo "📝 Updated scripts:"
echo "   - backup-database.sh"
echo "   - test-database.sh"
echo "   - restore-database.sh"
echo "   - setup-database.sh"
echo "   - setup-postgres-only.sh"
echo "   - setup-postgresql17.sh"
echo "   - start-pmo.sh"
echo ""
echo "🔧 All scripts now use tbl_ prefix for table names"
echo ""
