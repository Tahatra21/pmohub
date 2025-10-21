#!/usr/bin/env node

/**
 * PMO Cleanup Dry-Run Script
 * Safely tests file removal by moving files to trash directory
 */

import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface CleanupBatch {
  files: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  description: string;
}

class CleanupDryRun {
  private trashDir: string;
  private batches: CleanupBatch[] = [];

  constructor() {
    this.trashDir = `.trash/${new Date().toISOString().split('T')[0]}`;
  }

  async run() {
    console.log('🧪 Starting PMO Cleanup Dry-Run...');
    
    await this.loadRemovalPlan();
    await this.createTrashDirectory();
    await this.executeBatches();
    await this.generateReport();
    
    console.log('✅ Dry-run complete! Check reports/dryrun-results.md');
  }

  private async loadRemovalPlan() {
    const unusedFiles = JSON.parse(readFileSync('reports/unused_files.json', 'utf8'));
    const duplicates = JSON.parse(readFileSync('reports/duplicates.json', 'utf8'));
    
    // Create batches by risk level
    this.batches = [
      {
        files: unusedFiles.files.filter((f: any) => f.riskLevel === 'Low').map((f: any) => f.path),
        riskLevel: 'Low',
        description: 'Low risk files (tests, utilities)'
      },
      {
        files: unusedFiles.files.filter((f: any) => f.riskLevel === 'Medium').map((f: any) => f.path),
        riskLevel: 'Medium',
        description: 'Medium risk files (components, utilities)'
      },
      {
        files: unusedFiles.files.filter((f: any) => f.riskLevel === 'High').map((f: any) => f.path),
        riskLevel: 'High',
        description: 'High risk files (API routes, core functionality)'
      }
    ];
    
    // Add duplicate files (excluding canonical)
    const duplicateFiles = duplicates.groups.flatMap((group: any) => 
      group.members.filter((member: string) => member !== group.canonical)
    );
    
    if (duplicateFiles.length > 0) {
      this.batches.push({
        files: duplicateFiles,
        riskLevel: 'Low',
        description: 'Duplicate files (keeping canonical versions)'
      });
    }
  }

  private async createTrashDirectory() {
    if (!existsSync(this.trashDir)) {
      mkdirSync(this.trashDir, { recursive: true });
    }
    console.log(`📁 Created trash directory: ${this.trashDir}`);
  }

  private async executeBatches() {
    for (let i = 0; i < this.batches.length; i++) {
      const batch = this.batches[i];
      
      if (batch.files.length === 0) {
        console.log(`⏭️ Skipping empty batch ${i + 1}: ${batch.description}`);
        continue;
      }
      
      console.log(`\n🔄 Processing Batch ${i + 1}: ${batch.description} (${batch.files.length} files)`);
      
      const batchDir = join(this.trashDir, `batch-${i + 1}`);
      mkdirSync(batchDir, { recursive: true });
      
      const movedFiles: string[] = [];
      const failedFiles: string[] = [];
      
      // Move files to trash
      for (const file of batch.files) {
        try {
          if (existsSync(file)) {
            const fileName = file.split('/').pop() || file;
            const trashPath = join(batchDir, fileName);
            renameSync(file, trashPath);
            movedFiles.push(file);
            console.log(`  ✅ Moved: ${file}`);
          } else {
            console.log(`  ⚠️ File not found: ${file}`);
          }
        } catch (error) {
          failedFiles.push(file);
          console.log(`  ❌ Failed to move: ${file} - ${error}`);
        }
      }
      
      // Validate after each batch
      const validationResult = await this.validateBatch(i + 1, movedFiles);
      
      if (!validationResult.success) {
        console.log(`❌ Batch ${i + 1} validation failed. Restoring files...`);
        await this.restoreBatch(batchDir, movedFiles);
        break;
      } else {
        console.log(`✅ Batch ${i + 1} validation passed`);
      }
    }
  }

  private async validateBatch(batchNumber: number, movedFiles: string[]): Promise<{success: boolean, errors: string[]}> {
    const errors: string[] = [];
    
    console.log(`🔍 Validating Batch ${batchNumber}...`);
    
    try {
      // TypeScript build
      console.log('  🔨 Running TypeScript build...');
      execSync('npm run build', { stdio: 'pipe' });
      console.log('  ✅ TypeScript build passed');
    } catch (error) {
      errors.push(`TypeScript build failed: ${error}`);
      console.log('  ❌ TypeScript build failed');
    }
    
    try {
      // ESLint
      console.log('  🔍 Running ESLint...');
      execSync('npm run lint', { stdio: 'pipe' });
      console.log('  ✅ ESLint passed');
    } catch (error) {
      errors.push(`ESLint failed: ${error}`);
      console.log('  ❌ ESLint failed');
    }
    
    try {
      // Prisma validation
      console.log('  🗄️ Validating Prisma schema...');
      execSync('npx prisma validate', { stdio: 'pipe' });
      console.log('  ✅ Prisma validation passed');
    } catch (error) {
      errors.push(`Prisma validation failed: ${error}`);
      console.log('  ❌ Prisma validation failed');
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }

  private async restoreBatch(batchDir: string, movedFiles: string[]) {
    const { readdirSync, renameSync } = await import('fs');
    
    try {
      const trashFiles = readdirSync(batchDir);
      
      for (const trashFile of trashFiles) {
        const originalPath = movedFiles.find(file => file.split('/').pop() === trashFile);
        if (originalPath) {
          renameSync(join(batchDir, trashFile), originalPath);
          console.log(`  🔄 Restored: ${originalPath}`);
        }
      }
    } catch (error) {
      console.error('Error restoring files:', error);
    }
  }

  private async generateReport() {
    const report = `# PMO Cleanup Dry-Run Results

**Date**: ${new Date().toISOString()}
**Trash Directory**: ${this.trashDir}

## Summary
- Total batches processed: ${this.batches.length}
- Files moved to trash: ${this.batches.reduce((sum, batch) => sum + batch.files.length, 0)}

## Batch Results
${this.batches.map((batch, i) => `
### Batch ${i + 1}: ${batch.description}
- Risk Level: ${batch.riskLevel}
- Files: ${batch.files.length}
- Status: ${batch.files.length > 0 ? 'Processed' : 'Skipped'}
`).join('\n')}

## Next Steps
1. Review the moved files in \`${this.trashDir}\`
2. If everything looks good, create a PR with the actual deletions
3. If issues are found, restore files from trash directory

## Rollback Commands
\`\`\`bash
# Restore all files from trash
find ${this.trashDir} -type f -exec sh -c 'mv "$1" "${1#*/}"' _ {} \\;

# Or restore specific batch
mv ${this.trashDir}/batch-1/* ./
\`\`\`
`;

    writeFileSync('reports/dryrun-results.md', report);
  }
}

// Run the dry-run
if (require.main === module) {
  const dryRun = new CleanupDryRun();
  dryRun.run().catch(console.error);
}

export default CleanupDryRun;
