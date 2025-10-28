# Audit Trail System Documentation

## Overview

This document describes the comprehensive audit trail system implemented in the PMO application for production-level logging and compliance. The system provides complete visibility into all user activities, system events, and data changes.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Backend Audit Logging](#backend-audit-logging)
3. [Frontend Audit Logging](#frontend-audit-logging)
4. [Activity Log Dashboard](#activity-log-dashboard)
5. [API Endpoints](#api-endpoints)
6. [Security Features](#security-features)
7. [Production Considerations](#production-considerations)
8. [Usage Examples](#usage-examples)

## System Architecture

### Core Components

```
src/
├── lib/
│   ├── audit-trail.ts          # Core audit trail utility
│   └── audit-middleware.ts     # API middleware for automatic logging
├── hooks/
│   └── use-frontend-audit.ts   # Frontend activity logging hooks
├── app/
│   ├── api/
│   │   └── activity-logs/       # Activity log API endpoints
│   └── (authenticated)/
│       └── settings/
│           └── activity/        # Activity log dashboard
```

### Database Schema

The audit trail uses the existing `tbl_activity_logs` table with enhanced fields:

```sql
CREATE TABLE tbl_activity_logs (
  id VARCHAR(255) PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entityId VARCHAR(255),
  description TEXT,
  userId VARCHAR(255) NOT NULL,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  metadata JSONB,
  severity VARCHAR(20) DEFAULT 'info',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES tbl_users(id)
);
```

## Backend Audit Logging

### Core Audit Trail Utility

**File**: `src/lib/audit-trail.ts`

The `AuditTrail` class provides comprehensive logging capabilities:

#### Key Methods

- `logApiActivity()` - Log API activities with detailed information
- `logFrontendActivity()` - Log frontend user interactions
- `logCrudOperation()` - Log CRUD operations with standardized format
- `logAuthEvent()` - Log authentication events (login, logout, failures)
- `logPermissionEvent()` - Log permission-related events
- `logSystemEvent()` - Log system events (backups, exports, etc.)
- `logDataChange()` - Log data changes with before/after values

#### Usage Example

```typescript
import { AuditTrail } from '@/lib/audit-trail';

// Log API activity
await AuditTrail.logApiActivity({
  action: 'CREATE',
  entity: 'User',
  entityId: 'user-123',
  description: 'Created new user account',
  userId: 'admin-456',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  metadata: { role: 'Project Manager' },
  severity: 'success',
});

// Log authentication event
await AuditTrail.logAuthEvent('LOGIN', 'user-123', request, {
  email: 'user@company.com',
  role: 'Project Manager',
});
```

### Audit Middleware

**File**: `src/lib/audit-middleware.ts`

Automatic API logging middleware that captures all API requests:

#### Features

- Automatic request/response logging
- Client information extraction (IP, User Agent)
- Error logging with stack traces
- Performance metrics (response time)
- Permission-based access control

#### Usage Example

```typescript
import { withAudit } from '@/lib/audit-middleware';

export const GET = withAudit(async (request: NextRequest) => {
  // Your API handler
  return NextResponse.json({ data: 'response' });
}, 'User', 'READ');
```

### Enhanced API Endpoints

All major API endpoints have been enhanced with detailed audit logging:

#### User Management API
- **CREATE**: Logs user creation with all fields
- **UPDATE**: Logs changes with before/after comparison
- **DELETE**: Logs deletion with complete user data

#### Authentication API
- **LOGIN**: Logs successful logins and failures
- **LOGOUT**: Logs user logout events
- **PASSWORD_CHANGE**: Logs password changes

#### CRUD Operations
- **Projects**: Complete project lifecycle logging
- **Tasks**: Task creation, updates, assignments
- **Budgets**: Financial data changes
- **Documents**: File uploads/downloads

## Frontend Audit Logging

### Frontend Audit Hook

**File**: `src/hooks/use-frontend-audit.ts`

Comprehensive hook for logging frontend activities:

#### Available Methods

- `logPageView()` - Log page visits
- `logButtonClick()` - Log button interactions
- `logFormSubmit()` - Log form submissions
- `logFileUpload()` - Log file uploads
- `logFileDownload()` - Log file downloads
- `logSearch()` - Log search activities
- `logFilter()` - Log filter applications
- `logNavigation()` - Log page navigation

#### Usage Example

```typescript
import { useFrontendAudit } from '@/hooks/use-frontend-audit';

function MyComponent() {
  const { logButtonClick, logFormSubmit } = useFrontendAudit();
  const userId = 'user-123';

  const handleButtonClick = () => {
    logButtonClick('/dashboard', 'Export Button', userId, {
      exportType: 'PDF',
      dataSize: 'large'
    });
    // Your button logic
  };

  const handleFormSubmit = (e) => {
    logFormSubmit('/users', 'Create User Form', userId, {
      fields: ['name', 'email', 'role']
    });
    // Your form logic
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Export</button>
      <form onSubmit={handleFormSubmit}>...</form>
    </div>
  );
}
```

### Higher-Order Components

#### withPageAudit
Automatically logs page views:

```typescript
import { withPageAudit } from '@/hooks/use-frontend-audit';

const AuditedDashboard = withPageAudit(Dashboard, 'Dashboard');
```

#### useButtonAudit
Creates audited click handlers:

```typescript
import { useButtonAudit } from '@/hooks/use-frontend-audit';

function MyComponent() {
  const { createAuditedClickHandler } = useButtonAudit('/dashboard', userId);
  
  const handleClick = createAuditedClickHandler('Save Button', () => {
    // Your save logic
  });

  return <button onClick={handleClick}>Save</button>;
}
```

## Activity Log Dashboard

### Real-Time Activity Monitoring

**File**: `src/app/(authenticated)/settings/activity/page.tsx`

The activity log dashboard provides comprehensive monitoring capabilities:

#### Features

- **Real-time Data**: Live activity feed from database
- **Advanced Filtering**: Filter by entity, action, severity, user
- **Statistics Dashboard**: Activity counts, user metrics, trends
- **Detailed View**: Complete activity details with metadata
- **Pagination**: Handle large datasets efficiently
- **Search**: Full-text search across activities

#### Dashboard Components

1. **Statistics Cards**
   - Total Activities
   - Unique Users
   - Today's Activities
   - Filtered Results

2. **Advanced Filters**
   - Entity Type (User, Project, Task, etc.)
   - Action Type (CREATE, READ, UPDATE, DELETE)
   - Severity Level (info, success, warning, error)
   - Date Range

3. **Activity Table**
   - Action performed
   - Detailed description
   - User information
   - Entity type
   - Severity level
   - IP address
   - Timestamp
   - Detailed metadata

## API Endpoints

### Activity Logs API

#### GET /api/activity-logs
Fetch activity logs with filtering and pagination.

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `entity` - Filter by entity type
- `action` - Filter by action type
- `severity` - Filter by severity level
- `userId` - Filter by user ID

**Response**:
```json
{
  "success": true,
  "data": {
    "activityLogs": [
      {
        "id": "log-123",
        "action": "CREATE",
        "entity": "User",
        "entityId": "user-456",
        "description": "Created user: John Doe",
        "userId": "admin-789",
        "user": {
          "id": "admin-789",
          "name": "Admin User",
          "email": "admin@company.com"
        },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "metadata": {
          "role": "Project Manager",
          "department": "IT"
        },
        "severity": "success",
        "createdAt": "2025-10-21T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

#### POST /api/activity-logs
Create new activity log entry.

**Request Body**:
```json
{
  "action": "CREATE",
  "entity": "User",
  "entityId": "user-123",
  "description": "Created new user account",
  "metadata": {
    "role": "Project Manager"
  }
}
```

#### GET /api/activity-logs/stats
Get activity statistics.

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 1500,
    "byAction": [
      { "action": "CREATE", "_count": { "action": 450 } },
      { "action": "READ", "_count": { "action": 600 } },
      { "action": "UPDATE", "_count": { "action": 300 } },
      { "action": "DELETE", "_count": { "action": 150 } }
    ],
    "byEntity": [
      { "entity": "User", "_count": { "entity": 200 } },
      { "entity": "Project", "_count": { "entity": 300 } },
      { "entity": "Task", "_count": { "entity": 400 } }
    ],
    "bySeverity": [
      { "severity": "info", "_count": { "severity": 800 } },
      { "severity": "success", "_count": { "severity": 500 } },
      { "severity": "warning", "_count": { "severity": 150 } },
      { "severity": "error", "_count": { "severity": 50 } }
    ]
  }
}
```

## Security Features

### Data Protection

- **IP Address Tracking**: Monitor access patterns and detect anomalies
- **User Agent Logging**: Track device and browser information
- **Request Metadata**: Capture request headers and parameters
- **Error Logging**: Detailed error information with stack traces

### Access Control

- **Permission-based Access**: Only authorized users can view audit logs
- **Role-based Filtering**: Users see only relevant activities
- **Secure API Endpoints**: All endpoints require authentication

### Compliance Features

- **Complete Audit Trail**: Every action is logged with full context
- **Data Retention**: Configurable retention policies
- **Export Capabilities**: Export audit logs for compliance reporting
- **Search and Filter**: Efficient querying of audit data

## Production Considerations

### Performance Optimization

- **Asynchronous Logging**: Non-blocking audit operations
- **Batch Processing**: Group multiple activities for efficiency
- **Indexing**: Database indexes for fast queries
- **Pagination**: Handle large datasets efficiently

### Scalability

- **Database Partitioning**: Partition logs by date for better performance
- **Archiving**: Move old logs to cold storage
- **Caching**: Cache frequently accessed statistics
- **Load Balancing**: Distribute audit logging across multiple servers

### Monitoring

- **Health Checks**: Monitor audit system health
- **Alerting**: Set up alerts for critical events
- **Metrics**: Track audit system performance
- **Logging**: Monitor the audit system itself

### Data Retention

- **Retention Policies**: Define how long to keep audit logs
- **Archival**: Move old logs to cheaper storage
- **Deletion**: Secure deletion of expired logs
- **Backup**: Regular backups of audit data

## Usage Examples

### Basic API Logging

```typescript
// In your API route
import { logCrudOperation } from '@/lib/audit-middleware';

export async function POST(request: NextRequest) {
  const user = await verifyToken(token);
  const newUser = await db.user.create({...});
  
  // Log the operation
  await logCrudOperation(request, 'CREATE', 'User', newUser.id, user.id);
  
  return NextResponse.json({ success: true, data: newUser });
}
```

### Frontend Activity Logging

```typescript
// In your React component
import { useFrontendAudit } from '@/hooks/use-frontend-audit';

function UserManagement() {
  const { logButtonClick, logFormSubmit } = useFrontendAudit();
  const userId = getCurrentUserId();

  const handleCreateUser = () => {
    logButtonClick('/users', 'Create User Button', userId);
    // Your create user logic
  };

  const handleFormSubmit = (formData) => {
    logFormSubmit('/users', 'User Form', userId, {
      fields: Object.keys(formData)
    });
    // Your form submission logic
  };

  return (
    <div>
      <button onClick={handleCreateUser}>Create User</button>
      <form onSubmit={handleFormSubmit}>...</form>
    </div>
  );
}
```

### Custom Audit Logging

```typescript
// Custom audit logging
import { AuditTrail } from '@/lib/audit-trail';

// Log system event
await AuditTrail.logSystemEvent(
  'BACKUP_CREATED',
  'system-user',
  'Database backup completed successfully',
  {
    backupSize: '2.5GB',
    duration: '15 minutes',
    tables: 25
  }
);

// Log permission event
await AuditTrail.logPermissionEvent(
  'ACCESS_DENIED',
  'user-123',
  'sensitive-data',
  request,
  {
    reason: 'Insufficient permissions',
    requiredRole: 'Admin'
  }
);
```

## Best Practices

### Logging Guidelines

1. **Log Everything**: Log all significant user actions
2. **Include Context**: Provide enough context for investigation
3. **Use Consistent Format**: Standardize log message formats
4. **Avoid Sensitive Data**: Don't log passwords or sensitive information
5. **Performance First**: Ensure logging doesn't impact performance

### Security Considerations

1. **Access Control**: Restrict audit log access to authorized personnel
2. **Data Integrity**: Ensure logs cannot be tampered with
3. **Retention Policies**: Implement appropriate data retention
4. **Monitoring**: Monitor for suspicious audit log access
5. **Compliance**: Meet regulatory requirements for audit trails

### Maintenance

1. **Regular Review**: Periodically review audit logs
2. **Performance Monitoring**: Monitor audit system performance
3. **Storage Management**: Manage audit log storage efficiently
4. **Backup Strategy**: Implement comprehensive backup strategy
5. **Documentation**: Keep audit system documentation updated

---

**Last Updated**: October 21, 2025  
**Version**: 1.0  
**Maintainer**: PMO Development Team
