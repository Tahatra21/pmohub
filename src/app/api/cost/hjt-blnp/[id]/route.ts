import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const blnpUpdateSchema = z.object({
  item: z.string().min(1, 'Item is required').optional(),
  ref: z.string().min(1, 'Reference is required').optional(),
  khs2022: z.string().min(1, 'KHS 2022 is required').optional(),
  numericValue: z.number().min(0).optional(),
  isAtCost: z.boolean().optional(),
  note: z.string().optional(),
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
    const blnpRate = await db.hjtBlnp.findUnique({
      where: { id }
    });

    if (!blnpRate) {
      return NextResponse.json(
        { success: false, error: 'BLNP rate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blnpRate
    });

  } catch (error: any) {
    console.error('Error fetching BLNP rate:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch BLNP rate' },
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
    const validatedData = blnpUpdateSchema.parse(body);

    // Check if BLNP rate exists
    const existingRate = await db.hjtBlnp.findUnique({
      where: { id }
    });

    if (!existingRate) {
      return NextResponse.json(
        { success: false, error: 'BLNP rate not found' },
        { status: 404 }
      );
    }

    const updatedRate = await db.hjtBlnp.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      data: updatedRate,
      message: 'BLNP rate updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating BLNP rate:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.format() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update BLNP rate' },
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

    // Check if BLNP rate exists
    const existingRate = await db.hjtBlnp.findUnique({
      where: { id }
    });

    if (!existingRate) {
      return NextResponse.json(
        { success: false, error: 'BLNP rate not found' },
        { status: 404 }
      );
    }

    await db.hjtBlnp.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'BLNP rate deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting BLNP rate:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete BLNP rate' },
      { status: 500 }
    );
  }
}
