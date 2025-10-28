import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { SessionManager } from '@/lib/session-manager';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'settings:system')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get active sessions using SessionManager
    const sessions = userId 
      ? await SessionManager.getUserActiveSessions(userId)
      : await SessionManager.getAllActiveSessions();
    
    const statistics = await SessionManager.getSessionStatistics();

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session.id,
          userId: session.userId,
          sessionId: session.sessionId,
          userName: session.user?.name || 'Unknown',
          userEmail: session.user?.email || 'Unknown',
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          isActive: session.isActive,
          lastActivity: session.lastActivity,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt,
        })),
        statistics
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'settings:system')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action'); // 'single', 'user', 'all'

    if (action === 'single' && sessionId) {
      // Terminate single session
      const success = await SessionManager.terminateSession(sessionId);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to terminate session' },
          { status: 500 }
        );
      }
    } else if (action === 'user' && userId) {
      // Terminate all sessions for a user
      await SessionManager.terminateAllUserSessions(userId);
    } else if (action === 'all') {
      // Terminate all sessions
      await SessionManager.terminateAllSessions();
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session(s) terminated successfully'
    });
  } catch (error) {
    console.error('Error terminating sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
