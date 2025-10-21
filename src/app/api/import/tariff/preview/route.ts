import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    // Parsing form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    // Baca file Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Cek keberadaan sheet yang diperlukan
    if (!workbook.SheetNames.includes('BLNP') || !workbook.SheetNames.includes('BLP')) {
      return NextResponse.json(
        { error: "File harus berisi sheet BLNP dan BLP" },
        { status: 422 }
      );
    }

    // Baca data dari sheet
    const blnpSheet = workbook.Sheets['BLNP'];
    const blpSheet = workbook.Sheets['BLP'];

    const blnpData = XLSX.utils.sheet_to_json(blnpSheet);
    const blpData = XLSX.utils.sheet_to_json(blpSheet);

    // Validasi header
    const blnpHeaders = Object.keys(blnpData[0] || {});
    const blpHeaders = Object.keys(blpData[0] || {});

    const requiredBlnpHeaders = ['Uraian', 'Referensi', 'KHS 2022', 'Keterangan'];
    const requiredBlpHeaders = ['No', 'Spesifikasi', 'Referensi Harga', 'Harga Satuan Bulanan (man months)', 'Harga Satuan Harian (man days)'];

    const missingBlnpHeaders = requiredBlnpHeaders.filter(header => !blnpHeaders.includes(header));
    const missingBlpHeaders = requiredBlpHeaders.filter(header => !blpHeaders.includes(header));

    if (missingBlnpHeaders.length > 0 || missingBlpHeaders.length > 0) {
      return NextResponse.json(
        { 
          error: "Format header tidak sesuai", 
          missingBlnpHeaders, 
          missingBlpHeaders 
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      blnp: blnpData,
      blp: blpData,
    });

  } catch (error: any) {
    console.error('Error previewing tariff:', error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memproses file" },
      { status: 500 }
    );
  }
}