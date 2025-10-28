import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export interface AuditLogData {
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  severity?: 'info' | 'success' | 'warning' | 'error';
}

export interface FrontendAuditData {
  action: string;
  page: string;
  component?: string;
  userId: string;
  metadata?: Record<string, any>;
}

/**
 * Comprehensive audit trail utility for production logging
 */
export class AuditTrail {
  /**
   * Log API activity with detailed information
   */
  static async logApiActivity(data: AuditLogData): Promise<void> {
    try {
      await db.activityLog.create({
        data: {
          action: data.action,
          entity: data.entity,
          entityId: data.entityId || null,
          description: data.description,
          userId: data.userId,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          metadata: data.metadata || {},
          severity: data.severity || 'info',
        },
      });
    } catch (error) {
      console.error('Failed to log API activity:', error);
      // Don't throw error to prevent breaking the main operation
    }
  }

  /**
   * Log frontend activity (page views, button clicks, etc.)
   */
  static async logFrontendActivity(data: FrontendAuditData): Promise<void> {
    try {
      await db.activityLog.create({
        data: {
          action: data.action,
          entity: 'Frontend',
          entityId: data.component || null,
          description: `${data.action} on ${data.page}${data.component ? ` (${data.component})` : ''}`,
          userId: data.userId,
          metadata: {
            page: data.page,
            component: data.component,
            ...data.metadata,
          },
          severity: 'info',
        },
      });
    } catch (error) {
      console.error('Failed to log frontend activity:', error);
    }
  }

  /**
   * Extract client information from request
   */
  static extractClientInfo(request: NextRequest): { ipAddress?: string; userAgent?: string } {
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    return { ipAddress, userAgent };
  }

  /**
   * Log CRUD operations with standardized format
   */
  static async logCrudOperation(
    operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    entity: string,
    entityId: string,
    userId: string,
    request: NextRequest,
    additionalData?: Record<string, any>
  ): Promise<void> {
    const { ipAddress, userAgent } = this.extractClientInfo(request);
    
    const actionMap = {
      CREATE: 'Created',
      READ: 'Viewed',
      UPDATE: 'Updated',
      DELETE: 'Deleted',
    };

    const severityMap = {
      CREATE: 'success' as const,
      READ: 'info' as const,
      UPDATE: 'info' as const,
      DELETE: 'warning' as const,
    };

    await this.logApiActivity({
      action: actionMap[operation],
      entity,
      entityId,
      description: `${actionMap[operation]} ${entity.toLowerCase()} "${entityId}"`,
      userId,
      ipAddress,
      userAgent,
      metadata: {
        operation,
        ...additionalData,
      },
      severity: severityMap[operation],
    });
  }

  /**
   * Log authentication events
   */
  static async logAuthEvent(
    event: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE' | 'TOKEN_REFRESH',
    userId: string,
    request: NextRequest,
    additionalData?: Record<string, any>
  ): Promise<void> {
    const { ipAddress, userAgent } = this.extractClientInfo(request);
    
    const eventMap = {
      LOGIN: { action: 'User Login', description: 'User logged in successfully', severity: 'success' as const },
      LOGOUT: { action: 'User Logout', description: 'User logged out', severity: 'info' as const },
      LOGIN_FAILED: { action: 'Failed Login', description: 'Failed login attempt', severity: 'warning' as const },
      PASSWORD_CHANGE: { action: 'Password Changed', description: 'User changed password', severity: 'info' as const },
      TOKEN_REFRESH: { action: 'Token Refresh', description: 'User token refreshed', severity: 'info' as const },
    };

    const eventInfo = eventMap[event];

    await this.logApiActivity({
      action: eventInfo.action,
      entity: 'Authentication',
      entityId: userId,
      description: eventInfo.description,
      userId,
      ipAddress,
      userAgent,
      metadata: {
        event,
        ...additionalData,
      },
      severity: eventInfo.severity,
    });
  }

  /**
   * Log permission-related events
   */
  static async logPermissionEvent(
    event: 'ACCESS_GRANTED' | 'ACCESS_DENIED' | 'PERMISSION_CHANGED',
    userId: string,
    resource: string,
    request: NextRequest,
    additionalData?: Record<string, any>
  ): Promise<void> {
    const { ipAddress, userAgent } = this.extractClientInfo(request);
    
    const eventMap = {
      ACCESS_GRANTED: { action: 'Access Granted', description: `Access granted to ${resource}`, severity: 'success' as const },
      ACCESS_DENIED: { action: 'Access Denied', description: `Access denied to ${resource}`, severity: 'warning' as const },
      PERMISSION_CHANGED: { action: 'Permission Changed', description: `Permissions changed for ${resource}`, severity: 'info' as const },
    };

    const eventInfo = eventMap[event];

    await this.logApiActivity({
      action: eventInfo.action,
      entity: 'Permission',
      entityId: resource,
      description: eventInfo.description,
      userId,
      ipAddress,
      userAgent,
      metadata: {
        event,
        resource,
        ...additionalData,
      },
      severity: eventInfo.severity,
    });
  }

