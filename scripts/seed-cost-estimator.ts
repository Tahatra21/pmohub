/**
 * Script untuk mengisi sample data ke tabel tbl_cost_estimator
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample data untuk Cost Estimator
const costEstimatorData = [
  {
    name: 'Estimasi Proyek Sistem ERP',
    projectName: 'Implementasi ERP Perusahaan ABC',
    client: 'PT ABC Indonesia',
    description: 'Estimasi biaya untuk implementasi sistem ERP lengkap termasuk customisasi dan training',
    status: 'ACTIVE',
    version: '1.0',
    markUpPct: 15.0,
    contingencyPct: 10.0,
    discountPct: 5.0,
    ppnPct: 11.0,
    escalationPct: 3.0,
    subtotal: 2500000000,
    escalation: 75000000,
    overhead: 375000000,
    contingency: 250000000,
    discount: 125000000,
    dpp: 2700000000,
    ppn: 297000000,
    grandTotal: 2997000000,
    assumptions: {
      duration: '12 bulan',
      teamSize: '8 orang',
      scope: 'Full implementation dengan customisasi',
      risks: 'Medium risk project'
    },
    notes: 'Estimasi berdasarkan pengalaman proyek serupa',
    createdBy: 'admin@company.com'
  },
  {
    name: 'Estimasi Proyek Mobile App',
    projectName: 'Pengembangan Aplikasi Mobile Banking',
    client: 'Bank XYZ',
    description: 'Estimasi biaya untuk pengembangan aplikasi mobile banking dengan fitur lengkap',
    status: 'DRAFT',
    version: '1.0',
    markUpPct: 20.0,
    contingencyPct: 15.0,
    discountPct: 0.0,
    ppnPct: 11.0,
    escalationPct: 5.0,
    subtotal: 1800000000,
    escalation: 90000000,
    overhead: 360000000,
    contingency: 270000000,
    discount: 0,
    dpp: 2250000000,
    ppn: 247500000,
    grandTotal: 2497500000,
    assumptions: {
      duration: '8 bulan',
      teamSize: '6 orang',
      scope: 'iOS dan Android dengan backend',
      risks: 'High risk project - security critical'
    },
    notes: 'Estimasi awal, masih dalam tahap review',
    createdBy: 'pm@company.com'
  },
  {
    name: 'Estimasi Proyek Website E-commerce',
    projectName: 'Platform E-commerce B2B',
    client: 'PT DEF Trading',
    description: 'Estimasi biaya untuk pengembangan platform e-commerce B2B dengan integrasi payment gateway',
    status: 'COMPLETED',
    version: '2.1',
    markUpPct: 12.0,
    contingencyPct: 8.0,
    discountPct: 10.0,
    ppnPct: 11.0,
    escalationPct: 2.0,
    subtotal: 1200000000,
    escalation: 24000000,
    overhead: 144000000,
    contingency: 96000000,
    discount: 120000000,
    dpp: 1320000000,
    ppn: 145200000,
    grandTotal: 1465200000,
    assumptions: {
      duration: '6 bulan',
      teamSize: '5 orang',
      scope: 'Web platform dengan admin panel',
      risks: 'Low risk project'
    },
    notes: 'Proyek telah selesai dan berhasil',
    createdBy: 'dev@company.com',
    approvedBy: 'manager@company.com',
    approvedAt: new Date('2024-01-15')
  },
  {
    name: 'Estimasi Proyek Data Analytics',
    projectName: 'Sistem Business Intelligence',
    client: 'PT GHI Manufacturing',
    description: 'Estimasi biaya untuk implementasi sistem BI dan data analytics',
    status: 'CANCELLED',
    version: '1.0',
    markUpPct: 18.0,
    contingencyPct: 12.0,
    discountPct: 0.0,
    ppnPct: 11.0,
    escalationPct: 4.0,
    subtotal: 800000000,
    escalation: 32000000,
    overhead: 144000000,
    contingency: 96000000,
    discount: 0,
    dpp: 1072000000,
    ppn: 117920000,
    grandTotal: 1189920000,
    assumptions: {
      duration: '10 bulan',
      teamSize: '4 orang',
      scope: 'Data warehouse dan dashboard',
      risks: 'Medium risk project'
    },
    notes: 'Proyek dibatalkan karena perubahan requirement',
    createdBy: 'analyst@company.com'
  },
  {
    name: 'Estimasi Proyek Cloud Migration',
    projectName: 'Migrasi ke Cloud AWS',
    client: 'PT JKL Services',
    description: 'Estimasi biaya untuk migrasi sistem legacy ke cloud AWS',
    status: 'ACTIVE',
    version: '1.2',
    markUpPct: 25.0,
    contingencyPct: 20.0,
    discountPct: 8.0,
    ppnPct: 11.0,
    escalationPct: 6.0,
    subtotal: 3000000000,
    escalation: 180000000,
    overhead: 750000000,
    contingency: 600000000,
    discount: 240000000,
    dpp: 3690000000,
    ppn: 405900000,
    grandTotal: 4095900000,
    assumptions: {
      duration: '18 bulan',
      teamSize: '10 orang',
      scope: 'Full migration dengan optimization',
      risks: 'High risk project - business critical'
    },
    notes: 'Estimasi terbaru setelah review requirement',
    createdBy: 'architect@company.com'
  }
];

async function seedCostEstimator() {
  try {
    console.log('🚀 Starting Cost Estimator seeding...');

    // Clear existing data
    await prisma.costEstimator.deleteMany({});
    console.log('✅ Cleared existing Cost Estimator data');

    // Insert sample data
    console.log('📝 Inserting Cost Estimator sample data...');
    for (const item of costEstimatorData) {
      await prisma.costEstimator.create({
        data: item
      });
    }
    console.log(`✅ Inserted ${costEstimatorData.length} Cost Estimator records`);

    // Verify data
    const totalCount = await prisma.costEstimator.count();
    const activeCount = await prisma.costEstimator.count({ where: { status: 'ACTIVE' } });
    const draftCount = await prisma.costEstimator.count({ where: { status: 'DRAFT' } });
    const completedCount = await prisma.costEstimator.count({ where: { status: 'COMPLETED' } });
    const cancelledCount = await prisma.costEstimator.count({ where: { status: 'CANCELLED' } });

    console.log('📊 Verification:');
    console.log(`   Total records: ${totalCount}`);
    console.log(`   Active: ${activeCount}`);
    console.log(`   Draft: ${draftCount}`);
    console.log(`   Completed: ${completedCount}`);
    console.log(`   Cancelled: ${cancelledCount}`);

    // Show sample data
    console.log('\n📋 Sample Cost Estimator data:');
    const sampleData = await prisma.costEstimator.findMany({ take: 3 });
    sampleData.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - ${item.status} - ${item.grandTotal.toLocaleString('id-ID')}`);
    });

    console.log('\n🎉 Cost Estimator seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding Cost Estimator:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedCostEstimator()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedCostEstimator };
