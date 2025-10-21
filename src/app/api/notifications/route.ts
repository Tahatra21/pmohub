import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const markAsReadSchema = z.object({
  action: z.enum(['markAsRead', 'markAllAsRead']),
  notificationId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // For now, return mock notifications since we don't have a notifications table yet
    // TODO: Implement actual notifications table and logic
    const mockNotifications = [
      {
        id: '1',
        title: 'Welcome to SOLAR Hub',
        message: 'Your account has been successfully created. Start managing your solar projects!',
        type: 'success',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        actionText: 'Get Started',
        actionUrl: '/dashboard',
      },
      {
        id: '2',
        title: 'Project Update',
        message: 'Solar Panel Installation project is 75% complete.',
        type: 'info',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        actionText: 'View Project',
        actionUrl: '/projects',
      },
      {
        id: '3',
        title: 'Task Assigned',
        message: 'You have been assigned to "Site Survey" task.',
        type: 'info',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        actionText: 'View Task',
        actionUrl: '/tasks',
      },
      {
        id: '4',
        title: 'Budget Alert',
        message: 'Project budget is running low. Consider reviewing expenses.',
        type: 'warning',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        actionText: 'Review Budget',
        actionUrl: '/budget',
      },
      {
        id: '5',
        title: 'System Maintenance',
        message: 'Scheduled maintenance completed successfully.',
        type: 'success',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        actionText: 'View Details',
        actionUrl: '/settings',
      },
    ];

    const unreadCount = mockNotifications.filter(n => !n.read).length;
    const limitedNotifications = mockNotifications.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        notifications: limitedNotifications,
        unreadCount,
        totalCount: mockNotifications.length,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, notificationId } = markAsReadSchema.parse(body);

    // For now, just return success since we're using mock data
    // TODO: Implement actual database operations when notifications table is created
    console.log(`Notification action: ${action}${notificationId ? ` for ID: ${notificationId}` : ''}`);

    return NextResponse.json({
      success: true,
      message: `Notification${notificationId ? ` ${notificationId}` : 's'} marked as read`,
    });
  } catch (error) {
    console.error('Update notification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}