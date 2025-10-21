#!/usr/bin/env node

// Script to seed tbl_kategori with correct project categories
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedKategori() {
  try {
    console.log('🔄 Seeding tbl_kategori with project categories...');

    // Check existing data first
    const existingCategories = await prisma.category.findMany();
    console.log(`📋 Found ${existingCategories.length} existing categories:`);
    existingCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.kategori}`);
    });

    // Define the correct project categories
    const categories = [
      {
        kategori: 'INFRA NETWORK',
      },
      {
        kategori: 'INFRA CLOUD & DC',
      },
      {
        kategori: 'MULTIMEDIA & IOT',
      },
      {
        kategori: 'DIGITAL ELECTRICITY',
      },
      {
        kategori: 'SAAS BASED',
      }
    ];

    console.log('\n📝 Upserting project categories...');
    for (const category of categories) {
      const existing = await prisma.category.findUnique({
        where: { kategori: category.kategori }
      });

      if (existing) {
        console.log(`⚠️  Category already exists: ${category.kategori}`);
      } else {
        await prisma.category.create({
          data: category,
        });
        console.log(`✅ Created category: ${category.kategori}`);
      }
    }

    // Verify the data
    const allCategories = await prisma.category.findMany({
      orderBy: { kategori: 'asc' }
    });

    console.log('\n📊 Verification - All categories in tbl_kategori:');
    allCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.kategori}`);
    });

    console.log(`\n🎉 Successfully processed ${allCategories.length} categories!`);

  } catch (error) {
    console.error('❌ Error seeding kategori:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedKategori();
