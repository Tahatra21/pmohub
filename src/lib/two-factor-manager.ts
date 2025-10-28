import { db } from '@/lib/db';
import crypto from 'crypto';

export interface TwoFactorAuth {
  id: string;
  userId: string;
  secret: string;
  backupCodes: string[];
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OTPVerification {
  isValid: boolean;
  remainingAttempts: number;
  lockedUntil?: Date;
}

export class TwoFactorManager {
  // Generate secret for 2FA
  static generateSecret(): string {
    return crypto.randomBytes(20).toString('base32');
  }

  // Generate OTP code
  static generateOTP(secret: string): string {
    const epoch = Math.round(new Date().getTime() / 1000.0);
    const time = Math.floor(epoch / 30);
    
    const key = Buffer.from(secret, 'base32');
    const counter = Buffer.alloc(8);
    counter.writeUIntBE(time, 0, 8);
    
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(counter);
    const digest = hmac.digest();
    
    const offset = digest[digest.length - 1] & 0xf;
    const code = ((digest[offset] & 0x7f) << 24) |
                ((digest[offset + 1] & 0xff) << 16) |
                ((digest[offset + 2] & 0xff) << 8) |
                (digest[offset + 3] & 0xff);
    
    return (code % 1000000).toString().padStart(6, '0');
  }

  // Generate backup codes
  static generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  // Verify OTP code
  static verifyOTP(secret: string, code: string): boolean {
    const expectedCode = this.generateOTP(secret);
    return expectedCode === code;
  }

  // Verify backup code
  static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const twoFactor = await db.twoFactorAuth.findUnique({
        where: { userId }
      });

      if (!twoFactor || !twoFactor.isEnabled) {
        return false;
      }

      const backupCodes = twoFactor.backupCodes as string[];
      const codeIndex = backupCodes.indexOf(code.toUpperCase());

      if (codeIndex === -1) {
        return false;
      }

      // Remove used backup code
      backupCodes.splice(codeIndex, 1);
      await db.twoFactorAuth.update({
        where: { userId },
        data: {
          backupCodes: backupCodes,
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to verify backup code:', error);
      return false;
    }
  }

  // Enable 2FA for user
  static async enable2FA(userId: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  }> {
    try {
      const secret = this.generateSecret();
      const backupCodes = this.generateBackupCodes();

      // Check if 2FA already exists
      const existing = await db.twoFactorAuth.findUnique({
        where: { userId }
      });

      if (existing) {
        // Update existing
        await db.twoFactorAuth.update({
          where: { userId },
          data: {
            secret,
            backupCodes,
            isEnabled: false, // Not enabled until verified
            updatedAt: new Date(),
          }
        });
      } else {
        // Create new
        await db.twoFactorAuth.create({
          data: {
            userId,
            secret,
            backupCodes,
            isEnabled: false,
          }
        });
      }

      // Generate QR code URL (simplified - in production use proper QR library)
      const qrCodeUrl = `otpauth://totp/PMO:${userId}?secret=${secret}&issuer=PMO`;

      return {
        secret,
        qrCodeUrl,
        backupCodes,
      };
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      throw new Error('Failed to enable 2FA');
    }
  }

  // Verify and enable 2FA
  static async verifyAndEnable2FA(userId: string, code: string): Promise<boolean> {
    try {
      const twoFactor = await db.twoFactorAuth.findUnique({
        where: { userId }
      });

      if (!twoFactor) {
        return false;
      }

      const isValid = this.verifyOTP(twoFactor.secret, code);
      if (!isValid) {
        return false;
      }

      // Enable 2FA
      await db.twoFactorAuth.update({
        where: { userId },
        data: {
          isEnabled: true,
          updatedAt: new Date(),
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to verify and enable 2FA:', error);
      return false;
    }
  }

  // Disable 2FA
  static async disable2FA(userId: string): Promise<boolean> {
    try {
      await db.twoFactorAuth.update({
        where: { userId },
        data: {
          isEnabled: false,
          updatedAt: new Date(),
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      return false;
    }
  }

  // Check if 2FA is enabled for user
  static async is2FAEnabled(userId: string): Promise<boolean> {
    try {
      const twoFactor = await db.twoFactorAuth.findUnique({
        where: { userId }
      });
      return twoFactor?.isEnabled || false;
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
      return false;
    }
  }

  // Get 2FA status
  static async get2FAStatus(userId: string): Promise<{
    isEnabled: boolean;
    hasBackupCodes: boolean;
    backupCodesCount: number;
  }> {
    try {
      const twoFactor = await db.twoFactorAuth.findUnique({
        where: { userId }
      });

      if (!twoFactor) {
        return {
          isEnabled: false,
          hasBackupCodes: false,
          backupCodesCount: 0,
        };
      }

      const backupCodes = twoFactor.backupCodes as string[] || [];

      return {
        isEnabled: twoFactor.isEnabled,
        hasBackupCodes: backupCodes.length > 0,
        backupCodesCount: backupCodes.length,
      };
    } catch (error) {
      console.error('Failed to get 2FA status:', error);
      return {
        isEnabled: false,
        hasBackupCodes: false,
        backupCodesCount: 0,
      };
    }
  }

  // Regenerate backup codes
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    try {
      const backupCodes = this.generateBackupCodes();
      
      await db.twoFactorAuth.update({
        where: { userId },
        data: {
          backupCodes,
          updatedAt: new Date(),
        }
      });

      return backupCodes;
    } catch (error) {
      console.error('Failed to regenerate backup codes:', error);
      throw new Error('Failed to regenerate backup codes');
    }
  }
}
