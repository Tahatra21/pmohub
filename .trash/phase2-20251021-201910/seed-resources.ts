import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedResources() {
  console.log('🌱 Seeding Resources (Person in Charge)...');

  try {
    // Get existing users to link with resources
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });

    if (users.length === 0) {
      console.log('❌ No users found. Please seed users first.');
      return;
    }

    console.log(`📋 Found ${users.length} users to create resources for`);

    // Get system admin user for createdBy
    const adminUser = await prisma.user.findFirst({
      where: { 
        role: {
          name: 'System Admin'
        }
      }
    });

    if (!adminUser) {
      console.log('❌ No admin user found for createdBy');
      return;
    }

    // Create resources for each user with different roles
    const resourceData = [
      {
        userId: users[0]?.id,
        name: users[0]?.name || 'John Manager',
        type: 'PROJECT_MANAGER' as const,
        description: 'Experienced project manager with 10+ years in electrical and IT projects',
        status: 'AVAILABLE' as const,
        skills: 'Project Management, Risk Assessment, Team Leadership, Budget Planning',
        department: 'Project Management',
        phone: '+62-812-3456-7890',
        email: users[0]?.email || 'john.manager@company.com',
        maxProjects: 5,
        hourlyRate: 75.0,
        createdBy: adminUser.id
      },
      {
        userId: users[1]?.id,
        name: users[1]?.name || 'Sarah Engineer',
        type: 'FIELD_ENGINEER' as const,
        description: 'Senior field engineer specializing in electrical installations and site supervision',
        status: 'AVAILABLE' as const,
        skills: 'Electrical Systems, Site Supervision, Safety Management, Quality Control',
        department: 'Engineering',
        phone: '+62-813-4567-8901',
        email: users[1]?.email || 'sarah.engineer@company.com',
        maxProjects: 4,
        hourlyRate: 65.0,
        createdBy: adminUser.id
      },
      {
        userId: users[2]?.id,
        name: users[2]?.name || 'Mike Developer',
        type: 'IT_DEVELOPER' as const,
        description: 'Full-stack developer with expertise in web applications and system integration',
        status: 'AVAILABLE' as const,
        skills: 'React, Node.js, PostgreSQL, System Integration, API Development',
        department: 'IT Development',
        phone: '+62-814-5678-9012',
        email: users[2]?.email || 'mike.developer@company.com',
        maxProjects: 3,
        hourlyRate: 70.0,
        createdBy: adminUser.id
      },
      {
        userId: users[3]?.id,
        name: users[3]?.name || 'Lisa Technical',
        type: 'TECHNICAL_TEAM' as const,
        description: 'Technical specialist with expertise in system maintenance and troubleshooting',
        status: 'AVAILABLE' as const,
        skills: 'System Maintenance, Troubleshooting, Technical Support, Documentation',
        department: 'Technical Support',
        phone: '+62-815-6789-0123',
        email: users[3]?.email || 'lisa.technical@company.com',
        maxProjects: 4,
        hourlyRate: 55.0,
        createdBy: adminUser.id
      },
      {
        userId: users[4]?.id,
        name: users[4]?.name || 'David Client',
        type: 'CLIENT_STAKEHOLDER' as const,
        description: 'Client representative and stakeholder liaison for project coordination',
        status: 'AVAILABLE' as const,
        skills: 'Client Relations, Requirements Analysis, Stakeholder Management, Communication',
        department: 'Client Relations',
        phone: '+62-816-7890-1234',
        email: users[4]?.email || 'david.client@company.com',
        maxProjects: 2,
        hourlyRate: 60.0,
        createdBy: adminUser.id
      }
    ];

    // Create additional resources if we have more users
    const additionalResources = [];
    for (let i = 5; i < Math.min(users.length, 10); i++) {
      const user = users[i];
      const roles = ['FIELD_ENGINEER', 'IT_DEVELOPER', 'TECHNICAL_TEAM'] as const;
      const departments = ['Engineering', 'IT Development', 'Technical Support', 'Quality Assurance'];
      const skills = [
        'Electrical Systems, Automation, PLC Programming',
        'Frontend Development, UI/UX Design, Mobile Apps',
        'Network Administration, Security, Cloud Services',
        'Quality Control, Testing, Documentation',
        'Database Management, Data Analysis, Reporting'
      ];

      additionalResources.push({
        userId: user.id,
        name: user.name,
        type: roles[i % roles.length],
        description: `Experienced professional in ${roles[i % roles.length].replace('_', ' ').toLowerCase()}`,
        status: 'AVAILABLE' as const,
        skills: skills[i % skills.length],
        department: departments[i % departments.length],
        phone: `+62-817-${(8901 + i).toString().padStart(4, '0')}-${(2345 + i).toString().padStart(4, '0')}`,
        email: user.email,
        maxProjects: 3,
        hourlyRate: 50.0 + (i * 5),
        createdBy: adminUser.id
      });
    }

    const allResourceData = [...resourceData, ...additionalResources];

    // Create resources
    const createdResources = [];
    for (const resource of allResourceData) {
      if (resource.userId) {
        try {
          const created = await prisma.resource.create({
            data: resource
          });
          createdResources.push(created);
          console.log(`✅ Created resource: ${created.name} (${created.type})`);
        } catch (error) {
          console.log(`⚠️  Resource already exists for user ${resource.name}, skipping...`);
        }
      }
    }

    console.log(`\n🎯 Created ${createdResources.length} resources successfully!`);

    // Now create resource allocations for existing projects
    console.log('\n🔗 Creating resource allocations...');

    // Get existing projects
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          take: 3 // Take first 3 tasks per project
        }
      }
    });

    console.log(`📋 Found ${projects.length} projects to allocate resources to`);

    // Get created resources
    const resources = await prisma.resource.findMany({
      where: { status: 'AVAILABLE' }
    });

    console.log(`👥 Found ${resources.length} available resources`);

    // Create allocations for each project
    for (const project of projects) {
      // Allocate project manager
      const projectManager = resources.find(r => r.type === 'PROJECT_MANAGER');
      if (projectManager) {
        await prisma.resourceAllocation.create({
          data: {
            resourceId: projectManager.id,
            projectId: project.id,
            role: 'Project Manager',
            allocationPercentage: 50, // 50% allocation
            status: 'ACTIVE',
            notes: `Project manager for ${project.name}`,
            allocatedBy: adminUser.id
          }
        });
        console.log(`🔗 Allocated ${projectManager.name} as Project Manager for ${project.name}`);
      }

      // Allocate field engineer
      const fieldEngineer = resources.find(r => r.type === 'FIELD_ENGINEER');
      if (fieldEngineer) {
        await prisma.resourceAllocation.create({
          data: {
            resourceId: fieldEngineer.id,
            projectId: project.id,
            role: 'Site Supervisor',
            allocationPercentage: 80, // 80% allocation
            status: 'ACTIVE',
            notes: `Field engineer for ${project.name}`,
            allocatedBy: adminUser.id
          }
        });
        console.log(`🔗 Allocated ${fieldEngineer.name} as Site Supervisor for ${project.name}`);
      }

      // Allocate IT developer if project type is IT
      if (project.type === 'IT') {
        const itDeveloper = resources.find(r => r.type === 'IT_DEVELOPER');
        if (itDeveloper) {
          await prisma.resourceAllocation.create({
            data: {
              resourceId: itDeveloper.id,
              projectId: project.id,
              role: 'Lead Developer',
              allocationPercentage: 100, // 100% allocation
              status: 'ACTIVE',
              notes: `Lead developer for ${project.name}`,
              allocatedBy: adminUser.id
            }
          });
          console.log(`🔗 Allocated ${itDeveloper.name} as Lead Developer for ${project.name}`);
        }
      }

      // Allocate technical team member
      const technicalMember = resources.find(r => r.type === 'TECHNICAL_TEAM');
      if (technicalMember) {
        await prisma.resourceAllocation.create({
          data: {
            resourceId: technicalMember.id,
            projectId: project.id,
            role: 'Technical Support',
            allocationPercentage: 60, // 60% allocation
            status: 'ACTIVE',
            notes: `Technical support for ${project.name}`,
            allocatedBy: adminUser.id
          }
        });
        console.log(`🔗 Allocated ${technicalMember.name} as Technical Support for ${project.name}`);
      }

      // Allocate resources to specific tasks
      for (const task of project.tasks) {
        // Allocate field engineer to electrical tasks
        if (task.title.toLowerCase().includes('electrical') || task.title.toLowerCase().includes('installation')) {
          const engineer = resources.find(r => r.type === 'FIELD_ENGINEER');
          if (engineer) {
            await prisma.resourceAllocation.create({
              data: {
                resourceId: engineer.id,
                projectId: project.id,
                taskId: task.id,
                role: 'Task Lead',
                allocationPercentage: 100,
                status: 'ACTIVE',
                notes: `Task lead for ${task.title}`,
                allocatedBy: adminUser.id
              }
            });
            console.log(`🔗 Allocated ${engineer.name} to task: ${task.title}`);
          }
        }

        // Allocate IT developer to development tasks
        if (task.title.toLowerCase().includes('development') || task.title.toLowerCase().includes('coding') || task.title.toLowerCase().includes('programming')) {
          const developer = resources.find(r => r.type === 'IT_DEVELOPER');
          if (developer) {
            await prisma.resourceAllocation.create({
              data: {
                resourceId: developer.id,
                projectId: project.id,
                taskId: task.id,
                role: 'Developer',
                allocationPercentage: 100,
                status: 'ACTIVE',
                notes: `Developer for ${task.title}`,
                allocatedBy: adminUser.id
              }
            });
            console.log(`🔗 Allocated ${developer.name} to task: ${task.title}`);
          }
        }

        // Allocate technical team to testing tasks
        if (task.title.toLowerCase().includes('test') || task.title.toLowerCase().includes('quality')) {
          const technical = resources.find(r => r.type === 'TECHNICAL_TEAM');
          if (technical) {
            await prisma.resourceAllocation.create({
              data: {
                resourceId: technical.id,
                projectId: project.id,
                taskId: task.id,
                role: 'Quality Assurance',
                allocationPercentage: 80,
                status: 'ACTIVE',
                notes: `QA for ${task.title}`,
                allocatedBy: adminUser.id
              }
            });
            console.log(`🔗 Allocated ${technical.name} to task: ${task.title}`);
          }
        }
      }
    }

    // Update resource status based on allocations
    console.log('\n🔄 Updating resource status based on allocations...');
    
    const resourcesWithAllocations = await prisma.resource.findMany({
      include: {
        allocations: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    for (const resource of resourcesWithAllocations) {
      if (resource.allocations.length > 0) {
        await prisma.resource.update({
          where: { id: resource.id },
          data: { status: 'ALLOCATED' }
        });
        console.log(`🔄 Updated ${resource.name} status to ALLOCATED`);
      }
    }

    console.log('\n🎉 Resource seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Resources created: ${createdResources.length}`);
    console.log(`   - Projects allocated: ${projects.length}`);
    console.log(`   - Total allocations: ${await prisma.resourceAllocation.count()}`);

  } catch (error) {
    console.error('❌ Error seeding resources:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedResources();
