import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';

// API untuk mengupdate status aktif/tidak aktif BLP
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
    if (!user || !hasPermission(user, 'cost:admin')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isActive must be a boolean value' },
        { status: 422 }
      );
    }

    const updatedBlp = await db.hjtBlp.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json({
      success: true,
      data: updatedBlp,
      message: `BLP rate ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error: any) {
    console.error('Error updating BLP status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update BLP status' },
      { status: 500 }
    );
  }
}

// API untuk mengupdate data BLP
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
    if (!user || !hasPermission(user, 'cost:admin')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { spec, ref, monthly, daily, isActive } = body;

    // Validate required fields
    if (!spec || !ref || !monthly || !daily) {
      return NextResponse.json(
        { success: false, error: 'Spec, ref, monthly, and daily are required' },
        { status: 422 }
      );
    }

    const updatedBlp = await db.hjtBlp.update({
      where: { id },
      data: {
        spec,
        ref,
        monthly,
        daily,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedBlp,
      message: 'BLP rate updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating BLP rate:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update BLP rate' },
      { status: 500 }
    );
  }
}

// API untuk menghapus BLP
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
    if (!user || !hasPermission(user, 'cost:admin')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    await db.hjtBlp.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'BLP rate deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting BLP rate:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete BLP rate' },
      { status: 500 }
    );
  }
}
