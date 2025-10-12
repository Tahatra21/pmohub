import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create roles - Simplified 3-Role System
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Full system administrator with complete access',
      permissions: {
        dashboard: { read: true },
        projects: { all: true },
        tasks: { all: true },
        users: { all: true },
        roles: { create: true, read: true, update: true, delete: true },
        resources: { all: true },
        budgets: { all: true },
        documents: { all: true },
        milestones: { create: true, read: true, update: true, delete: true },
        activity: { all: true },
        settings: { system: true },
      },
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Project Manager' },
    update: {},
    create: {
      name: 'Project Manager',
      description: 'Project leader with team management capabilities',
      permissions: {
        dashboard: { read: true },
        projects: { create: true, read: true, update: true },
        tasks: { all: true },
        users: { read: true },
        resources: { read: true, create: true, allocate: true },
        budgets: { read: true, create: true, approve: true },
        documents: { all: true },
        milestones: { create: true, read: true, update: true, delete: true },
        activity: { read: true },
        settings: { read: true },
      },
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      description: 'Team member with basic project access',
      permissions: {
        dashboard: { read: true },
        projects: { read: true },
        tasks: { read: true, update: true },
        users: { read: true },
        resources: { read: true },
        budgets: { read: true },
        documents: { read: true, create: true, download: true },
        milestones: { read: true },
        activity: { read: true },
        settings: { read: true },
      },
    },
  });

  // Legacy roles for backward compatibility (deprecated)
  const engineerRole = await prisma.role.upsert({
    where: { name: 'Field/Site Engineer' },
    update: {
      description: 'Can work on assigned tasks (DEPRECATED - Use User role instead)',
      permissions: {},
    },
    create: {
      name: 'Field/Site Engineer',
      description: 'Can work on assigned tasks (DEPRECATED - Use User role instead)',
      permissions: {},
    },
  });

  const developerRole = await prisma.role.upsert({
    where: { name: 'IT Developer / Technical Team' },
    update: {
      description: 'Technical team member (DEPRECATED - Use User role instead)',
      permissions: {},
    },
    create: {
      name: 'IT Developer / Technical Team',
      description: 'Technical team member (DEPRECATED - Use User role instead)',
      permissions: {},
    },
  });

  const clientRole = await prisma.role.upsert({
    where: { name: 'Client / Stakeholder' },
    update: {
      description: 'View-only access (DEPRECATED - Use User role instead)',
      permissions: {},
    },
    create: {
      name: 'Client / Stakeholder',
      description: 'View-only access (DEPRECATED - Use User role instead)',
      permissions: {},
    },
  });

  // Create users with new 3-role system
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@projecthub.com' },
    update: {},
    create: {
      email: 'admin@projecthub.com',
      name: 'System Administrator',
      password: adminPassword,
      phone: '+1234567890',
      roleId: adminRole.id,
    },
  });

  const managerPassword = await hashPassword('manager123');
  const manager = await prisma.user.upsert({
    where: { email: 'manager@projecthub.com' },
    update: {},
    create: {
      email: 'manager@projecthub.com',
      name: 'John Manager',
      password: managerPassword,
      phone: '+1234567891',
      roleId: managerRole.id,
    },
  });

  // Create User role users (previously engineer and test user)
  const engineerPassword = await hashPassword('engineer123');
  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@projecthub.com' },
    update: {},
    create: {
      email: 'engineer@projecthub.com',
      name: 'Jane Engineer',
      password: engineerPassword,
      phone: '+1234567892',
      roleId: userRole.id,
    },
  });

  const userPassword = await hashPassword('user123');
  const testUser = await prisma.user.upsert({
    where: { email: 'apitest@example.com' },
    update: {},
    create: {
      email: 'apitest@example.com',
      name: 'API Test User',
      password: userPassword,
      phone: '+1234567893',
      roleId: userRole.id,
    },
  });

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Office Building Electrical Installation',
      description: 'Complete electrical system installation for new office building',
      type: 'ELECTRICAL',
      client: 'ABC Construction Corp',
      location: '123 Main St, City, State',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      progress: 65,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      createdBy: manager.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Network Infrastructure Upgrade',
      description: 'Upgrade network infrastructure for better performance and security',
      type: 'IT',
      client: 'Tech Solutions Inc',
      location: '456 Tech Ave, City, State',
      status: 'PLANNING',
      priority: 'MEDIUM',
      progress: 15,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-08-15'),
      createdBy: manager.id,
    },
  });

  // Add project members
  await prisma.projectMember.createMany({
    data: [
      {
        projectId: project1.id,
        userId: engineer.id,
        role: 'Lead Engineer',
      },
      {
        projectId: project2.id,
        userId: engineer.id,
        role: 'Technical Lead',
      },
    ],
  });

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Install main electrical panel',
        description: 'Install and configure main electrical distribution panel',
        projectId: project1.id,
        assigneeId: engineer.id,
        creatorId: manager.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        progress: 100,
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-02-15'),
        estimatedHours: 40,
        actualHours: 38,
      },
      {
        title: 'Run electrical conduits',
        description: 'Install electrical conduits throughout the building',
        projectId: project1.id,
        assigneeId: engineer.id,
        creatorId: manager.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        progress: 70,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-03-30'),
        estimatedHours: 80,
        actualHours: 56,
      },
      {
        title: 'Network assessment',
        description: 'Assess current network infrastructure and identify upgrade requirements',
        projectId: project2.id,
        assigneeId: engineer.id,
        creatorId: manager.id,
        status: 'TODO',
        priority: 'MEDIUM',
        progress: 0,
        startDate: new Date('2024-03-05'),
        endDate: new Date('2024-03-20'),
        estimatedHours: 24,
      },
    ],
  });

  // Create milestones
  await prisma.milestone.createMany({
    data: [
      {
        title: 'Electrical Design Approval',
        description: 'Get electrical design approved by client',
        projectId: project1.id,
        status: 'COMPLETED',
        dueDate: new Date('2024-01-30'),
        completedAt: new Date('2024-01-28'),
      },
      {
        title: 'Rough-in Inspection',
        description: 'Pass rough-in electrical inspection',
        projectId: project1.id,
        status: 'UPCOMING',
        dueDate: new Date('2024-04-15'),
      },
      {
        title: 'Network Analysis Complete',
        description: 'Complete network infrastructure analysis',
        projectId: project2.id,
        status: 'UPCOMING',
        dueDate: new Date('2024-03-25'),
      },
    ],
  });

  // Create resources
  await prisma.resource.createMany({
    data: [
      {
        name: 'Electrical Cable (500 ft)',
        type: 'MATERIAL',
        description: 'High-quality electrical cable for main circuits',
        quantity: 500,
        unit: 'ft',
        costPerUnit: 2.5,
        projectId: project1.id,
      },
      {
        name: 'Circuit Breakers',
        type: 'MATERIAL',
        description: '20A circuit breakers for distribution panel',
        quantity: 50,
        unit: 'pieces',
        costPerUnit: 25,
        projectId: project1.id,
      },
      {
        name: 'Network Switches',
        type: 'EQUIPMENT',
        description: '24-port managed network switches',
        quantity: 5,
        unit: 'pieces',
        costPerUnit: 500,
        projectId: project2.id,
      },
    ],
  });

  // Create budgets
  await prisma.budget.createMany({
    data: [
      {
        projectId: project1.id,
        category: 'Materials',
        estimatedCost: 25000,
        actualCost: 18500,
        approvedBy: manager.id,
        approvedAt: new Date('2024-01-10'),
      },
      {
        projectId: project1.id,
        category: 'Labor',
        estimatedCost: 35000,
        actualCost: 22000,
        approvedBy: manager.id,
        approvedAt: new Date('2024-01-10'),
      },
      {
        projectId: project2.id,
        category: 'Equipment',
        estimatedCost: 15000,
        actualCost: 0,
        approvedBy: manager.id,
        approvedAt: new Date('2024-02-20'),
      },
    ],
  });

  // Create risks
  await prisma.risk.createMany({
    data: [
      {
        title: 'Supply Chain Delays',
        description: 'Potential delays in electrical component delivery',
        projectId: project1.id,
        severity: 'MEDIUM',
        status: 'OPEN',
        mitigation: 'Order components early and have backup suppliers',
        assigneeId: manager.id,
      },
      {
        title: 'Weather Impact',
        description: 'Weather conditions may delay outdoor work',
        projectId: project1.id,
        severity: 'LOW',
        status: 'OPEN',
        mitigation: 'Plan work schedule around weather forecast',
        assigneeId: engineer.id,
      },
      {
        title: 'System Compatibility',
        description: 'New network equipment may not be compatible with existing systems',
        projectId: project2.id,
        severity: 'HIGH',
        status: 'OPEN',
        mitigation: 'Thorough testing before full deployment',
        assigneeId: engineer.id,
      },
    ],
  });

  console.log('Database seeding completed successfully!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@projecthub.com / admin123');
  console.log('Manager: manager@projecthub.com / manager123');
  console.log('Engineer: engineer@projecthub.com / engineer123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });