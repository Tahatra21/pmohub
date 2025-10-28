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
    if (!user || !hasPermission(user, 'tasks:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const projectId = searchParams.get('projectId') || '';
    const assigneeId = searchParams.get('assigneeId') || '';

    // Create cache key
    const cacheKey = `tasks:${page}:${limit}:${search}:${status}:${projectId}:${assigneeId}`;
    
    // Check cache first
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const skip = (page - 1) * limit;

    // Build where clause for optimized view
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND (task_title ILIKE $${paramCount} OR task_description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    if (status && status !== 'ALL') {
      whereClause += ` AND task_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    if (projectId && projectId !== 'ALL') {
      whereClause += ` AND project_name = $${paramCount}`;
      params.push(projectId);
      paramCount++;
    }
    if (assigneeId && assigneeId !== 'ALL') {
      whereClause += ` AND assignee_name = $${paramCount}`;
      params.push(assigneeId);
      paramCount++;
    }

    // Use optimized view for better performance
    const tasks = await db.$queryRawUnsafe(`
      SELECT * FROM v_task_management 
      ${whereClause}
      ORDER BY task_created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, ...params, limit, skip);

    const totalResult = await db.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM v_task_management 
      ${whereClause}
    `, ...params);
    
    const total = Number((totalResult as any)[0].count);

    const response = {
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };

    // Cache the response for 3 minutes
    apiCache.set(cacheKey, response, 180000);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
