import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission(user.permissions, 'settings:system')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('id');

    if (!backupId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Backup ID is required' 
      }, { status: 400 });
    }

    // Get backup directory
    const backupDir = path.join(process.cwd(), 'backups');
    const backupFile = path.join(backupDir, backupId);

    // Check if backup file exists
    if (!fs.existsSync(backupFile)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Backup file not found' 
      }, { status: 404 });
    }

    // Read backup file
    const backupData = fs.readFileSync(backupFile);
    const stats = fs.statSync(backupFile);

    // Log download activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'READ',
          entity: 'Database',
          entityId: backupId,
          description: `Database backup downloaded: ${backupId}`,
          userId: user.id,
          severity: 'info',
          metadata: {
            backupFile: backupFile,
            backupSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`
          }
        }
      });
    } catch (logError) {
      console.error('Failed to log download activity:', logError);
    }

    // Return file as download
    return new NextResponse(backupData, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${backupId}"`,
        'Content-Length': stats.size.toString()
      }
    });

  } catch (error) {
    console.error('Backup download error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to download backup' 
    }, { status: 500 });
  }
}
