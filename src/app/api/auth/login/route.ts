import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createToken, hashPassword, verifyPassword } from '@/lib/auth';
import { logAuthEvent } from '@/lib/audit-middleware';
import { SessionManager } from '@/lib/session-manager';
import { checkPasswordExpiry } from '@/lib/password-utils';
import { TwoFactorManager } from '@/lib/two-factor-manager';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  twoFactorCode: z.string().optional(),
  backupCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, twoFactorCode, backupCode } = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      // Log failed login attempt
      await logAuthEvent(request, 'LOGIN_FAILED', 'unknown', {
        email,
        reason: user ? 'inactive_account' : 'user_not_found',
      });
      
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      // Log failed login attempt
      await logAuthEvent(request, 'LOGIN_FAILED', user.id, {
        email,
        reason: 'invalid_password',
      });
      
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password expiry
    const passwordExpiry = await checkPasswordExpiry(user.id);
    if (passwordExpiry.isExpired) {
      // Log failed login attempt due to expired password
      await logAuthEvent(request, 'LOGIN_FAILED', user.id, {
        email,
        reason: 'password_expired',
        daysExpired: Math.abs(passwordExpiry.daysUntilExpiry),
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password has expired. Please change your password.',
          code: 'PASSWORD_EXPIRED',
          daysExpired: Math.abs(passwordExpiry.daysUntilExpiry)
        },
        { status: 403 }
      );
    }

    // Check if 2FA is enabled
    const is2FAEnabled = await TwoFactorManager.is2FAEnabled(user.id);
    
    if (is2FAEnabled) {
      // If 2FA is enabled, require 2FA code or backup code
      if (!twoFactorCode && !backupCode) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Two-factor authentication required',
            requires2FA: true
          },
          { status: 200 } // 200 because this is expected behavior
        );
      }

      let twoFactorValid = false;
      
      if (twoFactorCode) {
        // Verify OTP code
        const twoFactor = await db.twoFactorAuth.findUnique({
          where: { userId: user.id }
        });
        
        if (twoFactor) {
          twoFactorValid = TwoFactorManager.verifyOTP(twoFactor.secret, twoFactorCode);
        }
      } else if (backupCode) {
        // Verify backup code
        twoFactorValid = await TwoFactorManager.verifyBackupCode(user.id, backupCode);
      }

      if (!twoFactorValid) {
        // Log failed 2FA attempt
        await logAuthEvent(request, 'LOGIN_FAILED', user.id, {
          email,
          reason: 'invalid_2fa_code',
        });
        
        return NextResponse.json(
          { success: false, error: 'Invalid two-factor authentication code' },
          { status: 401 }
        );
      }
    }

    // Check concurrent session limit
    const settings = await db.securitySettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    const maxConcurrentSessions = settings?.maxConcurrentSessions || 3;
    const sessionTimeoutMinutes = settings?.sessionTimeoutMinutes || 30;
    
    const canCreateSession = await SessionManager.checkConcurrentSessionLimit(
      user.id, 
      maxConcurrentSessions
    );

    if (!canCreateSession) {
      // Log failed login attempt due to session limit
      await logAuthEvent(request, 'LOGIN_FAILED', user.id, {
        email,
        reason: 'concurrent_session_limit_exceeded',
        maxSessions: maxConcurrentSessions,
      });
      
      return NextResponse.json(
        { success: false, error: `Maximum concurrent sessions limit reached (${maxConcurrentSessions}). Please terminate existing sessions.` },
        { status: 403 }
      );
    }

    // Create new session
    const session = await SessionManager.createSession(
      user.id, 
      request, 
      sessionTimeoutMinutes
    );

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.role.permissions as Record<string, any> || {},
      sessionId: session.sessionId, // Include session ID in token
    };

    const token = await createToken(authUser);

    // Log successful login
    await logAuthEvent(request, 'LOGIN', user.id, {
      email,
      role: user.role.name,
      sessionId: session.sessionId,
      ipAddress: session.ipAddress,
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: authUser,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}