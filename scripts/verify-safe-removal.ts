#!/usr/bin/env node

/**
 * PMO Safe Removal Verification Script
 * Validates that file removal is safe before actual deletion
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

interface VerificationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

class SafeRemovalVerifier {
  private candidateFiles: string[] = [];

  constructor(candidateFiles: string[]) {
    this.candidateFiles = candidateFiles;
  }

  async verify(): Promise<VerificationResult> {
    const result: VerificationResult = {
      success: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    console.log(`🔍 Verifying safety of removing ${this.candidateFiles.length} files...`);

    // Check if files exist
    await this.checkFileExistence(result);
    
    // Check TypeScript compilation
    await this.checkTypeScriptCompilation(result);
    
    // Check ESLint
    await this.checkESLint(result);
    
    // Check Prisma schema
    await this.checkPrismaSchema(result);
    
    // Check for dynamic imports
    await this.checkDynamicImports(result);
    
    // Check for runtime references
    await this.checkRuntimeReferences(result);
    
    // Generate recommendations
    this.generateRecommendations(result);

    return result;
  }

  private async checkFileExistence(result: VerificationResult) {
    console.log('📁 Checking file existence...');
    
    for (const file of this.candidateFiles) {
      if (!existsSync(file)) {
        result.warnings.push(`File does not exist: ${file}`);
      }
    }
  }

  private async checkTypeScriptCompilation(result: VerificationResult) {
    console.log('🔨 Checking TypeScript compilation...');
    
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      console.log('✅ TypeScript compilation successful');
    } catch (error) {
      result.errors.push(`TypeScript compilation failed: ${error}`);
      result.success = false;
    }
  }

  private async checkESLint(result: VerificationResult) {
    console.log('🔍 Checking ESLint...');
    
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      console.log('✅ ESLint checks passed');
    } catch (error) {
      result.warnings.push(`ESLint issues found: ${error}`);
    }
  }

  private async checkPrismaSchema(result: VerificationResult) {
    console.log('🗄️ Checking Prisma schema...');
    
    try {
      execSync('npx prisma validate', { stdio: 'pipe' });
      console.log('✅ Prisma schema valid');
    } catch (error) {
      result.errors.push(`Prisma schema validation failed: ${error}`);
      result.success = false;
    }
  }

  private async checkDynamicImports(result: VerificationResult) {
    console.log('🔗 Checking for dynamic imports...');
    
    const dynamicPatterns = [
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      /next\/dynamic/g
    ];
    
    for (const file of this.candidateFiles) {
      if (existsSync(file) && file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = readFileSync(file, 'utf8');
          
          for (const pattern of dynamicPatterns) {
            const matches = content.match(pattern);
            if (matches) {
              result.warnings.push(`File ${file} contains dynamic imports: ${matches.join(', ')}`);
            }
          }
        } catch (error) {
          result.warnings.push(`Could not read file ${file}: ${error}`);
        }
      }
    }
  }

  private async checkRuntimeReferences(result: VerificationResult) {
    console.log('🔍 Checking for runtime references...');
    
    // Check if any candidate files are referenced in package.json scripts
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const scripts = Object.values(packageJson.scripts || {});
      
      for (const script of scripts) {
        for (const file of this.candidateFiles) {
          if (script.includes(file)) {
            result.errors.push(`File ${file} is referenced in package.json script: ${script}`);
            result.success = false;
          }
        }
      }
    } catch (error) {
      result.warnings.push(`Could not check package.json: ${error}`);
    }
  }

  private generateRecommendations(result: VerificationResult) {
    if (result.errors.length > 0) {
      result.recommendations.push('❌ DO NOT PROCEED: Critical errors found that would break the application');
    } else if (result.warnings.length > 0) {
      result.recommendations.push('⚠️ Proceed with caution: Warnings found that should be reviewed');
    } else {
      result.recommendations.push('✅ Safe to proceed: No critical issues found');
    }
    
    if (result.warnings.length > 0) {
      result.recommendations.push('Review all warnings before proceeding with deletion');
    }
    
    result.recommendations.push('Run a full test suite after deletion to ensure nothing is broken');
    result.recommendations.push('Keep backup files in trash directory until confident in the changes');
  }

  generateReport(result: VerificationResult): string {
    return `# Safe Removal Verification Report

**Date**: ${new Date().toISOString()}
**Files**: ${this.candidateFiles.length}
**Status**: ${result.success ? '✅ SAFE' : '❌ UNSAFE'}

## Summary
- **Success**: ${result.success}
- **Errors**: ${result.errors.length}
- **Warnings**: ${result.warnings.length}
- **Recommendations**: ${result.recommendations.length}

## Errors
${result.errors.length > 0 ? result.errors.map(e => `- ❌ ${e}`).join('\n') : 'No errors found'}

## Warnings
${result.warnings.length > 0 ? result.warnings.map(w => `- ⚠️ ${w}`).join('\n') : 'No warnings found'}

## Recommendations
${result.recommendations.map(r => `- ${r}`).join('\n')}

## Candidate Files
${this.candidateFiles.map(f => `- ${f}`).join('\n')}

## Next Steps
${result.success ? 
  '1. Proceed with file deletion\n2. Run full test suite\n3. Monitor application behavior' :
  '1. Fix critical errors before proceeding\n2. Review warnings\n3. Re-run verification'
}
`;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node verify-safe-removal.ts <file1> <file2> ...');
    process.exit(1);
  }
  
  const verifier = new SafeRemovalVerifier(args);
  
  verifier.verify().then(result => {
    const report = verifier.generateReport(result);
    console.log(report);
    
    // Write report to file
    require('fs').writeFileSync('reports/verification-report.md', report);
    
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

export default SafeRemovalVerifier;
