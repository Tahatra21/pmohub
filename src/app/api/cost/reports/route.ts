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
    const period = searchParams.get('period') || '30'; // days
    const status = searchParams.get('status');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // Build where clause
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };

    if (status && ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      where.status = status;
    }

    // Get statistics
    const [
      totalEstimates,
      activeEstimates,
      draftEstimates,
      completedEstimates,
      cancelledEstimates,
      totalValue,
      averageValue,
      estimatesByStatus,
      estimatesByMonth,
      topClients,
      recentEstimates
    ] = await Promise.all([
      // Total estimates
      db.costEstimator.count({ where }),
      
      // Status counts
      db.costEstimator.count({ where: { ...where, status: 'ACTIVE' } }),
      db.costEstimator.count({ where: { ...where, status: 'DRAFT' } }),
      db.costEstimator.count({ where: { ...where, status: 'COMPLETED' } }),
      db.costEstimator.count({ where: { ...where, status: 'CANCELLED' } }),
      
      // Value calculations
      db.costEstimator.aggregate({
        where,
        _sum: { grandTotal: true }
      }),
      
      db.costEstimator.aggregate({
        where,
        _avg: { grandTotal: true }
      }),
      
      // Estimates by status
      db.costEstimator.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
        _sum: { grandTotal: true }
      }),
      
      // Estimates by month
      db.costEstimator.findMany({
        where,
        select: {
          createdAt: true,
          grandTotal: true,
          status: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      
      // Top clients
      db.costEstimator.groupBy({
        by: ['client'],
        where: {
          ...where,
          client: { not: null }
        },
        _count: { client: true },
        _sum: { grandTotal: true },
        orderBy: { _sum: { grandTotal: 'desc' } },
        take: 5
      }),
      
      // Recent estimates
      db.costEstimator.findMany({
        where,
        select: {
          id: true,
          name: true,
          projectName: true,
          client: true,
          status: true,
          grandTotal: true,
          createdAt: true,
          createdBy: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    // Process monthly data
    const monthlyData = estimatesByMonth.reduce((acc: any, estimate) => {
      const month = new Date(estimate.createdAt).toISOString().substring(0, 7);
      if (!acc[month]) {
        acc[month] = { count: 0, total: 0, active: 0, draft: 0, completed: 0, cancelled: 0 };
      }
      acc[month].count++;
      acc[month].total += estimate.grandTotal;
      acc[month][estimate.status.toLowerCase()]++;
      return acc;
    }, {});

    const monthlyChart = Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
      month,
      count: data.count,
      total: data.total,
      active: data.active,
      draft: data.draft,
      completed: data.completed,
      cancelled: data.cancelled
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEstimates,
          activeEstimates,
          draftEstimates,
          completedEstimates,
          cancelledEstimates,
          totalValue: totalValue._sum.grandTotal || 0,
          averageValue: averageValue._avg.grandTotal || 0,
          period: `${period} days`
        },
        charts: {
          estimatesByStatus,
          monthlyChart,
          topClients: topClients.map(client => ({
            name: client.client || 'Unknown',
            count: client._count.client,
            totalValue: client._sum.grandTotal || 0
          }))
        },
        recentEstimates
      }
    });

  } catch (error: any) {
    console.error('Error generating reports:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate reports' },
      { status: 500 }
    );
  }
}
