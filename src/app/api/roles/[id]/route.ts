import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const roleUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  permissions: z.record(z.any()).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!user || !hasPermission(user, 'roles:update')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = roleUpdateSchema.parse(body);

    // Check if role exists
    const existingRole = await db.role.findUnique({
      where: { id: params.id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    // Check if role name already exists (if name is being updated)
    if (validatedData.name && validatedData.name !== existingRole.name) {
      const nameExists = await db.role.findFirst({
        where: { 
          name: validatedData.name,
          id: { not: params.id }
        },
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Role name already exists' },
          { status: 400 }
        );
      }
    }

    const role = await db.role.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: { role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating role:', error);
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
    if (!user || !hasPermission(user, 'roles:delete')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if role exists
    const existingRole = await db.role.findUnique({
      where: { id: params.id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    // Check if any users are assigned to this role
    const usersWithRole = await db.user.count({
      where: { roleId: params.id },
    });

    if (usersWithRole > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete role. ${usersWithRole} user(s) are assigned to this role.` },
        { status: 400 }
      );
    }

    await db.role.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}