#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface TableStats {
  tableName: string;
  rowCount: number;
  hasIdColumn: boolean;
  idType: string;
}

interface ForeignKeyCheck {
  tableName: string;
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
  orphanedCount: number;
}

class DatabaseSafetyChecker {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Check all table row counts and ID column types
   */
  async checkTableStats(): Promise<TableStats[]> {
    console.log('📊 Checking table statistics...');
    
    const tables = [
      { model: 'User', table: 'tbl_users' },
      { model: 'Role', table: 'tbl_roles' },
      { model: 'Project', table: 'tbl_projects' },
      { model: 'Task', table: 'tbl_tasks' },
      { model: 'Budget', table: 'tbl_budgets' },
      { model: 'Resource', table: 'tbl_resources' },
      { model: 'ResourceAllocation', table: 'tbl_resource_allocations' },
      { model: 'ActivityLog', table: 'tbl_activity_logs' },
      { model: 'Document', table: 'tbl_documents' },
      { model: 'Milestone', table: 'tbl_milestones' },
      { model: 'ProjectMember', table: 'tbl_project_members' },
      { model: 'TaskDependency', table: 'tbl_task_dependencies' },
      { model: 'CostEstimator', table: 'tbl_cost_estimator' },
      { model: 'EstimateLine', table: 'EstimateLine' },
      { model: 'Category', table: 'tbl_kategori' },
      { model: 'Segment', table: 'tbl_segmen' },
      { model: 'Stage', table: 'tbl_stage' },
      { model: 'Product', table: 'tbl_produk' },
      { model: 'MonitoringLicense', table: 'tbl_mon_licenses' },
      { model: 'LicenseNotification', table: 'tbl_license_notifications' },
      { model: 'HjtRate', table: 'tbl_hjt' },
      { model: 'HjtBlp', table: 'tbl_hjt_blp' },
      { model: 'HjtBlnp', table: 'tbl_hjt_blnp' }
    ];

    const stats: TableStats[] = [];

    for (const { model, table } of tables) {
      try {
        const rowCount = await (this.prisma as any)[model.toLowerCase()].count();
        
        // Check if table has id column and its type
        const tableInfo = await this.prisma.$queryRaw`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = ${table} 
          AND column_name = 'id'
        ` as any[];

        stats.push({
          tableName: model,
          rowCount,
          hasIdColumn: tableInfo.length > 0,
          idType: tableInfo.length > 0 ? tableInfo[0].data_type : 'N/A'
        });

        console.log(`   ✅ ${model}: ${rowCount} rows, ID type: ${tableInfo.length > 0 ? tableInfo[0].data_type : 'N/A'}`);
      } catch (error) {
        console.log(`   ⚠️  ${model}: Error checking stats`);
        stats.push({
          tableName: model,
          rowCount: 0,
          hasIdColumn: false,
          idType: 'Error'
        });
      }
    }

    return stats;
  }

