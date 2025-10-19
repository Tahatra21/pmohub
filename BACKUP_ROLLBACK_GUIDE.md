# PMO Hub Backup & Rollback Guide

## 📋 Overview
This guide provides comprehensive backup and rollback strategies for PMO Hub to ensure safe updates and quick recovery.

## 🔄 Current Stable State
- **Git Tag**: `v1.0-stable`
- **Commit**: `f023313`
- **Status**: Product Lifecycle working with 211 products synced
- **Backup Date**: 2025-10-19 19:08:55

## 💾 Backup Strategies

### 1. Git Tag Backup
```bash
# Create stable tag
git tag -a v1.0-stable -m "Stable version before updates"

# Push tag to GitHub
git push origin v1.0-stable

# Rollback to stable version
git checkout v1.0-stable
```

### 2. Database Backup
```bash
# Manual database backup
pg_dump -h localhost -U postgres -d pmo_db > pmo_db_backup.sql
pg_dump -h localhost -U postgres -d lifecycle_db > lifecycle_db_backup.sql

# Restore database
psql -h localhost -U postgres -d pmo_db < pmo_db_backup.sql
psql -h localhost -U postgres -d lifecycle_db < lifecycle_db_backup.sql
```

### 3. Quick Backup Script
```bash
# Create backup with description
./backup.sh "before_feature_update"

# List available backups
ls -la backups/
```

### 4. Full Rollback Script
```bash
# Full rollback (code + database)
./rollback.sh backups/20251019_190855

# Database only rollback
./rollback.sh backups/20251019_190855
# Choose option 2

# Code only rollback
./rollback.sh backups/20251019_190855
# Choose option 3

# Git rollback to stable tag
./rollback.sh
# Choose option 4
```

## 🚨 Emergency Rollback Procedures

### Scenario 1: Application Won't Start
```bash
# Quick Git rollback
git checkout v1.0-stable
npm install
npm run dev
```

### Scenario 2: Database Corruption
```bash
# Restore database only
./rollback.sh backups/20251019_190855
# Choose option 2
```

### Scenario 3: Code Issues After Update
```bash
# Full rollback
./rollback.sh backups/20251019_190855
# Choose option 1
```

### Scenario 4: Complete System Failure
```bash
# Git rollback + database restore
git checkout v1.0-stable
./rollback.sh backups/20251019_190855
# Choose option 2
```

## 📊 Current System State

### Database Status
- **PMO DB**: 211 products in `tbl_produk_lifecycle`
- **Lifecycle DB**: 211 products in `tbl_produk`
- **Segments**: 5 segments synced
- **Stages**: 4 stages synced
- **Stage History**: 45 records synced

### Key Features Working
- ✅ Product Lifecycle data display
- ✅ Authentication system
- ✅ Permission management
- ✅ File upload functionality
- ✅ Data synchronization
- ✅ All PMO modules (Projects, Tasks, Resources, Budget)

### API Endpoints Working
- ✅ `/api/lifecycle/products` - 211 products
- ✅ `/api/lifecycle/dropdowns` - Segments, stages, categories
- ✅ All CRUD operations functional

## 🔧 Maintenance Commands

### Before Any Update
```bash
# Create backup
./backup.sh "before_$(date +%Y%m%d_%H%M%S)"

# Check current status
git status
git log --oneline -5
```

### After Update Verification
```bash
# Test Product Lifecycle
curl -X GET "http://localhost:3000/api/lifecycle/products?page=1&limit=5"

# Check database
psql -h localhost -U postgres -d pmo_db -c "SELECT COUNT(*) FROM tbl_produk_lifecycle;"

# Test authentication
curl -X POST "http://localhost:3000/api/auth/login" -H "Content-Type: application/json" -d '{"email": "admin@test.com", "password": "password123"}'
```

### If Issues Found
```bash
# Immediate rollback
./rollback.sh backups/[latest_backup]
```

## 📁 Backup Directory Structure
```
backups/
├── 20251019_190855/                 # Initial stable backup
│   ├── pmo_db_backup.sql           # PMO database dump
│   ├── lifecycle_db_backup.sql      # Lifecycle database dump
│   ├── code_backup.tar.gz          # Complete code backup
│   ├── package.json                 # Dependencies
│   ├── package-lock.json           # Lock file
│   ├── .env.local                   # Environment config
│   └── backup_info.txt              # Backup metadata
├── backup.sh                        # Quick backup script
└── rollback.sh                      # Rollback script
```

## ⚠️ Important Notes

1. **Always backup before updates**: Use `./backup.sh "description"`
2. **Test after updates**: Verify all features work
3. **Keep multiple backups**: Don't overwrite stable backups
4. **Document changes**: Note what was updated
5. **Monitor logs**: Check for errors after rollback

## 🆘 Emergency Contacts
- **GitHub Repository**: https://github.com/Tahatra21/pmohub.git
- **Stable Tag**: v1.0-stable
- **Latest Commit**: f023313

## 📈 Success Metrics
After successful rollback, verify:
- [ ] Application starts without errors
- [ ] Product Lifecycle shows 211 products
- [ ] Authentication works
- [ ] All modules accessible
- [ ] Database connections stable
- [ ] API endpoints responding
