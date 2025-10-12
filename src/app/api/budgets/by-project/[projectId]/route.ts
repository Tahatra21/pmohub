import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
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
    
    if (!hasPermission(user, 'budgets:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { projectId } = params;

    const budgets = await db.budget.findMany({
      where: {
        projectId: projectId,
        budgetType: 'PROJECT'
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        prkNumber: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: { budgets },
    });
  } catch (error) {
    console.error('Error fetching project budgets:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
