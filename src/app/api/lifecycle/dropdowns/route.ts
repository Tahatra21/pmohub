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

    // Allow all authenticated users to view dropdown data
    // Remove restrictive permission check

    // Fetch stages from PMO tables
    const stages = await db.stage.findMany({
      select: {
        id: true,
        stage: true
      },
      orderBy: { stage: 'asc' }
    });

    console.log('Stages fetched:', stages);

    // Fetch categories from PMO tables
    const categories = await db.category.findMany({
      select: {
        id: true,
        kategori: true
      },
      orderBy: { kategori: 'asc' }
    });

    console.log('Categories fetched:', categories);

    // Fetch segments from PMO tables
    const segments = await db.segment.findMany({
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
