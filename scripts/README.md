# Scripts Documentation

This folder contains various utility scripts and documentation for the PMO application.

## 📁 Contents

### 🔧 Utility Scripts
- `cleanup-analyzer.js` - Code cleanup analysis tool
- `cleanup-analyzer-refined.js` - Enhanced cleanup analysis
- `cleanup-analyzer-import-aware.js` - Import-aware cleanup analysis
- `cleanup-dryrun.ts` - Safe deletion simulation
- `verify-safe-removal.ts` - Post-deletion verification
- `database-safety-check.ts` - Database integrity checks
- `encrypt_ids_pmo.ts` - ID encryption utility
- `import_cost_data.ts` - Cost data import tool
- `migration-validation.ts` - Database migration validation
- `seed-cost-estimator.ts` - Cost estimator data seeding
- `seed-hjt-tables.ts` - HJT tables data seeding
- `sync_lifecycle_to_pmo.ts` - Lifecycle data synchronization

### 📚 Documentation Files
- `PERMISSION_SYSTEM.md` - Role-based access control documentation
- `USER_MANAGEMENT.md` - User management system documentation
- `API_DOCUMENTATION.md` - Complete API endpoints documentation
- `DEPLOYMENT_MAINTENANCE.md` - Deployment and maintenance guide

## 🚀 Quick Start

### Running Utility Scripts
```bash
# Database safety check
npx tsx scripts/database-safety-check.ts

# Cleanup analysis
node scripts/cleanup-analyzer-import-aware.js

# Migration validation
npx tsx scripts/migration-validation.ts

# Data seeding
npx tsx scripts/seed-cost-estimator.ts
```

### Reading Documentation
```bash
# View permission system docs
cat scripts/PERMISSION_SYSTEM.md

# View API documentation
cat scripts/API_DOCUMENTATION.md

# View deployment guide
cat scripts/DEPLOYMENT_MAINTENANCE.md
```

## 📋 Script Categories

### 🧹 Cleanup Scripts
These scripts help maintain code quality and remove unused files:

- **cleanup-analyzer.js** - Basic cleanup analysis
- **cleanup-analyzer-refined.js** - Enhanced analysis with better detection
- **cleanup-analyzer-import-aware.js** - Most accurate analysis considering imports
- **cleanup-dryrun.ts** - Safe simulation of file deletions
- **verify-safe-removal.ts** - Verification after cleanup operations

### 🗄️ Database Scripts
These scripts handle database operations and data management:

- **database-safety-check.ts** - Database integrity and safety checks
- **encrypt_ids_pmo.ts** - Encrypt sensitive ID fields
- **migration-validation.ts** - Validate database migrations
- **seed-cost-estimator.ts** - Seed cost estimator data
- **seed-hjt-tables.ts** - Seed HJT tables data
- **sync_lifecycle_to_pmo.ts** - Synchronize lifecycle data

### 📊 Data Import Scripts
These scripts handle data import and synchronization:

- **import_cost_data.ts** - Import cost data from external sources

## 🔒 Security Considerations

### Script Execution
- Always review scripts before execution
- Run in development environment first
- Backup data before running destructive operations
- Use dry-run options when available

### Database Scripts
- Ensure database backups are current
- Test scripts on non-production data first
- Monitor database performance during execution
- Verify data integrity after script completion

## 📖 Documentation Overview

### PERMISSION_SYSTEM.md
Comprehensive guide to the role-based access control system:
- Role definitions and permissions
- Menu access control
- API protection mechanisms
- Implementation details
- Testing procedures

### USER_MANAGEMENT.md
Complete documentation for user management features:
- System features and components
- API endpoints for user operations
- Security features and password policies
- Database schema
- Usage guide and troubleshooting

### API_DOCUMENTATION.md
Detailed API reference for all endpoints:
- Authentication methods
- User management APIs
- Project and task management APIs
- Financial management APIs
- Product management APIs
- Error handling and rate limiting

### DEPLOYMENT_MAINTENANCE.md
Production deployment and maintenance guide:
- System requirements
- Deployment procedures
- Database management
- Monitoring and logging
- Backup and recovery
- Security maintenance
- Performance optimization

## 🛠️ Development Workflow

### Before Running Scripts
1. Review script documentation
2. Check current system state
3. Create backups if needed
4. Test in development environment

### After Running Scripts
1. Verify script completion
2. Check system functionality
3. Review logs for errors
4. Update documentation if needed

### Script Maintenance
1. Keep scripts updated with codebase changes
2. Test scripts regularly
3. Document any modifications
4. Remove obsolete scripts

## 🚨 Emergency Procedures

### If Script Fails
1. Stop script execution immediately
2. Check system state and logs
3. Restore from backup if necessary
4. Report issue to development team

### Database Script Issues
1. Check database connectivity
2. Verify backup integrity
3. Review database logs
4. Consider rollback procedures

### Cleanup Script Issues
1. Check file system state
2. Verify application functionality
3. Restore deleted files if needed
4. Review cleanup analysis results

## 📞 Support

For issues with scripts or documentation:
1. Check script logs and error messages
2. Review relevant documentation
3. Test in development environment
4. Contact development team with detailed information

## 🔄 Version History

- **v1.0** (October 21, 2025)
  - Initial script collection
  - Complete documentation set
  - Permission system implementation
  - User management system
  - API documentation
  - Deployment guide

---

**Last Updated**: October 21, 2025  
**Version**: 1.0  
**Maintainer**: PMO Development Team
