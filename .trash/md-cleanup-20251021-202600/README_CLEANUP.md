# PMO Code Cleanup Analysis

This directory contains tools and scripts for safely identifying and removing duplicate files and unused code from the PMO project.

## 🎯 Overview

The cleanup analysis follows a safety-first approach:
1. **Inventory**: Build comprehensive file inventory with content hashes
2. **Detect**: Find exact duplicates and near-duplicates
3. **Analyze**: Generate dependency graph and identify unused files
4. **Validate**: Run dry-run tests before any actual deletion
5. **Report**: Generate detailed reports with evidence and rollback plans

## 📁 Files

### Configuration
- `cleanup.config.json` - Main configuration file
- `cleanup.ignore` - Files that should never be suggested for deletion

### Scripts
- `scripts/cleanup-analyzer.ts` - Main analysis script
- `scripts/cleanup-dryrun.ts` - Dry-run testing script
- `scripts/verify-safe-removal.ts` - Safety verification script

### Reports (Generated)
- `reports/duplicates.json` - Duplicate file groups
- `reports/unused_files.json` - Potentially unused files
- `reports/dependency-graph.svg` - Visual dependency graph
- `reports/public_assets_usage.csv` - Public asset usage mapping
- `reports/safelist.json` - Auto-safelisted files
- `reports/removal_plan.md` - Step-by-step removal plan
- `reports/dryrun-results.md` - Dry-run test results
- `reports/verification-report.md` - Safety verification results

## 🚀 Usage

### 1. Run Analysis
```bash
# Install dependencies (if not already installed)
npm install

# Run the main analysis
npx tsx scripts/cleanup-analyzer.ts
```

### 2. Review Reports
```bash
# Check the generated reports
ls -la reports/

# Review duplicates
cat reports/duplicates.json

# Review unused files
cat reports/unused_files.json

# Review removal plan
cat reports/removal_plan.md
```

### 3. Run Dry-Run Test
```bash
# Test file removal safely
npx tsx scripts/cleanup-dryrun.ts
```

### 4. Verify Safety
```bash
# Verify specific files before removal
npx tsx scripts/verify-safe-removal.ts file1.ts file2.tsx
```

## 🔧 Configuration

### cleanup.config.json
```json
{
  "analysis": {
    "similarityThreshold": 90,
    "excludedDirs": [".next", "dist", "coverage", "node_modules"],
    "entrypoints": ["src/app/**/page.tsx", "src/app/**/layout.tsx"]
  },
  "tools": {
    "madge": true,
    "depcheck": true,
    "tsPrune": true
  }
}
```

### cleanup.ignore
Add patterns for files that should never be suggested for deletion:
```
# Configuration files
next.config.ts
tailwind.config.ts
package.json

# Essential assets
public/favicon.ico
public/icon.png
```

## 📊 Analysis Tools

### Built-in Analysis
- **File Inventory**: SHA-256 hashing for exact duplicates
- **Dependency Graph**: TypeScript-aware import/export analysis
- **Entrypoint Detection**: Next.js App Router conventions
- **Risk Assessment**: Low/Medium/High risk categorization

### External Tools (Optional)
- **madge**: Circular dependency detection
- **depcheck**: Unused dependency detection
- **ts-prune**: Unused export detection
- **ESLint**: Unused import detection

## 🛡️ Safety Measures

### Dry-Run Process
1. Move files to `.trash/` directory instead of deleting
2. Run validation tests after each batch
3. Restore files if validation fails
4. Generate detailed reports

### Validation Checks
- TypeScript compilation (`npx tsc --noEmit`)
- ESLint checks (`npm run lint`)
- Prisma schema validation (`npx prisma validate`)
- Next.js build (`npm run build`)

### Rollback Plan
```bash
# Restore from trash
find .trash/ -type f -exec sh -c 'mv "$1" "${1#*/}"' _ {} \;

# Git rollback
git revert <commit-hash>

# Backup restoration
tar -xzf backup_full_*.tar.gz
```

## 📈 Reports Explained

### duplicates.json
```json
{
  "summary": {
    "totalGroups": 5,
    "totalDuplicates": 12
  },
  "groups": [
    {
      "canonical": "src/components/Button.tsx",
      "members": ["src/components/Button.tsx", "src/ui/Button.tsx"],
      "hash": "abc123..."
    }
  ]
}
```

### unused_files.json
```json
{
  "summary": {
    "totalFiles": 15,
    "byRisk": { "Low": 8, "Medium": 5, "High": 2 }
  },
  "files": [
    {
      "path": "src/utils/old-helper.ts",
      "reason": "No inbound references found",
      "riskLevel": "Low",
      "lastModified": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## 🔄 Workflow

### Development Workflow
1. **Analyze**: Run cleanup analysis
2. **Review**: Check reports and recommendations
3. **Test**: Run dry-run validation
4. **Verify**: Confirm safety of changes
5. **Deploy**: Create PR with actual deletions

### CI/CD Integration
```yaml
# .github/workflows/cleanup.yml
name: Code Cleanup Check
on: [pull_request]
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npx tsx scripts/cleanup-analyzer.ts
      - run: npx tsx scripts/verify-safe-removal.ts
```

## ⚠️ Important Notes

### Never Delete
- Configuration files (`next.config.ts`, `package.json`)
- Essential assets (`favicon.ico`, `robots.txt`)
- Database files (`prisma/schema.prisma`)
- Documentation (`README.md`)

### Always Test
- Run full test suite after cleanup
- Verify application functionality
- Check build process
- Validate database operations

### Keep Backups
- Maintain recent backups
- Keep files in trash directory
- Document all changes
- Have rollback plan ready

## 🐛 Troubleshooting

### Common Issues
1. **Build Failures**: Check TypeScript compilation errors
2. **Missing Dependencies**: Verify import/export relationships
3. **Runtime Errors**: Check dynamic imports and require statements
4. **Asset Issues**: Verify public asset references

### Debug Commands
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check ESLint issues
npm run lint

# Check Prisma schema
npx prisma validate

# Check Next.js build
npm run build
```

## 📞 Support

For issues or questions:
1. Check the generated reports for detailed information
2. Review the removal plan for step-by-step guidance
3. Run verification scripts to identify specific problems
4. Use rollback procedures if needed

## 🔄 Regeneration

To regenerate all reports:
```bash
# Clean previous reports
rm -rf reports/

# Re-run analysis
npx tsx scripts/cleanup-analyzer.ts

# Re-run dry-run
npx tsx scripts/cleanup-dryrun.ts
```
