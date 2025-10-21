import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProjectTypes() {
  console.log('🌱 Seeding Project Types...');

  const projectTypesData = [
    {
      name: 'Infra Network',
      description: 'Network infrastructure projects including LAN, WAN, wireless networks, and network security',
    },
    {
      name: 'Infra Cloud & DC',
      description: 'Cloud infrastructure and data center projects including server setup, cloud migration, and data center management',
    },
    {
      name: 'Multimedia & IoT',
      description: 'Multimedia systems and Internet of Things projects including audio/video systems, smart devices, and IoT integrations',
    },
    {
      name: 'Digital Electricity',
      description: 'Digital electrical systems and smart grid projects including smart meters, electrical automation, and power management systems',
    },
    {
      name: 'SaaS Based',
      description: 'Software as a Service based projects including web applications, cloud software solutions, and subscription-based services',
    },
  ];

  const createdTypes = [];
  for (const data of projectTypesData) {
    const projectType = await prisma.projectType.upsert({
      where: { name: data.name },
      update: data,
      create: data,
    });
    createdTypes.push(projectType);
    console.log(`✅ Created/Updated project type: ${projectType.name}`);
  }

  console.log(`\n🎯 Created/Updated ${createdTypes.length} project types successfully!\n`);

  // Display summary
  console.log('📊 Project Types Summary:');
  for (const type of createdTypes) {
    console.log(`   - ${type.name}: ${type.description}`);
  }

  console.log('\n🎉 Project Types seeding completed successfully!\n');
}

seedProjectTypes()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
