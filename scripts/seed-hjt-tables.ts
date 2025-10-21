/**
 * Script untuk mengisi data BLP dan BLNP ke tabel terpisah tbl_hjt_blp dan tbl_hjt_blnp
 * Berdasarkan data dari cost.md
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data BLNP (Biaya Langsung Non Personel)
const blnpData = [
  {
    item: 'Biaya tiket termasuk airport tax',
    ref: 'INKINDO',
    khs2022: 'at cost',
    note: 'domestik berlaku tarif Garuda kelas ekonomi',
    isAtCost: true
  },
  {
    item: 'Biaya perjalanan darat',
    ref: 'INKINDO',
    khs2022: 'at cost',
    note: 'per orang per pekerjaan (dari kantor pelaksana ke bandara pp)',
    isAtCost: true
  },
  {
    item: 'Biaya penginapan',
    ref: 'KHS 2016',
    khs2022: '550.000',
    note: 'per hari (tidak sama dengan lokasi kantor)',
    numericValue: 550000,
    isAtCost: false
  },
  {
    item: 'Tunjangan harian',
    ref: 'INKINDO',
    khs2022: '350.000',
    note: 'per hari (tidak sama dengan lokasi kantor)',
    numericValue: 350000,
    isAtCost: false
  },
  {
    item: 'Tunjangan tugas luar',
    ref: 'INKINDO',
    khs2022: '350.000',
    note: 'per hari (tidak sama dengan lokasi kantor)',
    numericValue: 350000,
    isAtCost: false
  },
  {
    item: 'Biaya Alat Kerja',
    ref: 'KHS 2016',
    khs2022: '100.000',
    note: 'per orang per hari atau maksimal 1.000.000 per orang per bulan',
    numericValue: 100000,
    isAtCost: false
  },
  {
    item: 'Biaya Dokumentasi',
    ref: 'KHS 2016',
    khs2022: '1.000.000',
    note: '1 kali per pekerjaan',
    numericValue: 1000000,
    isAtCost: false
  },
  {
    item: 'Biaya Akomodasi Rapat Sosialisasi / UAT',
    ref: 'KHS 2016',
    khs2022: 'at cost',
    note: '1 kali per sosialisasi / UAT',
    isAtCost: true
  }
];

// Data BLP (Biaya Langsung Personel)
const blpData = [
  { spec: 'Administration Staff', ref: 'INKINDO', monthly: 7400000, daily: 370000, isActive: true },
  { spec: 'Administration & Contract Leader', ref: 'INKINDO', monthly: 47450000, daily: 2372500, isActive: true },
  { spec: 'Administrator System Contact Center', ref: 'INKINDO', monthly: 21950000, daily: 1097500, isActive: true },
  { spec: 'Application Support', ref: 'INKINDO', monthly: 11650000, daily: 582500, isActive: true },
  { spec: 'Bisnis Proses Senior', ref: 'INKINDO', monthly: 28150000, daily: 1407500, isActive: true },
  { spec: 'Bisnis Proses Madya', ref: 'INKINDO', monthly: 25050000, daily: 1252500, isActive: true },
  { spec: 'Bisnis Proses Junior', ref: 'KHS PLN', monthly: 17182000, daily: 781000, isActive: true },
  { spec: 'Change Management', ref: 'INKINDO', monthly: 36100000, daily: 1805000, isActive: true },
  { spec: 'Data Migration', ref: 'INKINDO', monthly: 26600000, daily: 1330000, isActive: true },
  { spec: 'Data Recon', ref: 'INKINDO', monthly: 21950000, daily: 1097500, isActive: true },
  { spec: 'Database Administration Senior', ref: 'INKINDO', monthly: 25050000, daily: 1252500, isActive: true },
  { spec: 'Database Administration Junior', ref: 'INKINDO', monthly: 21950000, daily: 1097500, isActive: true },
  { spec: 'Engineer System Contact Center', ref: 'INKINDO', monthly: 21950000, daily: 1097500, isActive: true },
  { spec: 'Helpdesk Support', ref: 'INKINDO', monthly: 6650000, daily: 332500, isActive: true },
  { spec: 'Operator DC', ref: 'INKINDO', monthly: 13500000, daily: 675000, isActive: true },
  { spec: 'Koordinator Teknis Senior', ref: 'INKINDO', monthly: 28150000, daily: 1407500, isActive: true },
  { spec: 'Koordinator Teknis Junior', ref: 'KHS PLN', monthly: 18744000, daily: 852000, isActive: true },
  { spec: 'Programmer Senior 2', ref: 'INKINDO', monthly: 35850000, daily: 1792500, isActive: true },
  { spec: 'Programmer Senior 1', ref: 'INKINDO', monthly: 28150000, daily: 1407500, isActive: true },
  { spec: 'Programmer Madya', ref: 'KHS PLN', monthly: 21868000, daily: 994000, isActive: true },
  { spec: 'Programmer Junior', ref: 'KHS PLN', monthly: 17182000, daily: 781000, isActive: true },
  { spec: 'Project Director', ref: 'INKINDO', monthly: 75900000, daily: 3795000, isActive: true },
  { spec: 'Project Manager (Project Leader)', ref: 'INKINDO', monthly: 56950000, daily: 2847500, isActive: true },
  { spec: 'Quality Assurance Senior', ref: 'INKINDO', monthly: 23500000, daily: 1175000, isActive: true },
  { spec: 'Quality Assurance Junior', ref: 'KHS PLN', monthly: 15620000, daily: 710000, isActive: true },
  { spec: 'Server Admin (DEPLOY)', ref: 'INKINDO', monthly: 13500000, daily: 675000, isActive: true },
  { spec: 'Solution Architect', ref: 'INKINDO', monthly: 25050000, daily: 1252500, isActive: true },
  { spec: 'System Analyst Senior', ref: 'INKINDO', monthly: 25050000, daily: 1252500, isActive: true },
  { spec: 'System Analyst Madya', ref: 'INKINDO', monthly: 21950000, daily: 1097500, isActive: true },
  { spec: 'System Analyst Junior', ref: 'KHS PLN', monthly: 17182000, daily: 781000, isActive: true },
  { spec: 'Systems/Network Admin Madya', ref: 'INKINDO', monthly: 21950000, daily: 1097500, isActive: true },
  { spec: 'Systems/Network Admin Junior', ref: 'KHS PLN', monthly: 17182000, daily: 781000, isActive: true },
  { spec: 'Technical Writer', ref: 'KHS PLN', monthly: 11088000, daily: 504000, isActive: true },
  { spec: 'Training Executive', ref: 'INKINDO', monthly: 13500000, daily: 675000, isActive: true },
  { spec: 'Desain UI/UX', ref: 'KHS PLN', monthly: 17182000, daily: 781000, isActive: true }
];

async function seedHjtTables() {
  try {
    console.log('🚀 Starting HJT tables seeding...');

    // Clear existing data
    await prisma.hjtBlp.deleteMany({});
    await prisma.hjtBlnp.deleteMany({});
    console.log('✅ Cleared existing HJT data');

    // Insert BLNP data
    console.log('📝 Inserting BLNP data to tbl_hjt_blnp...');
    for (const item of blnpData) {
      await prisma.hjtBlnp.create({
        data: {
          item: item.item,
          ref: item.ref,
          khs2022: item.khs2022,
          note: item.note,
          numericValue: item.numericValue,
          isAtCost: item.isAtCost
        }
      });
    }
    console.log(`✅ Inserted ${blnpData.length} BLNP records to tbl_hjt_blnp`);

    // Insert BLP data
    console.log('📝 Inserting BLP data to tbl_hjt_blp...');
    for (const item of blpData) {
      await prisma.hjtBlp.create({
        data: {
          spec: item.spec,
          ref: item.ref,
          monthly: item.monthly,
          daily: item.daily,
          isActive: item.isActive
        }
      });
    }
    console.log(`✅ Inserted ${blpData.length} BLP records to tbl_hjt_blp`);

    // Verify data
    const blpCount = await prisma.hjtBlp.count();
    const blnpCount = await prisma.hjtBlnp.count();

    console.log('📊 Verification:');
    console.log(`   tbl_hjt_blp records: ${blpCount}`);
    console.log(`   tbl_hjt_blnp records: ${blnpCount}`);
    console.log(`   Total records: ${blpCount + blnpCount}`);

    // Show sample data
    console.log('\n📋 Sample BLP data:');
    const sampleBlp = await prisma.hjtBlp.findMany({ take: 3 });
    sampleBlp.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.spec} - ${item.monthly.toLocaleString('id-ID')}/bulan (${item.isActive ? 'Active' : 'Inactive'})`);
    });

    console.log('\n📋 Sample BLNP data:');
    const sampleBlnp = await prisma.hjtBlnp.findMany({ take: 3 });
    sampleBlnp.forEach(item => {
      const value = item.isAtCost ? 'At Cost' : item.numericValue?.toLocaleString('id-ID');
      console.log(`   ${item.item} - ${value}`);
    });

    console.log('\n🎉 HJT tables seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding HJT tables:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedHjtTables()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedHjtTables };
