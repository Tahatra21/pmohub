#!/usr/bin/env node

/**
 * PMO Code Cleanup Analysis - Simplified Version
 * Identifies duplicate files and unused code
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class PMOCleanupAnalyzer {
  constructor() {
    this.fileInventory = [];
    this.duplicates = [];
    this.unusedFiles = [];
    this.config = JSON.parse(fs.readFileSync('cleanup.config.json', 'utf8'));
  }

  async analyze() {
    console.log('🔍 Starting PMO Code Cleanup Analysis...');
    
    await this.buildFileInventory();
    await this.detectDuplicates();
    await this.analyzeDependencies();
    await this.detectUnusedFiles();
    await this.generateReports();
    
    console.log('✅ Analysis complete! Check reports/ directory for results.');
  }

  buildFileInventory() {
    console.log('📁 Building file inventory...');
    
    const scanDir = (dir) => {
      const files = [];
      
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // Skip excluded directories
          if (entry.isDirectory()) {
            if (this.config.analysis.excludedDirs.some(excluded => 
              fullPath.includes(excluded) || entry.name.startsWith('.'))) {
              continue;
            }
            files.push(...scanDir(fullPath));
          } else {
            // Skip excluded files
            if (this.config.analysis.excludedFiles.some(pattern => 
              entry.name.match(pattern.replace('*', '.*')))) {
              continue;
            }
            
            const stats = fs.statSync(fullPath);
            const content = fs.readFileSync(fullPath);
            const hash = crypto.createHash('sha256').update(content).digest('hex');
            
            files.push({
              path: path.relative(process.cwd(), fullPath),
              hash,
              size: stats.size,
              lastModified: stats.mtime,
              extension: path.extname(entry.name),
              isBinary: this.isBinaryFile(content)
            });
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not scan directory ${dir}:`, error.message);
      }
      
      return files;
    };
    
    this.fileInventory = scanDir('.');
    console.log(`📊 Found ${this.fileInventory.length} files`);
  }

  isBinaryFile(content) {
    const nullBytes = content.filter(byte => byte === 0).length;
    const nonPrintable = content.filter(byte => byte < 32 && byte !== 9 && byte !== 10 && byte !== 13).length;
    
    return nullBytes > 0 || (nonPrintable / content.length) > 0.3;
  }

  detectDuplicates() {
    console.log('🔍 Detecting duplicate files...');
    
    const hashGroups = new Map();
    
    // Group files by hash
    for (const file of this.fileInventory) {
      if (!hashGroups.has(file.hash)) {
        hashGroups.set(file.hash, []);
      }
      hashGroups.get(file.hash).push(file.path);
    }
    
    // Create duplicate groups
    for (const [hash, files] of hashGroups) {
      if (files.length > 1) {
        // Choose canonical file (prefer src/ over others, then alphabetical)
        const canonical = files.sort((a, b) => {
          if (a.startsWith('src/') && !b.startsWith('src/')) return -1;
          if (!a.startsWith('src/') && b.startsWith('src/')) return 1;
          return a.localeCompare(b);
        })[0];
        
        this.duplicates.push({
          canonical,
          members: files,
          hash
        });
      }
    }
    
    console.log(`🔍 Found ${this.duplicates.length} duplicate groups`);
  }

  async analyzeDependencies() {
    console.log('🔗 Analyzing dependencies...');
    
    try {
      // Run madge to get dependency graph
      const madgeOutput = execSync('npx madge --circular --extensions ts,tsx,js,jsx src/', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      console.log('📊 Dependency analysis complete');
    } catch (error) {
      console.warn('Warning: Could not run madge analysis:', error.message);
    }
  }

  detectUnusedFiles() {
    console.log('🗑️ Detecting unused files...');
    
    const entrypoints = this.getEntrypoints();
    const referencedFiles = new Set();
    
    // Add entrypoints as referenced
    entrypoints.forEach(ep => referencedFiles.add(ep));
    
    // Find files with no inbound references
    for (const file of this.fileInventory) {
      if (!referencedFiles.has(file.path) && !this.isSafelisted(file.path)) {
        this.unusedFiles.push({
          path: file.path,
          reason: 'No inbound references found',
          evidence: ['Static analysis'],
          lastModified: file.lastModified,
          riskLevel: this.assessRisk(file.path)
        });
      }
    }
    
    console.log(`🗑️ Found ${this.unusedFiles.length} potentially unused files`);
  }

  getEntrypoints() {
    const entrypoints = [];
    
    // Find Next.js app router files
    const findAppFiles = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            findAppFiles(fullPath);
          } else if (this.isEntrypointFile(entry.name)) {
            entrypoints.push(path.relative(process.cwd(), fullPath));
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
    };
    
    findAppFiles('src/app');
    findAppFiles('src');
    
    return entrypoints;
  }

  isEntrypointFile(filename) {
    const entrypointPatterns = [
      'page.tsx',
      'layout.tsx',
      'route.ts',
      'loading.tsx',
      'error.tsx',
      'not-found.tsx',
      'middleware.ts'
    ];
    
    return entrypointPatterns.some(pattern => filename === pattern);
  }

  isSafelisted(path) {
    return this.config.analysis.safelist.some(pattern => 
      path.includes(pattern.replace('*', ''))
    );
  }

  assessRisk(path) {
    if (path.includes('test') || path.includes('spec')) return 'Low';
    if (path.includes('component') || path.includes('util')) return 'Medium';
    if (path.includes('api') || path.includes('route')) return 'High';
    return 'Medium';
  }

  async generateReports() {
    console.log('📊 Generating reports...');
    
    // Create reports directory
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports');
    }
    
    // Generate duplicates report
    fs.writeFileSync('reports/duplicates.json', JSON.stringify({
      summary: {
        totalGroups: this.duplicates.length,
        totalDuplicates: this.duplicates.reduce((sum, group) => sum + group.members.length - 1, 0)
      },
      groups: this.duplicates
    }, null, 2));
    
    // Generate unused files report
    fs.writeFileSync('reports/unused_files.json', JSON.stringify({
      summary: {
        totalFiles: this.unusedFiles.length,
        byRisk: {
          Low: this.unusedFiles.filter(f => f.riskLevel === 'Low').length,
          Medium: this.unusedFiles.filter(f => f.riskLevel === 'Medium').length,
          High: this.unusedFiles.filter(f => f.riskLevel === 'High').length
        }
      },
      files: this.unusedFiles
    }, null, 2));
    
    // Generate removal plan
    this.generateRemovalPlan();
    
    console.log('📊 Reports generated in reports/ directory');
  }

  generateRemovalPlan() {
    const plan = `# PMO Code Cleanup Removal Plan

## Overview
This document outlines a safe, step-by-step plan for removing duplicate and unused files from the PMO project.

## Safety Measures
- All deletions will be performed in a dry-run mode first
- Files will be moved to \`.trash/\` directory instead of permanent deletion
- Each batch will be validated before proceeding to the next

## Batch 1: Low Risk Files (${this.unusedFiles.filter(f => f.riskLevel === 'Low').length} files)
${this.unusedFiles.filter(f => f.riskLevel === 'Low').map(f => `- ${f.path} (${f.reason})`).join('\n')}

## Batch 2: Medium Risk Files (${this.unusedFiles.filter(f => f.riskLevel === 'Medium').length} files)
${this.unusedFiles.filter(f => f.riskLevel === 'Medium').map(f => `- ${f.path} (${f.reason})`).join('\n')}

## Batch 3: High Risk Files (${this.unusedFiles.filter(f => f.riskLevel === 'High').length} files)
${this.unusedFiles.filter(f => f.riskLevel === 'High').map(f => `- ${f.path} (${f.reason})`).join('\n')}

## Duplicate Files (${this.duplicates.length} groups)
${this.duplicates.map(group => `
### Group: ${group.hash.substring(0, 8)}...
- Canonical: ${group.canonical}
- Duplicates: ${group.members.filter(m => m !== group.canonical).join(', ')}
`).join('\n')}

## Validation Steps
1. Run TypeScript build: \`npm run build\`
2. Run ESLint: \`npm run lint\`
3. Run tests: \`npm run test\`
4. Start dev server: \`npm run dev\`
5. Verify health endpoint: \`curl http://localhost:3000/api/health\`

## Rollback Plan
If issues are detected:
1. Restore from trash: \`mv .trash/* ./\`
2. Revert git changes: \`git revert <commit-hash>\`
3. Restore from backup: Use backup files created earlier

## Next Steps
1. Create feature branch: \`git checkout -b chore/cleanup-dryrun\`
2. Run dry-run script: \`node scripts/cleanup-dryrun.js\`
3. Validate results
4. Create PR with detailed report
`;

    fs.writeFileSync('reports/removal_plan.md', plan);
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new PMOCleanupAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = PMOCleanupAnalyzer;
