import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const simpleProjects = [
  {
    name: "Smart Building Automation",
    type: "ELECTRICAL",
    status: "IN_PROGRESS",
    priority: "HIGH",
    description: "IoT-based building automation system",
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
    description: "Network infrastructure upgrade",
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
    description: "Complete electrical installation for factory",
    client: "PT Industri Maju",
    location: "Bekasi",
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-07-15'),
    progress: 45
  },
  {
    name: "Hospital IT System",
    type: "IT",
    status: "COMPLETED",
    priority: "HIGH",
    description: "Hospital management system deployment",
    client: "RS Cipto Mangunkusumo",
    location: "Jakarta Pusat",
    startDate: new Date('2023-10-01'),
    endDate: new Date('2024-01-31'),
    progress: 100
  },
  {
    name: "Shopping Mall Security",
    type: "ELECTRICAL",
    status: "ON_HOLD",
    priority: "LOW",
    description: "Security and surveillance system",
    client: "Mall Kelapa Gading",
    location: "Jakarta Utara",
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-09-30'),
    progress: 20
  },
  {
    name: "Cloud Migration",
    type: "IT",
    status: "IN_PROGRESS",
    priority: "HIGH",
    description: "Legacy system migration to cloud",
    client: "PT Telkom Indonesia",
    location: "Bandung",
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    progress: 55
  },
  {
    name: "Warehouse Lighting",
    type: "ELECTRICAL",
    status: "PLANNING",
    priority: "MEDIUM",
    description: "LED lighting upgrade",
    client: "PT Logistik Nusantara",
    location: "Tangerang",
    startDate: new Date('2024-05-01'),
    endDate: new Date('2024-08-31'),
    progress: 5
  },
  {
    name: "School Network Setup",
    type: "IT",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    description: "WiFi network and computer lab",
    client: "SMA Negeri 1 Jakarta",
    location: "Jakarta Selatan",
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-07-15'),
    progress: 70
  },
  {
    name: "Office Power Distribution",
    type: "ELECTRICAL",
    status: "COMPLETED",
    priority: "HIGH",
    description: "Electrical power distribution system",
    client: "PT Property Development",
    location: "Jakarta Barat",
    startDate: new Date('2023-08-01'),
    endDate: new Date('2023-12-31'),
    progress: 100
  },
  {
    name: "Restaurant POS System",
    type: "IT",
    status: "IN_PROGRESS",
    priority: "LOW",
    description: "Point of Sale system implementation",
    client: "Restoran Sederhana",
    location: "Multiple Locations",
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-06-30'),
    progress: 60
  }
];

async function addSimpleProjects() {
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

    console.log(`📋 Found project manager: ${projectManager.name}`);

    // Add projects
    for (const projectData of simpleProjects) {
      const project = await prisma.project.create({
        data: {
          ...projectData,
          createdBy: projectManager.id,
        }
      });
      console.log(`✅ Created project: ${project.name}`);
    }

    console.log(`🎉 Successfully added ${simpleProjects.length} sample projects!`);
    
    // Show summary
    const totalProjects = await prisma.project.count();
    console.log(`📊 Total projects in database: ${totalProjects}`);
    
  } catch (error) {
    console.error('❌ Error adding sample projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSimpleProjects();
