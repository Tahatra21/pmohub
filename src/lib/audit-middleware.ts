import { NextRequest, NextResponse } from 'next/server';
import { AuditTrail } from '@/lib/audit-trail';
import { verifyToken } from '@/lib/auth';

/**
 * Audit middleware untuk menangkap semua aktivitas API secara otomatis
 */
export async function auditMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  let userId: string | null = null;
  let response: NextResponse;

  try {
    // Log request start
    const method = request.method;
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    console.log(`[API] ${method} ${pathname} - Started at ${new Date().toISOString()}`);
    
    // Extract user information from token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const user = await verifyToken(token);
        userId = user?.id || null;
        if (userId) {
          console.log(`[API] ${method} ${pathname} - User: ${userId}`);
        }
      } catch (error) {
        // Token invalid, but continue with request
        console.log('[API] Invalid token in audit middleware:', error);
      }
    }

    // Execute the actual handler
    response = await handler(request);
    
    // Log request completion
    const duration = Date.now() - startTime;
    const status = response.status;
    const logLevel = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
    console.log(`[API] ${method} ${pathname} - ${logLevel} ${status} - ${duration}ms - User: ${userId || 'anonymous'}`);
    
    // Log the API activity
    if (userId) {
      const method = request.method;
      const url = new URL(request.url);
      const pathname = url.pathname;
      const searchParams = url.searchParams;
      
      // Determine operation type
      let operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' = 'READ';
      switch (method) {
        case 'POST':
          operation = 'CREATE';
          break;
        case 'PUT':
        case 'PATCH':
          operation = 'UPDATE';
          break;
        case 'DELETE':
          operation = 'DELETE';
          break;
        default:
          operation = 'READ';
      }

      // Extract entity from pathname
      const pathParts = pathname.split('/').filter(Boolean);
      let entity = 'Unknown';
      let entityId: string | undefined;

      if (pathParts.length >= 2) {
        entity = pathParts[1]; // e.g., 'users', 'projects', 'tasks'
        
        // Try to extract entity ID from path or response
        if (pathParts.length >= 3) {
          entityId = pathParts[2];
        }
      }

      // Get response data for entity ID if not found in path
      if (!entityId && response.ok) {
        try {
          const responseData = await response.clone().json();
          if (responseData?.data?.id) {
            entityId = responseData.data.id;
          } else if (responseData?.id) {
            entityId = responseData.id;
          }
        } catch (error) {
          // Response might not be JSON, ignore
        }
      }

      // Log the activity
      await AuditTrail.logApiActivity({
        action: `${method} ${pathname}`,
        entity: entity.charAt(0).toUpperCase() + entity.slice(1),
        entityId,
        description: `${method} request to ${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
        userId,
        ipAddress: AuditTrail.extractClientInfo(request).ipAddress,
        userAgent: AuditTrail.extractClientInfo(request).userAgent,
        metadata: {
          method,
          pathname,
          searchParams: Object.fromEntries(searchParams),
          statusCode: response.status,
          responseTime: Date.now() - startTime,
          operation,
        },
        severity: response.status >= 400 ? 'error' : response.status >= 300 ? 'warning' : 'info',
      });
    }

    return response;
  } catch (error) {
    // Log error if we have user context
    if (userId) {
      await AuditTrail.logApiActivity({
        action: 'API Error',
        entity: 'System',
        description: `Error in API request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        userId,
        ipAddress: AuditTrail.extractClientInfo(request).ipAddress,
        userAgent: AuditTrail.extractClientInfo(request).userAgent,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          pathname: request.nextUrl.pathname,
          method: request.method,
        },
        severity: 'error',
      });
    }

    throw error;
  }
}

/**
 * Higher-order function untuk membungkus API handlers dengan audit logging
 */
export function withAudit<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  options?: {
    entity?: string;
    operation?: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
    customLogging?: boolean;
  }
) {
  return async (...args: T): Promise<NextResponse> => {
    const [request] = args;
    
    if (options?.customLogging) {
      // Skip automatic logging, let the handler do custom logging
      return handler(...args);
    }
    
    return auditMiddleware(request as NextRequest, handler);
  };
}

/**
 * Utility untuk logging CRUD operations dengan detail
 */
export async function logCrudOperation(
  request: NextRequest,
  operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
  entity: string,
  entityId: string,
  userId: string,
  additionalData?: Record<string, any>
): Promise<void> {
  await AuditTrail.logCrudOperation(
    operation,
    entity,
    entityId,
    userId,
    request,
    additionalData
  );
}

/**
 * Utility untuk logging authentication events
 */
export async function logAuthEvent(
  request: NextRequest,
  event: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE' | 'TOKEN_REFRESH',
  userId: string,
  additionalData?: Record<string, any>
): Promise<void> {
  await AuditTrail.logAuthEvent(event, userId, request, additionalData);
}

/**
 * Utility untuk logging permission events
 */
export async function logPermissionEvent(
  request: NextRequest,
  event: 'ACCESS_GRANTED' | 'ACCESS_DENIED' | 'PERMISSION_CHANGED',
  userId: string,
  resource: string,
  additionalData?: Record<string, any>
): Promise<void> {
  await AuditTrail.logPermissionEvent(event, userId, resource, request, additionalData);
}

/**
 * Utility untuk logging data changes
 */
export async function logDataChange(
  request: NextRequest,
  operation: 'CREATE' | 'UPDATE' | 'DELETE',
  entity: string,
  entityId: string,
  userId: string,
  beforeData?: Record<string, any>,
  afterData?: Record<string, any>
): Promise<void> {
  await AuditTrail.logDataChange(
    operation,
    entity,
    entityId,
    userId,
    request,
    beforeData,
    afterData
  );
}
