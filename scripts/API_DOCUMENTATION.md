# API Endpoints Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the PMO application. The API follows RESTful conventions and implements role-based access control for security.

## Table of Contents

1. [Authentication](#authentication)
2. [User Management APIs](#user-management-apis)
3. [Project Management APIs](#project-management-apis)
4. [Task Management APIs](#task-management-apis)
5. [Financial Management APIs](#financial-management-apis)
6. [Product Management APIs](#product-management-apis)
7. [Settings APIs](#settings-apis)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)

## Authentication

### Authentication Header
All API requests require authentication via JWT token:

```http
Authorization: Bearer <jwt_token>
```

### Token Format
JWT tokens contain:
- User ID
- Email
- Role information
- Permissions
- Expiration time (24 hours)

### Authentication Endpoints

#### POST /api/auth/login
**Purpose**: User login and token generation

**Request Body**:
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "email": "user@company.com",
      "name": "User Name",
      "role": {
        "id": "role-uuid",
        "name": "System Admin"
      }
    }
  }
}
```

#### POST /api/auth/register
**Purpose**: User registration (if enabled)

**Request Body**:
```json
{
  "name": "New User",
  "email": "newuser@company.com",
  "password": "SecurePassword123!",
  "roleId": "role-uuid"
}
```

## User Management APIs

### GET /api/users
**Purpose**: Fetch users with pagination and filtering

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `roleId` (optional): Filter by role ID
- `isActive` (optional): Filter by active status (true/false)

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-uuid",
        "email": "user@company.com",
        "name": "User Name",
        "phone": "+62 812-3456-7890",
        "avatar": null,
        "roleId": "role-uuid",
        "isActive": true,
        "createdAt": "2025-10-21T07:30:33.528Z",
        "updatedAt": "2025-10-21T07:30:33.528Z",
        "role": {
          "id": "role-uuid",
          "name": "System Admin",
          "description": "Full system access"
        }
      }
    ],
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
    "user": {
      "id": "new-user-uuid",
      "email": "john.doe@company.com",
      "name": "John Doe",
      "phone": "+62 812-3456-7890",
      "roleId": "role-uuid",
      "isActive": true,
      "createdAt": "2025-10-21T10:30:00.000Z",
      "role": {
        "id": "role-uuid",
        "name": "Project Manager"
      }
    }
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
    "user": {
      "id": "user-uuid",
      "email": "john.updated@company.com",
      "name": "John Doe Updated",
      "phone": "+62 812-3456-7891",
      "roleId": "new-role-uuid",
      "isActive": false,
      "updatedAt": "2025-10-21T10:35:00.000Z",
      "role": {
        "id": "new-role-uuid",
        "name": "Field Engineer"
      }
    }
  },
  "message": "User updated successfully"
}
```

**Permissions Required**: `users:update`

### DELETE /api/users
**Purpose**: Delete user account

**Query Parameters**:
- `id` (required): User ID to delete

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

### GET /api/users/me
**Purpose**: Get current user information

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@company.com",
    "name": "User Name",
    "phone": "+62 812-3456-7890",
    "avatar": null,
    "roleId": "role-uuid",
    "isActive": true,
    "createdAt": "2025-10-21T07:30:33.528Z",
    "role": {
      "id": "role-uuid",
      "name": "System Admin",
      "description": "Full system access"
    }
  }
}
```

## Project Management APIs

### GET /api/projects
**Purpose**: Fetch projects with pagination

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by project status

**Response**:
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project-uuid",
        "name": "Project Name",
        "description": "Project description",
        "status": "ACTIVE",
        "startDate": "2025-01-01",
        "endDate": "2025-12-31",
        "budget": 1000000,
        "createdBy": "user-uuid",
        "createdAt": "2025-10-21T07:30:33.528Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

**Permissions Required**: `projects:read`

### POST /api/projects
**Purpose**: Create new project

**Request Body**:
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "ACTIVE",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "budget": 1000000
}
```

**Permissions Required**: `projects:create`

### PUT /api/projects/[id]
**Purpose**: Update project

**Permissions Required**: `projects:update`

### DELETE /api/projects/[id]
**Purpose**: Delete project

**Permissions Required**: `projects:delete`

## Task Management APIs

### GET /api/tasks
**Purpose**: Fetch tasks with pagination

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `projectId` (optional): Filter by project
- `assigneeId` (optional): Filter by assignee
- `status` (optional): Filter by status

**Response**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task-uuid",
        "title": "Task Title",
        "description": "Task description",
        "status": "TODO",
        "priority": "HIGH",
        "progress": 0,
        "startDate": "2025-01-01",
        "endDate": "2025-01-15",
        "projectId": "project-uuid",
        "assigneeId": "user-uuid",
        "creatorId": "user-uuid",
        "createdAt": "2025-10-21T07:30:33.528Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 20,
      "pages": 2
    }
  }
}
```

**Permissions Required**: `tasks:read`

### POST /api/tasks
**Purpose**: Create new task

**Request Body**:
```json
{
  "title": "New Task",
  "description": "Task description",
  "projectId": "project-uuid",
  "assigneeId": "user-uuid",
  "priority": "MEDIUM",
  "startDate": "2025-01-01",
  "endDate": "2025-01-15"
}
```

**Permissions Required**: `tasks:create`

### PUT /api/tasks/[id]
**Purpose**: Update task

**Permissions Required**: `tasks:update`

### DELETE /api/tasks/[id]
**Purpose**: Delete task

**Permissions Required**: `tasks:delete`

## Financial Management APIs

### GET /api/budgets
**Purpose**: Fetch budget entries

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `projectId` (optional): Filter by project
- `year` (optional): Filter by year

**Response**:
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "id": "budget-uuid",
        "costCenter": "CC001",
        "manager": "Manager Name",
        "prkNumber": "PRK001",
        "prkName": "Project Name",
        "kategoriBeban": "Operational",
        "coaNumber": "COA001",
        "anggaranTersedia": 1000000,
        "nilaiPo": 500000,
        "nilaiNonPo": 200000,
        "totalSpr": 700000,
        "totalPenyerapan": 700000,
        "sisaAnggaran": 300000,
        "tahun": 2025,
        "projectId": "project-uuid",
        "createdAt": "2025-10-21T07:30:33.528Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    }
  }
}
```

