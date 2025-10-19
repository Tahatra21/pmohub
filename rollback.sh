#!/bin/bash

# PMO Hub Rollback Script
# Usage: ./rollback.sh [backup_directory]

set -e

BACKUP_DIR=${1:-"backups/20251019_190855"}

echo "🔄 PMO Hub Rollback Script"
echo "=========================="
echo "Backup directory: $BACKUP_DIR"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: Backup directory '$BACKUP_DIR' not found!"
    echo "Available backups:"
    ls -la backups/ 2>/dev/null || echo "No backups found"
    exit 1
fi

echo "📋 Rollback Options:"
echo "1. Full rollback (code + database)"
echo "2. Database only"
echo "3. Code only"
echo "4. Git rollback to stable tag"
echo ""
read -p "Choose option (1-4): " choice

case $choice in
    1)
        echo "🔄 Starting full rollback..."
        
        # Stop application if running
        echo "⏹️  Stopping application..."
        pkill -f "next dev" || true
        
        # Restore code
        echo "📁 Restoring code..."
        tar -xzf "$BACKUP_DIR/code_backup.tar.gz"
        
        # Restore database
        echo "🗄️  Restoring PMO database..."
        psql -h localhost -U postgres -d pmo_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>/dev/null || true
        psql -h localhost -U postgres -d pmo_db < "$BACKUP_DIR/pmo_db_backup.sql"
        
        echo "🗄️  Restoring Lifecycle database..."
        psql -h localhost -U postgres -d lifecycle_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>/dev/null || true
        psql -h localhost -U postgres -d lifecycle_db < "$BACKUP_DIR/lifecycle_db_backup.sql"
        
        # Restore configuration
        echo "⚙️  Restoring configuration..."
        cp "$BACKUP_DIR/package.json" ./
        cp "$BACKUP_DIR/package-lock.json" ./
        [ -f "$BACKUP_DIR/.env.local" ] && cp "$BACKUP_DIR/.env.local" ./
        
        # Reinstall dependencies
        echo "📦 Installing dependencies..."
        npm install
        
        echo "✅ Full rollback completed!"
        ;;
        
    2)
        echo "🗄️  Starting database rollback..."
        
        echo "🗄️  Restoring PMO database..."
        psql -h localhost -U postgres -d pmo_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>/dev/null || true
        psql -h localhost -U postgres -d pmo_db < "$BACKUP_DIR/pmo_db_backup.sql"
        
        echo "🗄️  Restoring Lifecycle database..."
        psql -h localhost -U postgres -d lifecycle_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>/dev/null || true
        psql -h localhost -U postgres -d lifecycle_db < "$BACKUP_DIR/lifecycle_db_backup.sql"
        
        echo "✅ Database rollback completed!"
        ;;
        
    3)
        echo "📁 Starting code rollback..."
        
        # Stop application if running
        echo "⏹️  Stopping application..."
        pkill -f "next dev" || true
        
        # Restore code
        echo "📁 Restoring code..."
        tar -xzf "$BACKUP_DIR/code_backup.tar.gz"
        
        # Restore configuration
        echo "⚙️  Restoring configuration..."
        cp "$BACKUP_DIR/package.json" ./
        cp "$BACKUP_DIR/package-lock.json" ./
        [ -f "$BACKUP_DIR/.env.local" ] && cp "$BACKUP_DIR/.env.local" ./
        
        # Reinstall dependencies
        echo "📦 Installing dependencies..."
        npm install
        
        echo "✅ Code rollback completed!"
        ;;
        
    4)
        echo "🔄 Starting Git rollback to stable tag..."
        
        # Stop application if running
        echo "⏹️  Stopping application..."
        pkill -f "next dev" || true
        
        # Rollback to stable tag
        echo "🔄 Rolling back to v1.0-stable..."
        git checkout v1.0-stable
        
        # Reinstall dependencies
        echo "📦 Installing dependencies..."
        npm install
        
        echo "✅ Git rollback completed!"
        ;;
        
    *)
        echo "❌ Invalid option. Exiting..."
        exit 1
        ;;
esac

echo ""
echo "🚀 Rollback completed! You can now start the application with:"
echo "   npm run dev"
echo ""
echo "📋 To verify the rollback:"
echo "   - Check Product Lifecycle menu for 211 products"
echo "   - Verify all modules are working"
echo "   - Test authentication and permissions"
