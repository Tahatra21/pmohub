import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const budgetSchema = z.object({
  costCenter: z.string().min(1, 'Cost Center is required'),
  manager: z.string().min(1, 'Manager is required'),
  prkNumber: z.string().min(1, 'PRK Number is required'),
  prkName: z.string().min(1, 'PRK Name is required'),
  kategoriBeban: z.string().min(1, 'Kategori Beban is required'),
  coaNumber: z.string().min(1, 'COA Number is required'),
  anggaranTersedia: z.number().min(0, 'Anggaran Tersedia must be positive'),
  nilaiPo: z.number().min(0).optional(),
  nilaiNonPo: z.number().min(0).optional(),
  totalSpr: z.number().min(0).optional(),
  totalPenyerapan: z.number().min(0).optional(),
  sisaAnggaran: z.number().optional(),
  tahun: z.number().min(2000).max(2100, 'Year must be between 2000-2100'),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  budgetType: z.enum(['PROJECT', 'TASK', 'GENERAL']).default('PROJECT'),
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

    // Verify token directly
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    if (!hasPermission(user, 'budgets:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const costCenter = searchParams.get('costCenter');
    const kategoriBeban = searchParams.get('kategoriBeban');
    const tahun = searchParams.get('tahun');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (costCenter && costCenter !== 'ALL') {
      where.costCenter = costCenter;
    }
    if (kategoriBeban && kategoriBeban !== 'ALL') {
      where.kategoriBeban = kategoriBeban;
    }
    if (tahun && tahun !== 'ALL') {
      where.tahun = parseInt(tahun);
    }

    const [budgets, total] = await Promise.all([
      db.budget.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: {
          prkNumber: 'asc',
        },
        skip,
        take: limit,
      }),
      db.budget.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        budgets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'budgets:create')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = budgetSchema.parse(body);

    // Calculate sisaAnggaran if not provided
    const sisaAnggaran = validatedData.sisaAnggaran ?? 
      (validatedData.anggaranTersedia - (validatedData.totalPenyerapan || 0));

    const budget = await db.budget.create({
      data: {
        ...validatedData,
        nilaiPo: validatedData.nilaiPo || 0,
        nilaiNonPo: validatedData.nilaiNonPo || 0,
        totalSpr: validatedData.totalSpr || 0,
        totalPenyerapan: validatedData.totalPenyerapan || 0,
        sisaAnggaran,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'CREATE',
        entity: 'Budget',
        entityId: budget.id,
        description: `Created budget: ${budget.prkName}`,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: { budget },
      message: 'Budget created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating budget:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'budgets:update')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    const validatedData = budgetSchema.partial().parse(updateData);

    // Calculate sisaAnggaran if anggaranTersedia or totalPenyerapan is updated
    let sisaAnggaran = validatedData.sisaAnggaran;
    if (validatedData.anggaranTersedia !== undefined || validatedData.totalPenyerapan !== undefined) {
      const currentBudget = await db.budget.findUnique({
        where: { id },
        select: { anggaranTersedia: true, totalPenyerapan: true },
      });
      
      if (currentBudget) {
        const anggaranTersedia = validatedData.anggaranTersedia ?? currentBudget.anggaranTersedia;
        const totalPenyerapan = validatedData.totalPenyerapan ?? currentBudget.totalPenyerapan;
        sisaAnggaran = anggaranTersedia - totalPenyerapan;
      }
    }

    const budget = await db.budget.update({
      where: { id },
      data: {
        ...validatedData,
        sisaAnggaran,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Budget',
        entityId: budget.id,
        description: `Updated budget: ${budget.prkName}`,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: { budget },
      message: 'Budget updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating budget:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'budgets:delete')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    // Get budget prkName before deletion for logging
    const budget = await db.budget.findUnique({
      where: { id },
      select: { prkName: true },
    });

    await db.budget.delete({
      where: { id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'DELETE',
        entity: 'Budget',
        entityId: id,
        description: `Deleted budget: ${budget?.prkName || 'Unknown'}`,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}