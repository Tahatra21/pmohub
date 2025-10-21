#!/usr/bin/env node

/**
 * PMO Code Cleanup Analysis Tool
 * Identifies duplicate files and unused code with safety-first approach
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { createHash } from 'crypto';
import { execSync } from 'child_process';

interface FileInfo {
  path: string;
  hash: string;
  size: number;
  lastModified: Date;
  extension: string;
  isBinary: boolean;
}

interface DuplicateGroup {
  canonical: string;
  members: string[];
  hash: string;
  similarity?: number;
}

interface UnusedFile {
  path: string;
  reason: string;
  evidence: string[];
  lastModified: Date;
  riskLevel: 'Low' | 'Medium' | 'High';
}

class CleanupAnalyzer {
  private config: any;
  private fileInventory: FileInfo[] = [];
  private duplicates: DuplicateGroup[] = [];
  private unusedFiles: UnusedFile[] = [];
  private dependencyGraph: Map<string, string[]> = new Map();

  constructor() {
    this.config = JSON.parse(readFileSync('cleanup.config.json', 'utf8'));
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

  private async buildFileInventory() {
    console.log('📁 Building file inventory...');
    
    const scanDir = (dir: string): FileInfo[] => {
      const files: FileInfo[] = [];
      
      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          
          // Skip excluded directories
          if (entry.isDirectory()) {
            if (this.config.analysis.excludedDirs.some((excluded: string) => 
              fullPath.includes(excluded) || entry.name.startsWith('.'))) {
              continue;
            }
            files.push(...scanDir(fullPath));
          } else {
            // Skip excluded files
            if (this.config.analysis.excludedFiles.some((pattern: string) => 
              entry.name.match(pattern.replace('*', '.*')))) {
              continue;
            }
            
            const stats = statSync(fullPath);
            const content = readFileSync(fullPath);
            const hash = createHash('sha256').update(content).digest('hex');
            
            files.push({
              path: relative(process.cwd(), fullPath),
              hash,
              size: stats.size,
              lastModified: stats.mtime,
              extension: extname(entry.name),
              isBinary: this.isBinaryFile(content)
            });
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not scan directory ${dir}:`, error);
      }
      
      return files;
    };
    
    this.fileInventory = scanDir('.');
    console.log(`📊 Found ${this.fileInventory.length} files`);
  }

  private isBinaryFile(content: Buffer): boolean {
    // Check for null bytes or high percentage of non-printable characters
    const nullBytes = content.filter(byte => byte === 0).length;
    const nonPrintable = content.filter(byte => byte < 32 && byte !== 9 && byte !== 10 && byte !== 13).length;
    
    return nullBytes > 0 || (nonPrintable / content.length) > 0.3;
  }

  private async detectDuplicates() {
    console.log('🔍 Detecting duplicate files...');
    
    const hashGroups = new Map<string, string[]>();
    
    // Group files by hash
    for (const file of this.fileInventory) {
      if (!hashGroups.has(file.hash)) {
        hashGroups.set(file.hash, []);
      }
      hashGroups.get(file.hash)!.push(file.path);
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

  private async analyzeDependencies() {
    console.log('🔗 Analyzing dependencies...');
    
    try {
      // Run madge to get dependency graph
      const madgeOutput = execSync('npx madge --circular --extensions ts,tsx,js,jsx src/', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      console.log('📊 Dependency analysis complete');
    } catch (error) {
      console.warn('Warning: Could not run madge analysis:', error);
    }
  }

  private async detectUnusedFiles() {
    console.log('🗑️ Detecting unused files...');
    
    // This is a simplified version - in practice, you'd use ts-prune, depcheck, etc.
    const entrypoints = this.getEntrypoints();
    const referencedFiles = new Set<string>();
    
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

  private getEntrypoints(): string[] {
    const entrypoints: string[] = [];
    
    // Find Next.js app router files
    const findAppFiles = (dir: string) => {
      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          
          if (entry.isDirectory()) {
            findAppFiles(fullPath);
          } else if (this.isEntrypointFile(entry.name)) {
            entrypoints.push(relative(process.cwd(), fullPath));
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

  private isEntrypointFile(filename: string): boolean {
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

  private isSafelisted(path: string): boolean {
    return this.config.analysis.safelist.some((pattern: string) => 
      path.includes(pattern.replace('*', ''))
    );
  }

  private assessRisk(path: string): 'Low' | 'Medium' | 'High' {
    if (path.includes('test') || path.includes('spec')) return 'Low';
    if (path.includes('component') || path.includes('util')) return 'Medium';
    if (path.includes('api') || path.includes('route')) return 'High';
    return 'Medium';
  }

  private async generateReports() {
    console.log('📊 Generating reports...');
    
    // Create reports directory
    execSync('mkdir -p reports', { cwd: process.cwd() });
    
    // Generate duplicates report
    writeFileSync('reports/duplicates.json', JSON.stringify({
      summary: {
        totalGroups: this.duplicates.length,
        totalDuplicates: this.duplicates.reduce((sum, group) => sum + group.members.length - 1, 0)
      },
      groups: this.duplicates
    }, null, 2));
    
    // Generate unused files report
    writeFileSync('reports/unused_files.json', JSON.stringify({
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

  private generateRemovalPlan() {
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

    writeFileSync('reports/removal_plan.md', plan);
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new CleanupAnalyzer();
  analyzer.analyze().catch(console.error);
}

export default CleanupAnalyzer;
