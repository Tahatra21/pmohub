import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');

    if (!stage) {
      return NextResponse.json(
        { success: false, error: 'Stage parameter is required' },
        { status: 400 }
      );
    }

    // Get products by stage using raw SQL with parameter
    const products = await db.$queryRaw`
      SELECT 
        p.id::text,
        p.produk,
        p.deskripsi,
        p.id_kategori::text,
        p.id_segmen::text,
        p.id_stage::text,
        p.harga::text,
        p.tanggal_launch,
        p.pelanggan,
        k.kategori,
        s.segmen,
        st.stage
      FROM tbl_produk p
      LEFT JOIN tbl_kategori k ON p.id_kategori = k.id
      LEFT JOIN tbl_segmen s ON p.id_segmen = s.id
      LEFT JOIN tbl_stage st ON p.id_stage = st.id
      WHERE p.id_stage = ${parseInt(stage)}
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products by stage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products by stage' },
      { status: 500 }
    );
  }
}