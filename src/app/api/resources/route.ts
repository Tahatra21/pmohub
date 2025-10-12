import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const resourceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['PROJECT_MANAGER', 'FIELD_ENGINEER', 'IT_DEVELOPER', 'TECHNICAL_TEAM', 'CLIENT_STAKEHOLDER']),
  description: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ALLOCATED', 'BUSY', 'ON_LEAVE']).default('AVAILABLE'),
  skills: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  maxProjects: z.number().min(1).max(10).default(3),
  hourlyRate: z.number().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'resources:read') && !hasPermission(user, 'resources:all')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const projectId = searchParams.get('projectId') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { skills: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (type && type !== 'ALL') {
      where.type = type;
    }
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (projectId && projectId !== 'ALL') {
      where.projectId = projectId;
    }

    const [resources, total] = await Promise.all([
      db.resource.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          allocations: {
            include: {
              task: { select: { id: true, title: true } },
              project: { select: { id: true, name: true } },
            },
          },
          _count: {
            select: {
              allocations: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      db.resource.count({ where }),
    ]);

    // Calculate allocation status for each person
    const resourcesWithAvailability = await Promise.all(
      resources.map(async (resource) => {
        const activeAllocations = await db.resourceAllocation.findMany({
          where: {
            resourceId: resource.id,
            status: 'ACTIVE',
          },
        });

        const currentProjects = activeAllocations.length;
        const totalAllocationPercentage = activeAllocations.reduce((sum, alloc) => sum + alloc.allocationPercentage, 0);
        const isOverAllocated = totalAllocationPercentage > 100;
        const isAtCapacity = currentProjects >= resource.maxProjects;

        return {
          ...resource,
          currentProjects,
          totalAllocationPercentage,
          isOverAllocated,
          isAtCapacity,
          utilizationRate: Math.min(totalAllocationPercentage, 100),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        resources: resourcesWithAvailability,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || (!hasPermission(user, 'resources:create') && !hasPermission(user, 'resources:all'))) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = resourceSchema.parse(body);

    // Check if user already has a resource
    const existingResource = await db.resource.findUnique({
      where: { userId: validatedData.userId },
    });

    if (existingResource) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User already has a resource record',
          details: 'Each user can only have one resource record'
        },
        { status: 409 }
      );
    }

    const resource = await db.resource.create({
      data: {
        ...validatedData,
        createdBy: user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        creator: {
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
        entityType: 'RESOURCE',
        entityId: resource.id,
        action: 'CREATE',
        details: `Created resource: ${resource.name} (${resource.type})`,
      },
    });

    return NextResponse.json({
      success: true,
      data: { resource },
      message: 'Resource created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating resource:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || (!hasPermission(user, 'resources:update') && !hasPermission(user, 'resources:all'))) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    const validatedData = resourceSchema.partial().parse(updateData);

    const resource = await db.resource.update({
      where: { id },
      data: validatedData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        entityType: 'RESOURCE',
        entityId: resource.id,
        action: 'UPDATE',
        details: `Updated resource: ${resource.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: { resource },
      message: 'Resource updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating resource:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || (!hasPermission(user, 'resources:delete') && !hasPermission(user, 'resources:all'))) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    // Get resource name before deletion for logging
    const resource = await db.resource.findUnique({
      where: { id },
      select: { name: true },
    });

    await db.resource.delete({
      where: { id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        entityType: 'RESOURCE',
        entityId: id,
        action: 'DELETE',
        details: `Deleted resource: ${resource?.name || 'Unknown'}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
