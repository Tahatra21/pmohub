import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const estimateLineSchema = z.object({
  type: z.enum(['BLP', 'BLNP', 'CUSTOM']),
  refId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  unit: z.enum(['man-days', 'man-months', 'unit', 'hari']),
  qty: z.number().min(0, 'Quantity must be positive'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  isAtCost: z.boolean().default(false),
  meta: z.any().optional(),
  sort: z.number().default(0)
});

const estimateUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  status: z.enum(['draft', 'review', 'approved', 'rejected']).optional(),
  lines: z.array(estimateLineSchema).optional(),
  totals: z.any().optional()
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

    const estimate = await db.estimate.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            tariffVersion: true
          }
        },
        lines: {
          orderBy: {
            sort: 'asc'
          }
        }
      }
    });

    if (!estimate) {
      return NextResponse.json(
        { success: false, error: 'Estimate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: estimate
    });

  } catch (error: any) {
    console.error('Error fetching estimate:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch estimate' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await request.json();
    const validatedData = estimateUpdateSchema.parse(body);

    // Check if estimate exists
    const existingEstimate = await db.estimate.findUnique({
      where: { id: params.id }
    });

    if (!existingEstimate) {
      return NextResponse.json(
        { success: false, error: 'Estimate not found' },
        { status: 404 }
      );
    }

    // Update estimate in transaction
    const result = await db.$transaction(async (tx) => {
      // Update estimate
      const updatedEstimate = await tx.estimate.update({
        where: { id: params.id },
        data: {
          title: validatedData.title,
          status: validatedData.status,
          totals: validatedData.totals
        }
      });

      // Update lines if provided
      if (validatedData.lines) {
        // Delete existing lines
        await tx.estimateLine.deleteMany({
          where: { estimateId: params.id }
        });

        // Create new lines
        const lines = await Promise.all(
          validatedData.lines.map((line, index) =>
            tx.estimateLine.create({
              data: {
                estimateId: params.id,
                type: line.type,
                refId: line.refId,
                description: line.description,
                unit: line.unit,
                qty: line.qty,
                unitPrice: line.unitPrice,
                isAtCost: line.isAtCost,
                meta: line.meta,
                lineTotal: line.qty * line.unitPrice,
                sort: line.sort || index
              }
            })
          )
        );

        return { estimate: updatedEstimate, lines };
      }

      return { estimate: updatedEstimate, lines: [] };
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Error updating estimate:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.format() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update estimate' },
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

    // Check if estimate exists
    const existingEstimate = await db.estimate.findUnique({
      where: { id: params.id }
    });

    if (!existingEstimate) {
      return NextResponse.json(
        { success: false, error: 'Estimate not found' },
        { status: 404 }
      );
    }

    // Delete estimate (lines will be deleted automatically due to cascade)
    await db.estimate.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Estimate deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting estimate:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete estimate' },
      { status: 500 }
    );
  }
}
