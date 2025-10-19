#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const lifecycleDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.LIFECYCLE_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/lifecycle_db'
    }
  }
});

const pmoDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/pmo_db'
    }
  }
});

async function createTablesIfNotExist() {
  console.log('🔧 Creating monitoring license tables if not exist...');
  
  try {
    // Create tbl_mon_licenses table
    await pmoDb.$executeRaw`
      CREATE TABLE IF NOT EXISTS tbl_mon_licenses (
        id SERIAL PRIMARY KEY,
        no_urut INTEGER,
        nama_aplikasi VARCHAR(255) NOT NULL,
        bpo VARCHAR(100),
        jenis_lisensi VARCHAR(255),
        jumlah INTEGER DEFAULT 0,
        harga_satuan NUMERIC(15,2) DEFAULT 0,
        harga_total NUMERIC(15,2) DEFAULT 0,
        periode_po INTEGER DEFAULT 0,
        kontrak_layanan_bulan INTEGER DEFAULT 0,
        start_layanan DATE,
        akhir_layanan DATE,
        metode VARCHAR(50),
        keterangan_akun TEXT,
        tanggal_aktivasi DATE,
        tanggal_pembaharuan DATE,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        selling_price NUMERIC(15,2) DEFAULT 0,
        purchase_price_per_unit NUMERIC(15,2) DEFAULT 0,
        total_purchase_price NUMERIC(15,2) DEFAULT 0,
        total_selling_price NUMERIC(15,2) DEFAULT 0
      )
    `;
    
    // Create tbl_license_notifications table
    await pmoDb.$executeRaw`
      CREATE TABLE IF NOT EXISTS tbl_license_notifications (
        id SERIAL PRIMARY KEY,
        license_id INTEGER,
        notification_type VARCHAR(50) NOT NULL,
        notification_date DATE NOT NULL,
        is_sent BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (license_id) REFERENCES tbl_mon_licenses(id) ON DELETE CASCADE
      )
    `;
    
    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

async function syncLicenses() {
  console.log('🔄 Syncing licenses...');
  
  try {
    // Get licenses from lifecycle_db
    const licenses = await lifecycleDb.$queryRaw`
      SELECT * FROM tbl_mon_licenses ORDER BY id
    ` as any[];
    
    console.log(`📊 Found ${licenses.length} licenses in lifecycle_db`);
    
    for (const license of licenses) {
      await pmoDb.$executeRaw`
        INSERT INTO tbl_mon_licenses (
          id, no_urut, nama_aplikasi, bpo, jenis_lisensi, jumlah, harga_satuan, 
          harga_total, periode_po, kontrak_layanan_bulan, start_layanan, akhir_layanan,
          metode, keterangan_akun, tanggal_aktivasi, tanggal_pembaharuan, status,
          created_at, updated_at, selling_price, purchase_price_per_unit,
          total_purchase_price, total_selling_price
        ) VALUES (
          ${license.id}, ${license.no_urut}, ${license.nama_aplikasi}, ${license.bpo},
          ${license.jenis_lisensi}, ${license.jumlah}, ${license.harga_satuan},
          ${license.harga_total}, ${license.periode_po}, ${license.kontrak_layanan_bulan},
          ${license.start_layanan}, ${license.akhir_layanan}, ${license.metode},
          ${license.keterangan_akun}, ${license.tanggal_aktivasi}, ${license.tanggal_pembaharuan},
          ${license.status}, ${license.created_at}, ${license.updated_at},
          ${license.selling_price}, ${license.purchase_price_per_unit},
          ${license.total_purchase_price}, ${license.total_selling_price}
        )
        ON CONFLICT (id) DO UPDATE SET
          no_urut = EXCLUDED.no_urut,
          nama_aplikasi = EXCLUDED.nama_aplikasi,
          bpo = EXCLUDED.bpo,
          jenis_lisensi = EXCLUDED.jenis_lisensi,
          jumlah = EXCLUDED.jumlah,
          harga_satuan = EXCLUDED.harga_satuan,
          harga_total = EXCLUDED.harga_total,
          periode_po = EXCLUDED.periode_po,
          kontrak_layanan_bulan = EXCLUDED.kontrak_layanan_bulan,
          start_layanan = EXCLUDED.start_layanan,
          akhir_layanan = EXCLUDED.akhir_layanan,
          metode = EXCLUDED.metode,
          keterangan_akun = EXCLUDED.keterangan_akun,
          tanggal_aktivasi = EXCLUDED.tanggal_aktivasi,
          tanggal_pembaharuan = EXCLUDED.tanggal_pembaharuan,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at,
          selling_price = EXCLUDED.selling_price,
          purchase_price_per_unit = EXCLUDED.purchase_price_per_unit,
          total_purchase_price = EXCLUDED.total_purchase_price,
          total_selling_price = EXCLUDED.total_selling_price
      `;
    }
    
    console.log(`✅ Synced ${licenses.length} licenses`);
  } catch (error) {
    console.error('❌ Error syncing licenses:', error);
    throw error;
  }
}

async function syncLicenseNotifications() {
  console.log('🔄 Syncing license notifications...');
  
  try {
    // Get notifications from lifecycle_db
    const notifications = await lifecycleDb.$queryRaw`
      SELECT * FROM tbl_license_notifications ORDER BY id
    ` as any[];
    
    console.log(`📊 Found ${notifications.length} notifications in lifecycle_db`);
    
    for (const notification of notifications) {
      await pmoDb.$executeRaw`
        INSERT INTO tbl_license_notifications (
          id, license_id, notification_type, notification_date, is_sent, sent_at, created_at
        ) VALUES (
          ${notification.id}, ${notification.license_id}, ${notification.notification_type},
          ${notification.notification_date}, ${notification.is_sent}, ${notification.sent_at},
          ${notification.created_at}
        )
        ON CONFLICT (id) DO UPDATE SET
          license_id = EXCLUDED.license_id,
          notification_type = EXCLUDED.notification_type,
          notification_date = EXCLUDED.notification_date,
          is_sent = EXCLUDED.is_sent,
          sent_at = EXCLUDED.sent_at
      `;
    }
    
    console.log(`✅ Synced ${notifications.length} notifications`);
  } catch (error) {
    console.error('❌ Error syncing notifications:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Monitoring License sync...');
    
    // Create tables if not exist
    await createTablesIfNotExist();
    
    // Sync data
    await syncLicenses();
    await syncLicenseNotifications();
    
    console.log('🎉 Monitoring License sync completed successfully!');
    
  } catch (error) {
    console.error('💥 Sync failed:', error);
    process.exit(1);
  } finally {
    await lifecycleDb.$disconnect();
    await pmoDb.$disconnect();
  }
}

main();
