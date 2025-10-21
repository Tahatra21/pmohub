import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import * as XLSX from 'xlsx';

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

    const { id } = params;
    const costEstimator = await db.costEstimator.findUnique({
      where: { id }
    });

    if (!costEstimator) {
      return NextResponse.json(
        { success: false, error: 'Cost estimator not found' },
        { status: 404 }
      );
    }

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['COST ESTIMATION REPORT'],
      [''],
      ['Estimasi:', costEstimator.name],
      ['Proyek:', costEstimator.projectName || '-'],
      ['Klien:', costEstimator.client || '-'],
      ['Status:', costEstimator.status],
      ['Versi:', costEstimator.version],
      ['Tanggal Dibuat:', new Date(costEstimator.createdAt).toLocaleDateString('id-ID')],
      ['Dibuat Oleh:', costEstimator.createdBy || '-'],
      [''],
      ['RINGKASAN BIAYA'],
      ['Subtotal:', costEstimator.subtotal],
      ['Eskalasi:', costEstimator.escalation],
      ['Overhead:', costEstimator.overhead],
      ['Kontingensi:', costEstimator.contingency],
      ['Diskon:', costEstimator.discount],
      ['DPP:', costEstimator.dpp],
      ['PPN:', costEstimator.ppn],
      ['GRAND TOTAL:', costEstimator.grandTotal],
      [''],
      ['PENGATURAN'],
      ['Markup %:', costEstimator.markUpPct],
      ['Kontingensi %:', costEstimator.contingencyPct],
      ['Diskon %:', costEstimator.discountPct],
      ['PPN %:', costEstimator.ppnPct],
      ['Eskalasi %:', costEstimator.escalationPct],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Assumptions sheet
    if (costEstimator.assumptions) {
      const assumptionsData = [
        ['ASUMSI DAN CATATAN'],
        [''],
        ...Object.entries(costEstimator.assumptions).map(([key, value]) => [key, value])
      ];
      
      const assumptionsSheet = XLSX.utils.aoa_to_sheet(assumptionsData);
      XLSX.utils.book_append_sheet(workbook, assumptionsSheet, 'Assumptions');
    }

    // Notes sheet
    if (costEstimator.notes) {
      const notesData = [
        ['CATATAN TAMBAHAN'],
        [''],
        [costEstimator.notes]
      ];
      
      const notesSheet = XLSX.utils.aoa_to_sheet(notesData);
      XLSX.utils.book_append_sheet(workbook, notesSheet, 'Notes');
    }

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="estimasi-${costEstimator.name.replace(/[^a-zA-Z0-9]/g, '-')}.xlsx"`,
      },
    });

  } catch (error: any) {
    console.error('Error exporting cost estimator:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export cost estimator' },
      { status: 500 }
    );
  }
}
