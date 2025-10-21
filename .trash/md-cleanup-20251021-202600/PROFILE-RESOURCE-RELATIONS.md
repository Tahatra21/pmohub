# Profile-Resource-User Relations Documentation

## Overview
This document describes the relationship between User, Resource, and Profile components in the SOLAR HUB PMO application.

## Database Schema Relations

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  phone     String?
  avatar    String?
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id])
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  createdProjects     Project[]           @relation("ProjectCreator")
  projectMemberships  ProjectMember[]
  assignedTasks       Task[]              @relation("TaskAssignee")
  createdTasks        Task[]              @relation("TaskCreator")
  resource            Resource?           @relation("UserResource")

  @@map("tbl_users")
}
```

### Resource Model
```prisma
model Resource {
  id          String         @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  createdBy   String
  userId      String         @unique
  skills      String?
  department  String?
  phone       String?
  email       String?
  maxProjects Int            @default(3)
  hourlyRate  Float?
  status      ResourceStatus @default(AVAILABLE)
  type        ResourceType

  // Relations
  user User @relation("UserResource", fields: [userId], references: [id], onDelete: Cascade)

  @@map("tbl_resources")
}
```

## Relationship Details

### One-to-One Relationship
- **User ↔ Resource**: Each user can have at most one resource profile
- **Resource ↔ User**: Each resource belongs to exactly one user
- **Foreign Key**: `Resource.userId` references `User.id`
- **Constraint**: `userId` is unique in Resource table

### Cascade Behavior
- When a user is deleted, their associated resource is automatically deleted (`onDelete: Cascade`)
- This ensures data integrity and prevents orphaned resource records

## API Endpoints

### 1. Get User Profile with Resource
**Endpoint**: `GET /api/users/me`
**Description**: Retrieves the authenticated user's profile including their resource information
**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "phone": "+1234567890",
    "avatar": "avatar_url",
    "role": {
      "id": "role_id",
      "name": "Role Name",
      "description": "Role Description"
    },
    "resource": {
      "id": "resource_id",
      "name": "Resource Name",
      "description": "Resource Description",
      "skills": "Skills List",
      "department": "Department",
      "phone": "+1234567890",
      "email": "resource@example.com",
      "maxProjects": 3,
      "hourlyRate": 50.0,
      "status": "AVAILABLE",
      "type": "IT_DEVELOPER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get User Resource
**Endpoint**: `GET /api/users/[id]/resource`
**Description**: Retrieves a specific user's resource information
**Authentication**: Required (user can only access their own resource unless admin)
**Response**: Same as resource object in user profile

### 3. Update User Resource
**Endpoint**: `PUT /api/users/[id]/resource`
**Description**: Updates a specific user's resource information
**Authentication**: Required (user can only update their own resource unless admin)
**Request Body**:
```json
{
  "name": "Updated Resource Name",
  "description": "Updated Description",
  "skills": "Updated Skills",
  "department": "Updated Department",
  "phone": "+1234567890",
  "email": "updated@example.com",
  "maxProjects": 5,
  "hourlyRate": 75.0,
  "status": "AVAILABLE",
  "type": "PROJECT_MANAGER"
}
```

## Frontend Components

### Profile Page
**Location**: `src/app/(authenticated)/profile/page.tsx`
**Features**:
- Displays user profile information
- Shows resource information if available
- Allows editing of profile information
- Resource information is read-only (can be updated via separate resource management)

### Resource Information Display
The profile page includes a dedicated section for resource information:
- Resource name and type
- Skills and department
- Max projects and hourly rate
- Status and timestamps
- Conditional rendering (only shows if resource exists)

## Resource Types
```typescript
enum ResourceType {
  PROJECT_MANAGER = "PROJECT_MANAGER",
  FIELD_ENGINEER = "FIELD_ENGINEER", 
  IT_DEVELOPER = "IT_DEVELOPER",
  TECHNICAL_TEAM = "TECHNICAL_TEAM",
  CLIENT_STAKEHOLDER = "CLIENT_STAKEHOLDER"
}
```

## Resource Status
```typescript
enum ResourceStatus {
  AVAILABLE = "AVAILABLE",
  ALLOCATED = "ALLOCATED",
  BUSY = "BUSY",
  ON_LEAVE = "ON_LEAVE"
}
```

## Usage Examples

### Creating a Resource for a User
```typescript
const resource = await prisma.resource.create({
  data: {
    userId: user.id,
    name: user.name,
    description: "Resource profile for user",
    skills: "General skills",
    department: "IT Department",
    phone: user.phone,
    email: user.email,
    maxProjects: 3,
    hourlyRate: 50.0,
    status: "AVAILABLE",
    type: "TECHNICAL_TEAM",
    createdBy: adminUserId,
  }
});
```

### Fetching User with Resource
```typescript
const userWithResource = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    role: true,
    resource: true
  }
});
```

### Updating Resource Information
```typescript
const updatedResource = await prisma.resource.update({
  where: { userId: userId },
  data: {
    skills: "Updated skills",
    hourlyRate: 75.0,
    status: "BUSY"
  }
});
```

## Security Considerations

1. **Authentication Required**: All resource endpoints require valid JWT token
2. **Authorization**: Users can only access/update their own resources unless they have admin permissions
3. **Data Validation**: All input data is validated using Zod schemas
4. **Cascade Deletion**: Resources are automatically deleted when users are deleted

## Migration Notes

1. **Schema Changes**: Added explicit relations between User and Resource models
2. **API Updates**: Updated `/api/users/me` to include resource information
3. **Frontend Updates**: Enhanced profile page to display resource information
4. **New Endpoints**: Added `/api/users/[id]/resource` for resource-specific operations

## Future Enhancements

1. **Resource Allocation**: Track which projects a resource is allocated to
2. **Skill Management**: More detailed skill tracking and matching
3. **Availability Calendar**: Track resource availability over time
4. **Performance Metrics**: Track resource utilization and performance
5. **Resource Pool**: Manage shared resources across multiple users
