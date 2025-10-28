import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
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

    // Get file stats before deletion
    const stats = fs.statSync(backupFile);
    const backupSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;

    // Delete backup file
    fs.unlinkSync(backupFile);

    // Log deletion activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'DELETE',
          entity: 'Database',
          entityId: backupId,
          description: `Database backup deleted: ${backupId}`,
          userId: user.id,
          severity: 'warning',
          metadata: {
            backupFile: backupFile,
            backupSize: backupSize
          }
        }
      });
    } catch (logError) {
      console.error('Failed to log deletion activity:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully'
    });

  } catch (error) {
    console.error('Backup deletion error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete backup' 
    }, { status: 500 });
  }
}
