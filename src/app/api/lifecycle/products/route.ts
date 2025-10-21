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

    // Allow all authenticated users to view products
    // Remove restrictive permission check

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const stage = searchParams.get('stage') || '';
    const category = searchParams.get('category') || '';
    const segment = searchParams.get('segment') || '';

    const skip = (page - 1) * limit;

    // Use Prisma models instead of raw SQL
    const whereClause: any = {};
    
    if (search) {
      whereClause.produk = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    if (stage) {
      whereClause.id_stage = stage;
    }
    
    if (category) {
      whereClause.id_kategori = category;
    }
    
    if (segment) {
      whereClause.id_segmen = segment;
    }

    // Get products with pagination using Prisma
    const products = await db.product.findMany({
      where: whereClause,
      include: {
        kategori: true,
        segmen: true,
        stage: true
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: skip,
      take: limit
    });

    // Get total count
    const totalItems = await db.product.count({
      where: whereClause
    });

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