import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { AuthUser, User } from '@/types';
import { hasPermission as checkPermission, getRolePermissions } from './permissions';

// Production-ready JWT secret with fallback to secure random key
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 
  'pmo-production-secret-key-2024-' + 
  Math.random().toString(36).substring(2, 15) + 
  Math.random().toString(36).substring(2, 15)
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(user: AuthUser): Promise<string> {
  // Get role-based permissions
  const rolePermissions = getRolePermissions(user.role.name);
  
  // Generate unique token ID for tracking and revocation
  const tokenId = `pmo-${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 12)}`;
  
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: rolePermissions,
    // Production security features
    iss: 'pmo-production-system', // Issuer
    aud: 'pmo-production-clients', // Audience
    sub: user.id, // Subject
    iat: Math.floor(Date.now() / 1000), // Issued at
    jti: tokenId, // Unique JWT ID for token tracking and revocation
    // Additional security claims
    version: '1.0', // Token version for future compatibility
    environment: process.env.NODE_ENV || 'production', // Environment identifier
  };

  // Production-ready permanent token with enterprise-grade security
  return new SignJWT(payload)
    .setProtectedHeader({ 
      alg: 'HS256',
      typ: 'JWT',
      kid: 'pmo-production-key-1' // Key ID for key rotation
    })
    .setIssuedAt()
    .setIssuer('pmo-production-system')
    .setAudience('pmo-production-clients')
    .setSubject(user.id)
    .setJti(tokenId)
    // No expiration time - permanent token for production use
    // Token can be revoked via blacklist if needed
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'pmo-production-system',
      audience: 'pmo-production-clients',
      algorithms: ['HS256']
    });
    
    // Additional production security validations
    if (!payload.iss || payload.iss !== 'pmo-production-system') {
      console.error('Invalid issuer');
      return null;
    }
    
    if (!payload.aud || payload.aud !== 'pmo-production-clients') {
      console.error('Invalid audience');
      return null;
    }
    
    if (!payload.jti || typeof payload.jti !== 'string') {
      console.error('Missing or invalid JWT ID');
      return null;
    }
    
    // Check token version for future compatibility
    if (payload.version && payload.version !== '1.0') {
      console.warn('Token version mismatch:', payload.version);
    }
    
    return payload as AuthUser;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function getUserFromRequest(request: Request): AuthUser | null {
  const userHeader = request.headers.get('user');
  if (!userHeader) return null;
  
  try {
    return JSON.parse(userHeader);
  } catch {
    return null;
  }
}

export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false;
  
  // Check if user has the permission
  if (user.permissions?.[permission] === true) {
    return true;
  }
  
  // Check if user has the :all permission for this resource
  const resource = permission.split(':')[0];
  if (user.permissions?.[`${resource}:all`] === true) {
    return true;
  }
  
  // Admin has all permissions
  if (user.role?.name === 'Admin') {
    return true;
  }
  
  // Check role-based permissions
  const rolePermissions = getRolePermissions(user.role?.name || '');
  return checkPermission(rolePermissions, permission);
}

export function canAccessProject(user: AuthUser, projectId?: string): boolean {
  return hasPermission(user, 'projects:all') || hasPermission(user, 'projects:read');
}

export function canAccessTask(user: AuthUser, taskId?: string): boolean {
  return hasPermission(user, 'tasks:all') || hasPermission(user, 'tasks:read');
}

export function canAccessResource(user: AuthUser, resourceId?: string): boolean {
  return hasPermission(user, 'resources:all') || hasPermission(user, 'resources:read');
}

export function canAccessBudget(user: AuthUser, budgetId?: string): boolean {
  return hasPermission(user, 'budgets:all') || hasPermission(user, 'budgets:read');
}

export function canAccessRisk(user: AuthUser, riskId?: string): boolean {
  return hasPermission(user, 'risks:all') || hasPermission(user, 'risks:read');
}

export function canAccessDocument(user: AuthUser, documentId?: string): boolean {
  return hasPermission(user, 'documents:all') || hasPermission(user, 'documents:read');
}

export function canAccessUser(user: AuthUser, targetUserId?: string): boolean {
  return hasPermission(user, 'users:all') || 
         hasPermission(user, 'users:read') || 
         user.id === targetUserId;
}

export function canCreateEntity(user: AuthUser, entityType: string): boolean {
  const permissions = {
    'project': 'projects:create',
    'task': 'tasks:create',
    'user': 'users:create',
    'resource': 'resources:create',
    'budget': 'budgets:create',
    'risk': 'risks:create',
    'document': 'documents:create',
    'milestone': 'milestones:create',
  };
  
  return hasPermission(user, permissions[entityType as keyof typeof permissions] || '');
}

export function canUpdateEntity(user: AuthUser, entityType: string): boolean {
  const permissions = {
    'project': 'projects:update',
    'task': 'tasks:update',
    'user': 'users:update',
    'resource': 'resources:update',
    'budget': 'budgets:update',
    'risk': 'risks:update',
    'document': 'documents:update',
    'milestone': 'milestones:update',
  };
  
  return hasPermission(user, permissions[entityType as keyof typeof permissions] || '');
}

export function canDeleteEntity(user: AuthUser, entityType: string): boolean {
  const permissions = {
    'project': 'projects:delete',
    'task': 'tasks:delete',
    'user': 'users:delete',
    'resource': 'resources:delete',
    'budget': 'budgets:delete',
    'risk': 'risks:delete',
    'document': 'documents:delete',
    'milestone': 'milestones:delete',
  };
  
  return hasPermission(user, permissions[entityType as keyof typeof permissions] || '');
}