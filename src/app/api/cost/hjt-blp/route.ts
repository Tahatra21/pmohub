import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';

// API untuk tbl_hjt_blp
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
    const q = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build where clause
    const where: any = {};
    
    // Add search filter
    if (q) {
      where.OR = [
        { spec: { contains: q, mode: 'insensitive' } },
        { ref: { contains: q, mode: 'insensitive' } }
      ];
    }

    const blpRates = await db.hjtBlp.findMany({
      where,
      orderBy: {
        spec: 'asc'
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: blpRates,
      count: blpRates.length
    });

  } catch (error: any) {
    console.error('Error fetching HJT BLP rates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch HJT BLP rates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { spec, ref, monthly, daily, isActive } = body;

    // Validate required fields
    if (!spec || !ref || !monthly || !daily) {
      return NextResponse.json(
        { success: false, error: 'Spec, ref, monthly, and daily are required for BLP' },
        { status: 422 }
      );
    }

    const blpRate = await db.hjtBlp.create({
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
      data: blpRate
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating HJT BLP rate:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create HJT BLP rate' },
      { status: 500 }
    );
  }
}
