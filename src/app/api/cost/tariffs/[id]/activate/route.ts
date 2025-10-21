import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';

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

    // Nonaktifkan semua versi tarif
    await db.tariffVersion.updateMany({
      where: {
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Aktifkan versi tarif yang dipilih
    const updatedTariff = await db.tariffVersion.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTariff
    });
  } catch (error: any) {
    console.error('Error activating tariff version:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan saat mengaktifkan versi tarif' },
      { status: 500 }
    );
  }
}