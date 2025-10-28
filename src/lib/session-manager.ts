import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export interface SessionData {
  id: string;
  userId: string;
  sessionId: string;
  ipAddress: string | null;
  userAgent: string | null;
  isActive: boolean;
  lastActivity: Date;
  expiresAt: Date;
  createdAt: Date;
}

export class SessionManager {
  // Create new session
  static async createSession(
    userId: string, 
    request: NextRequest, 
    sessionTimeoutMinutes: number = 30
  ): Promise<SessionData> {
    const sessionId = `sess_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
    const expiresAt = new Date(Date.now() + sessionTimeoutMinutes * 60 * 1000);
    
    const clientIp = request.ip || 
                     request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    const userAgent = request.headers.get('user-agent') || null;

    const session = await db.userSession.create({
      data: {
        userId,
        sessionId,
        ipAddress: clientIp,
        userAgent,
        isActive: true,
        lastActivity: new Date(),
        expiresAt,
      }
    });

    return session as SessionData;
  }

  // Update session activity
  static async updateSessionActivity(sessionId: string): Promise<void> {
    await db.userSession.update({
      where: { sessionId },
      data: {
        lastActivity: new Date(),
      }
    });
  }

  // Get active sessions for user
  static async getUserActiveSessions(userId: string): Promise<SessionData[]> {
    const sessions = await db.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        lastActivity: 'desc'
      }
    });

    return sessions as SessionData[];
  }

  // Get all active sessions (admin)
  static async getAllActiveSessions(): Promise<SessionData[]> {
    const sessions = await db.userSession.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        lastActivity: 'desc'
      }
    });

    return sessions as any[];
  }

  // Terminate specific session
  static async terminateSession(sessionId: string): Promise<boolean> {
    try {
      await db.userSession.update({
        where: { sessionId },
        data: {
          isActive: false,
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to terminate session:', error);
      return false;
    }
  }

  // Terminate all sessions for user
  static async terminateAllUserSessions(userId: string): Promise<number> {
    try {
      const result = await db.userSession.updateMany({
        where: { userId },
        data: {
          isActive: false,
        }
      });
      return result.count;
    } catch (error) {
      console.error('Failed to terminate user sessions:', error);
      return 0;
    }
  }

  // Terminate all sessions (admin)
  static async terminateAllSessions(): Promise<number> {
    try {
      const result = await db.userSession.updateMany({
        where: { isActive: true },
        data: {
          isActive: false,
        }
      });
      return result.count;
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      return 0;
    }
  }

  // Clean expired sessions
  static async cleanExpiredSessions(): Promise<number> {
    try {
      const result = await db.userSession.updateMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        },
        data: {
          isActive: false,
        }
      });
      return result.count;
    } catch (error) {
      console.error('Failed to clean expired sessions:', error);
      return 0;
    }
  }

  // Check if session is valid
  static async isValidSession(sessionId: string): Promise<boolean> {
    try {
      const session = await db.userSession.findUnique({
        where: { sessionId },
        select: {
          isActive: true,
          expiresAt: true,
        }
      });

      if (!session) return false;
      
      return session.isActive && session.expiresAt > new Date();
    } catch (error) {
      console.error('Failed to validate session:', error);
      return false;
    }
  }

  // Get session statistics
  static async getSessionStatistics(): Promise<{
    totalActiveSessions: number;
    expiredSessions: number;
    validSessions: number;
  }> {
    try {
      const now = new Date();
      
      const [totalActive, expired, valid] = await Promise.all([
        db.userSession.count({
          where: { isActive: true }
        }),
        db.userSession.count({
          where: {
            isActive: true,
            expiresAt: { lt: now }
          }
        }),
        db.userSession.count({
          where: {
            isActive: true,
            expiresAt: { gt: now }
          }
        })
      ]);

      return {
        totalActiveSessions: totalActive,
        expiredSessions: expired,
        validSessions: valid,
      };
    } catch (error) {
      console.error('Failed to get session statistics:', error);
      return {
        totalActiveSessions: 0,
        expiredSessions: 0,
        validSessions: 0,
      };
    }
  }

  // Check concurrent session limit
  static async checkConcurrentSessionLimit(
    userId: string, 
    maxConcurrentSessions: number = 3
  ): Promise<boolean> {
    try {
      const activeSessions = await db.userSession.count({
        where: {
          userId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      return activeSessions < maxConcurrentSessions;
    } catch (error) {
      console.error('Failed to check concurrent session limit:', error);
      return true; // Allow if check fails
    }
  }
}
