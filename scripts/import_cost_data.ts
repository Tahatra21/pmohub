#!/usr/bin/env tsx

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface BlpData {
  spec: string;
  ref: string;
  monthly: number;
  daily: number;
}

interface BlnpData {
  item: string;
  ref: string;
  khs2022: string;
  note: string;
}

class CostDataImporter {
  private pool: Pool;

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
   * Test database connection
   */
  async testConnection(): Promise<void> {
    console.log('🔍 Testing database connection...');
    
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT current_database(), version()');
      console.log(`✅ Connected to: ${result.rows[0].current_database}`);
      client.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Parse BLP data from markdown content
   */
  parseBlpData(content: string): BlpData[] {
    console.log('📋 Parsing BLP data...');
    
    const blpData: BlpData[] = [];
    
    // Find BLP section
    const blpSectionMatch = content.match(/## BLP \(Biaya Langsung Personel\)([\s\S]*?)(?=##|$)/);
    if (!blpSectionMatch) {
      throw new Error('BLP section not found in markdown file');
    }
    
    const blpSection = blpSectionMatch[1];
    
    // Extract table rows (skip header row)
    const tableRows = blpSection.match(/\|\s*\d+\s*\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g);
    if (!tableRows) {
      throw new Error('No BLP table rows found');
    }
    
    console.log(`   Found ${tableRows.length} BLP rows`);
    
    for (const row of tableRows) {
      const columns = row.split('|').map(col => col.trim()).filter(col => col !== '');
      
      if (columns.length >= 5) {
        const spec = columns[1]; // Spesifikasi
        const ref = columns[2]; // Referensi Harga
        
        // Parse harga bulanan (remove dots and convert to number)
        const monthly_str = columns[3].replace(/\./g, '');
        const monthly = parseInt(monthly_str) || 0;
        
        // Parse harga harian (remove dots and convert to number)
        const daily_str = columns[4].replace(/\./g, '');
        const daily = parseInt(daily_str) || 0;
        
        blpData.push({
          spec,
          ref,
          monthly,
          daily
        });
      }
    }
    
    console.log(`   ✅ Parsed ${blpData.length} BLP records`);
    return blpData;
  }

  /**
   * Parse BLNP data from markdown content
   */
  parseBlnpData(content: string): BlnpData[] {
    console.log('📋 Parsing BLNP data...');
    
    const blnpData: BlnpData[] = [];
    
    // Find BLNP section
    const blnpSectionMatch = content.match(/## BLNP \(Biaya Langsung Non Personel\)([\s\S]*?)(?=##|$)/);
    if (!blnpSectionMatch) {
      throw new Error('BLNP section not found in markdown file');
    }
    
    const blnpSection = blnpSectionMatch[1];
    
    // Extract table rows (skip header row)
    const tableRows = blnpSection.match(/\|\s*[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g);
    if (!tableRows) {
      throw new Error('No BLNP table rows found');
    }
    
    console.log(`   Found ${tableRows.length} BLNP rows`);
    
    for (const row of tableRows) {
      const columns = row.split('|').map(col => col.trim()).filter(col => col !== '');
      
      if (columns.length >= 4) {
        const item = columns[0]; // Uraian
        const ref = columns[1]; // Referensi
        const khs2022 = columns[2]; // KHS 2022
        const note = columns[3]; // Keterangan
        
        blnpData.push({
          item,
          ref,
          khs2022,
          note
        });
      }
    }
    
    console.log(`   ✅ Parsed ${blnpData.length} BLNP records`);
    return blnpData;
  }

  /**
   * Insert BLP data into database
   */
  async insertBlpData(blpData: BlpData[]): Promise<void> {
    console.log('💾 Inserting BLP data...');
    
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Clear existing data
      console.log('   🗑️  Clearing existing BLP data...');
      await client.query('TRUNCATE TABLE tbl_hjt_blp CASCADE');
      
      // Insert new data
      console.log(`   📊 Inserting ${blpData.length} BLP records...`);
      
      for (let i = 0; i < blpData.length; i++) {
        const data = blpData[i];
        const query = `
          INSERT INTO tbl_hjt_blp (id, spec, ref, monthly, daily, "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        await client.query(query, [
          `blp_${i + 1}`, // Generate unique ID
          data.spec,
          data.ref,
          data.monthly,
          data.daily,
          new Date() // Set updatedAt to current timestamp
        ]);
        
        if ((i + 1) % 10 === 0) {
          console.log(`   📈 Inserted ${i + 1}/${blpData.length} BLP records...`);
        }
      }
      
      await client.query('COMMIT');
      console.log('   ✅ BLP data insertion completed successfully');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('   ❌ Error inserting BLP data:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Insert BLNP data into database
   */
  async insertBlnpData(blnpData: BlnpData[]): Promise<void> {
    console.log('💾 Inserting BLNP data...');
    
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Clear existing data
      console.log('   🗑️  Clearing existing BLNP data...');
      await client.query('TRUNCATE TABLE tbl_hjt_blnp CASCADE');
      
      // Insert new data
      console.log(`   📊 Inserting ${blnpData.length} BLNP records...`);
      
      for (let i = 0; i < blnpData.length; i++) {
        const data = blnpData[i];
        
        // Parse numeric value from khs2022 if it's a number
        let numericValue = null;
        let isAtCost = false;
        
        if (data.khs2022.toLowerCase() === 'at cost') {
          isAtCost = true;
        } else {
          // Try to parse as number (remove dots)
          const numericStr = data.khs2022.replace(/\./g, '');
          const parsed = parseInt(numericStr);
          if (!isNaN(parsed)) {
            numericValue = parsed;
          }
        }
        
        const query = `
          INSERT INTO tbl_hjt_blnp (id, item, ref, khs2022, "numericValue", "isAtCost", note, "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        
        await client.query(query, [
          `blnp_${i + 1}`, // Generate unique ID
          data.item,
          data.ref,
          data.khs2022,
          numericValue,
          isAtCost,
          data.note,
          new Date() // Set updatedAt to current timestamp
        ]);
        
        if ((i + 1) % 5 === 0) {
          console.log(`   📈 Inserted ${i + 1}/${blnpData.length} BLNP records...`);
        }
      }
      
      await client.query('COMMIT');
      console.log('   ✅ BLNP data insertion completed successfully');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('   ❌ Error inserting BLNP data:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Main import process
   */
  async importCostData(filePath: string): Promise<void> {
    console.log('🚀 Starting cost data import process...');
    console.log('=' .repeat(50));
    
    try {
      // Test database connection
      await this.testConnection();
      
      // Read markdown file
      console.log(`📖 Reading file: ${filePath}`);
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log(`   ✅ File read successfully (${content.length} characters)`);
      
      // Parse data
      const blpData = this.parseBlpData(content);
      const blnpData = this.parseBlnpData(content);
      
      // Insert data
      await this.insertBlpData(blpData);
      await this.insertBlnpData(blnpData);
      
      // Summary
      console.log('=' .repeat(50));
      console.log('📊 IMPORT SUMMARY');
      console.log('=' .repeat(50));
      console.log(`✅ BLP records imported: ${blpData.length}`);
      console.log(`✅ BLNP records imported: ${blnpData.length}`);
      console.log(`📈 Total records imported: ${blpData.length + blnpData.length}`);
      console.log('=' .repeat(50));
      console.log('🎉 Cost data import completed successfully!');
      
    } catch (error) {
      console.error('💥 Import process failed:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
    console.log('🔌 Database connection closed');
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const filePath = '/Users/jmaharyuda/Downloads/FDM/cost.md';
  const importer = new CostDataImporter();
  
  try {
    await importer.importCostData(filePath);
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await importer.close();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { CostDataImporter };
