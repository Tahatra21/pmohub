import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data for demonstration
    const mockStats = {
      totalProjects: 12,
      activeProjects: 8,
      completedProjects: 4,
      totalTasks: 45,
      completedTasks: 28,
      totalBudget: 250000,
      actualSpent: 185000,
      overdueTasks: 3,
      highRisks: 2,
      taskCompletionRate: 62.2,
      projectCompletionRate: 33.3,
      budgetUtilization: 74.0,
    };

    const mockProjects = [
      {
        id: '1',
        name: 'Office Building Electrical Installation',
        type: 'ELECTRICAL',
        client: 'ABC Construction Corp',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        progress: 65,
        createdAt: '2024-01-15T10:00:00Z',
        creator: { name: 'John Manager' },
        _count: { tasks: 12, risks: 2 },
      },
      {
        id: '2',
        name: 'Network Infrastructure Upgrade',
        type: 'IT',
        client: 'Tech Solutions Inc',
        status: 'PLANNING',
        priority: 'MEDIUM',
        progress: 15,
        createdAt: '2024-02-01T10:00:00Z',
        creator: { name: 'John Manager' },
        _count: { tasks: 8, risks: 1 },
      },
      {
        id: '3',
        name: 'Warehouse Lighting System',
        type: 'ELECTRICAL',
        client: 'Logistics Plus',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        progress: 100,
        createdAt: '2024-01-01T10:00:00Z',
        creator: { name: 'John Manager' },
        _count: { tasks: 15, risks: 0 },
      },
    ];

    const mockTasks = [
      {
        id: '1',
        title: 'Install main electrical panel',
        status: 'COMPLETED',
        priority: 'HIGH',
        project: { name: 'Office Building Electrical Installation' },
        assignee: { name: 'Jane Engineer' },
        createdAt: '2024-01-20T10:00:00Z',
      },
      {
        id: '2',
        title: 'Run electrical conduits',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        project: { name: 'Office Building Electrical Installation' },
        assignee: { name: 'Jane Engineer' },
        createdAt: '2024-02-01T10:00:00Z',
      },
      {
        id: '3',
        title: 'Network assessment',
        status: 'TODO',
        priority: 'MEDIUM',
        project: { name: 'Network Infrastructure Upgrade' },
        assignee: { name: 'Jane Engineer' },
        createdAt: '2024-03-05T10:00:00Z',
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        stats: mockStats,
        recentProjects: mockProjects,
        recentTasks: mockTasks,
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