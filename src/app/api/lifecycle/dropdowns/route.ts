import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const auth = await verifyToken(token || '');

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Basic authorization check for Product Lifecycle access
    if (auth.role?.name !== 'Admin' && auth.role?.name !== 'Project Manager' && auth.role?.name !== 'User') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Fetch stages from lifecycle tables using Prisma models
    const stages = await db.stageLifecycle.findMany({
      select: {
        id: true,
        stage: true
      },
      orderBy: { stage: 'asc' }
    });

    console.log('Stages fetched:', stages);

    // Fetch categories from existing PMO tables (if any)
    const categories = await db.category.findMany({
      select: {
        id: true,
        kategori: true
      },
      orderBy: { kategori: 'asc' }
    });

    console.log('Categories fetched:', categories);

    // Fetch segments from lifecycle tables using Prisma models
    const segments = await db.segmentLifecycle.findMany({
      select: {
        id: true,
        segmen: true
      },
      orderBy: { segmen: 'asc' }
    });

    console.log('Segments fetched:', segments);

    return NextResponse.json({
      success: true,
      data: {
        stages,
        categories,
        segments
      }
    });
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dropdown data' },
      { status: 500 }
    );
  }
}
