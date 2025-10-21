#!/usr/bin/env tsx

import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

interface SyncResult {
  tableName: string;
  rowsCopied: number;
  success: boolean;
  error?: string;
}

class DatabaseSync {
  private sourcePool: Pool;
  private targetPool: Pool;
  private results: SyncResult[] = [];

  constructor() {
    // Source database (lifecycle_db)
    this.sourcePool = new Pool({
      host: process.env.SOURCE_DB_HOST || 'localhost',
      port: parseInt(process.env.SOURCE_DB_PORT || '5432'),
      database: process.env.SOURCE_DB_NAME || 'lifecycle_db',
      user: process.env.SOURCE_DB_USER || 'postgres',
      password: process.env.SOURCE_DB_PASSWORD || 'password',
    });

    // Target database (pmo_db)
    this.targetPool = new Pool({
      host: process.env.TARGET_DB_HOST || 'localhost',
      port: parseInt(process.env.TARGET_DB_PORT || '5432'),
      database: process.env.TARGET_DB_NAME || 'pmo_db',
      user: process.env.TARGET_DB_USER || 'postgres',
      password: process.env.TARGET_DB_PASSWORD || 'password',
    });
  }

  /**
   * Test database connections
   */
  async testConnections(): Promise<void> {
    console.log('🔍 Testing database connections...');
    
    try {
      const sourceClient = await this.sourcePool.connect();
      const sourceResult = await sourceClient.query('SELECT current_database(), version()');
      console.log(`✅ Source DB connected: ${sourceResult.rows[0].current_database}`);
      sourceClient.release();

      const targetClient = await this.targetPool.connect();
      const targetResult = await targetClient.query('SELECT current_database(), version()');
      console.log(`✅ Target DB connected: ${targetResult.rows[0].current_database}`);
      targetClient.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Get table schema information
   */
  async getTableSchema(tableName: string, isSource: boolean = true): Promise<string[]> {
    const pool = isSource ? this.sourcePool : this.targetPool;
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const result = await client.query(query, [tableName]);
      return result.rows.map(row => row.column_name);
    } finally {
      client.release();
    }
  }

  /**
   * Get table schema with detailed information
   */
  async getDetailedTableSchema(tableName: string, isSource: boolean = true): Promise<any[]> {
    const pool = isSource ? this.sourcePool : this.targetPool;
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const result = await client.query(query, [tableName]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Copy data from source to target table with schema mapping
   */
  async copyTableData(tableName: string): Promise<SyncResult> {
    console.log(`📋 Copying ${tableName}...`);
    
    const sourceClient = await this.sourcePool.connect();
    const targetClient = await this.targetPool.connect();
    
    try {
      // Start transaction on target database
      await targetClient.query('BEGIN');
      
      // Get detailed column information
      const sourceSchema = await this.getDetailedTableSchema(tableName, true);
      const targetSchema = await this.getDetailedTableSchema(tableName, false);
      
      console.log(`   📋 Source schema: [${sourceSchema.map(c => c.column_name).join(', ')}]`);
      console.log(`   📋 Target schema: [${targetSchema.map(c => c.column_name).join(', ')}]`);
      
      // Find common columns
      const sourceColumns = sourceSchema.map(c => c.column_name);
      const targetColumns = targetSchema.map(c => c.column_name);
      const commonColumns = sourceColumns.filter(col => targetColumns.includes(col));
      
      console.log(`   🔗 Common columns: [${commonColumns.join(', ')}]`);
      
      if (commonColumns.length === 0) {
        throw new Error(`No common columns found between source and target for ${tableName}`);
      }
      
      // Truncate target table
      console.log(`   🗑️  Truncating target table ${tableName}...`);
      await targetClient.query(`TRUNCATE TABLE ${tableName} CASCADE`);
      
      // Get row count from source
      const countResult = await sourceClient.query(`SELECT COUNT(*) FROM ${tableName}`);
      const sourceRowCount = parseInt(countResult.rows[0].count);
      
      if (sourceRowCount === 0) {
        console.log(`   ⚠️  No data to copy from ${tableName}`);
        await targetClient.query('COMMIT');
        return {
          tableName,
          rowsCopied: 0,
          success: true
        };
      }
      
      console.log(`   📊 Found ${sourceRowCount} rows to copy...`);
      
      // Handle special cases for different table schemas
      let copyQuery: string;
      
      // Get data from source database first
      let sourceData: any[];
      
      if (tableName === 'tbl_kategori') {
        const sourceQuery = `SELECT id, kategori, created_at, updated_at FROM ${tableName}`;
        const sourceResult = await sourceClient.query(sourceQuery);
        sourceData = sourceResult.rows;
      } else if (tableName === 'tbl_segmen') {
        const sourceQuery = `SELECT id, segmen, created_at, updated_at FROM ${tableName}`;
        const sourceResult = await sourceClient.query(sourceQuery);
        sourceData = sourceResult.rows;
      } else if (tableName === 'tbl_stage') {
        const sourceQuery = `SELECT id, stage, created_at, updated_at FROM ${tableName}`;
        const sourceResult = await sourceClient.query(sourceQuery);
        sourceData = sourceResult.rows;
      } else {
        const columns = commonColumns.join(', ');
        const sourceQuery = `SELECT ${columns} FROM ${tableName}`;
        const sourceResult = await sourceClient.query(sourceQuery);
        sourceData = sourceResult.rows;
      }
      
      console.log(`   📊 Retrieved ${sourceData.length} rows from source...`);
      
      // Insert data into target database
      let totalCopied = 0;
      
      if (tableName === 'tbl_kategori') {
        for (const row of sourceData) {
          const insertQuery = `
            INSERT INTO ${tableName} (id, kategori, created_at, updated_at) 
            VALUES ($1, $2, $3, $4)
          `;
          await targetClient.query(insertQuery, [
            row.id.toString(), 
            row.kategori, 
            row.created_at, 
            row.updated_at || row.created_at
          ]);
          totalCopied++;
        }
      } else if (tableName === 'tbl_segmen') {
        for (const row of sourceData) {
          const insertQuery = `
            INSERT INTO ${tableName} (id, segmen, created_at, updated_at) 
            VALUES ($1, $2, $3, $4)
          `;
          await targetClient.query(insertQuery, [
            row.id.toString(), 
            row.segmen, 
            row.created_at, 
            row.updated_at || row.created_at
          ]);
          totalCopied++;
        }
      } else if (tableName === 'tbl_stage') {
        for (const row of sourceData) {
          const insertQuery = `
            INSERT INTO ${tableName} (id, stage, created_at, updated_at) 
            VALUES ($1, $2, $3, $4)
          `;
          await targetClient.query(insertQuery, [
            row.id.toString(), 
            row.stage, 
            row.created_at, 
            row.updated_at || row.created_at
          ]);
          totalCopied++;
        }
      } else {
        // For other tables, use parameterized insert with null handling
        const columns = commonColumns.join(', ');
        const placeholders = commonColumns.map((_, i) => `$${i + 1}`).join(', ');
        
        for (const row of sourceData) {
          const insertQuery = `
            INSERT INTO ${tableName} (${columns}) 
            VALUES (${placeholders})
          `;
          const values = commonColumns.map(col => {
            // Handle null values for required fields
            if (row[col] === null || row[col] === undefined) {
              if (col === 'updated_at') {
                return row['created_at']; // Use created_at as fallback for updated_at
              } else if (col === 'id_stage') {
                return '1'; // Default stage ID
              } else if (col === 'id_kategori') {
                return '1'; // Default kategori ID
              } else if (col === 'id_segmen') {
                return '1'; // Default segmen ID
              } else if (col === 'harga') {
                return 0; // Default price
              } else if (col === 'tanggal_launch') {
                return new Date(); // Default launch date
              } else if (col === 'pelanggan') {
                return 'Unknown'; // Default customer
              } else if (col === 'deskripsi') {
                return ''; // Empty description
              }
            }
            return row[col];
          });
          await targetClient.query(insertQuery, values);
          totalCopied++;
        }
      }
      
      // Commit transaction
      await targetClient.query('COMMIT');
      
      console.log(`   ✅ Successfully copied ${totalCopied} rows to ${tableName}`);
      
      return {
        tableName,
        rowsCopied: totalCopied,
        success: true
      };
      
    } catch (error) {
      // Rollback transaction on error
      await targetClient.query('ROLLBACK');
      console.error(`   ❌ Error copying ${tableName}:`, error);
      
      return {
        tableName,
        rowsCopied: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    } finally {
      sourceClient.release();
      targetClient.release();
    }
  }

  /**
   * Main sync process
   */
  async sync(): Promise<void> {
    console.log('🚀 Starting database sync process...');
    console.log('=' .repeat(50));
    
    try {
      // Test connections
      await this.testConnections();
      
      // Define tables to sync in order
      const tablesToSync = [
        'tbl_kategori',
        'tbl_segmen', 
        'tbl_stage',
        'tbl_produk',
        'tbl_mon_licenses'
      ];
      
      console.log(`📋 Tables to sync: ${tablesToSync.join(', ')}`);
      console.log('=' .repeat(50));
      
      // Sync each table
      for (const tableName of tablesToSync) {
        const result = await this.copyTableData(tableName);
        this.results.push(result);
        
        if (!result.success) {
          console.error(`❌ Failed to sync ${tableName}, stopping sync process`);
          break;
        }
      }
      
      // Print summary
      this.printSummary();
      
    } catch (error) {
      console.error('💥 Sync process failed:', error);
      throw error;
    }
  }

  /**
   * Print sync summary
   */
  private printSummary(): void {
    console.log('=' .repeat(50));
    console.log('📊 SYNC SUMMARY');
    console.log('=' .repeat(50));
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    const totalRows = this.results.reduce((sum, r) => sum + r.rowsCopied, 0);
    
    console.log(`✅ Successful tables: ${successful.length}`);
    console.log(`❌ Failed tables: ${failed.length}`);
    console.log(`📈 Total rows copied: ${totalRows}`);
    
    if (successful.length > 0) {
      console.log('\n✅ Successfully synced:');
      successful.forEach(result => {
        console.log(`   ${result.tableName}: ${result.rowsCopied} rows`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed to sync:');
      failed.forEach(result => {
        console.log(`   ${result.tableName}: ${result.error}`);
      });
    }
    
    console.log('=' .repeat(50));
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    await this.sourcePool.end();
    await this.targetPool.end();
    console.log('🔌 Database connections closed');
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const sync = new DatabaseSync();
  
  try {
    await sync.sync();
    console.log('🎉 Sync completed successfully!');
  } catch (error) {
    console.error('💥 Sync failed:', error);
    process.exit(1);
  } finally {
    await sync.close();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { DatabaseSync };
