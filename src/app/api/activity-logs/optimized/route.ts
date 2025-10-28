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
    if (!user || !hasPermission(user, 'activity:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || '';
    const entity = searchParams.get('entity') || '';
    const userId = searchParams.get('userId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Create cache key
    const cacheKey = `activity_logs:${page}:${limit}:${search}:${action}:${entity}:${userId}:${startDate}:${endDate}`;
    
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
      whereClause += ` AND (log_description ILIKE $${paramCount} OR user_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    if (action && action !== 'ALL') {
      whereClause += ` AND log_action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }
    if (entity && entity !== 'ALL') {
      whereClause += ` AND log_entity = $${paramCount}`;
      params.push(entity);
      paramCount++;
    }
    if (userId && userId !== 'ALL') {
      whereClause += ` AND user_name = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }
    if (startDate) {
      whereClause += ` AND log_created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    if (endDate) {
      whereClause += ` AND log_created_at <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    // Use optimized view for better performance
    const activityLogs = await db.$queryRawUnsafe(`
      SELECT * FROM v_activity_logs 
      ${whereClause}
      ORDER BY log_created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, ...params, limit, skip);

    const totalResult = await db.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM v_activity_logs 
      ${whereClause}
    `, ...params);
    
    const total = Number((totalResult as any)[0].count);

    const response = {
      success: true,
      data: {
        activityLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };

    // Cache the response for 2 minutes
    apiCache.set(cacheKey, response, 120000);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
