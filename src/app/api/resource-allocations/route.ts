import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const allocationSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  taskId: z.string().optional(),
  role: z.string().optional(),
  allocationPercentage: z.number().min(1).max(100).default(100),
  startDate: z.string().optional().transform((str) => str ? new Date(str) : new Date()),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']).default('ACTIVE'),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'resources:read')) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const resourceId = searchParams.get('resourceId') || '';
    const projectId = searchParams.get('projectId') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (resourceId && resourceId !== 'ALL') {
      where.resourceId = resourceId;
    }
    
    if (projectId && projectId !== 'ALL') {
      where.projectId = projectId;
    }
    
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [allocations, total] = await Promise.all([
      db.resourceAllocation.findMany({
        where,
        include: {
          resource: {
            select: {
              id: true,
              name: true,
              type: true,
              skills: true,
              department: true,
              email: true,
              phone: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
          allocator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          allocatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      db.resourceAllocation.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        allocations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Resource allocations API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'resources:create')) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = allocationSchema.parse(body);

    // Check if person can be allocated
    const resource = await db.resource.findUnique({
      where: { id: validatedData.resourceId },
      include: {
        allocations: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!resource) {
      return NextResponse.json({ success: false, error: 'Person not found' }, { status: 404 });
    }

    // Check if person is available
    if (resource.status === 'ON_LEAVE') {
      return NextResponse.json({ 
        success: false, 
        error: `${resource.name} is currently on leave and cannot be allocated` 
      }, { status: 400 });
    }

    // Check current allocation percentage
    const currentAllocationPercentage = resource.allocations.reduce((sum, alloc) => sum + alloc.allocationPercentage, 0);
    const newTotalPercentage = currentAllocationPercentage + validatedData.allocationPercentage;

    if (newTotalPercentage > 100) {
      return NextResponse.json({ 
        success: false, 
        error: `Over-allocation: ${resource.name} is already allocated ${currentAllocationPercentage}%. Cannot add ${validatedData.allocationPercentage}%` 
      }, { status: 400 });
    }

    // Check project capacity
    if (resource.allocations.length >= resource.maxProjects) {
      return NextResponse.json({ 
        success: false, 
        error: `${resource.name} is already allocated to maximum projects (${resource.maxProjects})` 
      }, { status: 400 });
    }

    const allocation = await db.resourceAllocation.create({
      data: {
        ...validatedData,
        allocatedBy: user.id,
      },
      include: {
        resource: {
            select: {
              id: true,
              name: true,
              type: true,
              skills: true,
              department: true,
              email: true,
              phone: true,
            },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        allocator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        entityType: 'RESOURCE_ALLOCATION',
        entityId: allocation.id,
        action: 'CREATE',
        details: `Allocated ${allocation.allocationPercentage}% of ${resource.name} (${allocation.role || 'Team Member'}) to ${allocation.project.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: allocation,
      message: 'Resource allocated successfully',
    });
  } catch (error) {
    console.error('Create resource allocation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'resources:update')) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Allocation ID is required' }, { status: 400 });
    }

    const validatedData = allocationSchema.partial().parse(updateData);

    const allocation = await db.resourceAllocation.update({
      where: { id },
      data: validatedData,
      include: {
        resource: {
            select: {
              id: true,
              name: true,
              type: true,
              skills: true,
              department: true,
              email: true,
              phone: true,
            },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        allocator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        entityType: 'RESOURCE_ALLOCATION',
        entityId: allocation.id,
        action: 'UPDATE',
        details: `Updated allocation for ${allocation.resource.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: allocation,
      message: 'Resource allocation updated successfully',
    });
  } catch (error) {
    console.error('Update resource allocation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'resources:delete')) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Allocation ID is required' }, { status: 400 });
    }

    const allocation = await db.resourceAllocation.delete({
      where: { id },
      include: {
        resource: {
          select: {
            name: true,
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        entityType: 'RESOURCE_ALLOCATION',
        entityId: id,
        action: 'DELETE',
        details: `Deleted allocation for ${allocation.resource.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Resource allocation deleted successfully',
    });
  } catch (error) {
    console.error('Delete resource allocation error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
