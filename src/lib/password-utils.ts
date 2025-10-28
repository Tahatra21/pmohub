import { db } from '@/lib/db';

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export async function getPasswordPolicy(): Promise<PasswordPolicy> {
  const settings = await db.securitySettings.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (!settings) {
    // Return default policy
    return {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiryDays: 90,
    };
  }

  return {
    minLength: settings.passwordMinLength,
    requireUppercase: settings.passwordRequireUpper,
    requireLowercase: settings.passwordRequireLower,
    requireNumbers: settings.passwordRequireNumber,
    requireSpecialChars: settings.passwordRequireSpecial,
    passwordExpiryDays: settings.passwordExpiryDays,
  };
}

export function validatePassword(password: string, policy: PasswordPolicy): PasswordValidationResult {
  const errors: string[] = [];
  let strengthScore = 0;

  // Check minimum length
  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  } else {
    strengthScore++;
  }

  // Check uppercase requirement
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    strengthScore++;
  }

  // Check lowercase requirement
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    strengthScore++;
  }

  // Check number requirement
  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (/\d/.test(password)) {
    strengthScore++;
  }

  // Check special character requirement
  if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strengthScore++;
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (strengthScore >= 4) {
    strength = 'strong';
  } else if (strengthScore >= 2) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

export async function checkPasswordExpiry(userId: string): Promise<{
  isExpired: boolean;
  daysUntilExpiry: number;
  lastChanged: Date | null;
}> {
  try {
    const policy = await getPasswordPolicy();
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { passwordChangedAt: true }
    });

    if (!user || !user.passwordChangedAt) {
      return {
        isExpired: true,
        daysUntilExpiry: 0,
        lastChanged: null,
      };
    }

    const now = new Date();
    const expiryDate = new Date(user.passwordChangedAt);
    expiryDate.setDate(expiryDate.getDate() + policy.passwordExpiryDays);

    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isExpired: now > expiryDate,
      daysUntilExpiry: Math.max(0, daysUntilExpiry),
      lastChanged: user.passwordChangedAt,
    };
  } catch (error) {
    console.error('Failed to check password expiry:', error);
    return {
      isExpired: false,
      daysUntilExpiry: 90,
      lastChanged: null,
    };
  }
}

export async function updatePasswordChangedAt(userId: string): Promise<void> {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        passwordChangedAt: new Date(),
      }
    });
  } catch (error) {
    console.error('Failed to update password changed date:', error);
  }
}

export function generatePasswordStrengthIndicator(password: string): {
  score: number;
  level: string;
  color: string;
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    suggestions.push('Use at least 8 characters');
  }

  if (password.length >= 12) {
    score++;
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    suggestions.push('Add lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    suggestions.push('Add uppercase letters');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    suggestions.push('Add numbers');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    suggestions.push('Add special characters');
  }

  // Determine level and color
  let level: string;
  let color: string;

  if (score <= 2) {
    level = 'Weak';
    color = 'bg-red-500';
  } else if (score <= 4) {
    level = 'Medium';
    color = 'bg-yellow-500';
  } else {
    level = 'Strong';
    color = 'bg-green-500';
  }

  return {
    score,
    level,
    color,
    suggestions,
  };
}
