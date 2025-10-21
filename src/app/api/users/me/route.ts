import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
});

export async function GET(request: NextRequest) {
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

    const userProfile = await db.user.findUnique({
      where: { id: user.id },
      include: { 
        role: true,
        resource: true
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        avatar: userProfile.avatar,
        role: {
          id: userProfile.role.id,
          name: userProfile.role.name,
          description: userProfile.role.description,
        },
        resource: userProfile.resource ? {
          id: userProfile.resource.id,
          name: userProfile.resource.name,
          description: userProfile.resource.description,
          skills: userProfile.resource.skills,
          department: userProfile.resource.department,
          phone: userProfile.resource.phone,
          email: userProfile.resource.email,
          maxProjects: userProfile.resource.maxProjects,
          hourlyRate: userProfile.resource.hourlyRate,
          status: userProfile.resource.status,
          type: userProfile.resource.type,
          createdAt: userProfile.resource.createdAt.toISOString(),
          updatedAt: userProfile.resource.updatedAt.toISOString(),
        } : null,
        isActive: userProfile.isActive,
        createdAt: userProfile.createdAt.toISOString(),
        updatedAt: userProfile.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { name, email, phone } = updateProfileSchema.parse(body);

    // Check if email is already taken by another user
    const existingUser = await db.user.findFirst({
      where: {
        email,
        id: { not: user.id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already taken' },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        phone,
        updatedAt: new Date(),
      },
      include: { role: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: {
          id: updatedUser.role.id,
          name: updatedUser.role.name,
          description: updatedUser.role.description,
        },
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
