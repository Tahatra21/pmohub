import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get transition matrix data using raw SQL
    const transitionMatrix = await db.$queryRaw`
      SELECT 
        sp.stage as previous_stage,
        sn.stage as next_stage,
        COUNT(*)::text as transition_count,
        ROUND(AVG(EXTRACT(EPOCH FROM (sh.tanggal_perubahan - sh.created_at))/86400), 2)::text as avg_days
      FROM tbl_stage_histori sh
      LEFT JOIN tbl_stage sp ON sh.stage_previous = sp.id
      LEFT JOIN tbl_stage sn ON sh.stage_now = sn.id
      WHERE sh.stage_previous IS NOT NULL AND sh.stage_now IS NOT NULL
      GROUP BY sp.id, sp.stage, sn.id, sn.stage
      ORDER BY sp.id, sn.id
    `;

    // Get all stages for matrix structure
    const stages = await db.$queryRaw`
      SELECT id::text, stage FROM tbl_stage ORDER BY id
    `;

    return NextResponse.json({
      success: true,
      data: {
        transitions: transitionMatrix,
        stages: stages,
      },
    });
  } catch (error) {
    console.error('Error fetching transition matrix:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transition matrix' },
      { status: 500 }
    );
  }
}