import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, hasPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !hasPermission(user, 'budgets:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const where = hasPermission(user, 'budgets:all') ? {} : {
      project: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    };

    const [
      budgetStats,
      approvedStats,
      pendingStats,
    ] = await Promise.all([
      db.budget.aggregate({
        where,
        _sum: {
          estimatedCost: true,
          actualCost: true,
        },
      }),
      db.budget.aggregate({
        where: {
          ...where,
          approvedAt: { not: null },
        },
        _sum: {
          estimatedCost: true,
          actualCost: true,
        },
      }),
      db.budget.aggregate({
        where: {
          ...where,
          approvedAt: null,
        },
        _sum: {
          estimatedCost: true,
          actualCost: true,
        },
      }),
    ]);

    const totalEstimated = budgetStats._sum.estimatedCost || 0;
    const totalActual = budgetStats._sum.actualCost || 0;
    const totalVariance = totalActual - totalEstimated;
    const variancePercentage = totalEstimated > 0 ? (totalVariance / totalEstimated) * 100 : 0;

    const stats = {
      totalEstimated,
      totalActual,
      totalVariance,
      variancePercentage,
      approvedBudget: approvedStats._sum.estimatedCost || 0,
      pendingApproval: pendingStats._sum.estimatedCost || 0,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get budget stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
