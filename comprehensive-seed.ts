import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveSeed() {
  try {
    console.log('🚀 Starting comprehensive database seeding...');

    // Get users
    const admin = await prisma.user.findFirst({ where: { email: 'admin@projecthub.com' } });
    const manager = await prisma.user.findFirst({ where: { email: 'manager@projecthub.com' } });
    const engineer = await prisma.user.findFirst({ where: { email: 'engineer@projecthub.com' } });

    if (!admin || !manager || !engineer) {
      console.error('❌ Required users not found');
      return;
    }

    // Get projects
    const projects = await prisma.project.findMany({ take: 5 });
    if (projects.length === 0) {
      console.error('❌ No projects found');
      return;
    }

    console.log(`📋 Found ${projects.length} projects to work with`);

    // 1. Add Tasks
    console.log('📝 Adding sample tasks...');
    const taskData = [
      {
        title: "System Architecture Design",
        description: "Design the overall system architecture for the building automation system",
        status: "IN_PROGRESS",
        priority: "HIGH",
        progress: 75,
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-02-15'),
        projectId: projects[0].id,
        assigneeId: engineer.id,
      },
      {
        title: "Hardware Installation",
        description: "Install sensors and control devices throughout the building",
        status: "UPCOMING",
        priority: "HIGH",
        progress: 20,
        startDate: new Date('2024-02-16'),
        endDate: new Date('2024-03-30'),
        projectId: projects[0].id,
        assigneeId: engineer.id,
      },
      {
        title: "Network Configuration",
        description: "Configure network infrastructure for data center upgrade",
        status: "IN_PROGRESS",
        priority: "HIGH",
        progress: 60,
        startDate: new Date('2024-03-05'),
        endDate: new Date('2024-04-15'),
        projectId: projects[1].id,
        assigneeId: engineer.id,
      },
      {
        title: "Electrical Wiring",
        description: "Install electrical wiring for factory facility",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        progress: 45,
        startDate: new Date('2024-02-05'),
        endDate: new Date('2024-04-20'),
        projectId: projects[2].id,
        assigneeId: engineer.id,
      },
      {
        title: "System Testing",
        description: "Test hospital IT system functionality",
        status: "COMPLETED",
        priority: "HIGH",
        progress: 100,
        startDate: new Date('2023-12-01'),
        endDate: new Date('2024-01-25'),
        projectId: projects[3].id,
        assigneeId: engineer.id,
      },
      {
        title: "Security Camera Installation",
        description: "Install security cameras in shopping mall",
        status: "UPCOMING",
        priority: "LOW",
        progress: 15,
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-06-30'),
        projectId: projects[4].id,
        assigneeId: engineer.id,
      },
      {
        title: "Database Migration",
        description: "Migrate legacy databases to cloud infrastructure",
        status: "IN_PROGRESS",
        priority: "HIGH",
        progress: 70,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-08-31'),
        projectId: projects[1].id,
        assigneeId: engineer.id,
      },
      {
        title: "LED Fixture Installation",
        description: "Install LED lighting fixtures in warehouse",
        status: "UPCOMING",
        priority: "MEDIUM",
        progress: 10,
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-07-31'),
        projectId: projects[2].id,
        assigneeId: engineer.id,
      }
    ];

    for (const task of taskData) {
      await prisma.task.create({ 
        data: {
          ...task,
          creatorId: manager.id,
        }
      });
      console.log(`✅ Created task: ${task.title}`);
    }

    // 2. Add Milestones
    console.log('🎯 Adding sample milestones...');
    const milestoneData = [
      {
        title: "Phase 1 Complete",
        description: "Architecture design and planning phase completed",
        status: "COMPLETED",
        dueDate: new Date('2024-02-15'),
        projectId: projects[0].id,
      },
      {
        title: "Hardware Procurement",
        description: "All hardware components procured and delivered",
        status: "IN_PROGRESS",
        dueDate: new Date('2024-03-01'),
        projectId: projects[0].id,
      },
      {
        title: "Network Setup",
        description: "Network infrastructure setup completed",
        status: "UPCOMING",
        dueDate: new Date('2024-04-15'),
        projectId: projects[1].id,
      },
      {
        title: "Electrical Rough-in",
        description: "Electrical rough-in work completed",
        status: "IN_PROGRESS",
        dueDate: new Date('2024-04-20'),
        projectId: projects[2].id,
      },
      {
        title: "System Go-Live",
        description: "Hospital system successfully deployed and operational",
        status: "COMPLETED",
        dueDate: new Date('2024-01-31'),
        projectId: projects[3].id,
      }
    ];

    for (const milestone of milestoneData) {
      await prisma.milestone.create({ data: milestone });
      console.log(`✅ Created milestone: ${milestone.title}`);
    }

    // 3. Add Resources
    console.log('🔧 Adding sample resources...');
    const resourceData = [
      {
        name: "IoT Sensors",
        type: "EQUIPMENT",
        description: "Smart sensors for building automation",
        quantity: 50,
        unit: "units",
        costPerUnit: 250000,
        projectId: projects[0].id,
      },
      {
        name: "Network Switches",
        type: "EQUIPMENT",
        description: "24-port managed switches for data center",
        quantity: 8,
        unit: "units",
        costPerUnit: 1500000,
        projectId: projects[1].id,
      },
      {
        name: "Electrical Cables",
        type: "MATERIAL",
        description: "Copper electrical cables for factory installation",
        quantity: 2000,
        unit: "meters",
        costPerUnit: 25000,
        projectId: projects[2].id,
      },
      {
        name: "Senior Electrical Engineer",
        type: "MANPOWER",
        description: "Senior electrical engineer for hospital project",
        quantity: 2,
        unit: "persons",
        costPerUnit: 15000000,
        projectId: projects[3].id,
      },
      {
        name: "Security Cameras",
        type: "EQUIPMENT",
        description: "IP security cameras for mall surveillance",
        quantity: 25,
        unit: "units",
        costPerUnit: 800000,
        projectId: projects[4].id,
      },
      {
        name: "Cloud Storage",
        type: "SOFTWARE",
        description: "Cloud storage service for data migration",
        quantity: 1,
        unit: "subscription",
        costPerUnit: 5000000,
        projectId: projects[1].id,
      },
      {
        name: "LED Fixtures",
        type: "MATERIAL",
        description: "LED lighting fixtures for warehouse",
        quantity: 100,
        unit: "units",
        costPerUnit: 350000,
        projectId: projects[2].id,
      },
      {
        name: "Project Manager",
        type: "MANPOWER",
        description: "Project manager for coordination",
        quantity: 1,
        unit: "person",
        costPerUnit: 20000000,
        projectId: projects[0].id,
      }
    ];

    for (const resource of resourceData) {
      await prisma.resource.create({ data: resource });
      console.log(`✅ Created resource: ${resource.name}`);
    }

    // 4. Add Budgets
    console.log('💰 Adding sample budgets...');
    const budgetData = [
      {
        category: "HARDWARE",
        description: "Hardware procurement budget",
        estimatedAmount: 50000000,
        actualAmount: 42000000,
        projectId: projects[0].id,
      },
      {
        category: "LABOR",
        description: "Labor costs for installation",
        estimatedAmount: 80000000,
        actualAmount: 75000000,
        projectId: projects[0].id,
      },
      {
        category: "NETWORK_EQUIPMENT",
        description: "Network equipment and infrastructure",
        estimatedAmount: 75000000,
        actualAmount: 68000000,
        projectId: projects[1].id,
      },
      {
        category: "MATERIALS",
        description: "Electrical materials and components",
        estimatedAmount: 60000000,
        actualAmount: 55000000,
        projectId: projects[2].id,
      },
      {
        category: "SOFTWARE_LICENSES",
        description: "Software licenses for hospital system",
        estimatedAmount: 25000000,
        actualAmount: 25000000,
        projectId: projects[3].id,
      },
      {
        category: "SECURITY_SYSTEM",
        description: "Security system components",
        estimatedAmount: 40000000,
        actualAmount: 15000000,
        projectId: projects[4].id,
      },
      {
        category: "CLOUD_SERVICES",
        description: "Cloud migration and hosting services",
        estimatedAmount: 100000000,
        actualAmount: 85000000,
        projectId: projects[1].id,
      },
      {
        category: "LIGHTING_SYSTEM",
        description: "LED lighting system installation",
        estimatedAmount: 35000000,
        actualAmount: 0,
        projectId: projects[2].id,
      }
    ];

    for (const budget of budgetData) {
      await prisma.budget.create({ 
        data: {
          projectId: budget.projectId,
          category: budget.category,
          estimatedCost: budget.estimatedAmount,
          actualCost: budget.actualAmount,
          approvedBy: manager.id,
          approvedAt: new Date(),
        }
      });
      console.log(`✅ Created budget: ${budget.category} - ${budget.description}`);
    }

    // 5. Add Risks
    console.log('⚠️ Adding sample risks...');
    const riskData = [
      {
        title: "Hardware Delivery Delay",
        description: "Potential delay in hardware delivery from suppliers",
        severity: "MEDIUM",
        probability: "MEDIUM",
        impact: "MEDIUM",
        status: "OPEN",
        mitigation: "Maintain backup supplier relationships and order early",
        assignedTo: engineer.id,
        projectId: projects[0].id,
      },
      {
        title: "Network Security Breach",
        description: "Risk of security breach during network upgrade",
        severity: "HIGH",
        probability: "LOW",
        impact: "HIGH",
        status: "RESOLVED",
        mitigation: "Implement strict security protocols and monitoring",
        assignedTo: engineer.id,
        projectId: projects[1].id,
      },
      {
        title: "Electrical Code Compliance",
        description: "Risk of non-compliance with electrical codes",
        severity: "HIGH",
        probability: "LOW",
        impact: "HIGH",
        status: "OPEN",
        mitigation: "Regular inspections and code compliance checks",
        assignedTo: engineer.id,
        projectId: projects[2].id,
      },
      {
        title: "Data Migration Failure",
        description: "Risk of data loss during hospital system migration",
        severity: "HIGH",
        probability: "LOW",
        impact: "CRITICAL",
        status: "RESOLVED",
        mitigation: "Comprehensive backup strategy and testing",
        assignedTo: engineer.id,
        projectId: projects[3].id,
      },
      {
        title: "Budget Overrun",
        description: "Risk of exceeding allocated budget",
        severity: "MEDIUM",
        probability: "MEDIUM",
        impact: "MEDIUM",
        status: "OPEN",
        mitigation: "Regular budget monitoring and cost control",
        assignedTo: manager.id,
        projectId: projects[4].id,
      },
      {
        title: "Resource Availability",
        description: "Risk of key personnel unavailability",
        severity: "MEDIUM",
        probability: "MEDIUM",
        impact: "MEDIUM",
        status: "OPEN",
        mitigation: "Cross-training and backup resource planning",
        assignedTo: manager.id,
        projectId: projects[0].id,
      }
    ];

    for (const risk of riskData) {
      await prisma.risk.create({ 
        data: {
          title: risk.title,
          description: risk.description,
          projectId: risk.projectId,
          severity: risk.severity,
          status: risk.status,
          mitigation: risk.mitigation,
          assigneeId: risk.assignedTo,
          resolvedAt: risk.status === "RESOLVED" ? new Date() : null,
        }
      });
      console.log(`✅ Created risk: ${risk.title}`);
    }

    // 6. Add Documents
    console.log('📄 Adding sample documents...');
    const documentData = [
      {
        title: "System Architecture Document",
        description: "Detailed system architecture specification",
        type: "DESIGN",
        filePath: "/documents/architecture-v1.2.pdf",
        fileSize: 2048000,
        projectId: projects[0].id,
        uploadedBy: engineer.id,
      },
      {
        title: "Network Configuration Manual",
        description: "Network configuration and setup manual",
        type: "MANUAL",
        filePath: "/documents/network-config.pdf",
        fileSize: 1536000,
        projectId: projects[1].id,
        uploadedBy: engineer.id,
      },
      {
        title: "Electrical Installation Plan",
        description: "Electrical installation drawings and plans",
        type: "DRAWING",
        filePath: "/documents/electrical-plan.dwg",
        fileSize: 5120000,
        projectId: projects[2].id,
        uploadedBy: engineer.id,
      },
      {
        title: "Hospital System Requirements",
        description: "Detailed requirements specification for hospital system",
        type: "REQUIREMENTS",
        filePath: "/documents/hospital-requirements.pdf",
        fileSize: 3072000,
        projectId: projects[3].id,
        uploadedBy: manager.id,
      },
      {
        title: "Security System Proposal",
        description: "Proposal for mall security system implementation",
        type: "PROPOSAL",
        filePath: "/documents/security-proposal.pdf",
        fileSize: 1024000,
        projectId: projects[4].id,
        uploadedBy: manager.id,
      },
      {
        title: "Cloud Migration Strategy",
        description: "Strategy document for cloud migration project",
        type: "STRATEGY",
        filePath: "/documents/cloud-migration.pdf",
        fileSize: 2560000,
        projectId: projects[1].id,
        uploadedBy: manager.id,
      },
      {
        title: "LED Lighting Specifications",
        description: "Technical specifications for LED lighting system",
        type: "SPECIFICATION",
        filePath: "/documents/led-specs.pdf",
        fileSize: 768000,
        projectId: projects[2].id,
        uploadedBy: engineer.id,
      },
      {
        title: "Project Status Report",
        description: "Monthly project status and progress report",
        type: "REPORT",
        filePath: "/documents/status-report-march.pdf",
        fileSize: 512000,
        projectId: projects[0].id,
        uploadedBy: manager.id,
      }
    ];

    for (const document of documentData) {
      const fileName = document.filePath.split('/').pop() || 'document.pdf';
      const fileType = fileName.split('.').pop() || 'pdf';
      
      await prisma.document.create({ 
        data: {
          title: document.title,
          description: document.description,
          fileName: fileName,
          filePath: document.filePath,
          fileSize: document.fileSize,
          fileType: fileType,
          projectId: document.projectId,
          uploadedBy: document.uploadedBy,
        }
      });
      console.log(`✅ Created document: ${document.title}`);
    }

    // 7. Add Activity Logs
    console.log('📊 Adding sample activity logs...');
    const activityData = [
      {
        action: "CREATE",
        entity: "Project",
        entityId: projects[0].id,
        description: "Created new project: Smart Building Automation",
        userId: manager.id,
      },
      {
        action: "UPDATE",
        entity: "Task",
        entityId: "task-1",
        description: "Updated task progress to 75%",
        userId: engineer.id,
      },
      {
        action: "CREATE",
        entity: "Risk",
        entityId: "risk-1",
        description: "Identified new risk: Hardware Delivery Delay",
        userId: engineer.id,
      },
      {
        action: "UPLOAD",
        entity: "Document",
        entityId: "doc-1",
        description: "Uploaded System Architecture Document",
        userId: engineer.id,
      },
      {
        action: "UPDATE",
        entity: "Budget",
        entityId: "budget-1",
        description: "Updated actual spending for hardware category",
        userId: manager.id,
      },
      {
        action: "ASSIGN",
        entity: "Task",
        entityId: "task-2",
        description: "Assigned task to field engineer",
        userId: manager.id,
      },
      {
        action: "COMPLETE",
        entity: "Milestone",
        entityId: "milestone-1",
        description: "Completed Phase 1 milestone",
        userId: engineer.id,
      },
      {
        action: "UPDATE",
        entity: "Resource",
        entityId: "resource-1",
        description: "Updated resource quantity and cost",
        userId: manager.id,
      },
      {
        action: "MITIGATE",
        entity: "Risk",
        entityId: "risk-2",
        description: "Implemented risk mitigation measures",
        userId: engineer.id,
      },
      {
        action: "APPROVE",
        entity: "Document",
        entityId: "doc-2",
        description: "Approved Network Configuration Manual",
        userId: manager.id,
      }
    ];

    for (const activity of activityData) {
      await prisma.activityLog.create({ data: activity });
      console.log(`✅ Created activity: ${activity.description}`);
    }

    // 8. Add Project Members
    console.log('👥 Adding project members...');
    for (const project of projects) {
      // Add manager as project member
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: manager.id,
          role: "PROJECT_MANAGER",
        }
      });
      
      // Add engineer as project member
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: engineer.id,
          role: "TEAM_MEMBER",
        }
      });
      
      console.log(`✅ Added members to project: ${project.name}`);
    }

    console.log('🎉 Comprehensive seeding completed successfully!');
    
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
      projectMembers: await prisma.projectMember.count(),
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
    console.log(`   Project Members: ${summary.projectMembers}`);

  } catch (error) {
    console.error('❌ Error during comprehensive seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveSeed();
