#!/bin/bash

# PMO Database Backup Script
# This script creates backups of the PMO database

set -e  # Exit on any error

echo "💾 PMO Database Backup"
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
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

print_step "1. Creating backup directory..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
print_status "Backup directory: $BACKUP_DIR"

print_step "2. Testing database connection..."

# Test database connection
if ! psql "postgresql://$DB_USER:postgres@$DB_HOST:$DB_PORT/$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    print_error "Cannot connect to database. Please check your PostgreSQL setup."
    exit 1
fi

print_step "3. Creating database backup..."

# Create backup filename
BACKUP_FILE="$BACKUP_DIR/pmo_db_backup_$TIMESTAMP.sql"

print_status "Creating backup: $BACKUP_FILE"

# Create backup
pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" > "$BACKUP_FILE"

# Check if backup was created successfully
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    print_status "Backup created successfully!"
    
    # Get backup size
    BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    print_status "Backup size: $BACKUP_SIZE"
else
    print_error "Backup creation failed!"
    exit 1
fi

print_step "4. Creating schema-only backup..."

# Create schema-only backup
SCHEMA_BACKUP_FILE="$BACKUP_DIR/pmo_db_schema_$TIMESTAMP.sql"
pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" --schema-only > "$SCHEMA_BACKUP_FILE"

if [ -f "$SCHEMA_BACKUP_FILE" ] && [ -s "$SCHEMA_BACKUP_FILE" ]; then
    print_status "Schema backup created: $SCHEMA_BACKUP_FILE"
fi

print_step "5. Creating data-only backup..."

# Create data-only backup
DATA_BACKUP_FILE="$BACKUP_DIR/pmo_db_data_$TIMESTAMP.sql"
pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" --data-only > "$DATA_BACKUP_FILE"

if [ -f "$DATA_BACKUP_FILE" ] && [ -s "$DATA_BACKUP_FILE" ]; then
    print_status "Data backup created: $DATA_BACKUP_FILE"
fi

print_step "6. Creating compressed backup..."

# Create compressed backup
COMPRESSED_BACKUP_FILE="$BACKUP_DIR/pmo_db_backup_$TIMESTAMP.tar.gz"
tar -czf "$COMPRESSED_BACKUP_FILE" -C "$BACKUP_DIR" "pmo_db_backup_$TIMESTAMP.sql"

if [ -f "$COMPRESSED_BACKUP_FILE" ]; then
    COMPRESSED_SIZE=$(ls -lh "$COMPRESSED_BACKUP_FILE" | awk '{print $5}')
    print_status "Compressed backup created: $COMPRESSED_BACKUP_FILE ($COMPRESSED_SIZE)"
fi

print_step "7. Cleaning up old backups..."

# Keep only the last 10 backups
cd "$BACKUP_DIR"
ls -t pmo_db_backup_*.sql 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
ls -t pmo_db_schema_*.sql 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
ls -t pmo_db_data_*.sql 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
ls -t pmo_db_backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true

print_status "Old backups cleaned up (keeping last 10)"

print_step "8. Listing current backups..."

# List current backups
echo ""
print_status "Current backups in $BACKUP_DIR:"
ls -lh "$BACKUP_DIR"/pmo_db_* 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}' || print_warning "No backups found"

echo ""
echo "=================================="
echo -e "${GREEN}✅ Database Backup Complete!${NC}"
echo "=================================="
echo ""
echo "📁 Backup files created:"
echo "   Full backup: $BACKUP_FILE"
echo "   Schema backup: $SCHEMA_BACKUP_FILE"
echo "   Data backup: $DATA_BACKUP_FILE"
echo "   Compressed: $COMPRESSED_BACKUP_FILE"
echo ""
echo "🔄 To restore from backup:"
echo "   psql -U postgres -d pmo_db -f $BACKUP_FILE"
echo ""
echo "📋 To restore schema only:"
echo "   psql -U postgres -d pmo_db -f $SCHEMA_BACKUP_FILE"
echo ""
echo "📋 To restore data only:"
echo "   psql -U postgres -d pmo_db -f $DATA_BACKUP_FILE"
echo ""
