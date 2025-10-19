import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { nama_aplikasi: { contains: search, mode: 'insensitive' } },
        { bpo: { contains: search, mode: 'insensitive' } },
        { jenis_lisensi: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    // Get licenses with pagination
    const [licenses, total] = await Promise.all([
      prisma.monitoringLicense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.monitoringLicense.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: licenses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Error fetching monitoring licenses:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['nama_aplikasi', 'bpo', 'jenis_lisensi', 'jumlah', 'harga_satuan'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const jumlah = Number(body.jumlah) || 0;
    const hargaSatuan = Number(body.harga_satuan) || 0;
    const sellingPrice = Number(body.selling_price) || 0;
    
    const hargaTotal = jumlah * hargaSatuan;
    const totalPurchasePrice = jumlah * hargaSatuan;
    const totalSellingPrice = jumlah * sellingPrice;

    const license = await prisma.monitoringLicense.create({
      data: {
        nama_aplikasi: body.nama_aplikasi,
        bpo: body.bpo,
        jenis_lisensi: body.jenis_lisensi,
        jumlah: jumlah,
        harga_satuan: hargaSatuan,
        harga_total: hargaTotal,
        periode_po: Number(body.periode_po) || 0,
        kontrak_layanan_bulan: Number(body.kontrak_layanan_bulan) || 0,
        start_layanan: body.start_layanan ? new Date(body.start_layanan) : null,
        akhir_layanan: body.akhir_layanan ? new Date(body.akhir_layanan) : null,
        metode: body.metode || '',
        keterangan_akun: body.keterangan_akun || '',
        tanggal_aktivasi: body.tanggal_aktivasi ? new Date(body.tanggal_aktivasi) : null,
        tanggal_pembaharuan: body.tanggal_pembaharuan ? new Date(body.tanggal_pembaharuan) : null,
        status: body.status || 'Active',
        selling_price: sellingPrice,
        purchase_price_per_unit: hargaSatuan,
        total_purchase_price: totalPurchasePrice,
        total_selling_price: totalSellingPrice,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(license, { status: 201 });

  } catch (error) {
    console.error('Error creating monitoring license:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'License ID is required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const jumlah = Number(body.jumlah) || 0;
    const hargaSatuan = Number(body.harga_satuan) || 0;
    const sellingPrice = Number(body.selling_price) || 0;
    
    const hargaTotal = jumlah * hargaSatuan;
    const totalPurchasePrice = jumlah * hargaSatuan;
    const totalSellingPrice = jumlah * sellingPrice;

    const license = await prisma.monitoringLicense.update({
      where: { id: body.id },
      data: {
        nama_aplikasi: body.nama_aplikasi,
        bpo: body.bpo,
        jenis_lisensi: body.jenis_lisensi,
        jumlah: jumlah,
        harga_satuan: hargaSatuan,
        harga_total: hargaTotal,
        periode_po: Number(body.periode_po) || 0,
        kontrak_layanan_bulan: Number(body.kontrak_layanan_bulan) || 0,
        start_layanan: body.start_layanan ? new Date(body.start_layanan) : null,
        akhir_layanan: body.akhir_layanan ? new Date(body.akhir_layanan) : null,
        metode: body.metode || '',
        keterangan_akun: body.keterangan_akun || '',
        tanggal_aktivasi: body.tanggal_aktivasi ? new Date(body.tanggal_aktivasi) : null,
        tanggal_pembaharuan: body.tanggal_pembaharuan ? new Date(body.tanggal_pembaharuan) : null,
        status: body.status || 'Active',
        selling_price: sellingPrice,
        purchase_price_per_unit: hargaSatuan,
        total_purchase_price: totalPurchasePrice,
        total_selling_price: totalSellingPrice,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(license);

  } catch (error) {
    console.error('Error updating monitoring license:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'License ID is required' },
        { status: 400 }
      );
    }

    await prisma.monitoringLicense.delete({
      where: { id: body.id },
    });

    return NextResponse.json({ message: 'License deleted successfully' });

  } catch (error) {
    console.error('Error deleting monitoring license:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
