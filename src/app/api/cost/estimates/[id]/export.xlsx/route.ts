import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { formatCurrency } from '@/lib/cost-calculator';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Fetch estimate data
    const estimate = await db.estimate.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            tariffVersion: true
          }
        },
        lines: {
          orderBy: {
            sort: 'asc'
          }
        }
      }
    });

    if (!estimate) {
      return NextResponse.json(
        { success: false, error: 'Estimate not found' },
        { status: 404 }
      );
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['ESTIMASI BIAYA PROYEK'],
      [''],
      ['Nama Proyek', estimate.project.name],
      ['Nama Estimasi', estimate.title],
      ['Tarif yang Digunakan', estimate.project.tariffVersion.name],
      ['Tanggal Dibuat', estimate.createdAt.toLocaleDateString('id-ID')],
      ['Status', estimate.status],
      [''],
      ['RINGKASAN TOTAL'],
      ['Subtotal', formatCurrency(estimate.totals?.subtotal || 0)],
      ['Escalation', formatCurrency(estimate.totals?.escalation || 0)],
      ['Overhead', formatCurrency(estimate.totals?.overhead || 0)],
      ['Contingency', formatCurrency(estimate.totals?.contingency || 0)],
      ['Discount', formatCurrency(estimate.totals?.discount || 0)],
      ['DPP', formatCurrency(estimate.totals?.dpp || 0)],
      ['PPN', formatCurrency(estimate.totals?.ppn || 0)],
      ['GRAND TOTAL', formatCurrency(estimate.totals?.grandTotal || 0)]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    // Detail lines sheet
    const linesData = [
      ['No', 'Tipe', 'Deskripsi', 'Unit', 'Quantity', 'Harga Satuan', 'Total', 'Catatan']
    ];

    estimate.lines.forEach((line, index) => {
      linesData.push([
        index + 1,
        line.type,
        line.description,
        line.unit,
        line.qty,
        formatCurrency(line.unitPrice),
        formatCurrency(line.lineTotal),
        line.meta?.notes || ''
      ]);
    });

    const linesSheet = XLSX.utils.aoa_to_sheet(linesData);
    XLSX.utils.book_append_sheet(workbook, linesSheet, 'Detail Baris');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="estimasi-${estimate.title.replace(/[^a-zA-Z0-9]/g, '-')}.xlsx"`
      }
    });

  } catch (error: any) {
    console.error('Error exporting estimate to Excel:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export estimate' },
      { status: 500 }
    );
  }
}
