import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const createProductSchema = z.object({
  produk: z.string().min(1, 'Product name is required'),
  deskripsi: z.string().optional(),
  id_kategori: z.string().min(1, 'Category is required'),
  id_segmen: z.string().min(1, 'Segment is required'),
  id_stage: z.string().min(1, 'Stage is required'),
  harga: z.string().optional(),
  tanggal_launch: z.string().optional(),
  pelanggan: z.string().optional(),
});

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

// GET - Fetch products with pagination and filters
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const stage = searchParams.get('stage') || '';
    const category = searchParams.get('category') || '';
    const segment = searchParams.get('segment') || '';

    const skip = (page - 1) * limit;

    // Get products with pagination using Prisma models with joins
    const products = await db.$queryRaw`
      SELECT 
        p.id,
        p.produk,
        p.deskripsi,
        p.id_kategori,
        p.id_segmen,
        p.id_stage,
        p.harga,
        p.tanggal_launch,
        p.pelanggan,
        p.created_at,
        p.updated_at,
        p.tanggal_stage_end,
        p.tanggal_stage_start,
        s.segmen,
        st.stage
      FROM tbl_produk_lifecycle p
      LEFT JOIN tbl_segmen_lifecycle s ON p.id_segmen = s.id
      LEFT JOIN tbl_stage_lifecycle st ON p.id_stage = st.id
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    // Get total count
    const totalItems = await db.productLifecycle.count();

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const auth = await verifyToken(token);

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only admin and project manager can create products
    if (auth.role?.name !== 'Admin' && auth.role?.name !== 'Project Manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    
    // Extract form fields
    const productData = {
      produk: formData.get('produk') as string,
      deskripsi: formData.get('deskripsi') as string,
      id_kategori: formData.get('id_kategori') as string,
      id_segmen: formData.get('id_segmen') as string,
      id_stage: formData.get('id_stage') as string,
      harga: formData.get('harga') as string,
      tanggal_launch: formData.get('tanggal_launch') as string,
      pelanggan: formData.get('pelanggan') as string,
    };

    const validatedData = createProductSchema.parse(productData);

    // Create product
    const newProduct = await db.product.create({
      data: {
        produk: validatedData.produk,
        deskripsi: validatedData.deskripsi || null,
        id_kategori: validatedData.id_kategori,
        id_segmen: validatedData.id_segmen,
        id_stage: validatedData.id_stage,
        harga: validatedData.harga || null,
        tanggal_launch: validatedData.tanggal_launch || null,
        pelanggan: validatedData.pelanggan || null,
      },
      include: {
        kategori: true,
        segmen: true,
        stage: true
      }
    });

    // Handle file uploads if any
    const files = formData.getAll('files') as File[];
    if (files.length > 0) {
      // TODO: Implement file storage logic here
      console.log('Files to upload:', files.map(f => f.name));
    }

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    
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