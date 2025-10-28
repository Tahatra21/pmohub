import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import backupScheduler from '@/services/backupScheduler';

// GET /api/database/scheduler - Get scheduler status and jobs
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    if (!user.permissions || !user.permissions['settings:system']) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const status = backupScheduler.getStatus();
    const jobs = backupScheduler.getJobs();

    return NextResponse.json({
      success: true,
      data: {
        status,
        jobs
      }
    });

  } catch (error) {
    console.error('Scheduler status error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get scheduler status' 
    }, { status: 500 });
  }
}

// POST /api/database/scheduler - Toggle job or add new job
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    if (!user.permissions || !user.permissions['settings:system']) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, jobId, schedule, name } = body;

    switch (action) {
      case 'toggle':
        if (!jobId) {
          return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }
        
        const isActive = backupScheduler.toggleJob(jobId);
        return NextResponse.json({
          success: true,
          data: { isActive }
        });

      case 'add':
        if (!schedule || !name) {
          return NextResponse.json({ error: 'Schedule and name are required' }, { status: 400 });
        }
        
        const newJobId = backupScheduler.addJob({
          name,
          schedule,
          isActive: true
        });
        
        return NextResponse.json({
          success: true,
          data: { jobId: newJobId }
        });

      case 'update':
        if (!jobId || !schedule) {
          return NextResponse.json({ error: 'Job ID and schedule are required' }, { status: 400 });
        }
        
        const updated = backupScheduler.updateJobSchedule(jobId, schedule);
        if (!updated) {
          return NextResponse.json({ error: 'Invalid schedule format' }, { status: 400 });
        }
        
        return NextResponse.json({
          success: true,
          data: { updated: true }
        });

      case 'remove':
        if (!jobId) {
          return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }
        
        const removed = backupScheduler.removeJob(jobId);
        if (!removed) {
          return NextResponse.json({ error: 'Cannot remove default jobs' }, { status: 400 });
        }
        
        return NextResponse.json({
          success: true,
          data: { removed: true }
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Scheduler action error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to perform scheduler action' 
    }, { status: 500 });
  }
}
