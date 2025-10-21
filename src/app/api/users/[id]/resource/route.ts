import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is requesting their own resource or has admin permissions
    if (user.id !== params.id && !user.permissions?.users?.all) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const resource = await db.resource.findUnique({
      where: { userId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: resource.id,
        name: resource.name,
        description: resource.description,
        skills: resource.skills,
        department: resource.department,
        phone: resource.phone,
        email: resource.email,
        maxProjects: resource.maxProjects,
        hourlyRate: resource.hourlyRate,
        status: resource.status,
        type: resource.type,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString(),
        user: {
          id: resource.user.id,
          name: resource.user.name,
          email: resource.user.email,
        }
      },
    });
  } catch (error) {
    console.error('Get user resource error:', error);
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
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is updating their own resource or has admin permissions
    if (user.id !== params.id && !user.permissions?.users?.all) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      skills,
      department,
      phone,
      email,
      maxProjects,
      hourlyRate,
      status,
      type
    } = body;

    // Check if resource exists
    const existingResource = await db.resource.findUnique({
      where: { userId: params.id }
    });

    if (!existingResource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    const updatedResource = await db.resource.update({
      where: { userId: params.id },
      data: {
        name,
        description,
        skills,
        department,
        phone,
        email,
        maxProjects,
        hourlyRate,
        status,
        type,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedResource.id,
        name: updatedResource.name,
        description: updatedResource.description,
        skills: updatedResource.skills,
        department: updatedResource.department,
        phone: updatedResource.phone,
        email: updatedResource.email,
        maxProjects: updatedResource.maxProjects,
        hourlyRate: updatedResource.hourlyRate,
        status: updatedResource.status,
        type: updatedResource.type,
        createdAt: updatedResource.createdAt.toISOString(),
        updatedAt: updatedResource.updatedAt.toISOString(),
        user: {
          id: updatedResource.user.id,
          name: updatedResource.user.name,
          email: updatedResource.user.email,
        }
      },
      message: 'Resource updated successfully'
    });
  } catch (error) {
    console.error('Update user resource error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
