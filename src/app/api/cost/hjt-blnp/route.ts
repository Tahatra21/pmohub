import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const blnpSchema = z.object({
  item: z.string().min(1, 'Item is required'),
  ref: z.string().min(1, 'Reference is required'),
  khs2022: z.string().min(1, 'KHS 2022 is required'),
  numericValue: z.number().min(0).optional(),
  isAtCost: z.boolean().optional(),
  note: z.string().optional(),
});

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
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    // Add search filter
    if (q) {
      where.OR = [
        { item: { contains: q, mode: 'insensitive' } },
        { ref: { contains: q, mode: 'insensitive' } },
        { khs2022: { contains: q, mode: 'insensitive' } }
      ];
    }

    const [blnpRates, totalCount] = await Promise.all([
      db.hjtBlnp.findMany({
        where,
        orderBy: {
          item: 'asc'
        },
        take: limit,
        skip: offset
      }),
      db.hjtBlnp.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: blnpRates,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching BLNP rates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch BLNP rates' },
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
    if (!user || !hasPermission(user, 'cost:write')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = blnpSchema.parse(body);

    const blnpRate = await db.hjtBlnp.create({
      data: {
        item: validatedData.item,
        ref: validatedData.ref,
        khs2022: validatedData.khs2022,
        numericValue: validatedData.numericValue,
        isAtCost: validatedData.isAtCost || false,
        note: validatedData.note
      }
    });

    return NextResponse.json({
      success: true,
      data: blnpRate,
      message: 'BLNP rate created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating BLNP rate:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.format() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create BLNP rate' },
      { status: 500 }
    );
  }
}