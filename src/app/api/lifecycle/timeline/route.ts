import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get lifecycle timeline data using raw SQL
    const timeline = await db.$queryRaw`
      SELECT 
        p.id::text,
        p.produk,
        p.tanggal_stage_start,
        p.tanggal_stage_end,
        s.stage,
        k.kategori,
        seg.segmen
      FROM tbl_produk p
      LEFT JOIN tbl_stage s ON p.id_stage = s.id
      LEFT JOIN tbl_kategori k ON p.id_kategori = k.id
      LEFT JOIN tbl_segmen seg ON p.id_segmen = seg.id
      WHERE p.tanggal_stage_start IS NOT NULL
      ORDER BY p.tanggal_stage_start DESC
      LIMIT 100
    `;

    return NextResponse.json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    console.error('Error fetching lifecycle timeline:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lifecycle timeline' },
      { status: 500 }
    );
  }
}