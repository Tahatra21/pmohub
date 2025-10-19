import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get product distribution by stage using raw SQL
    const result = await db.$queryRaw`
      SELECT 
        s.stage,
        COUNT(p.id)::text as count,
        ROUND((COUNT(p.id) * 100.0 / (SELECT COUNT(*) FROM tbl_produk)), 2)::text as percentage
      FROM tbl_stage s
      LEFT JOIN tbl_produk p ON s.id = p.id_stage
      GROUP BY s.id, s.stage
      ORDER BY s.id
    `;

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching product distribution:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product distribution' },
      { status: 500 }
    );
  }
}
