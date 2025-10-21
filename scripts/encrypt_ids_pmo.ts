#!/usr/bin/env tsx

import { Pool, Client } from 'pg';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface TableInfo {
  tableName: string;
  idColumn: string;
  foreignKeys: ForeignKeyInfo[];
}

interface ForeignKeyInfo {
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
  constraintName: string;
}

interface IdMapping {
  oldId: string;
  newId: string;
}

class IdEncryptionMigrator {
  private pool: Pool;
  private client: Client | null = null;
  private tables: TableInfo[] = [];
  private allMappings: Map<string, Map<string, string>> = new Map(); // tableName -> oldId -> newId

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'pmo_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });
  }

  /**
   * Generate a unique encrypted ID using UUID v4
   */
  private generateEncryptedId(): string {
    return crypto.randomUUID();
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<void> {
    console.log('🔍 Testing database connection...');
    
    try {
      this.client = await this.pool.connect();
      const result = await this.client.query('SELECT current_database(), version()');
      console.log(`✅ Connected to: ${result.rows[0].current_database}`);
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Discover all tables with id columns and their foreign key relationships
   */
  async discoverTables(): Promise<void> {
    console.log('🔍 Discovering tables with id columns...');

    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    // Get all tables with id columns
    const tablesQuery = `
      SELECT 
        t.table_name,
        c.column_name as id_column
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND c.column_name = 'id'
        AND c.is_nullable = 'NO'
      ORDER BY t.table_name;
    `;

    const tablesResult = await this.client.query(tablesQuery);
    
    console.log(`   📋 Found ${tablesResult.rows.length} tables with id columns`);

    // Get foreign key relationships for each table
    for (const table of tablesResult.rows) {
      const foreignKeysQuery = `
        SELECT 
          kcu.column_name,
          ccu.table_name AS referenced_table_name,
          ccu.column_name AS referenced_column_name,
          tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = $1
          AND ccu.table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
          );
      `;

      const foreignKeysResult = await this.client.query(foreignKeysQuery, [table.table_name]);
      
      const foreignKeys: ForeignKeyInfo[] = foreignKeysResult.rows.map(row => ({
        columnName: row.column_name,
        referencedTable: row.referenced_table_name,
        referencedColumn: row.referenced_column_name,
        constraintName: row.constraint_name
      }));

      this.tables.push({
        tableName: table.table_name,
        idColumn: table.id_column,
        foreignKeys
      });

      console.log(`   📊 ${table.tableName}: ${foreignKeys.length} foreign key(s)`);
    }

    console.log(`✅ Discovery completed: ${this.tables.length} tables found`);
  }

  /**
   * Generate new encrypted IDs for all tables
   */
  async generateNewIds(): Promise<void> {
    console.log('🔐 Generating new encrypted IDs...');

    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    for (const table of this.tables) {
      console.log(`   📋 Processing ${table.tableName}...`);

      // Skip if table name is undefined
      if (!table.tableName || table.tableName === 'undefined') {
        console.log(`   ⚠️  Skipping undefined table`);
        continue;
      }

      // Get all existing IDs (use double quotes for case-sensitive table names)
      const idsQuery = `SELECT "${table.idColumn}" FROM "${table.tableName}" ORDER BY "${table.idColumn}"`;
      const idsResult = await this.client.query(idsQuery);
      
      const mappings = new Map<string, string>();
      
      // Generate new encrypted ID for each existing ID
      for (const row of idsResult.rows) {
        const oldId = row[table.idColumn];
        const newId = this.generateEncryptedId();
        mappings.set(oldId, newId);
      }

      this.allMappings.set(table.tableName, mappings);
      console.log(`   ✅ Generated ${mappings.size} new IDs for ${table.tableName}`);
    }

    console.log('✅ ID generation completed');
  }

  /**
   * Create temporary mapping tables for each table
   */
  async createMappingTables(): Promise<void> {
    console.log('🗂️  Creating temporary mapping tables...');

    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    for (const table of this.tables) {
      const mappingTableName = `temp_mapping_${table.tableName}`;
      
      // Drop if exists
      await this.client.query(`DROP TABLE IF EXISTS "${mappingTableName}"`);
      
      // Create mapping table (simplified - use TEXT for all old_id columns)
      const createMappingQuery = `
        CREATE TEMPORARY TABLE "${mappingTableName}" (
          old_id TEXT,
          new_id TEXT PRIMARY KEY
        );
      `;
      
      await this.client.query(createMappingQuery);
      
      // Insert mappings
      const mappings = this.allMappings.get(table.tableName);
      if (mappings) {
        for (const [oldId, newId] of mappings) {
          await this.client.query(
            `INSERT INTO "${mappingTableName}" (old_id, new_id) VALUES ($1, $2)`,
            [oldId, newId]
          );
        }
      }
      
      console.log(`   ✅ Created mapping table for ${table.tableName}`);
    }

    console.log('✅ Mapping tables created');
  }

  /**
   * Get column data type for a specific column
   */
  private async getColumnType(tableName: string, columnName: string): Promise<string> {
    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    const query = `
      SELECT data_type, character_maximum_length, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2;
    `;

    const result = await this.client.query(query, [tableName, columnName]);
    
    if (result.rows.length === 0) {
      return 'TEXT'; // Default fallback
    }

    const row = result.rows[0];
    let dataType = row.data_type.toUpperCase();
    
    // Handle specific PostgreSQL types
    if (row.udt_name === 'text') {
      dataType = 'TEXT';
    } else if (row.udt_name === 'varchar') {
      dataType = 'VARCHAR';
      if (row.character_maximum_length) {
        dataType += `(${row.character_maximum_length})`;
      }
    } else if (row.udt_name === 'int4') {
      dataType = 'INTEGER';
    } else if (row.udt_name === 'int8') {
      dataType = 'BIGINT';
    } else if (row.udt_name === 'uuid') {
      dataType = 'UUID';
    }
    
    return dataType;
  }

  /**
   * Disable foreign key constraints temporarily
   */
  async disableForeignKeys(): Promise<void> {
    console.log('🔓 Disabling foreign key constraints...');

    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    // Disable all triggers and constraints
    await this.client.query('SET session_replication_role = replica;');
    console.log('   🔓 Disabled all triggers and constraints');

    console.log('✅ Foreign key constraints disabled');
  }

  /**
   * Re-enable foreign key constraints
   */
  async enableForeignKeys(): Promise<void> {
    console.log('🔒 Re-enabling foreign key constraints...');

    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    // Re-enable all triggers and constraints
    await this.client.query('SET session_replication_role = DEFAULT;');
    console.log('   🔒 Re-enabled all triggers and constraints');

    console.log('✅ Foreign key constraints re-enabled');
  }

  /**
   * Drop all foreign key constraints temporarily
   */
  async dropForeignKeys(): Promise<void> {
    console.log('🗑️  Dropping foreign key constraints...');

    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    // Get all foreign key constraints
    const constraintsQuery = `
      SELECT 
        tc.table_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `;

    const result = await this.client.query(constraintsQuery);
    
    for (const row of result.rows) {
      const dropQuery = `ALTER TABLE "${row.table_name}" DROP CONSTRAINT "${row.constraint_name}";`;
      await this.client.query(dropQuery);
      console.log(`   🗑️  Dropped constraint ${row.constraint_name} from ${row.table_name}`);
    }

    console.log('✅ Foreign key constraints dropped');
  }

  /**
   * Recreate all foreign key constraints
   */
  async recreateForeignKeys(): Promise<void> {
    console.log('🔗 Recreating foreign key constraints...');

    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    // Get all foreign key relationships
    const fkQuery = `
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS referenced_table_name,
        ccu.column_name AS referenced_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `;

    const result = await this.client.query(fkQuery);
    
    for (const row of result.rows) {
      const createQuery = `
        ALTER TABLE "${row.table_name}" 
        ADD CONSTRAINT "${row.constraint_name}" 
        FOREIGN KEY ("${row.column_name}") 
        REFERENCES "${row.referenced_table_name}" ("${row.referenced_column_name}");
      `;
      await this.client.query(createQuery);
      console.log(`   🔗 Recreated constraint ${row.constraint_name} on ${row.table_name}`);
    }

    console.log('✅ Foreign key constraints recreated');
  }
  async convertIdColumnsToText(): Promise<void> {
    console.log('🔄 Converting all ID columns to TEXT type...');

    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    for (const table of this.tables) {
      console.log(`   🔄 Converting ${table.tableName}.${table.idColumn} to TEXT...`);
      
      // Convert primary key column to TEXT
      const alterQuery = `ALTER TABLE "${table.tableName}" ALTER COLUMN "${table.idColumn}" TYPE TEXT;`;
      await this.client.query(alterQuery);
      
      // Convert all foreign key columns that reference this table
      for (const otherTable of this.tables) {
        for (const fk of otherTable.foreignKeys) {
          if (fk.referencedTable === table.tableName && fk.referencedColumn === table.idColumn) {
            console.log(`   🔄 Converting ${otherTable.tableName}.${fk.columnName} to TEXT...`);
            const fkAlterQuery = `ALTER TABLE "${otherTable.tableName}" ALTER COLUMN "${fk.columnName}" TYPE TEXT;`;
            await this.client.query(fkAlterQuery);
          }
        }
      }
    }

    console.log('✅ All ID columns converted to TEXT');
  }
  async updateForeignKeys(): Promise<void> {
    console.log('🔗 Updating foreign key references...');

    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    for (const table of this.tables) {
      for (const fk of table.foreignKeys) {
        console.log(`   🔗 Updating ${table.tableName}.${fk.columnName} -> ${fk.referencedTable}.${fk.referencedColumn}`);
        
        const mappingTableName = `temp_mapping_${fk.referencedTable}`;
        
        // Update foreign key values using mapping table
        const updateQuery = `
          UPDATE "${table.tableName}"
          SET "${fk.columnName}" = m.new_id
          FROM "${mappingTableName}" m
          WHERE "${table.tableName}"."${fk.columnName}" = m.old_id;
        `;
        
        const result = await this.client.query(updateQuery);
        console.log(`   ✅ Updated ${result.rowCount} foreign key references`);
      }
    }

    console.log('✅ Foreign key updates completed');
  }

  /**
   * Update primary key IDs in each table
   */
  async updatePrimaryKeys(): Promise<void> {
    console.log('🔑 Updating primary key IDs...');

    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    for (const table of this.tables) {
      console.log(`   🔑 Updating ${table.tableName} primary keys...`);
      
      const mappingTableName = `temp_mapping_${table.tableName}`;
      
      // Update primary key values using mapping table
      const updateQuery = `
        UPDATE "${table.tableName}"
        SET "${table.idColumn}" = m.new_id
        FROM "${mappingTableName}" m
        WHERE "${table.tableName}"."${table.idColumn}" = m.old_id;
      `;
      
      const result = await this.client.query(updateQuery);
      console.log(`   ✅ Updated ${result.rowCount} primary key values`);
    }

    console.log('✅ Primary key updates completed');
  }

  /**
   * Verify referential integrity after updates
   */
  async verifyIntegrity(): Promise<void> {
    console.log('🔍 Verifying referential integrity...');

    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    let totalViolations = 0;

    for (const table of this.tables) {
      for (const fk of table.foreignKeys) {
        // Check for orphaned foreign keys
        const checkQuery = `
          SELECT COUNT(*) as violations
          FROM "${table.tableName}" t1
          LEFT JOIN "${fk.referencedTable}" t2 ON t1."${fk.columnName}" = t2."${fk.referencedColumn}"
          WHERE t2."${fk.referencedColumn}" IS NULL
            AND t1."${fk.columnName}" IS NOT NULL;
        `;
        
        const result = await this.client.query(checkQuery);
        const violations = parseInt(result.rows[0].violations);
        
        if (violations > 0) {
          console.log(`   ⚠️  ${table.tableName}.${fk.columnName}: ${violations} orphaned references`);
          totalViolations += violations;
        } else {
          console.log(`   ✅ ${table.tableName}.${fk.columnName}: No violations`);
        }
      }
    }

    if (totalViolations === 0) {
      console.log('✅ Referential integrity verified - no violations found');
    } else {
      throw new Error(`❌ Referential integrity check failed: ${totalViolations} violations found`);
    }
  }

  /**
   * Generate summary report
   */
  async generateSummary(): Promise<void> {
    console.log('📊 Generating summary report...');

    if (!this.client) {
      throw new Error('Database client not initialized');
    }

    console.log('=' .repeat(60));
    console.log('📊 ID ENCRYPTION MIGRATION SUMMARY');
    console.log('=' .repeat(60));

    let totalRecords = 0;
    let totalForeignKeys = 0;

    for (const table of this.tables) {
      const mappings = this.allMappings.get(table.tableName);
      const recordCount = mappings ? mappings.size : 0;
      totalRecords += recordCount;
      totalForeignKeys += table.foreignKeys.length;

      console.log(`📋 ${table.tableName}:`);
      console.log(`   • Records updated: ${recordCount}`);
      console.log(`   • Foreign keys: ${table.foreignKeys.length}`);
      
      if (table.foreignKeys.length > 0) {
        table.foreignKeys.forEach(fk => {
          console.log(`     - ${fk.columnName} -> ${fk.referencedTable}.${fk.referencedColumn}`);
        });
      }
      console.log('');
    }

    console.log('=' .repeat(60));
    console.log(`📈 TOTAL STATISTICS:`);
    console.log(`   • Tables processed: ${this.tables.length}`);
    console.log(`   • Total records updated: ${totalRecords}`);
    console.log(`   • Total foreign key relationships: ${totalForeignKeys}`);
    console.log(`   • ID format: UUID v4 (encrypted)`);
    console.log('=' .repeat(60));
    console.log('🎉 ID encryption migration completed successfully!');
  }

  /**
   * Main migration process
   */
  async migrateIds(): Promise<void> {
    console.log('🚀 Starting ID encryption migration...');
    console.log('⚠️  WARNING: This operation will modify all ID values in the database!');
    console.log('=' .repeat(60));

    try {
      // Test connection
      await this.testConnection();

      // Start transaction
      console.log('🔄 Starting database transaction...');
      await this.client!.query('BEGIN');

      // Discovery phase
      await this.discoverTables();

      // Generate new IDs
      await this.generateNewIds();

      // Create mapping tables
      await this.createMappingTables();

      // Drop foreign key constraints
      await this.dropForeignKeys();

      // Convert all ID columns to TEXT first
      await this.convertIdColumnsToText();

      // Update foreign keys first (to maintain referential integrity)
      await this.updateForeignKeys();

      // Update primary keys
      await this.updatePrimaryKeys();

      // Recreate foreign key constraints
      await this.recreateForeignKeys();

      // Verify integrity
      await this.verifyIntegrity();

      // Commit transaction
      console.log('💾 Committing transaction...');
      await this.client!.query('COMMIT');

      // Generate summary
      await this.generateSummary();

    } catch (error) {
      console.error('💥 Migration failed:', error);
      
      if (this.client) {
        console.log('🔄 Rolling back transaction...');
        try {
          await this.client.query('ROLLBACK');
          console.log('✅ Transaction rolled back successfully');
        } catch (rollbackError) {
          console.error('❌ Rollback failed:', rollbackError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.client) {
      this.client.release();
    }
    await this.pool.end();
    console.log('🔌 Database connection closed');
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const migrator = new IdEncryptionMigrator();
  
  try {
    await migrator.migrateIds();
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await migrator.close();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { IdEncryptionMigrator };
