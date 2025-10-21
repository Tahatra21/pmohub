import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import * as XLSX from 'xlsx';
import { Server } from 'socket.io';
import { z } from 'zod';

const prisma = new PrismaClient();

// Skema validasi untuk request
const importSchema = z.object({
  name: z.string().min(1, "Nama versi tarif wajib diisi"),
  effectiveDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Format tanggal tidak valid",
  }),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parsing form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const effectiveDate = formData.get('effectiveDate') as string;
    const notes = formData.get('notes') as string;

    // Validasi input
    const validatedData = importSchema.parse({
      name,
      effectiveDate,
      notes,
    });

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

    // Hitung hash file untuk versioning
    const fileHash = createHash('md5').update(Buffer.from(buffer)).digest('hex');

    // Buat versi tarif baru
    const tariffVersion = await prisma.tariffVersion.create({
      data: {
        name: validatedData.name,
        effectiveDate: new Date(validatedData.effectiveDate),
        notes: validatedData.notes,
        isActive: true,
      }
    });

    // Proses data BLNP
    let processedCount = 0;
    const totalCount = blnpData.length + blpData.length;

    // Socket.io untuk progress updates
    // Catatan: Ini hanya simulasi, implementasi sebenarnya memerlukan setup Socket.io di server
    const sendProgress = (progress: number) => {
      // Dalam implementasi sebenarnya, kirim progress ke client via Socket.io
      console.log(`Progress: ${progress}%`);
    };

    // Proses data BLNP
    for (const item of blnpData) {
      const khs2022 = item['KHS 2022'] as string;
      const isAtCost = khs2022 === 'at cost';
      let numericValue: number | null = null;

      if (!isAtCost) {
        // Parse nilai rupiah (contoh: "1.000.000" -> 1000000)
        numericValue = parseInt(khs2022.replace(/\./g, ''));
      }

      await prisma.blnpRate.create({
        data: {
          versionId: tariffVersion.id,
          item: item['Uraian'] as string,
          ref: item['Referensi'] as string,
          khs2022: khs2022,
          note: item['Keterangan'] as string,
          numericValue,
          isAtCost,
        }
      });

      processedCount++;
      sendProgress(Math.floor((processedCount / totalCount) * 100));
    }

    // Proses data BLP
    for (const item of blpData) {
      const monthly = parseInt(String(item['Harga Satuan Bulanan (man months)']).replace(/\./g, ''));
      const daily = parseInt(String(item['Harga Satuan Harian (man days)']).replace(/\./g, ''));

      await prisma.blpRate.create({
        data: {
          versionId: tariffVersion.id,
          spec: item['Spesifikasi'] as string,
          ref: item['Referensi Harga'] as string,
          monthly: isNaN(monthly) ? 0 : monthly,
          daily: isNaN(daily) ? 0 : daily,
        }
      });

      processedCount++;
      sendProgress(Math.floor((processedCount / totalCount) * 100));
    }

    return NextResponse.json({
      success: true,
      tariffVersionId: tariffVersion.id,
      blnpCount: blnpData.length,
      blpCount: blpData.length,
    });

  } catch (error: any) {
    console.error('Error importing tariff:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validasi gagal", details: error.format() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat mengimpor data" },
      { status: 500 }
    );
  }
}