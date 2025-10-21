import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const tariffVersions = await db.tariffVersion.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            blpRates: true,
            blnpRates: true,
          },
        },
      },
    });

    // Format data untuk respons
    const formattedTariffs = tariffVersions.map((tariff) => ({
      id: tariff.id,
      name: tariff.name,
      effectiveDate: tariff.effectiveDate.toISOString(),
      isActive: tariff.isActive,
      blpRatesCount: tariff._count.blpRates,
      blnpRatesCount: tariff._count.blnpRates,
      createdAt: tariff.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedTariffs
    });
  } catch (error: any) {
    console.error('Error fetching tariff versions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan saat mengambil data tarif' },
      { status: 500 }
    );
  }
}