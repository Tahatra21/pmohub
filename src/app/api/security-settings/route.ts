import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const securitySettingsSchema = z.object({
  // Password Policy
  passwordMinLength: z.number().min(6).max(32),
  passwordRequireUpper: z.boolean(),
  passwordRequireLower: z.boolean(),
  passwordRequireNumber: z.boolean(),
  passwordRequireSpecial: z.boolean(),
  passwordExpiryDays: z.number().min(30).max(365),
  
  // Session Settings
  sessionTimeoutMinutes: z.number().min(5).max(480),
  maxConcurrentSessions: z.number().min(1).max(10),
  requireReauthSensitive: z.boolean(),
  
  // Access Control
  enableTwoFactor: z.boolean(),
  enableIpWhitelist: z.boolean(),
  allowedIps: z.array(z.string()),
  enableAuditLog: z.boolean(),
  
  // Encryption
  enableDataEncryption: z.boolean(),
  encryptionAlgorithm: z.string(),
  keyRotationDays: z.number().min(1).max(365),
});

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

    // Get security settings (there should only be one record)
    let settings = await db.securitySettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    // If no settings exist, create default ones
    if (!settings) {
      settings = await db.securitySettings.create({
        data: {
          passwordMinLength: 8,
          passwordRequireUpper: true,
          passwordRequireLower: true,
          passwordRequireNumber: true,
          passwordRequireSpecial: true,
          passwordExpiryDays: 90,
          sessionTimeoutMinutes: 30,
          maxConcurrentSessions: 3,
          requireReauthSensitive: true,
          enableTwoFactor: false,
          enableIpWhitelist: false,
          allowedIps: [],
          enableAuditLog: true,
          enableDataEncryption: true,
          encryptionAlgorithm: 'AES-256',
          keyRotationDays: 30,
          updatedBy: user.id,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: settings.id,
        passwordPolicy: {
          minLength: settings.passwordMinLength,
          requireUppercase: settings.passwordRequireUpper,
          requireLowercase: settings.passwordRequireLower,
          requireNumbers: settings.passwordRequireNumber,
          requireSpecialChars: settings.passwordRequireSpecial,
          passwordExpiryDays: settings.passwordExpiryDays,
        },
        sessionSettings: {
          sessionTimeout: settings.sessionTimeoutMinutes,
          maxConcurrentSessions: settings.maxConcurrentSessions,
          requireReauthForSensitive: settings.requireReauthSensitive,
        },
        accessControl: {
          enableTwoFactor: settings.enableTwoFactor,
          enableIpWhitelist: settings.enableIpWhitelist,
          allowedIps: settings.allowedIps as string[],
          enableAuditLog: settings.enableAuditLog,
        },
        encryption: {
          enableDataEncryption: settings.enableDataEncryption,
          encryptionAlgorithm: settings.encryptionAlgorithm,
          keyRotationDays: settings.keyRotationDays,
        },
        updatedAt: settings.updatedAt,
        updatedBy: settings.updatedBy,
      }
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = securitySettingsSchema.parse(body);

    // Get existing settings
    let settings = await db.securitySettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (settings) {
      // Update existing settings
      settings = await db.securitySettings.update({
        where: { id: settings.id },
        data: {
          passwordMinLength: validatedData.passwordMinLength,
          passwordRequireUpper: validatedData.passwordRequireUpper,
          passwordRequireLower: validatedData.passwordRequireLower,
          passwordRequireNumber: validatedData.passwordRequireNumber,
          passwordRequireSpecial: validatedData.passwordRequireSpecial,
          passwordExpiryDays: validatedData.passwordExpiryDays,
          sessionTimeoutMinutes: validatedData.sessionTimeoutMinutes,
          maxConcurrentSessions: validatedData.maxConcurrentSessions,
          requireReauthSensitive: validatedData.requireReauthSensitive,
          enableTwoFactor: validatedData.enableTwoFactor,
          enableIpWhitelist: validatedData.enableIpWhitelist,
          allowedIps: validatedData.allowedIps,
          enableAuditLog: validatedData.enableAuditLog,
          enableDataEncryption: validatedData.enableDataEncryption,
          encryptionAlgorithm: validatedData.encryptionAlgorithm,
          keyRotationDays: validatedData.keyRotationDays,
          updatedBy: user.id,
        }
      });
    } else {
      // Create new settings
      settings = await db.securitySettings.create({
        data: {
          passwordMinLength: validatedData.passwordMinLength,
          passwordRequireUpper: validatedData.passwordRequireUpper,
          passwordRequireLower: validatedData.passwordRequireLower,
          passwordRequireNumber: validatedData.passwordRequireNumber,
          passwordRequireSpecial: validatedData.passwordRequireSpecial,
          passwordExpiryDays: validatedData.passwordExpiryDays,
          sessionTimeoutMinutes: validatedData.sessionTimeoutMinutes,
          maxConcurrentSessions: validatedData.maxConcurrentSessions,
          requireReauthSensitive: validatedData.requireReauthSensitive,
          enableTwoFactor: validatedData.enableTwoFactor,
          enableIpWhitelist: validatedData.enableIpWhitelist,
          allowedIps: validatedData.allowedIps,
          enableAuditLog: validatedData.enableAuditLog,
          enableDataEncryption: validatedData.enableDataEncryption,
          encryptionAlgorithm: validatedData.encryptionAlgorithm,
          keyRotationDays: validatedData.keyRotationDays,
          updatedBy: user.id,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: settings.id,
        passwordPolicy: {
          minLength: settings.passwordMinLength,
          requireUppercase: settings.passwordRequireUpper,
          requireLowercase: settings.passwordRequireLower,
          requireNumbers: settings.passwordRequireNumber,
          requireSpecialChars: settings.passwordRequireSpecial,
          passwordExpiryDays: settings.passwordExpiryDays,
        },
        sessionSettings: {
          sessionTimeout: settings.sessionTimeoutMinutes,
          maxConcurrentSessions: settings.maxConcurrentSessions,
          requireReauthForSensitive: settings.requireReauthSensitive,
        },
        accessControl: {
          enableTwoFactor: settings.enableTwoFactor,
          enableIpWhitelist: settings.enableIpWhitelist,
          allowedIps: settings.allowedIps as string[],
          enableAuditLog: settings.enableAuditLog,
        },
        encryption: {
          enableDataEncryption: settings.enableDataEncryption,
          encryptionAlgorithm: settings.encryptionAlgorithm,
          keyRotationDays: settings.keyRotationDays,
        },
        updatedAt: settings.updatedAt,
        updatedBy: settings.updatedBy,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating security settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
