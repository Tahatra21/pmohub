import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// DELETE - Delete specific attachment
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token);

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only admin and project manager can delete attachments
    if (auth.role?.name !== 'Admin' && auth.role?.name !== 'Project Manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Check if attachment exists and belongs to the product
    const attachment = await db.$queryRaw`
      SELECT 
        ap.id,
        ap.nama_file,
        p.produk
      FROM tbl_attachment_produk ap
      JOIN tbl_produk p ON ap.id_produk = p.id
      WHERE ap.id = ${params.attachmentId}::integer
      AND ap.id_produk = ${params.id}::integer
    `;

    if (!attachment || (attachment as any[]).length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Attachment not found' 
      }, { status: 404 });
    }

    // Delete attachment
    await db.$queryRaw`
      DELETE FROM tbl_attachment_produk 
      WHERE id = ${params.attachmentId}::integer
      AND id_produk = ${params.id}::integer
    `;

    return NextResponse.json({
      success: true,
      message: 'Attachment deleted successfully',
      data: { 
        id: params.attachmentId, 
        nama_file: (attachment as any[])[0].nama_file 
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error' 
    }, { status: 500 });
  }
}
