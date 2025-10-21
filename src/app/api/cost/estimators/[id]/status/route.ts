import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const statusUpdateSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
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

    // Verify token
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'cost:write')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = statusUpdateSchema.parse(body);

    // Check if cost estimator exists
    const existingEstimator = await db.costEstimator.findUnique({
      where: { id }
    });

    if (!existingEstimator) {
      return NextResponse.json(
        { success: false, error: 'Cost estimator not found' },
        { status: 404 }
      );
    }

    // Update status
    const updatedEstimator = await db.costEstimator.update({
      where: { id },
      data: {
        status: validatedData.status,
        // If changing to COMPLETED, set approvedBy and approvedAt
        ...(validatedData.status === 'COMPLETED' && {
          approvedBy: user.email,
          approvedAt: new Date()
        })
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedEstimator,
      message: 'Status updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating status:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.format() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update status' },
      { status: 500 }
    );
  }
}