**Permissions Required**: `budgets:read`

### POST /api/budgets
**Purpose**: Create budget entry

**Permissions Required**: `budgets:create`

### PUT /api/budgets/[id]
**Purpose**: Update budget entry

**Permissions Required**: `budgets:update`

### DELETE /api/budgets/[id]
**Purpose**: Delete budget entry

**Permissions Required**: `budgets:delete`

## Product Management APIs

### GET /api/lifecycle/products
**Purpose**: Fetch product lifecycle data

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category
- `stage` (optional): Filter by stage

**Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "product-uuid",
        "produk": "Product Name",
        "deskripsi": "Product description",
        "id_kategori": "category-uuid",
        "id_segmen": "segment-uuid",
        "id_stage": "stage-uuid",
        "harga": "1000000",
        "tanggal_launch": "2025-01-01",
        "pelanggan": "Customer Name",
        "created_at": "2025-10-21T07:30:33.528Z",
        "kategori": {
          "id": "category-uuid",
          "kategori": "INFRA NETWORK"
        },
        "segmen": {
          "id": "segment-uuid",
          "segmen": "EP & Pembangkit"
        },
        "stage": {
          "id": "stage-uuid",
          "stage": "Growth"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

**Permissions Required**: `lifecycle:read`

### POST /api/lifecycle/products
**Purpose**: Create product

**Permissions Required**: `lifecycle:create`

### PUT /api/lifecycle/products/[id]
**Purpose**: Update product

**Permissions Required**: `lifecycle:update`

### DELETE /api/lifecycle/products/[id]
**Purpose**: Delete product

**Permissions Required**: `lifecycle:delete`

### GET /api/monitoring-license
**Purpose**: Fetch license monitoring data

**Response**:
```json
{
  "success": true,
  "data": {
    "licenses": [
      {
        "id": "license-uuid",
        "licenseName": "Software License",
        "vendor": "Vendor Name",
        "totalPurchase": 1000000,
        "remainingValue": 800000,
        "expiryDate": "2025-12-31",
        "status": "ACTIVE"
      }
    ]
  }
}
```

**Permissions Required**: `license:read`

## Settings APIs

### GET /api/roles
**Purpose**: Fetch available roles

**Response**:
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "role-uuid",
        "name": "System Admin",
        "description": "Full system access"
      },
      {
        "id": "role-uuid-2",
        "name": "Project Manager",
        "description": "Can manage projects and teams"
      }
    ]
  }
}
```

**Permissions Required**: `roles:read`

### GET /api/activity-logs
**Purpose**: Fetch activity logs

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `userId` (optional): Filter by user
- `action` (optional): Filter by action
- `entity` (optional): Filter by entity

**Response**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-uuid",
        "action": "CREATE",
        "entity": "User",
        "entityId": "user-uuid",
        "description": "Created user: John Doe",
        "userId": "admin-uuid",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2025-10-21T07:30:33.528Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

**Permissions Required**: `activity:read`

## Error Handling

### Error Response Format
All API errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

### Common Error Messages
- `"Authentication required"` - Missing or invalid token
- `"Insufficient permissions"` - User lacks required permissions
- `"Validation error"` - Invalid request data
- `"Email already exists"` - Duplicate email address
- `"User not found"` - User doesn't exist
- `"Invalid current password"` - Wrong password for change
- `"Cannot delete your own account"` - Self-deletion protection

## Rate Limiting

### Rate Limits
- **General APIs**: 100 requests per minute per user
- **Authentication APIs**: 10 requests per minute per IP
- **User Management APIs**: 20 requests per minute per user
- **File Upload APIs**: 5 requests per minute per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

## Testing

### API Testing Tools
- **Postman**: Import collection for testing
- **curl**: Command-line testing
- **Insomnia**: Alternative API client
- **Thunder Client**: VS Code extension

### Test Environment
- **Base URL**: `http://localhost:3000/api`
- **Test Token**: Use login endpoint to get valid token
- **Test Data**: Use provided test users and data

### Example curl Commands
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}'

# Get Users
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>"

# Create User
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@company.com","password":"Password123!","roleId":"role-uuid"}'
```

---

**Last Updated**: October 21, 2025  
**Version**: 1.0  
**Maintainer**: PMO Development Team
