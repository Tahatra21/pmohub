# Permission System Documentation

## Overview

This document describes the Role-Based Access Control (RBAC) system implemented in the PMO application. The system controls user access to different features and functionalities based on their assigned roles.

## Table of Contents

1. [Role Definitions](#role-definitions)
2. [Permission Structure](#permission-structure)
3. [Menu Access Control](#menu-access-control)
4. [API Protection](#api-protection)
5. [Implementation Details](#implementation-details)
6. [Testing](#testing)
7. [Maintenance](#maintenance)

## Role Definitions

The system supports 4 main roles with specific access levels:

### 1. System Admin (Full Access)
- **Description**: Full system administrator access
- **Access Level**: Complete system control
- **Permissions**: All permissions granted

### 2. Project Manager (Management Access)
- **Description**: Project and team management access
- **Access Level**: Management and operational control
- **Permissions**: Project management, financial management, product management

### 3. Field/Site Engineer (Task Execution)
- **Description**: Task execution and field operations
- **Access Level**: Task-focused operations
- **Permissions**: Task management, product management, document handling

### 4. Client/Stakeholder (View-Only)
- **Description**: View-only access for stakeholders
- **Access Level**: Read-only access
- **Permissions**: View-only access to most features

## Permission Structure

### Permission Format
Permissions follow the format: `resource:action`

Examples:
- `dashboard:read` - Read access to dashboard
- `projects:all` - Full access to projects
- `users:create` - Create user permission

### Available Permissions

#### Dashboard Permissions
- `dashboard:read` - View dashboard and analytics

#### Project Permissions
- `projects:create` - Create new projects
- `projects:read` - View projects
- `projects:update` - Update project details
- `projects:delete` - Delete projects
- `projects:all` - Full project access

#### Task Permissions
- `tasks:create` - Create new tasks
- `tasks:read` - View tasks
- `tasks:update` - Update task details
- `tasks:delete` - Delete tasks
- `tasks:all` - Full task access
- `tasks:assign` - Assign tasks to users

#### User Management Permissions
- `users:create` - Create new users
- `users:read` - View user information
- `users:update` - Update user details
- `users:delete` - Delete users
- `users:all` - Full user management access

#### Financial Management Permissions
- `budgets:create` - Create budget entries
- `budgets:read` - View budget information
- `budgets:update` - Update budget details
- `budgets:delete` - Delete budget entries
- `budgets:all` - Full budget access
- `budgets:approve` - Approve budget requests

#### Cost Management Permissions
- `cost:read` - View cost estimates
- `cost:write` - Create and update cost estimates
- `cost:delete` - Delete cost estimates
- `cost:all` - Full cost estimation access

#### Product Management Permissions
- `lifecycle:read` - View product lifecycle analytics
- `lifecycle:create` - Create lifecycle data
- `lifecycle:update` - Update lifecycle data
- `lifecycle:delete` - Delete lifecycle data
- `lifecycle:all` - Full lifecycle access

#### License Monitoring Permissions
- `license:read` - View license monitoring data
- `license:write` - Create and update license data

#### Document Permissions
- `documents:create` - Upload documents
- `documents:read` - View documents
- `documents:update` - Update document details
- `documents:delete` - Delete documents
- `documents:all` - Full document access
- `documents:download` - Download documents

#### Settings Permissions
- `settings:read` - View settings
- `settings:update` - Update settings
- `settings:system` - System-wide settings access

#### Activity Log Permissions
- `activity:read` - View activity logs
- `activity:all` - Full activity log access

## Menu Access Control

### System Admin Menu Access
- ✅ Dashboard - Analytics dan overview
- ✅ Project Management - Projects, Tasks, Resources (All)
- ✅ Financial Management - Budget, Cost Estimation, Reports (All)
- ✅ Product Management - Product Catalog, License Monitoring (All)
- ✅ Settings - Users, Roles, Security, Database, Activity (All)
- ✅ User Management - Create, Edit, Delete users
- ✅ Activity Logs - Full audit trail access

### Project Manager Menu Access
- ✅ Dashboard - Project analytics
- ✅ Project Management - Projects, Tasks, Resources (All)
- ✅ Financial Management - Budget, Cost Estimation, Reports (All)
- ✅ Product Management - Product Catalog, License Monitoring (All)
- ✅ Settings - Read-only access
- ✅ Documents - Read/Create/Download

### Field/Site Engineer Menu Access
- ✅ Dashboard - Task overview
- ✅ Projects - Projects, Tasks
- ✅ Tasks - Read/Update assigned tasks
- ✅ Product Management - Product Catalog, License Monitoring (All)
- ✅ Budget - Read access
- ✅ Documents - Read/Create/Download

### Client/Stakeholder Menu Access
- ✅ Dashboard - Overview
- ✅ Projects - Read access
- ✅ Tasks - Read access
- ✅ Resources - Read access
- ✅ Budget - Read access
- ✅ Documents - Read/Download only

## API Protection

All API endpoints are protected with permission-based access control:

### Authentication Required
- All API calls require valid JWT token
- Token must be included in Authorization header: `Bearer <token>`

### Permission Checking
- Each API endpoint checks for required permissions
- Users without proper permissions receive 403 Forbidden response
- Permission checking is implemented in `src/lib/permissions.ts`

### Protected Endpoints
- `/api/users/*` - User management endpoints
- `/api/projects/*` - Project management endpoints
- `/api/tasks/*` - Task management endpoints
- `/api/budgets/*` - Budget management endpoints
- `/api/cost/*` - Cost estimation endpoints
- `/api/lifecycle/*` - Product lifecycle endpoints
- `/api/monitoring-license` - License monitoring endpoints
- `/api/settings/*` - Settings management endpoints

## Implementation Details

### File Structure
```
src/
├── lib/
│   ├── permissions.ts          # Permission definitions and utilities
│   └── auth.ts                 # Authentication utilities
├── components/
│   └── top-navigation.tsx      # Navigation with permission filtering
└── app/
    ├── (authenticated)/
    │   └── layout.tsx          # Authentication layout
    └── api/                     # Protected API endpoints
```

### Key Functions

#### `hasPermission(userPermissions, permission)`
Checks if user has specific permission.

#### `getRolePermissions(roleName)`
Returns permissions for a specific role.

#### `checkPermission(permission)`
Navigation component function to check menu permissions.

### Permission Checking Flow
1. User logs in and receives JWT token
2. Token contains user role information
3. Navigation component loads user permissions based on role
4. Menu items are filtered based on user permissions
5. API calls include permission validation

## Testing

### Manual Testing
Test each role by logging in with different user accounts and verifying menu visibility.

### Automated Testing
```bash
# Test permission system
npx tsx -e "
import { getRolePermissions, hasPermission } from './src/lib/permissions';
// Test code here
"
```

### Test Cases
1. System Admin should see all menus
2. Project Manager should see management menus
3. Field/Site Engineer should see task-focused menus
4. Client/Stakeholder should see read-only menus

## Maintenance

### Adding New Permissions
1. Add permission to `PERMISSIONS` object in `src/lib/permissions.ts`
2. Add permission to appropriate roles in `ROLE_PERMISSIONS`
3. Update navigation items with permission requirements
4. Test permission functionality

### Adding New Roles
1. Add role to database `tbl_roles` table
2. Add role permissions to `ROLE_PERMISSIONS` object
3. Update user assignment to new role
4. Test role functionality

### Modifying Existing Permissions
1. Update `ROLE_PERMISSIONS` for affected roles
2. Test permission changes
3. Update documentation

## Security Considerations

### Token Security
- JWT tokens expire after 24 hours
- Tokens are stored in localStorage
- Tokens include user role and permissions

### Permission Validation
- All permissions are validated on both client and server
- Server-side validation prevents client-side bypassing
- Permission checks are logged for audit purposes

### Access Control
- Users cannot access features they don't have permission for
- Menu items are hidden for unauthorized users
- API endpoints return 403 for unauthorized access

## Troubleshooting

### Common Issues

#### Menu Not Showing
- Check if user has required permission
- Verify role assignment in database
- Check permission definition in `ROLE_PERMISSIONS`

#### API Access Denied
- Verify JWT token is valid
- Check if user has required permission
- Ensure token includes correct role information

#### Permission Not Working
- Check permission spelling in `PERMISSIONS` object
- Verify role has permission in `ROLE_PERMISSIONS`
- Test permission function manually

### Debug Steps
1. Check browser console for permission logs
2. Verify user role in database
3. Test permission function with specific role
4. Check API response for permission errors

## Version History

### v1.0 (Current)
- Initial permission system implementation
- 4 main roles defined
- Menu-based access control
- API protection implemented

### Future Enhancements
- Dynamic permission assignment
- Permission inheritance
- Time-based permissions
- Resource-specific permissions

---

**Last Updated**: October 21, 2025  
**Version**: 1.0  
**Maintainer**: PMO Development Team
