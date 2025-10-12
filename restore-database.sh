#!/bin/bash

# PMO Database Restore Script
# This script restores the database from a backup file

set -e  # Exit on any error

echo "🔄 PMO Database Restore"
echo "====================="

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

# Configuration
DB_NAME="pmo_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="./backups"

print_step "1. Checking backup directory..."

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    print_error "Backup directory '$BACKUP_DIR' does not exist"
    exit 1
fi

print_step "2. Listing available backups..."

# List available backup files
echo "Available backup files:"
echo "======================"
ls -la "$BACKUP_DIR"/pmo_db_backup_*.sql 2>/dev/null | awk '{print "   " $9 " (" $5 " - " $6 " " $7 " " $8 ")"}' || {
    print_error "No backup files found in $BACKUP_DIR"
    exit 1
}

echo ""

print_step "3. Selecting backup file..."

# If backup file is provided as argument, use it
if [ -n "$1" ]; then
    BACKUP_FILE="$1"
else
    # Get the latest backup file
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/pmo_db_backup_*.sql | head -n 1)
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file '$BACKUP_FILE' does not exist"
    exit 1
fi

print_status "Selected backup file: $BACKUP_FILE"

# Get backup file size
BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
print_status "Backup file size: $BACKUP_SIZE"

print_step "4. Testing database connection..."

# Test database connection
CONNECTION_STRING="postgresql://$DB_USER:postgres@$DB_HOST:$DB_PORT/$DB_NAME"

if ! psql "$CONNECTION_STRING" -c "SELECT 1;" > /dev/null 2>&1; then
    print_error "Cannot connect to database. Please check your PostgreSQL setup."
    exit 1
fi

print_step "5. Creating backup of current database..."

# Create a backup of current database before restore
CURRENT_BACKUP="$BACKUP_DIR/pmo_db_before_restore_$(date +"%Y%m%d_%H%M%S").sql"
print_status "Creating current database backup: $CURRENT_BACKUP"

pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" > "$CURRENT_BACKUP"

if [ -f "$CURRENT_BACKUP" ] && [ -s "$CURRENT_BACKUP" ]; then
    print_status "Current database backup created successfully"
else
    print_warning "Failed to create current database backup"
fi

print_step "6. Dropping existing database..."

# Drop existing database
print_status "Dropping existing database '$DB_NAME'..."
psql postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

print_step "7. Creating new database..."

# Create new database
print_status "Creating new database '$DB_NAME'..."
psql postgres -c "CREATE DATABASE $DB_NAME;"

print_status "Granting privileges to postgres user..."
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

print_step "8. Restoring database from backup..."

# Restore database from backup
print_status "Restoring database from backup..."
psql "$CONNECTION_STRING" -f "$BACKUP_FILE"

print_step "9. Verifying restore..."

# Test if restore was successful
if psql "$CONNECTION_STRING" -c "SELECT COUNT(*) FROM tbl_users;" > /dev/null 2>&1; then
    print_status "Database restore successful!"
else
    print_error "Database restore failed!"
    exit 1
fi

print_step "10. Checking restored data..."

# Get restored data counts
USER_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_users;" | xargs)
ROLE_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_roles;" | xargs)
PROJECT_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_projects;" | xargs)
TASK_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM tbl_tasks;" | xargs)

print_status "Restored data counts:"
echo "   Users: $USER_COUNT"
echo "   Roles: $ROLE_COUNT"
echo "   Projects: $PROJECT_COUNT"
echo "   Tasks: $TASK_COUNT"

print_step "11. Updating Prisma client..."

# Update Prisma client
print_status "Generating Prisma client..."
npm run db:generate

echo ""
echo "=================================="
echo -e "${GREEN}✅ Database Restore Complete!${NC}"
echo "=================================="
echo ""
echo "📊 Restore Information:"
echo "   Source backup: $BACKUP_FILE"
echo "   Database: $DB_NAME"
echo "   Users restored: $USER_COUNT"
echo "   Roles restored: $ROLE_COUNT"
echo "   Projects restored: $PROJECT_COUNT"
echo "   Tasks restored: $TASK_COUNT"
echo ""
echo "🚀 You can now start the application with:"
echo "   npm run dev"
echo ""
echo "🌐 Application will be available at:"
echo "   http://localhost:3000"
echo ""
echo "💾 Backup of previous database:"
echo "   $CURRENT_BACKUP"
echo ""

# Usage instructions
echo "📋 Usage Examples:"
echo "   ./restore-database.sh                                    # Restore from latest backup"
echo "   ./restore-database.sh backups/pmo_db_backup_20241201_120000.sql  # Restore from specific backup"
echo ""
