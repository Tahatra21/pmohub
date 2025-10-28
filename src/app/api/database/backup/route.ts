import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);
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

    // Get backup directory
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // List existing backups
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.sql') || file.endsWith('.tar.gz'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          id: file,
          name: file,
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: {
        backups: backupFiles
      }
    });

  } catch (error) {
    console.error('Backup list error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to list backups' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { name, type = 'full' } = await request.json();

    // Get database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database URL not configured' 
      }, { status: 500 });
    }

    // Parse database URL
    const url = new URL(databaseUrl);
    const dbHost = url.hostname;
    const dbPort = url.port || '5432';
    const dbName = url.pathname.slice(1);
    const dbUser = url.username;
    const dbPassword = url.password;

    // Create backup directory
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupName = name || `pmo_db_backup_${timestamp}`;
    const backupFile = path.join(backupDir, `${backupName}.sql`);

    // Set PGPASSWORD environment variable
    process.env.PGPASSWORD = dbPassword;

    // Create backup command
    const backupCommand = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --no-password --verbose --clean --if-exists --create > "${backupFile}"`;

    console.log('Starting database backup...');
    console.log('Command:', backupCommand.replace(dbPassword, '***'));

    // Execute backup
    const { stdout, stderr } = await execAsync(backupCommand);

    // Check if backup file was created successfully
    if (!fs.existsSync(backupFile)) {
      console.error('Backup file was not created');
      return NextResponse.json({ 
        success: false, 
        error: 'Backup file was not created' 
      }, { status: 500 });
    }

    // Check for errors in stderr (but allow warnings)
    if (stderr && !stderr.includes('pg_dump: warning') && !stderr.includes('pg_dump: last built-in OID')) {
      console.error('Backup stderr:', stderr);
      return NextResponse.json({ 
        success: false, 
        error: 'Backup failed: ' + stderr 
      }, { status: 500 });
    }

    // Get backup file size
    const stats = fs.statSync(backupFile);
    const backupSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;

    console.log('Backup completed successfully');
    console.log('Backup file:', backupFile);
    console.log('Backup size:', backupSize);

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'CREATE',
          entity: 'Database',
          entityId: backupName,
          description: `Database backup created: ${backupName}`,
          userId: user.id,
          severity: 'success',
          metadata: {
            backupFile: backupFile,
            backupSize: backupSize,
            backupType: type
          }
        }
      });
    } catch (logError) {
      console.error('Failed to log backup activity:', logError);
    }

    return NextResponse.json({
      success: true,
      data: {
        backup: {
          id: backupName,
          name: backupName,
          file: backupFile,
          size: backupSize,
          createdAt: stats.birthtime.toISOString(),
          type: type
        }
      },
      message: 'Backup created successfully'
    });

  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create backup: ' + error.message 
    }, { status: 500 });
  }
}
