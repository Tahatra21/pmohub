# User Management System Documentation

## Overview

This document describes the User Management system implemented in the PMO application. The system provides comprehensive user account management with role-based access control, password security, and audit logging.

## Table of Contents

1. [System Features](#system-features)
2. [User Management Components](#user-management-components)
3. [API Endpoints](#api-endpoints)
4. [Security Features](#security-features)
5. [Database Schema](#database-schema)
6. [Implementation Details](#implementation-details)
7. [Usage Guide](#usage-guide)
8. [Troubleshooting](#troubleshooting)

## System Features

### Core Functionality
- ✅ **User Creation** - Create new user accounts
- ✅ **User Editing** - Update user information and roles
- ✅ **User Deletion** - Remove user accounts (with safety checks)
- ✅ **Role Assignment** - Assign roles to users
- ✅ **Password Management** - Secure password handling
- ✅ **Account Status** - Enable/disable user accounts
- ✅ **Search & Filter** - Find users by name, email, role, status
- ✅ **Real-time Stats** - Dynamic user statistics

### Security Features
- ✅ **Password Hashing** - bcryptjs with 12 salt rounds
- ✅ **Input Validation** - Comprehensive form validation
- ✅ **Permission Checking** - Role-based access control
- ✅ **Activity Logging** - Audit trail for all user actions
- ✅ **Self-deletion Protection** - Users cannot delete their own accounts

## User Management Components

### 1. User Management Page
**Location**: `src/app/(authenticated)/settings/users/page.tsx`

**Features**:
- User list with pagination
- Search and filter functionality
- Real-time statistics
- Action buttons (Edit, Delete)
- Responsive design

**Key Functions**:
- `fetchUsers()` - Load users from API
- `handleAddUser()` - Open add user modal
- `handleEditUser()` - Open edit user modal
- `handleDeleteUser()` - Delete user with confirmation

### 2. User Modal Component
**Location**: `src/components/auth/UserModal.tsx`

**Features**:
- Add/Edit user form
- Password validation
- Role selection
- Active status toggle
- Real-time validation feedback

**Form Fields**:
- Full Name (required)
- Email Address (required, validated)
- Password (required for new users, optional for edit)
- Phone Number (optional)
- Role (required)
- Account Status (Active/Inactive)

## API Endpoints

### GET /api/users
**Purpose**: Fetch users with pagination and filtering

**Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `roleId` - Filter by role ID
- `isActive` - Filter by active status

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 14,
      "pages": 2
    }
  }
}
```

**Permissions Required**: `users:read`

### POST /api/users
**Purpose**: Create new user

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "password": "SecurePassword123!",
  "phone": "+62 812-3456-7890",
  "roleId": "role-uuid",
  "isActive": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {...}
  },
  "message": "User created successfully"
}
```

**Permissions Required**: `users:create`

### PUT /api/users
**Purpose**: Update existing user

**Request Body**:
```json
{
  "id": "user-uuid",
  "name": "John Doe Updated",
  "email": "john.updated@company.com",
  "password": "NewPassword123!",
  "phone": "+62 812-3456-7891",
  "roleId": "new-role-uuid",
  "isActive": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {...}
  },
  "message": "User updated successfully"
}
```

**Permissions Required**: `users:update`

### DELETE /api/users
**Purpose**: Delete user account

**Parameters**:
- `id` - User ID to delete

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Permissions Required**: `users:delete`

### POST /api/users/change-password
**Purpose**: Change user password

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmNewPassword": "NewPassword123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Permissions Required**: User can only change their own password

## Security Features

### Password Security
- **Hashing Algorithm**: bcryptjs
- **Salt Rounds**: 12 (high security)
- **Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)
  - Maximum 100 characters

### Input Validation
- **Email Format**: RFC 5322 compliant
- **Name Validation**: Required, non-empty
- **Phone Validation**: Optional, format validation
- **Role Validation**: Must exist in database
- **Password Confirmation**: Must match for new passwords

### Access Control
- **Authentication Required**: All endpoints require valid JWT token
- **Permission Based**: Role-based access control
- **Self-deletion Protection**: Users cannot delete their own accounts
- **Activity Logging**: All user actions are logged

## Database Schema

### tbl_users Table
```sql
CREATE TABLE tbl_users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  avatar VARCHAR(255),
  roleId VARCHAR(255) NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (roleId) REFERENCES tbl_roles(id)
);
```

### tbl_roles Table
```sql
CREATE TABLE tbl_roles (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### tbl_activity_logs Table
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
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES tbl_users(id)
);
```

## Implementation Details

### File Structure
```
src/
├── app/
│   ├── (authenticated)/
│   │   └── settings/
│   │       └── users/
│   │           └── page.tsx          # User management page
│   └── api/
│       └── users/
│           ├── route.ts              # CRUD operations
│           └── change-password/
│               └── route.ts          # Password change
├── components/
│   └── auth/
│       └── UserModal.tsx             # User form modal
└── lib/
    ├── permissions.ts                # Permission system
    └── auth.ts                       # Authentication utilities
```

### Key Functions

#### User Management Page
- `fetchUsers()` - Load users from API
- `handleAddUser()` - Open add user modal
- `handleEditUser(user)` - Open edit user modal
- `handleDeleteUser(userId)` - Delete user with confirmation
- `filteredUsers` - Computed filtered user list

#### User Modal Component
- `handleSubmit()` - Submit user form
- `handleInputChange()` - Handle form input changes
- `fetchRoles()` - Load available roles
- `resetForm()` - Reset form to initial state

#### API Functions
- `GET /api/users` - Fetch users with filtering
- `POST /api/users` - Create new user
- `PUT /api/users` - Update existing user
- `DELETE /api/users` - Delete user
- `POST /api/users/change-password` - Change password

## Usage Guide

### Adding a New User
1. Navigate to Settings → Users
2. Click "Add User" button
3. Fill in required information:
   - Full Name
   - Email Address
   - Password (meets security requirements)
   - Phone Number (optional)
   - Role
   - Account Status
4. Click "Create User"
5. User will be created and appear in the list

### Editing a User
1. Find user in the user list
2. Click "Edit" button (pencil icon)
3. Modify required fields
4. Click "Update User"
5. Changes will be saved and reflected in the list

### Deleting a User
1. Find user in the user list
2. Click "Delete" button (trash icon)
3. Confirm deletion in the dialog
4. User will be removed from the system

### Changing Password
1. Navigate to Profile page
2. Click "Change Password" button
3. Enter current password
4. Enter new password (meets security requirements)
5. Confirm new password
6. Click "Change Password"

### Searching and Filtering
1. Use search box to find users by name or email
2. Use role filter to show users by role
3. Use status filter to show active/inactive users
4. Filters can be combined for precise results

## Troubleshooting

### Common Issues

#### User Creation Fails
- Check if email already exists
- Verify password meets security requirements
- Ensure role ID is valid
- Check user permissions

#### User Edit Fails
- Verify user ID exists
- Check if new email conflicts with existing users
- Ensure user has update permissions
- Validate all required fields

#### User Deletion Fails
- Check if user is trying to delete themselves
- Verify user has delete permissions
- Ensure user ID is valid
- Check for foreign key constraints

#### Password Change Fails
- Verify current password is correct
- Check if new password meets requirements
- Ensure password confirmation matches
- Verify user authentication

### Debug Steps
1. Check browser console for error messages
2. Verify API response status codes
3. Check database for user existence
4. Validate user permissions
5. Test with different user accounts

### Error Messages
- **"Email already exists"** - User with this email already exists
- **"Invalid email format"** - Email doesn't meet format requirements
- **"Password must be at least 8 characters"** - Password too short
- **"New password cannot be the same as old password"** - Password unchanged
- **"Cannot delete your own account"** - Self-deletion protection
- **"Insufficient permissions"** - User lacks required permissions

## Performance Considerations

### Database Optimization
- Indexes on email, roleId, isActive fields
- Pagination for large user lists
- Efficient queries with proper joins

### Frontend Optimization
- Lazy loading of user data
- Debounced search functionality
- Efficient filtering algorithms
- Responsive design for mobile devices

### Security Optimization
- Rate limiting on API endpoints
- Input sanitization
- SQL injection prevention
- XSS protection

## Future Enhancements

### Planned Features
- Bulk user operations
- User import/export functionality
- Advanced user analytics
- User activity monitoring
- Password policy customization
- Two-factor authentication
- User groups and teams
- Custom user fields

### Technical Improvements
- Real-time user updates
- Advanced search capabilities
- User activity dashboard
- Automated user provisioning
- Integration with external systems

---

**Last Updated**: October 21, 2025  
**Version**: 1.0  
**Maintainer**: PMO Development Team
