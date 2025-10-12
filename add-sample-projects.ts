import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProjects = [
  {
    name: "Smart Building Automation System",
    type: "ELECTRICAL",
    status: "IN_PROGRESS",
    priority: "HIGH",
    description: "Implementation of IoT-based building automation for energy efficiency",
    client: "GreenTech Solutions",
    location: "Jakarta CBD",
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-30'),
    progress: 65
  },
  {
    name: "Data Center Network Upgrade",
    type: "IT",
    status: "PLANNING",
    priority: "HIGH",
    description: "Upgrade network infrastructure for improved performance and security",
    client: "Bank Indonesia",
    location: "Jakarta Selatan",
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-08-31'),
    progress: 10
  },
  {
    name: "Factory Electrical Installation",
    type: "ELECTRICAL",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    description: "Complete electrical installation for new manufacturing facility",
    client: "PT Industri Maju",
    location: "Bekasi",
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-07-15'),
    estimatedBudget: 320000000,
    actualBudget: 200000000,
    progress: 45
  },
  {
    name: "Hospital IT Infrastructure",
    type: "IT",
    status: "COMPLETED",
    priority: "HIGH",
    description: "Deployment of hospital management system and network infrastructure",
    client: "RS Cipto Mangunkusumo",
    location: "Jakarta Pusat",
    startDate: new Date('2023-10-01'),
    endDate: new Date('2024-01-31'),
    estimatedBudget: 150000000,
    actualBudget: 145000000,
    progress: 100
  },
  {
    name: "Shopping Mall Security System",
    type: "ELECTRICAL",
    status: "ON_HOLD",
    priority: "LOW",
    description: "Installation of comprehensive security and surveillance system",
    client: "Mall Kelapa Gading",
    location: "Jakarta Utara",
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-09-30'),
    estimatedBudget: 220000000,
    actualBudget: 50000000,
    progress: 20
  },
  {
    name: "Cloud Migration Project",
    type: "IT",
    status: "IN_PROGRESS",
    priority: "HIGH",
    description: "Migration of legacy systems to cloud infrastructure",
    client: "PT Telkom Indonesia",
    location: "Bandung",
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    estimatedBudget: 500000000,
    actualBudget: 300000000,
    progress: 55
  },
  {
    name: "Warehouse Lighting System",
    type: "ELECTRICAL",
    status: "PLANNING",
    priority: "MEDIUM",
    description: "LED lighting upgrade for warehouse facility",
    client: "PT Logistik Nusantara",
    location: "Tangerang",
    startDate: new Date('2024-05-01'),
    endDate: new Date('2024-08-31'),
    estimatedBudget: 80000000,
    actualBudget: 0,
    progress: 5
  },
  {
    name: "School Network Infrastructure",
    type: "IT",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    description: "WiFi network and computer lab setup for educational institution",
    client: "SMA Negeri 1 Jakarta",
    location: "Jakarta Selatan",
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-07-15'),
    estimatedBudget: 120000000,
    actualBudget: 80000000,
    progress: 70
  },
  {
    name: "Office Building Power Distribution",
    type: "ELECTRICAL",
    status: "COMPLETED",
    priority: "HIGH",
    description: "Electrical power distribution system for new office building",
    client: "PT Property Development",
    location: "Jakarta Barat",
    startDate: new Date('2023-08-01'),
    endDate: new Date('2023-12-31'),
    estimatedBudget: 280000000,
    actualBudget: 275000000,
    progress: 100
  },
  {
    name: "Restaurant POS System",
    type: "IT",
    status: "IN_PROGRESS",
    priority: "LOW",
    description: "Point of Sale system implementation for restaurant chain",
    client: "Restoran Sederhana",
    location: "Multiple Locations",
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-06-30'),
    estimatedBudget: 45000000,
    actualBudget: 30000000,
    progress: 60
  }
];

async function addSampleProjects() {
  try {
    console.log('🚀 Adding sample projects to database...');
    
    // Get project manager user
    const projectManager = await prisma.user.findFirst({
      where: { email: 'manager@projecthub.com' }
    });

    if (!projectManager) {
      console.error('❌ Project manager not found');
      return;
    }

    // Add projects
    for (const projectData of sampleProjects) {
      const project = await prisma.project.create({
        data: {
          ...projectData,
          projectManagerId: projectManager.id,
          creator: {
            connect: { id: projectManager.id }
          }
        }
      });
      console.log(`✅ Created project: ${project.name}`);
    }

    console.log(`🎉 Successfully added ${sampleProjects.length} sample projects!`);
    
    // Show summary
    const totalProjects = await prisma.project.count();
    console.log(`📊 Total projects in database: ${totalProjects}`);
    
  } catch (error) {
    console.error('❌ Error adding sample projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleProjects();
