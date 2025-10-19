import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Get attachments for a product
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token);

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if product exists
    const product = await db.$queryRaw`
      SELECT id, produk FROM tbl_produk WHERE id = ${params.id}::integer
    `;

    if (!product || (product as any[]).length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Product not found' 
      }, { status: 404 });
    }

    // Get attachments for this product
    const attachments = await db.$queryRaw`
      SELECT 
        id::text,
        nama_file,
        path_file,
        tipe_file,
        ukuran_file::text,
        created_at
      FROM tbl_attachment_produk
      WHERE id_produk = ${params.id}::integer
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      data: attachments,
      product: (product as any[])[0]
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error' 
    }, { status: 500 });
  }
}

// POST - Upload new attachment (placeholder for file upload)
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token);

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only admin and project manager can upload attachments
    if (auth.role?.name !== 'Admin' && auth.role?.name !== 'Project Manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Check if product exists
    const product = await db.$queryRaw`
      SELECT id, produk FROM tbl_produk WHERE id = ${params.id}::integer
    `;

    if (!product || (product as any[]).length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Product not found' 
      }, { status: 404 });
    }

    const body = await req.json();
    const { nama_file, path_file, tipe_file, ukuran_file } = body;

    // Insert attachment
    const newAttachment = await db.$queryRaw`
      INSERT INTO tbl_attachment_produk (
        id_produk,
        nama_file,
        path_file,
        tipe_file,
        ukuran_file,
        created_at
      ) VALUES (
        ${params.id}::integer,
        ${nama_file},
        ${path_file},
        ${tipe_file},
        ${ukuran_file}::integer,
        NOW()
      )
      RETURNING id::text, nama_file
    `;

    return NextResponse.json({
      success: true,
      message: 'Attachment uploaded successfully',
      data: (newAttachment as any[])[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading attachment:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error' 
    }, { status: 500 });
  }
}
