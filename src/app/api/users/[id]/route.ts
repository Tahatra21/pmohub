import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !hasPermission(user, 'users:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const foundUser = await db.user.findUnique({
      where: { id: params.id },
      include: {
        role: { select: { id: true, name: true, description: true } },
        assignedTasks: {
          select: { id: true, title: true, status: true, project: { select: { name: true } } },
        },
        createdTasks: {
          select: { id: true, title: true, status: true, project: { select: { name: true } } },
        },
        projectMembers: {
          include: {
            project: { select: { id: true, name: true, status: true } },
          },
        },
      },
    });

    if (!foundUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...foundUser,
        password: undefined, // Remove password from response
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
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
    if (!user || (!hasPermission(user, 'users:update') && user.id !== params.id)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        role: { select: { id: true, name: true, description: true } },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'UPDATE',
        entity: 'User',
        entityId: updatedUser.id,
        description: `Updated user: ${updatedUser.name}`,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser,
        password: undefined, // Remove password from response
      },
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
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
    if (!user || !hasPermission(user, 'users:delete')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (user.id === params.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    await db.user.delete({
      where: { id: params.id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'DELETE',
        entity: 'User',
        entityId: params.id,
        description: `Deleted user: ${existingUser.name}`,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

