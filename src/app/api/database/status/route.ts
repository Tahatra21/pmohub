import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

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
    // Check permission from token payload directly
    if (!user.permissions || !user.permissions['settings:system']) {
      console.log('Permission check failed for settings:system');
      console.log('User permissions:', user.permissions);
      console.log('User object:', user);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Test database connection
    let dbStatus = 'disconnected';
    let lastChecked = new Date().toISOString();
    let databaseSize = 0;
    let databaseName = 'pmo_db';
    let databaseVersion = 'Unknown';
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
      
      // Get database info
      const dbInfo = await prisma.$queryRaw`
        SELECT 
          pg_database_size(current_database()) as size,
          current_database() as name,
          version() as version
      ` as any[];

      databaseSize = dbInfo[0]?.size ? Math.round(Number(dbInfo[0].size) / 1024 / 1024 * 100) / 100 : 0;
      databaseName = dbInfo[0]?.name || 'pmo_db';
      databaseVersion = dbInfo[0]?.version || 'Unknown';
      
    } catch (error) {
      console.error('Database connection test failed:', error);
      dbStatus = 'error';
    }

    return NextResponse.json({
      success: true,
      data: {
        connection: {
          id: '1',
          name: `PMO Database (${databaseName})`,
          host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]?.split(':')[0] || 'localhost',
          port: parseInt(process.env.DATABASE_URL?.split(':')[3] || '5432'),
          database: databaseName,
          status: dbStatus,
          lastChecked: lastChecked,
          version: databaseVersion,
          size: `${databaseSize} MB`
        }
      }
    });

  } catch (error) {
    console.error('Database status error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get database status' 
    }, { status: 500 });
  }
}
