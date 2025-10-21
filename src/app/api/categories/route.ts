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
    
    if (!user || !hasPermission(user, 'projects:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get project categories from tbl_kategori
    const categories = await db.category.findMany({
      where: {
        kategori: {
          in: [
            'INFRA NETWORK',
            'INFRA CLOUD & DC', 
            'MULTIMEDIA & IOT',
            'DIGITAL ELECTRICITY',
            'SAAS BASED'
          ]
        }
      },
      orderBy: {
        kategori: 'asc'
      }
    });

    console.log('Categories API - Found categories:', categories.length);

    return NextResponse.json({
      success: true,
      data: categories,
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
