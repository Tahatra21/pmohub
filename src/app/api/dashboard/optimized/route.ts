import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { apiCache } from '@/lib/cache';

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

    // Create cache key
    const cacheKey = `dashboard:${user.id}`;
    
    // Check cache first
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Use optimized views for dashboard data
    const [userStats, projectStats, taskStats, recentActivity] = await Promise.all([
      // User dashboard stats
      db.$queryRawUnsafe(`
        SELECT * FROM v_user_dashboard WHERE user_id = $1
      `, user.id),
      
      // Project summary stats
      db.$queryRawUnsafe(`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN project_status = 'IN_PROGRESS' THEN 1 END) as active_projects,
          COUNT(CASE WHEN project_status = 'COMPLETED' THEN 1 END) as completed_projects,
          COUNT(CASE WHEN project_status = 'ON_HOLD' THEN 1 END) as on_hold_projects,
          AVG(project_progress) as avg_progress
        FROM v_project_summary
      `),
      
      // Task management stats
      db.$queryRawUnsafe(`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN task_status = 'IN_PROGRESS' THEN 1 END) as active_tasks,
          COUNT(CASE WHEN task_status = 'COMPLETED' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN deadline_status = 'OVERDUE' THEN 1 END) as overdue_tasks,
          COUNT(CASE WHEN deadline_status = 'DUE_SOON' THEN 1 END) as due_soon_tasks
        FROM v_task_management
      `),
      
      // Recent activity logs
      db.$queryRawUnsafe(`
        SELECT 
          log_action,
          log_entity,
          log_description,
          user_name,
          log_created_at
        FROM v_activity_logs 
        ORDER BY log_created_at DESC 
        LIMIT 10
      `)
    ]);

    const response = {
      success: true,
      data: {
        userStats: userStats[0] || {},
        projectStats: projectStats[0] || {},
        taskStats: taskStats[0] || {},
        recentActivity: recentActivity || []
      }
    };

    // Cache the response for 5 minutes
    apiCache.set(cacheKey, response, 300000);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