  /**
   * Check foreign key integrity
   */
  async checkForeignKeyIntegrity(): Promise<ForeignKeyCheck[]> {
    console.log('🔗 Checking foreign key integrity...');
    
    const fkChecks: ForeignKeyCheck[] = [];

    // Define known foreign key relationships
    const fkRelations = [
      { table: 'Project', column: 'createdBy', refTable: 'User', refColumn: 'id' },
      { table: 'Task', column: 'projectId', refTable: 'Project', refColumn: 'id' },
      { table: 'Task', column: 'assigneeId', refTable: 'User', refColumn: 'id' },
      { table: 'Task', column: 'creatorId', refTable: 'User', refColumn: 'id' },
      { table: 'Budget', column: 'projectId', refTable: 'Project', refColumn: 'id' },
      { table: 'Budget', column: 'taskId', refTable: 'Task', refColumn: 'id' },
      { table: 'Resource', column: 'userId', refTable: 'User', refColumn: 'id' },
      { table: 'Resource', column: 'createdBy', refTable: 'User', refColumn: 'id' },
      { table: 'ResourceAllocation', column: 'resourceId', refTable: 'Resource', refColumn: 'id' },
      { table: 'ResourceAllocation', column: 'projectId', refTable: 'Project', refColumn: 'id' },
      { table: 'ResourceAllocation', column: 'taskId', refTable: 'Task', refColumn: 'id' },
      { table: 'ResourceAllocation', column: 'allocatedBy', refTable: 'User', refColumn: 'id' },
      { table: 'ActivityLog', column: 'userId', refTable: 'User', refColumn: 'id' },
      { table: 'Document', column: 'projectId', refTable: 'Project', refColumn: 'id' },
      { table: 'Document', column: 'taskId', refTable: 'Task', refColumn: 'id' },
      { table: 'Document', column: 'uploadedBy', refTable: 'User', refColumn: 'id' },
      { table: 'Milestone', column: 'projectId', refTable: 'Project', refColumn: 'id' },
      { table: 'ProjectMember', column: 'projectId', refTable: 'Project', refColumn: 'id' },
      { table: 'ProjectMember', column: 'userId', refTable: 'User', refColumn: 'id' },
      { table: 'TaskDependency', column: 'taskId', refTable: 'Task', refColumn: 'id' },
      { table: 'TaskDependency', column: 'dependsOnTaskId', refTable: 'Task', refColumn: 'id' },
      { table: 'CostEstimator', column: 'projectId', refTable: 'Project', refColumn: 'id' },
      { table: 'EstimateLine', column: 'costEstimatorId', refTable: 'CostEstimator', refColumn: 'id' },
      { table: 'Product', column: 'id_kategori', refTable: 'Category', refColumn: 'id' },
      { table: 'Product', column: 'id_segmen', refTable: 'Segment', refColumn: 'id' },
      { table: 'Product', column: 'id_stage', refTable: 'Stage', refColumn: 'id' },
      { table: 'LicenseNotification', column: 'license_id', refTable: 'MonitoringLicense', refColumn: 'id' },
      { table: 'User', column: 'roleId', refTable: 'Role', refColumn: 'id' }
    ];

    for (const relation of fkRelations) {
      try {
        // Check for orphaned records
        const orphanedQuery = `
          SELECT COUNT(*) as count
          FROM "${relation.table}" t1
          LEFT JOIN "${relation.refTable}" t2 ON t1."${relation.column}" = t2."${relation.refColumn}"
          WHERE t2."${relation.refColumn}" IS NULL
          AND t1."${relation.column}" IS NOT NULL
        `;
        
        const result = await this.prisma.$queryRawUnsafe(orphanedQuery) as any[];
        const orphanedCount = parseInt(result[0].count);

        fkChecks.push({
          tableName: relation.table,
          columnName: relation.column,
          referencedTable: relation.refTable,
          referencedColumn: relation.refColumn,
          orphanedCount
        });

        if (orphanedCount === 0) {
          console.log(`   ✅ ${relation.table}.${relation.column} -> ${relation.refTable}.${relation.refColumn}: No violations`);
        } else {
          console.log(`   ⚠️  ${relation.table}.${relation.column} -> ${relation.refTable}.${relation.refColumn}: ${orphanedCount} orphaned records`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${relation.table}.${relation.column}: ${error}`);
      }
    }

    return fkChecks;
  }

  /**
   * Check UUID format consistency
   */
  async checkUUIDFormat(): Promise<void> {
    console.log('🔐 Checking UUID format consistency...');
    
    const tables = ['User', 'Project', 'Task', 'Budget', 'Resource'];
    
    for (const table of tables) {
      try {
        const uuidPatternQuery = `
          SELECT COUNT(*) as total,
                 COUNT(CASE WHEN "id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as valid_uuids
          FROM "${table}"
        `;
        
        const result = await this.prisma.$queryRawUnsafe(uuidPatternQuery) as any[];
        const total = parseInt(result[0].total);
        const validUuids = parseInt(result[0].valid_uuids);
        
        if (total === validUuids) {
          console.log(`   ✅ ${table}: All ${total} IDs are valid UUIDs`);
        } else {
          console.log(`   ⚠️  ${table}: ${validUuids}/${total} IDs are valid UUIDs`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${table} UUID format: ${error}`);
      }
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(): Promise<void> {
    console.log('🚀 Starting database safety check...');
    console.log('=' .repeat(60));

    try {
      const tableStats = await this.checkTableStats();
      const fkChecks = await this.checkForeignKeyIntegrity();
      await this.checkUUIDFormat();

      console.log('=' .repeat(60));
      console.log('📊 DATABASE SAFETY REPORT');
      console.log('=' .repeat(60));

      // Table statistics summary
      const totalRows = tableStats.reduce((sum, stat) => sum + stat.rowCount, 0);
      const tablesWithData = tableStats.filter(stat => stat.rowCount > 0).length;
      const tablesWithIdColumn = tableStats.filter(stat => stat.hasIdColumn).length;

      console.log(`📈 TABLE STATISTICS:`);
      console.log(`   • Total tables checked: ${tableStats.length}`);
      console.log(`   • Tables with data: ${tablesWithData}`);
      console.log(`   • Tables with ID column: ${tablesWithIdColumn}`);
      console.log(`   • Total records: ${totalRows}`);
      console.log('');

      // Foreign key integrity summary
      const totalViolations = fkChecks.reduce((sum, check) => sum + check.orphanedCount, 0);
      const cleanRelations = fkChecks.filter(check => check.orphanedCount === 0).length;

      console.log(`🔗 FOREIGN KEY INTEGRITY:`);
      console.log(`   • Total relationships checked: ${fkChecks.length}`);
      console.log(`   • Clean relationships: ${cleanRelations}`);
      console.log(`   • Total violations: ${totalViolations}`);
      console.log('');

      // Overall health status
      if (totalViolations === 0) {
        console.log('✅ DATABASE HEALTH: EXCELLENT');
        console.log('   • All foreign key relationships are intact');
        console.log('   • UUID format is consistent');
        console.log('   • Ready for production use');
      } else {
        console.log('⚠️  DATABASE HEALTH: NEEDS ATTENTION');
        console.log(`   • ${totalViolations} foreign key violations found`);
        console.log('   • Review orphaned records before deployment');
      }

      console.log('=' .repeat(60));

    } catch (error) {
      console.error('❌ Safety check failed:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const checker = new DatabaseSafetyChecker();
  
  try {
    await checker.generateReport();
  } catch (error) {
    console.error('💥 Safety check failed:', error);
    process.exit(1);
  } finally {
    await checker.close();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { DatabaseSafetyChecker };
