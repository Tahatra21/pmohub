import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const costEstimatorUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  client: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  version: z.string().optional(),
  markUpPct: z.number().min(0).max(100).optional(),
  contingencyPct: z.number().min(0).max(100).optional(),
  discountPct: z.number().min(0).max(100).optional(),
  ppnPct: z.number().min(0).max(100).optional(),
  escalationPct: z.number().min(0).max(100).optional(),
  subtotal: z.number().min(0).optional(),
  escalation: z.number().min(0).optional(),
  overhead: z.number().min(0).optional(),
  contingency: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  dpp: z.number().min(0).optional(),
  ppn: z.number().min(0).optional(),
  grandTotal: z.number().min(0).optional(),
  assumptions: z.any().optional(),
  notes: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
});

export async function GET(
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
    if (!user || !hasPermission(user, 'cost:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;
    const costEstimator = await db.costEstimator.findUnique({
      where: { id }
    });

    if (!costEstimator) {
      return NextResponse.json(
        { success: false, error: 'Cost estimator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: costEstimator
    });

  } catch (error: any) {
    console.error('Error fetching cost estimator:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch cost estimator' },
      { status: 500 }
    );
  }
}

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
    const validatedData = costEstimatorUpdateSchema.parse(body);

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

    // Handle approvedAt conversion
    const updateData = { ...validatedData };
    if (validatedData.approvedAt) {
      updateData.approvedAt = new Date(validatedData.approvedAt);
    }

    const updatedEstimator = await db.costEstimator.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedEstimator,
      message: 'Cost estimator updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating cost estimator:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.format() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update cost estimator' },
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

    // Verify token
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'cost:delete')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

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

    await db.costEstimator.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Cost estimator deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting cost estimator:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete cost estimator' },
      { status: 500 }
    );
  }
}
