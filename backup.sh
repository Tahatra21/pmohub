#!/bin/bash

# PMO Hub Quick Backup Script
# Usage: ./backup.sh [description]

set -e

DESCRIPTION=${1:-"manual_backup"}
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)_$DESCRIPTION"

echo "💾 PMO Hub Quick Backup Script"
echo "=============================="
echo "Backup directory: $BACKUP_DIR"
echo "Description: $DESCRIPTION"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Database backup
echo "🗄️  Backing up PMO database..."
pg_dump -h localhost -U postgres -d pmo_db > "$BACKUP_DIR/pmo_db_backup.sql"

echo "🗄️  Backing up Lifecycle database..."
pg_dump -h localhost -U postgres -d lifecycle_db > "$BACKUP_DIR/lifecycle_db_backup.sql"

# Code backup
echo "📁 Backing up code..."
tar -czf "$BACKUP_DIR/code_backup.tar.gz" --exclude=node_modules --exclude=.next --exclude=backups .

# Configuration backup
echo "⚙️  Backing up configuration..."
cp package.json "$BACKUP_DIR/"
cp package-lock.json "$BACKUP_DIR/"
[ -f .env.local ] && cp .env.local "$BACKUP_DIR/"

# Create backup info
cat > "$BACKUP_DIR/backup_info.txt" << EOF
PMO Hub Backup Information
==========================
Date: $(date)
Description: $DESCRIPTION
Git Commit: $(git rev-parse HEAD)
Git Branch: $(git branch --show-current)
Git Status: $(git status --porcelain | wc -l) files changed

Database Status:
- PMO DB: $(psql -h localhost -U postgres -d pmo_db -t -c "SELECT COUNT(*) FROM tbl_produk_lifecycle;" 2>/dev/null || echo "N/A") products
- Lifecycle DB: $(psql -h localhost -U postgres -d lifecycle_db -t -c "SELECT COUNT(*) FROM tbl_produk;" 2>/dev/null || echo "N/A") products

Files in backup:
- pmo_db_backup.sql
- lifecycle_db_backup.sql
- code_backup.tar.gz
- package.json
- package-lock.json
- .env.local (if exists)
EOF

echo "✅ Backup completed successfully!"
echo "📁 Backup location: $BACKUP_DIR"
echo "📋 Backup info saved to: $BACKUP_DIR/backup_info.txt"
echo ""
echo "🔄 To restore this backup, run:"
echo "   ./rollback.sh $BACKUP_DIR"