  /**
   * Log system events
   */
  static async logSystemEvent(
    event: 'SYSTEM_START' | 'SYSTEM_STOP' | 'BACKUP_CREATED' | 'BACKUP_RESTORED' | 'DATA_EXPORT' | 'DATA_IMPORT',
    userId: string,
    description: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    const eventMap = {
      SYSTEM_START: { action: 'System Start', severity: 'success' as const },
      SYSTEM_STOP: { action: 'System Stop', severity: 'warning' as const },
      BACKUP_CREATED: { action: 'Backup Created', severity: 'info' as const },
      BACKUP_RESTORED: { action: 'Backup Restored', severity: 'warning' as const },
      DATA_EXPORT: { action: 'Data Export', severity: 'info' as const },
      DATA_IMPORT: { action: 'Data Import', severity: 'info' as const },
    };

    const eventInfo = eventMap[event];

    await this.logApiActivity({
      action: eventInfo.action,
      entity: 'System',
      description,
      userId,
      metadata: {
        event,
        ...additionalData,
      },
      severity: eventInfo.severity,
    });
  }

  /**
   * Log data changes with before/after values
   */
  static async logDataChange(
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: string,
    entityId: string,
    userId: string,
    request: NextRequest,
    beforeData?: Record<string, any>,
    afterData?: Record<string, any>
  ): Promise<void> {
    const { ipAddress, userAgent } = this.extractClientInfo(request);
    
    const actionMap = {
      CREATE: 'Created',
      UPDATE: 'Updated',
      DELETE: 'Deleted',
    };

    const severityMap = {
      CREATE: 'success' as const,
      UPDATE: 'info' as const,
      DELETE: 'warning' as const,
    };

    // Calculate changes for UPDATE operations
    let changes: Record<string, any> = {};
    if (operation === 'UPDATE' && beforeData && afterData) {
      changes = this.calculateChanges(beforeData, afterData);
    }

    await this.logApiActivity({
      action: actionMap[operation],
      entity,
      entityId,
      description: `${actionMap[operation]} ${entity.toLowerCase()} "${entityId}"`,
      userId,
      ipAddress,
      userAgent,
      metadata: {
        operation,
        beforeData,
        afterData,
        changes,
      },
      severity: severityMap[operation],
    });
  }

  /**
   * Calculate changes between two objects
   */
  private static calculateChanges(before: Record<string, any>, after: Record<string, any>): Record<string, any> {
    const changes: Record<string, any> = {};
    
    // Check for changed values
    for (const key in after) {
      if (before[key] !== after[key]) {
        changes[key] = {
          before: before[key],
          after: after[key],
        };
      }
    }

    // Check for removed keys
    for (const key in before) {
      if (!(key in after)) {
        changes[key] = {
          before: before[key],
          after: null,
        };
      }
    }

    return changes;
  }

  /**
   * Get audit trail statistics
   */
  static async getAuditStats(userId?: string, dateRange?: { start: Date; end: Date }) {
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (dateRange) {
      where.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    const [total, byAction, byEntity, bySeverity] = await Promise.all([
      db.activityLog.count({ where }),
      db.activityLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
      }),
      db.activityLog.groupBy({
        by: ['entity'],
        where,
        _count: { entity: true },
        orderBy: { _count: { entity: 'desc' } },
      }),
      db.activityLog.groupBy({
        by: ['severity'],
        where,
        _count: { severity: true },
        orderBy: { _count: { severity: 'desc' } },
      }),
    ]);

    return {
      total,
      byAction,
      byEntity,
      bySeverity,
    };
  }
}

/**
 * Middleware helper for automatic API logging
 */
export function withAuditLog<T extends any[]>(
  handler: (...args: T) => Promise<any>,
  entity: string,
  operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
) {
  return async (...args: T): Promise<any> => {
    const [request] = args;
    const result = await handler(...args);
    
    // Extract user ID from result or request
    const userId = result?.userId || request?.user?.id;
    const entityId = result?.id || result?.data?.id;
    
    if (userId && entityId) {
      await AuditTrail.logCrudOperation(
        operation,
        entity,
        entityId,
        userId,
        request as NextRequest
      );
    }
    
    return result;
  };
}

/**
 * React hook for frontend activity logging
 */
export function useAuditLog() {
  const logPageView = async (page: string, userId: string) => {
    await AuditTrail.logFrontendActivity({
      action: 'Page View',
      page,
      userId,
    });
  };

  const logButtonClick = async (page: string, button: string, userId: string, metadata?: Record<string, any>) => {
    await AuditTrail.logFrontendActivity({
      action: 'Button Click',
      page,
      component: button,
      userId,
      metadata,
    });
  };

  const logFormSubmit = async (page: string, form: string, userId: string, metadata?: Record<string, any>) => {
    await AuditTrail.logFrontendActivity({
      action: 'Form Submit',
      page,
      component: form,
      userId,
      metadata,
    });
  };

  const logFileUpload = async (page: string, fileName: string, userId: string, metadata?: Record<string, any>) => {
    await AuditTrail.logFrontendActivity({
      action: 'File Upload',
      page,
      component: fileName,
      userId,
      metadata,
    });
  };

  const logFileDownload = async (page: string, fileName: string, userId: string, metadata?: Record<string, any>) => {
    await AuditTrail.logFrontendActivity({
      action: 'File Download',
      page,
      component: fileName,
      userId,
      metadata,
    });
  };

  return {
    logPageView,
    logButtonClick,
    logFormSubmit,
    logFileUpload,
    logFileDownload,
  };
}
