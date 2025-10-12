import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const progressUpdateSchema = z.object({
  progress: z.number().min(0).max(100),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
});

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
    if (!user || !hasPermission(user, 'projects:update')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = progressUpdateSchema.parse(body);

    // Update project progress
    const project = await db.project.update({
      where: { id: params.id },
      data: {
        progress: validatedData.progress,
        ...(validatedData.status && { status: validatedData.status }),
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { 
          include: { 
            user: { select: { id: true, name: true, email: true } } 
          } 
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Project',
        entityId: project.id,
        description: `Updated project progress to ${validatedData.progress}%`,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project progress updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Update project progress error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
