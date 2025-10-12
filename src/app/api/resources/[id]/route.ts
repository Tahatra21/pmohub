import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const updateResourceSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.enum(['MANPOWER', 'EQUIPMENT', 'MATERIAL', 'TOOL', 'SOFTWARE', 'OTHER']).optional(),
  description: z.string().optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  costPerUnit: z.number().positive().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !hasPermission(user, 'resources:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const resource = await db.resource.findUnique({
      where: { id: params.id },
      include: {
        project: { 
          select: { 
            id: true, 
            name: true, 
            status: true,
            members: {
              where: { userId: user.id },
            },
          } 
        },
        allocations: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { allocatedAt: 'desc' },
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this resource
    const hasAccess = hasPermission(user, 'resources:all') ||
                     resource.project.members.length > 0;

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error('Get resource error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !hasPermission(user, 'resources:update')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateResourceSchema.parse(body);

    // Check if resource exists and user has access
    const existingResource = await db.resource.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            members: {
              where: { userId: user.id },
            },
          },
        },
      },
    });

    if (!existingResource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    const hasAccess = hasPermission(user, 'resources:all') ||
                     existingResource.project.members.length > 0;

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const updatedResource = await db.resource.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Resource',
        entityId: updatedResource.id,
        description: `Updated resource: ${updatedResource.name}`,
        userId: user.id,
        metadata: {
          projectId: updatedResource.projectId,
          resourceType: updatedResource.type,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedResource,
      message: 'Resource updated successfully',
    });
  } catch (error) {
    console.error('Update resource error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !hasPermission(user, 'resources:delete')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const existingResource = await db.resource.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            members: {
              where: { userId: user.id },
            },
          },
        },
        _count: {
          select: {
            allocations: true,
          },
        },
      },
    });

    if (!existingResource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    const hasAccess = hasPermission(user, 'resources:all') ||
                     existingResource.project.members.length > 0;

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (existingResource._count.allocations > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete resource with active allocations' },
        { status: 400 }
      );
    }

    await db.resource.delete({
      where: { id: params.id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'DELETE',
        entity: 'Resource',
        entityId: params.id,
        description: `Deleted resource: ${existingResource.name}`,
        userId: user.id,
        metadata: {
          projectId: existingResource.projectId,
          resourceType: existingResource.type,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

