import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const updateProductSchema = z.object({
  produk: z.string().min(1, 'Product name is required').optional(),
  deskripsi: z.string().optional(),
  id_kategori: z.string().min(1, 'Category is required').optional(),
  id_segmen: z.string().min(1, 'Segment is required').optional(),
  id_stage: z.string().min(1, 'Stage is required').optional(),
  harga: z.string().optional(),
  tanggal_launch: z.string().optional(),
  pelanggan: z.string().optional(),
});

// GET - Get single product by ID
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

    // Basic authorization check
    if (auth.role?.name !== 'Admin' && auth.role?.name !== 'Project Manager' && auth.role?.name !== 'User') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const product = await db.$queryRaw`
      SELECT 
        p.id::text,
        p.produk,
        p.deskripsi,
        p.id_kategori::text,
        p.id_segmen::text,
        p.id_stage::text,
        k.kategori,
        s.segmen,
        st.stage,
        p.harga::text,
        p.tanggal_launch,
        p.pelanggan,
        p.created_at,
        p.updated_at
      FROM tbl_produk p
      LEFT JOIN tbl_kategori k ON p.id_kategori = k.id
      LEFT JOIN tbl_segmen s ON p.id_segmen = s.id
      LEFT JOIN tbl_stage st ON p.id_stage = st.id
      WHERE p.id = ${params.id}::integer
    `;

    if (!product || (product as any[]).length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Product not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: (product as any[])[0]
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error' 
    }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token);

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only admin and project manager can update products
    if (auth.role?.name !== 'Admin' && auth.role?.name !== 'Project Manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateProductSchema.parse(body);

    // Check if product exists
    const existingProduct = await db.$queryRaw`
      SELECT id FROM tbl_produk WHERE id = ${params.id}::integer
    `;

    if (!existingProduct || (existingProduct as any[]).length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Product not found' 
      }, { status: 404 });
    }

    // Build dynamic UPDATE query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (validatedData.produk !== undefined) {
      updateFields.push(`produk = $${paramIndex++}`);
      updateValues.push(validatedData.produk);
    }
    if (validatedData.deskripsi !== undefined) {
      updateFields.push(`deskripsi = $${paramIndex++}`);
      updateValues.push(validatedData.deskripsi);
    }
    if (validatedData.id_kategori !== undefined) {
      updateFields.push(`id_kategori = $${paramIndex++}`);
      updateValues.push(validatedData.id_kategori);
    }
    if (validatedData.id_segmen !== undefined) {
      updateFields.push(`id_segmen = $${paramIndex++}`);
      updateValues.push(validatedData.id_segmen);
    }
    if (validatedData.id_stage !== undefined) {
      updateFields.push(`id_stage = $${paramIndex++}`);
      updateValues.push(validatedData.id_stage);
    }
    if (validatedData.harga !== undefined) {
      updateFields.push(`harga = $${paramIndex++}`);
      updateValues.push(validatedData.harga);
    }
    if (validatedData.tanggal_launch !== undefined) {
      updateFields.push(`tanggal_launch = $${paramIndex++}`);
      updateValues.push(validatedData.tanggal_launch);
    }
    if (validatedData.pelanggan !== undefined) {
      updateFields.push(`pelanggan = $${paramIndex++}`);
      updateValues.push(validatedData.pelanggan);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No fields to update'
      }, { status: 400 });
    }

    // Add updated_at field
    updateFields.push(`updated_at = NOW()`);

    const updateQuery = `
      UPDATE tbl_produk 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}::integer
      RETURNING id::text, produk, updated_at
    `;

    updateValues.push(params.id);

    const updatedProduct = await db.$queryRawUnsafe(updateQuery, ...updateValues);

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: (updatedProduct as any[])[0]
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error' 
    }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const auth = verifyToken(token);

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only admin can delete products
    if (auth.role?.name !== 'Admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Check if product exists
    const existingProduct = await db.$queryRaw`
      SELECT id, produk FROM tbl_produk WHERE id = ${params.id}::integer
    `;

    if (!existingProduct || (existingProduct as any[]).length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Product not found' 
      }, { status: 404 });
    }

    // Delete product
    await db.$queryRaw`
      DELETE FROM tbl_produk WHERE id = ${params.id}::integer
    `;

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      data: { id: params.id, produk: (existingProduct as any[])[0].produk }
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error' 
    }, { status: 500 });
  }
}
