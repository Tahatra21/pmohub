import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const estimateLineSchema = z.object({
  type: z.enum(['BLP', 'BLNP', 'CUSTOM']),
  refId: z.string().optional(),
  description: z.string(),
  unit: z.string(),
  qty: z.number().min(0),
  unitPrice: z.number().min(0),
  isAtCost: z.boolean().optional(),
  lineTotal: z.number().min(0),
  sort: z.number()
});

const estimateLinesSchema = z.object({
  lines: z.array(estimateLineSchema)
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
    
    // Check if cost estimator exists
    const costEstimator = await db.costEstimator.findUnique({
      where: { id }
    });

    if (!costEstimator) {
      return NextResponse.json(
        { success: false, error: 'Cost estimator not found' },
        { status: 404 }
      );
    }

    // Get estimate lines
    const lines = await db.estimateLine.findMany({
      where: { costEstimatorId: id },
      orderBy: { sort: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: lines
    });

  } catch (error: any) {
    console.error('Error fetching estimate lines:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch estimate lines' },
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
    const validatedData = estimateLinesSchema.parse(body);

    // Check if cost estimator exists
    const costEstimator = await db.costEstimator.findUnique({
      where: { id }
    });

    if (!costEstimator) {
      return NextResponse.json(
        { success: false, error: 'Cost estimator not found' },
        { status: 404 }
      );
    }

    // Delete existing lines
    await db.estimateLine.deleteMany({
      where: { costEstimatorId: id }
    });

    // Create new lines
    const lines = validatedData.lines.map(line => ({
      ...line,
      costEstimatorId: id,
      isAtCost: line.isAtCost || false
    }));

    await db.estimateLine.createMany({
      data: lines
    });

    return NextResponse.json({
      success: true,
      message: 'Estimate lines updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating estimate lines:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.format() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update estimate lines' },
      { status: 500 }
    );
  }
}
