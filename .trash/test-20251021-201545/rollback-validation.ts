#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

interface RollbackResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

interface BackupInfo {
  timestamp: string;
  stats: any;
  tables: any[];
}

class DatabaseRollbackManager {
  private prisma: PrismaClient;
  private pool: Pool;

  constructor() {
    this.prisma = new PrismaClient();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<string[]> {
    console.log('📋 Listing available backups...');
    
    try {
      const files = fs.readdirSync('.');
      const backupFiles = files.filter(file => 
        file.startsWith('backup_') && 
        (file.endsWith('.sql') || file.endsWith('.json'))
      );
      
      console.log(`   Found ${backupFiles.length} backup files:`);
      backupFiles.forEach(file => {
        const stats = fs.statSync(file);
        console.log(`   📄 ${file} (${stats.size} bytes, ${stats.mtime.toISOString()})`);
      });
      
      return backupFiles;
    } catch (error) {
      console.error('   ❌ Error listing backups:', error);
      return [];
    }
  }

  /**
   * Load backup metadata
   */
  async loadBackupMetadata(backupFile: string): Promise<BackupInfo | null> {
    console.log(`📖 Loading backup metadata from ${backupFile}...`);
    
    try {
      if (!backupFile.endsWith('.json')) {
        console.log('   ⚠️  Only JSON metadata files are supported for rollback');
        return null;
      }
      
      const content = fs.readFileSync(backupFile, 'utf8');
      const metadata = JSON.parse(content);
      
      console.log(`   ✅ Backup loaded: ${metadata.timestamp}`);
      console.log(`   📊 Tables: ${metadata.tables?.length || 0}`);
      console.log(`   📈 Records: ${metadata.stats?.totalRecords || 0}`);
      
      return metadata;
    } catch (error) {
      console.error('   ❌ Error loading backup:', error);
      return null;
    }
  }

  /**
   * Validate current database state
   */
  async validateCurrentState(): Promise<RollbackResult> {
    console.log('🔍 Validating current database state...');
    
    const client = await this.pool.connect();
    
    try {
      // Check if database is in UUID format
      const uuidCheck = await this.checkUUIDFormat(client);
      
      // Check foreign key integrity
      const fkCheck = await this.checkForeignKeyIntegrity(client);
      
      // Get current statistics
      const stats = await this.getCurrentStats(client);
      
      return {
        success: true,
        message: 'Current database state validated',
        details: {
          uuidCheck,
          fkCheck,
          stats
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Database state validation failed',
        error: error instanceof Error ? error.message : String(error)
      };
    } finally {
      client.release();
    }
  }

  /**
   * Check UUID format in current database
   */
  async checkUUIDFormat(client: any): Promise<any> {
    const tables = ['tbl_users', 'tbl_projects', 'tbl_tasks', 'tbl_budgets', 'tbl_resources'];
    const results: any[] = [];

    for (const table of tables) {
      try {
        const query = `
          SELECT 
            COUNT(*) as total_rows,
            COUNT(CASE WHEN id ~ '^[a-z0-9]{25}$' THEN 1 END) as valid_cuids
          FROM ${table}
        `;
        
        const result = await client.query(query);
        const row = result.rows[0];
        
        results.push({
          table,
          totalRows: parseInt(row.total_rows),
          validCuids: parseInt(row.valid_cuids),
          isUUID: parseInt(row.total_rows) === parseInt(row.valid_cuids)
        });
      } catch (error) {
        console.log(`   ⚠️  Could not check ${table}: ${error}`);
      }
    }

    return results;
  }

  /**
   * Check foreign key integrity
   */
  async checkForeignKeyIntegrity(client: any): Promise<any> {
    try {
      const query = `
        SELECT COUNT(*) as total_fks
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_schema = 'public'
      `;
      
      const result = await client.query(query);
      return {
        totalForeignKeys: parseInt(result.rows[0].total_fks),
        status: 'checked'
      };
    } catch (error) {
      return {
        totalForeignKeys: 0,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get current database statistics
   */
  async getCurrentStats(client: any): Promise<any> {
    try {
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `;
      
      const tablesResult = await client.query(tablesQuery);
      const tables = tablesResult.rows.map(row => row.table_name);
      
      let totalRecords = 0;
      let tablesWithData = 0;
      
      for (const table of tables) {
        try {
          const countQuery = `SELECT COUNT(*) as count FROM "${table}"`;
          const countResult = await client.query(countQuery);
          const count = parseInt(countResult.rows[0].count);
          
          totalRecords += count;
          if (count > 0) tablesWithData++;
        } catch (error) {
          console.log(`   ⚠️  Could not count ${table}: ${error}`);
        }
      }
      
      return {
        totalTables: tables.length,
        tablesWithData,
        totalRecords
      };
    } catch (error) {
      return {
        totalTables: 0,
        tablesWithData: 0,
        totalRecords: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Create rollback plan
   */
  async createRollbackPlan(backupFile: string): Promise<RollbackResult> {
    console.log(`📋 Creating rollback plan for ${backupFile}...`);
    
    try {
      const metadata = await this.loadBackupMetadata(backupFile);
      if (!metadata) {
        return {
          success: false,
          message: 'Could not load backup metadata',
          error: 'Invalid backup file'
        };
      }

      const currentState = await this.validateCurrentState();
      
      const rollbackPlan = {
        backupFile,
        backupTimestamp: metadata.timestamp,
        currentState: currentState.details,
        steps: [
          '1. Validate current database state',
          '2. Create current state backup',
          '3. Restore from selected backup',
          '4. Verify data integrity',
          '5. Update Prisma schema if needed',
          '6. Regenerate Prisma client'
        ],
        warnings: [
          '⚠️  This will overwrite current data',
          '⚠️  Make sure to backup current state first',
          '⚠️  Test in development environment first'
        ]
      };

      return {
        success: true,
        message: 'Rollback plan created',
        details: rollbackPlan
      };

    } catch (error) {
      return {
        success: false,
        message: 'Rollback plan creation failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Execute rollback (simulation only)
   */
  async executeRollback(backupFile: string, dryRun: boolean = true): Promise<RollbackResult> {
    console.log(`🔄 ${dryRun ? 'Simulating' : 'Executing'} rollback from ${backupFile}...`);
    
    try {
      const metadata = await this.loadBackupMetadata(backupFile);
      if (!metadata) {
        return {
          success: false,
          message: 'Could not load backup metadata',
          error: 'Invalid backup file'
        };
      }

      if (dryRun) {
        console.log('   🔍 DRY RUN - No actual changes will be made');
        console.log('   📋 Rollback steps that would be executed:');
        console.log('      1. Create current state backup');
        console.log('      2. Drop all tables');
        console.log('      3. Restore from backup file');
        console.log('      4. Verify data integrity');
        console.log('      5. Update Prisma schema');
        console.log('      6. Regenerate Prisma client');
        
        return {
          success: true,
          message: 'Rollback simulation completed',
          details: {
            dryRun: true,
            backupFile,
            metadata
          }
        };
      } else {
        // Actual rollback would go here
        // This is a placeholder for the actual implementation
        console.log('   ⚠️  Actual rollback not implemented for safety');
        console.log('   💡 Use database-specific tools for actual rollback');
        
        return {
          success: false,
          message: 'Actual rollback not implemented',
          error: 'Use database-specific tools for actual rollback'
        };
      }

    } catch (error) {
      return {
        success: false,
        message: 'Rollback execution failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Run complete rollback validation
   */
  async runRollbackValidation(backupFile?: string): Promise<RollbackResult> {
    console.log('🚀 Starting rollback validation...');
    console.log('=' .repeat(60));

    try {
      // List available backups
      const backups = await this.listBackups();
      
      if (backups.length === 0) {
        return {
          success: false,
          message: 'No backup files found',
          error: 'Create a backup before attempting rollback'
        };
      }

      // Use provided backup or latest one
      const selectedBackup = backupFile || backups[0];
      console.log(`📄 Selected backup: ${selectedBackup}`);

      // Create rollback plan
      const plan = await this.createRollbackPlan(selectedBackup);
      if (!plan.success) {
        return plan;
      }

      // Execute rollback simulation
      const rollback = await this.executeRollback(selectedBackup, true);
      
      console.log('=' .repeat(60));
      console.log('📊 ROLLBACK VALIDATION RESULTS');
      console.log('=' .repeat(60));
      console.log(`📋 Available backups: ${backups.length}`);
      console.log(`📄 Selected backup: ${selectedBackup}`);
      console.log(`✅ Rollback plan: ${plan.success ? 'CREATED' : 'FAILED'}`);
      console.log(`✅ Rollback simulation: ${rollback.success ? 'PASSED' : 'FAILED'}`);
      console.log('');
      console.log('⚠️  IMPORTANT NOTES:');
      console.log('   • This is a simulation only');
      console.log('   • Actual rollback requires manual intervention');
      console.log('   • Test in development environment first');
      console.log('   • Backup current state before rollback');
      console.log('=' .repeat(60));

      return {
        success: true,
        message: 'Rollback validation completed',
        details: {
          backups,
          selectedBackup,
          plan: plan.details,
          rollback: rollback.details
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Rollback validation failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    await this.prisma.$disconnect();
    await this.pool.end();
    console.log('🔌 Database connections closed');
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const rollbackManager = new DatabaseRollbackManager();
  
  try {
    // Get backup file from command line argument
    const backupFile = process.argv[2];
    
    const result = await rollbackManager.runRollbackValidation(backupFile);
    
    if (result.success) {
      console.log('🎉 Rollback validation completed successfully!');
      console.log('✅ Rollback plan is ready');
    } else {
      console.error('❌ Rollback validation failed:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Rollback validation failed:', error);
    process.exit(1);
  } finally {
    await rollbackManager.close();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { DatabaseRollbackManager };
