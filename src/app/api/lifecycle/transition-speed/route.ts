import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get transition speed analysis data using raw SQL
    const speedAnalysis = await db.$queryRaw`
      SELECT 
        s.stage,
        COUNT(sh.id)::text as total_transitions,
        ROUND(AVG(EXTRACT(EPOCH FROM (sh.tanggal_perubahan - sh.created_at))/86400), 2)::text as avg_days,
        ROUND(MIN(EXTRACT(EPOCH FROM (sh.tanggal_perubahan - sh.created_at))/86400), 2)::text as min_days,
        ROUND(MAX(EXTRACT(EPOCH FROM (sh.tanggal_perubahan - sh.created_at))/86400), 2)::text as max_days
      FROM tbl_stage s
      LEFT JOIN tbl_stage_histori sh ON s.id = sh.stage_now
      WHERE sh.tanggal_perubahan IS NOT NULL
      GROUP BY s.id, s.stage
      ORDER BY s.id
    `;

    return NextResponse.json({
      success: true,
      data: speedAnalysis,
    });
  } catch (error) {
    console.error('Error fetching transition speed analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transition speed analysis' },
      { status: 500 }
    );
  }
}