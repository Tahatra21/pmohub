import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleSeed() {
  try {
    console.log('🚀 Starting simple database seeding...');

    // Get users
    const admin = await prisma.user.findFirst({ where: { email: 'admin@projecthub.com' } });
    const manager = await prisma.user.findFirst({ where: { email: 'manager@projecthub.com' } });
    const engineer = await prisma.user.findFirst({ where: { email: 'engineer@projecthub.com' } });

    if (!admin || !manager || !engineer) {
      console.error('❌ Required users not found');
      return;
    }

    // Get projects
    const projects = await prisma.project.findMany({ take: 3 });
    if (projects.length === 0) {
      console.error('❌ No projects found');
      return;
    }

    console.log(`📋 Found ${projects.length} projects to work with`);

    // 1. Add Tasks (using valid TaskStatus)
    console.log('📝 Adding sample tasks...');
    const tasks = [
      {
        title: "System Design",
        description: "Design system architecture",
        status: "TODO" as const,
        priority: "HIGH" as const,
        progress: 0,
        projectId: projects[0].id,
        assigneeId: engineer.id,
        creatorId: manager.id,
      },
      {
        title: "Hardware Setup",
        description: "Install hardware components",
        status: "IN_PROGRESS" as const,
        priority: "MEDIUM" as const,
        progress: 50,
        projectId: projects[0].id,
        assigneeId: engineer.id,
        creatorId: manager.id,
      },
      {
        title: "Network Configuration",
        description: "Configure network settings",
        status: "REVIEW" as const,
        priority: "HIGH" as const,
        progress: 80,
        projectId: projects[1].id,
        assigneeId: engineer.id,
        creatorId: manager.id,
      },
      {
        title: "Testing Phase",
        description: "Test system functionality",
        status: "COMPLETED" as const,
        priority: "HIGH" as const,
        progress: 100,
        projectId: projects[2].id,
        assigneeId: engineer.id,
        creatorId: manager.id,
      }
    ];

    for (const task of tasks) {
      await prisma.task.create({ data: task });
      console.log(`✅ Created task: ${task.title}`);
    }

    // 2. Add Milestones (using valid MilestoneStatus)
    console.log('🎯 Adding sample milestones...');
    const milestones = [
      {
        title: "Project Kickoff",
        description: "Project initiation milestone",
        status: "COMPLETED" as const,
        dueDate: new Date('2024-01-15'),
        completedAt: new Date('2024-01-15'),
        projectId: projects[0].id,
      },
      {
        title: "Design Phase Complete",
        description: "System design completed",
        status: "IN_PROGRESS" as const,
        dueDate: new Date('2024-02-28'),
        projectId: projects[0].id,
      },
      {
        title: "Testing Complete",
        description: "All testing completed",
        status: "UPCOMING" as const,
        dueDate: new Date('2024-04-30'),
        projectId: projects[1].id,
      }
    ];

    for (const milestone of milestones) {
      await prisma.milestone.create({ data: milestone });
      console.log(`✅ Created milestone: ${milestone.title}`);
    }

    // 3. Add Resources
    console.log('🔧 Adding sample resources...');
    const resources = [
      {
        name: "IoT Sensors",
        type: "EQUIPMENT" as const,
        description: "Smart sensors for automation",
        quantity: 25,
        unit: "units",
        costPerUnit: 250000,
        projectId: projects[0].id,
      },
      {
        name: "Network Switches",
        type: "EQUIPMENT" as const,
        description: "Managed network switches",
        quantity: 5,
        unit: "units",
        costPerUnit: 1500000,
        projectId: projects[1].id,
      },
      {
        name: "Senior Engineer",
        type: "MANPOWER" as const,
        description: "Senior electrical engineer",
        quantity: 2,
        unit: "persons",
        costPerUnit: 15000000,
        projectId: projects[2].id,
      },
      {
        name: "Electrical Cables",
        type: "MATERIAL" as const,
        description: "Copper electrical cables",
        quantity: 1000,
        unit: "meters",
        costPerUnit: 25000,
        projectId: projects[0].id,
      }
    ];

    for (const resource of resources) {
      await prisma.resource.create({ data: resource });
      console.log(`✅ Created resource: ${resource.name}`);
    }

    // 4. Add Budgets
    console.log('💰 Adding sample budgets...');
    const budgets = [
      {
        category: "HARDWARE",
        estimatedCost: 50000000,
        actualCost: 45000000,
        projectId: projects[0].id,
        approvedBy: manager.id,
        approvedAt: new Date(),
      },
      {
        category: "LABOR",
        estimatedCost: 80000000,
        actualCost: 75000000,
        projectId: projects[0].id,
        approvedBy: manager.id,
        approvedAt: new Date(),
      },
      {
        category: "MATERIALS",
        estimatedCost: 30000000,
        actualCost: 28000000,
        projectId: projects[1].id,
        approvedBy: manager.id,
        approvedAt: new Date(),
      }
    ];

    for (const budget of budgets) {
      await prisma.budget.create({ data: budget });
      console.log(`✅ Created budget: ${budget.category}`);
    }

    // 5. Add Risks
    console.log('⚠️ Adding sample risks...');
    const risks = [
      {
        title: "Hardware Delay",
        description: "Potential delay in hardware delivery",
        severity: "MEDIUM" as const,
        status: "OPEN" as const,
        mitigation: "Maintain backup suppliers",
        assigneeId: engineer.id,
        projectId: projects[0].id,
      },
      {
        title: "Budget Overrun",
        description: "Risk of exceeding allocated budget",
        severity: "HIGH" as const,
        status: "OPEN" as const,
        mitigation: "Regular budget monitoring",
        assigneeId: manager.id,
        projectId: projects[1].id,
      },
      {
        title: "Security Breach",
        description: "Risk of security breach during upgrade",
        severity: "HIGH" as const,
        status: "RESOLVED" as const,
        mitigation: "Implement security protocols",
        assigneeId: engineer.id,
        projectId: projects[2].id,
        resolvedAt: new Date(),
      }
    ];

    for (const risk of risks) {
      await prisma.risk.create({ data: risk });
      console.log(`✅ Created risk: ${risk.title}`);
    }

    // 6. Add Documents
    console.log('📄 Adding sample documents...');
    const documents = [
      {
        title: "System Architecture",
        description: "System architecture document",
        fileName: "architecture.pdf",
        filePath: "/documents/architecture.pdf",
        fileSize: 2048000,
        fileType: "pdf",
        projectId: projects[0].id,
        uploadedBy: engineer.id,
      },
      {
        title: "Network Manual",
        description: "Network configuration manual",
        fileName: "network-manual.pdf",
        filePath: "/documents/network-manual.pdf",
        fileSize: 1536000,
        fileType: "pdf",
        projectId: projects[1].id,
        uploadedBy: engineer.id,
      },
      {
        title: "Test Results",
        description: "System testing results",
        fileName: "test-results.pdf",
        filePath: "/documents/test-results.pdf",
        fileSize: 1024000,
        fileType: "pdf",
        projectId: projects[2].id,
        uploadedBy: engineer.id,
      }
    ];

    for (const document of documents) {
      await prisma.document.create({ data: document });
      console.log(`✅ Created document: ${document.title}`);
    }

    // 7. Add Activity Logs
    console.log('📊 Adding sample activity logs...');
    const activities = [
      {
        action: "CREATE",
        entity: "Project",
        entityId: projects[0].id,
        description: "Created new project",
        userId: manager.id,
      },
      {
        action: "UPDATE",
        entity: "Task",
        entityId: "task-1",
        description: "Updated task progress",
        userId: engineer.id,
      },
      {
        action: "UPLOAD",
        entity: "Document",
        entityId: "doc-1",
        description: "Uploaded system document",
        userId: engineer.id,
      }
    ];

    for (const activity of activities) {
      await prisma.activityLog.create({ data: activity });
      console.log(`✅ Created activity: ${activity.description}`);
    }

    console.log('🎉 Simple seeding completed successfully!');
    
    // Show summary
    const summary = {
      projects: await prisma.project.count(),
      tasks: await prisma.task.count(),
      milestones: await prisma.milestone.count(),
      resources: await prisma.resource.count(),
      budgets: await prisma.budget.count(),
      risks: await prisma.risk.count(),
      documents: await prisma.document.count(),
      activityLogs: await prisma.activityLog.count(),
    };

    console.log('\n📊 Database Summary:');
    console.log(`   Projects: ${summary.projects}`);
    console.log(`   Tasks: ${summary.tasks}`);
    console.log(`   Milestones: ${summary.milestones}`);
    console.log(`   Resources: ${summary.resources}`);
    console.log(`   Budgets: ${summary.budgets}`);
    console.log(`   Risks: ${summary.risks}`);
    console.log(`   Documents: ${summary.documents}`);
    console.log(`   Activity Logs: ${summary.activityLogs}`);

  } catch (error) {
    console.error('❌ Error during simple seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleSeed();
