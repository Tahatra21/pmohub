import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const estimateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  description: z.string().optional(),
  lines: z.array(z.any()).optional()
});

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'cost:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const estimates = await db.estimate.findMany({
      include: {
        project: true,
        lines: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Format data untuk respons
    const formattedEstimates = estimates.map((estimate) => {
      // Hitung total estimasi dari semua baris estimasi
      const totalAmount = estimate.lines.reduce((sum, line) => {
        return sum + (line.qty * line.unitPrice);
      }, 0);

      return {
        id: estimate.id,
        name: estimate.title,
        projectName: estimate.project.name,
        createdAt: estimate.createdAt.toISOString(),
        updatedAt: estimate.updatedAt.toISOString(),
        totalAmount,
      };
    });

    return NextResponse.json({
      success: true,
      estimates: formattedEstimates,
    });
  } catch (error: any) {
    console.error('Error fetching estimates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan saat mengambil data estimasi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'cost:write')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = estimateSchema.parse(body);

    // Buat estimasi baru dalam transaksi
    const result = await db.$transaction(async (tx) => {
      // Buat estimasi
      const estimate = await tx.estimate.create({
        data: {
          title: validatedData.name,
          projectId: validatedData.projectId,
        },
      });

      // Buat baris estimasi jika ada
      if (validatedData.lines && validatedData.lines.length > 0) {
        const estimateLines = await Promise.all(
          validatedData.lines.map((line: any) => 
            tx.estimateLine.create({
              data: {
                estimateId: estimate.id,
                type: line.type || 'CUSTOM',
                description: line.description,
                unit: line.unit || 'unit',
                qty: line.qty || 1,
                unitPrice: line.unitPrice || 0,
                lineTotal: (line.qty || 1) * (line.unitPrice || 0),
                notes: line.notes || null,
              },
            })
          )
        );
        return { estimate, estimateLines };
      }

      return { estimate, estimateLines: [] };
    });

    return NextResponse.json({
      success: true,
      message: 'Estimasi berhasil dibuat',
      estimate: result.estimate,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating estimate:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.format() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan saat membuat estimasi' },
      { status: 500 }
    );
  }
}