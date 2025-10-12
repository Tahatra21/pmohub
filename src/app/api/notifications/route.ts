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
    if (!user || !hasPermission(user, 'dashboard:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // For now, return mock notifications since we don't have a notifications table yet
    const mockNotifications = [
      {
        id: '1',
        title: 'Project Deadline Approaching',
        message: 'Smart Building Automation project deadline is in 3 days',
        type: 'WARNING',
        isRead: false,
        createdAt: new Date().toISOString(),
        projectId: 'project-1',
      },
      {
        id: '2',
        title: 'Task Completed',
        message: 'Testing Phase task has been completed',
        type: 'SUCCESS',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        taskId: 'task-1',
      },
      {
        id: '3',
        title: 'Budget Alert',
        message: 'Hardware budget is 90% utilized',
        type: 'WARNING',
        isRead: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        budgetId: 'budget-1',
      },
      {
        id: '4',
        title: 'Risk Identified',
        message: 'New high-severity risk identified: Hardware Delay',
        type: 'ERROR',
        isRead: false,
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        riskId: 'risk-1',
      },
      {
        id: '5',
        title: 'Document Uploaded',
        message: 'System Architecture document has been uploaded',
        type: 'INFO',
        isRead: true,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        documentId: 'doc-1',
      }
    ];

    const total = mockNotifications.length;
    const notifications = mockNotifications.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}