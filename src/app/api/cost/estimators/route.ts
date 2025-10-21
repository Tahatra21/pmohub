import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const costEstimatorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  projectId: z.string().nullable().optional(),
  projectName: z.string().optional(),
  client: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  version: z.string().optional(),
  markUpPct: z.number().min(0).max(100).optional(),
  contingencyPct: z.number().min(0).max(100).optional(),
  discountPct: z.number().min(0).max(100).optional(),
  ppnPct: z.number().min(0).max(100).optional(),
  escalationPct: z.number().min(0).max(100).optional(),
  subtotal: z.number().min(0).optional(),
  escalation: z.number().min(0).optional(),
  overhead: z.number().min(0).optional(),
  contingency: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  dpp: z.number().min(0).optional(),
  ppn: z.number().min(0).optional(),
  grandTotal: z.number().min(0).optional(),
  assumptions: z.any().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
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
    const status = searchParams.get('status');
    const q = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      where.status = status;
    }

    // Add search filter
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { projectName: { contains: q, mode: 'insensitive' } },
        { client: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    const [costEstimators, totalCount] = await Promise.all([
      db.costEstimator.findMany({
        where,
        orderBy: {
          updatedAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      db.costEstimator.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: costEstimators,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching cost estimators:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch cost estimators' },
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
    const validatedData = costEstimatorSchema.parse(body);

    // Set default values
    const data = {
      ...validatedData,
      createdBy: validatedData.createdBy || user.email,
      status: validatedData.status || 'DRAFT',
      version: validatedData.version || '1.0',
      markUpPct: validatedData.markUpPct || 0,
      contingencyPct: validatedData.contingencyPct || 0,
      discountPct: validatedData.discountPct || 0,
      ppnPct: validatedData.ppnPct || 11,
      escalationPct: validatedData.escalationPct || 0,
      subtotal: validatedData.subtotal || 0,
      escalation: validatedData.escalation || 0,
      overhead: validatedData.overhead || 0,
      contingency: validatedData.contingency || 0,
      discount: validatedData.discount || 0,
      dpp: validatedData.dpp || 0,
      ppn: validatedData.ppn || 0,
      grandTotal: validatedData.grandTotal || 0,
    };

    const costEstimator = await db.costEstimator.create({
      data
    });

    return NextResponse.json({
      success: true,
      data: costEstimator,
      message: 'Cost estimator created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating cost estimator:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.format() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create cost estimator' },
      { status: 500 }
    );
  }
}
