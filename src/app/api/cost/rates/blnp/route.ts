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

    const { searchParams } = new URL(request.url);
    const versionId = searchParams.get('versionId');
    const q = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {};
    
    if (versionId) {
      where.versionId = versionId;
    } else {
      // If no versionId specified, get from active tariff
      const activeTariff = await db.tariffVersion.findFirst({
        where: { isActive: true },
        select: { id: true }
      });
      
      if (activeTariff) {
        where.versionId = activeTariff.id;
      } else {
        return NextResponse.json({
          success: true,
          data: [],
          message: 'No active tariff version found'
        });
      }
    }

    // Add search filter
    if (q) {
      where.item = {
        contains: q,
        mode: 'insensitive'
      };
    }

    const blnpRates = await db.blnpRate.findMany({
      where,
      include: {
        version: {
          select: {
            id: true,
            name: true,
            effectiveDate: true
          }
        }
      },
      orderBy: {
        item: 'asc'
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: blnpRates
    });

  } catch (error: any) {
    console.error('Error fetching BLNP rates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch BLNP rates' },
      { status: 500 }
    );
  }
}
