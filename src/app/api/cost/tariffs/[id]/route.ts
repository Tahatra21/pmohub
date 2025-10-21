import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';

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

    const tariff = await db.tariffVersion.findUnique({
      where: { id: params.id },
      include: {
        blpRates: {
          orderBy: {
            spec: 'asc'
          }
        },
        blnpRates: {
          orderBy: {
            item: 'asc'
          }
        }
      }
    });

    if (!tariff) {
      return NextResponse.json(
        { success: false, error: 'Tariff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tariff: {
        id: tariff.id,
        name: tariff.name,
        effectiveDate: tariff.effectiveDate.toISOString(),
        notes: tariff.notes,
        isActive: tariff.isActive,
        createdAt: tariff.createdAt.toISOString()
      },
      blpRates: tariff.blpRates,
      blnpRates: tariff.blnpRates
    });

  } catch (error: any) {
    console.error('Error fetching tariff detail:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tariff detail' },
      { status: 500 }
    );
  }
}