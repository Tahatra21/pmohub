#!/usr/bin/env node

// Script to update project types in database to match dropdown values
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProjectTypes() {
  try {
    console.log('🔄 Updating project types in database...');

    // Get all projects
    const projects = await prisma.project.findMany({
      select: { id: true, name: true, type: true }
    });

    console.log('📋 Current project types in database:');
    projects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name} - Type: "${project.type}"`);
    });

    // Define mapping from old types to new types
    const typeMapping = {
      'Software Development': 'SAAS BASED',
      'Electrical Infrastructure': 'INFRA NETWORK',
      'IT Infrastructure': 'INFRA CLOUD & DC',
      'Multimedia Systems': 'MULTIMEDIA & IOT',
      'Digital Systems': 'DIGITAL ELECTRICITY',
      'Network Infrastructure': 'INFRA NETWORK',
      'Data Center': 'INFRA CLOUD & DC',
      'IoT Systems': 'MULTIMEDIA & IOT',
      'Smart Grid': 'DIGITAL ELECTRICITY',
      'Mobile Development': 'SAAS BASED',
      'Web Development': 'SAAS BASED',
      'System Integration': 'SAAS BASED',
      'Cloud Migration': 'INFRA CLOUD & DC',
      'Digital Transformation': 'SAAS BASED',
      'Infrastructure': 'INFRA NETWORK'
    };

    // Update projects with new types
    let updatedCount = 0;
    for (const project of projects) {
      const newType = typeMapping[project.type];
      if (newType) {
        await prisma.project.update({
          where: { id: project.id },
          data: { type: newType }
        });
        console.log(`✅ Updated "${project.name}" from "${project.type}" to "${newType}"`);
        updatedCount++;
      } else {
        console.log(`⚠️  No mapping found for "${project.type}" in project "${project.name}"`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total projects: ${projects.length}`);
    console.log(`   Updated projects: ${updatedCount}`);
    console.log(`   Unmapped types: ${projects.length - updatedCount}`);

    // Verify the update
    console.log('\n🔍 Verifying updated project types:');
    const updatedProjects = await prisma.project.findMany({
      select: { id: true, name: true, type: true }
    });

    updatedProjects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name} - Type: "${project.type}"`);
    });

    console.log('\n🎉 Project types update completed!');

  } catch (error) {
    console.error('❌ Error updating project types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProjectTypes();
