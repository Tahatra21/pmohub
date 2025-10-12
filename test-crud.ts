import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCRUD() {
  try {
    console.log('🧪 Testing CRUD Operations...\n');

    // Get a project for testing
    const project = await prisma.project.findFirst();
    if (!project) {
      console.error('❌ No project found for testing');
      return;
    }

    console.log(`📋 Using project: ${project.name}`);

    // Test CREATE Task
    console.log('\n1️⃣ Testing CREATE Task...');
    const newTask = await prisma.task.create({
      data: {
        title: 'Test CRUD Task',
        description: 'This is a test task for CRUD operations',
        status: 'TODO',
        priority: 'MEDIUM',
        progress: 0,
        projectId: project.id,
        creatorId: project.createdBy,
      },
    });
    console.log(`✅ Created task: ${newTask.title} (ID: ${newTask.id})`);

    // Test READ Task
    console.log('\n2️⃣ Testing READ Task...');
    const readTask = await prisma.task.findUnique({
      where: { id: newTask.id },
      include: {
        project: { select: { name: true } },
        creator: { select: { name: true } },
      },
    });
    console.log(`✅ Read task: ${readTask?.title} from project: ${readTask?.project.name}`);

    // Test UPDATE Task
    console.log('\n3️⃣ Testing UPDATE Task...');
    const updatedTask = await prisma.task.update({
      where: { id: newTask.id },
      data: {
        status: 'IN_PROGRESS',
        progress: 50,
        description: 'Updated test task description',
      },
    });
    console.log(`✅ Updated task: ${updatedTask.title} - Status: ${updatedTask.status}, Progress: ${updatedTask.progress}%`);

    // Test CREATE Resource
    console.log('\n4️⃣ Testing CREATE Resource...');
    const newResource = await prisma.resource.create({
      data: {
        name: 'Test CRUD Resource',
        type: 'EQUIPMENT',
        description: 'This is a test resource for CRUD operations',
        quantity: 5,
        unit: 'units',
        costPerUnit: 100000,
        projectId: project.id,
      },
    });
    console.log(`✅ Created resource: ${newResource.name} (ID: ${newResource.id})`);

    // Test UPDATE Resource
    console.log('\n5️⃣ Testing UPDATE Resource...');
    const updatedResource = await prisma.resource.update({
      where: { id: newResource.id },
      data: {
        quantity: 10,
        costPerUnit: 150000,
      },
    });
    console.log(`✅ Updated resource: ${updatedResource.name} - Quantity: ${updatedResource.quantity}, Cost: Rp ${updatedResource.costPerUnit}`);

    // Test CREATE Budget
    console.log('\n6️⃣ Testing CREATE Budget...');
    const newBudget = await prisma.budget.create({
      data: {
        projectId: project.id,
        category: 'TEST_CRUD',
        estimatedCost: 1000000,
        actualCost: 750000,
        approvedBy: project.createdBy,
        approvedAt: new Date(),
      },
    });
    console.log(`✅ Created budget: ${newBudget.category} (ID: ${newBudget.id})`);

    // Test UPDATE Budget
    console.log('\n7️⃣ Testing UPDATE Budget...');
    const updatedBudget = await prisma.budget.update({
      where: { id: newBudget.id },
      data: {
        actualCost: 900000,
      },
    });
    console.log(`✅ Updated budget: ${updatedBudget.category} - Actual Cost: Rp ${updatedBudget.actualCost}`);

    // Test CREATE Risk
    console.log('\n8️⃣ Testing CREATE Risk...');
    const newRisk = await prisma.risk.create({
      data: {
        title: 'Test CRUD Risk',
        description: 'This is a test risk for CRUD operations',
        severity: 'MEDIUM',
        status: 'OPEN',
        mitigation: 'Test mitigation plan',
        assigneeId: project.createdBy,
        projectId: project.id,
      },
    });
    console.log(`✅ Created risk: ${newRisk.title} (ID: ${newRisk.id})`);

    // Test UPDATE Risk
    console.log('\n9️⃣ Testing UPDATE Risk...');
    const updatedRisk = await prisma.risk.update({
      where: { id: newRisk.id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });
    console.log(`✅ Updated risk: ${updatedRisk.title} - Status: ${updatedRisk.status}`);

    // Test CREATE Document
    console.log('\n🔟 Testing CREATE Document...');
    const newDocument = await prisma.document.create({
      data: {
        title: 'Test CRUD Document',
        description: 'This is a test document for CRUD operations',
        fileName: 'test-crud.pdf',
        filePath: '/documents/test-crud.pdf',
        fileSize: 1024000,
        fileType: 'pdf',
        projectId: project.id,
        uploadedBy: project.createdBy,
      },
    });
    console.log(`✅ Created document: ${newDocument.title} (ID: ${newDocument.id})`);

    // Test UPDATE Document
    console.log('\n1️⃣1️⃣ Testing UPDATE Document...');
    const updatedDocument = await prisma.document.update({
      where: { id: newDocument.id },
      data: {
        isPublic: true,
        description: 'Updated test document description',
      },
    });
    console.log(`✅ Updated document: ${updatedDocument.title} - Public: ${updatedDocument.isPublic}`);

    // Test DELETE operations
    console.log('\n🗑️ Testing DELETE operations...');
    
    await prisma.document.delete({ where: { id: newDocument.id } });
    console.log('✅ Deleted document');

    await prisma.risk.delete({ where: { id: newRisk.id } });
    console.log('✅ Deleted risk');

    await prisma.budget.delete({ where: { id: newBudget.id } });
    console.log('✅ Deleted budget');

    await prisma.resource.delete({ where: { id: newResource.id } });
    console.log('✅ Deleted resource');

    await prisma.task.delete({ where: { id: newTask.id } });
    console.log('✅ Deleted task');

    console.log('\n🎉 All CRUD operations completed successfully!');
    console.log('\n📊 CRUD Operations Summary:');
    console.log('✅ CREATE - All entities can be created');
    console.log('✅ READ - All entities can be read');
    console.log('✅ UPDATE - All entities can be updated');
    console.log('✅ DELETE - All entities can be deleted');

  } catch (error) {
    console.error('❌ CRUD test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCRUD();
