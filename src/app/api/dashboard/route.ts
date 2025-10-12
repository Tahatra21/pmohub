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

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || (!hasPermission(user, 'dashboard:read') && !hasPermission(user, 'dashboard:all'))) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const where = hasPermission(user, 'projects:all') ? {} : {
      members: {
        some: {
          userId: user.id,
        },
      },
    };

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      budgetStats,
      recentProjects,
      recentTasks,
    ] = await Promise.all([
      db.project.count({ where }),
      db.project.count({ 
        where: { 
          ...where,
          status: 'IN_PROGRESS' 
        } 
      }),
      db.project.count({ 
        where: { 
          ...where,
          status: 'COMPLETED' 
        } 
      }),
      db.task.count({
        where: {
          ...hasPermission(user, 'tasks:all') ? {} : {
            OR: [
              { assigneeId: user.id },
              { creatorId: user.id },
              {
                project: {
                  members: {
                    some: {
                      userId: user.id,
                    },
                  },
                },
              },
            ],
          },
        },
      }),
      db.task.count({
        where: {
          ...hasPermission(user, 'tasks:all') ? {} : {
            OR: [
              { assigneeId: user.id },
              { creatorId: user.id },
              {
                project: {
                  members: {
                    some: {
                      userId: user.id,
                    },
                  },
                },
              },
            ],
          },
          status: 'COMPLETED',
        },
      }),
      db.task.count({
        where: {
          ...hasPermission(user, 'tasks:all') ? {} : {
            OR: [
              { assigneeId: user.id },
              { creatorId: user.id },
              {
                project: {
                  members: {
                    some: {
                      userId: user.id,
                    },
                  },
                },
              },
            ],
          },
          status: { not: 'COMPLETED' },
          endDate: { lt: new Date() },
        },
      }),
      db.budget.aggregate({
        where: hasPermission(user, 'budgets:all') ? {} : {
          project: {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        },
        _sum: {
          anggaranTersedia: true,
          totalPenyerapan: true,
        },
      }),
      db.project.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true } },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.task.findMany({
        where: {
          ...hasPermission(user, 'tasks:all') ? {} : {
            OR: [
              { assigneeId: user.id },
              { creatorId: user.id },
              {
                project: {
                  members: {
                    some: {
                      userId: user.id,
                    },
                  },
                },
              },
            ],
          },
        },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalBudget = Number(budgetStats._sum.anggaranTersedia || 0);
    const actualSpent = Number(budgetStats._sum.totalPenyerapan || 0);

    const stats = {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      totalBudget,
      actualSpent,
      overdueTasks,
      taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      projectCompletionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
      budgetUtilization: totalBudget > 0 ? (actualSpent / totalBudget) * 100 : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentProjects,
        recentTasks,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}