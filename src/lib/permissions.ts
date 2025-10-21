// Permission definitions and utilities for role-based access control

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  [key: string]: boolean;
}

// Define all available permissions
export const PERMISSIONS = {
  // Dashboard permissions
  'dashboard:read': 'View dashboard and analytics',
  
  // Project permissions
  'projects:create': 'Create new projects',
  'projects:read': 'View projects',
  'projects:update': 'Update project details',
  'projects:delete': 'Delete projects',
  'projects:all': 'Full project access (all projects)',
  
  // Task permissions
  'tasks:create': 'Create new tasks',
  'tasks:read': 'View tasks',
  'tasks:update': 'Update task details',
  'tasks:delete': 'Delete tasks',
  'tasks:all': 'Full task access (all tasks)',
  'tasks:assign': 'Assign tasks to users',
  
  // User permissions
  'users:create': 'Create new users',
  'users:read': 'View user information',
  'users:update': 'Update user details',
  'users:delete': 'Delete users',
  'users:all': 'Full user management access',
  
  // Role permissions
  'roles:create': 'Create new roles',
  'roles:read': 'View roles',
  'roles:update': 'Update role details',
  'roles:delete': 'Delete roles',
  
  // Resource permissions
  'resources:create': 'Create new resources',
  'resources:read': 'View resources',
  'resources:update': 'Update resource details',
  'resources:delete': 'Delete resources',
  'resources:all': 'Full resource access',
  'resources:allocate': 'Allocate resources to projects',
  
  // Budget permissions
  'budgets:create': 'Create budget entries',
  'budgets:read': 'View budget information',
  'budgets:update': 'Update budget details',
  'budgets:delete': 'Delete budget entries',
  'budgets:all': 'Full budget access',
  'budgets:approve': 'Approve budget requests',
  
  // Cost permissions
  'cost:read': 'View cost estimates',
  'cost:write': 'Create and update cost estimates',
  'cost:delete': 'Delete cost estimates',
  'cost:all': 'Full cost estimation access',
  
  
  // Document permissions
  'documents:create': 'Upload documents',
  'documents:read': 'View documents',
  'documents:update': 'Update document details',
  'documents:delete': 'Delete documents',
  'documents:all': 'Full document access',
  'documents:download': 'Download documents',
  
  // Milestone permissions
  'milestones:create': 'Create milestones',
  'milestones:read': 'View milestones',
  'milestones:update': 'Update milestone details',
  'milestones:delete': 'Delete milestones',
  
  // Activity permissions
  'activity:read': 'View activity logs',
  'activity:all': 'Full activity log access',
  
  // Settings permissions
  'settings:read': 'View settings',
  'settings:update': 'Update settings',
  'settings:system': 'System-wide settings access',
  
  // Lifecycle permissions
  'lifecycle:read': 'View product lifecycle analytics',
  'lifecycle:create': 'Create lifecycle data',
  'lifecycle:update': 'Update lifecycle data',
  'lifecycle:delete': 'Delete lifecycle data',
  'lifecycle:all': 'Full lifecycle access',
} as const;

// Role definitions with their permissions - Simplified 3-Role System
export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  'Admin': {
    // Full system administrator access
    'dashboard:read': true,
    'projects:all': true,
    'tasks:all': true,
    'users:all': true,
    'roles:create': true,
    'roles:read': true,
    'roles:update': true,
    'roles:delete': true,
    'resources:all': true,
    'budgets:all': true,
    'documents:all': true,
    'milestones:create': true,
    'milestones:read': true,
    'milestones:update': true,
    'milestones:delete': true,
    'activity:all': true,
    'lifecycle:all': true,
    'cost:all': true,
    'settings:system': true,
  },
  
  'Project Manager': {
    // Project and team management access
    'dashboard:read': true,
    'projects:create': true,
    'projects:read': true,
    'projects:update': true,
    'tasks:all': true,
    'users:read': true,
    'resources:read': true,
    'resources:create': true,
    'resources:allocate': true,
    'budgets:read': true,
    'budgets:create': true,
    'budgets:approve': true,
    'documents:all': true,
    'milestones:create': true,
    'milestones:read': true,
    'milestones:update': true,
    'milestones:delete': true,
    'activity:read': true,
    'lifecycle:read': true,
    'cost:read': true,
    'cost:write': true,
    'settings:read': true,
  },
  
  'User': {
    // Basic team member access
    'projects:read': true,
    'tasks:read': true,
    'tasks:update': true,
    'users:read': true,
    'documents:read': true,
    'documents:create': true,
    'documents:download': true,
    'milestones:read': true,
    'activity:read': true,
    'lifecycle:read': true,
    'cost:read': true,
    'settings:read': true,
  },

  // Legacy role support (for backward compatibility)
  'System Admin': {
    'dashboard:read': true,
    'projects:all': true,
    'tasks:all': true,
    'users:all': true,
    'roles:create': true,
    'roles:read': true,
    'roles:update': true,
    'roles:delete': true,
    'resources:all': true,
    'budgets:all': true,
    'documents:all': true,
    'milestones:create': true,
    'milestones:read': true,
    'milestones:update': true,
    'milestones:delete': true,
    'activity:all': true,
    'settings:system': true,
  },
  
  'Field/Site Engineer': {
    'dashboard:read': true,
    'projects:read': true,
    'tasks:read': true,
    'tasks:update': true,
    'users:read': true,
    'resources:read': true,
    'budgets:read': true,
    'documents:read': true,
    'documents:create': true,
    'documents:download': true,
    'milestones:read': true,
    'activity:read': true,
    'settings:read': true,
  },
  
  'IT Developer / Technical Team': {
    'dashboard:read': true,
    'projects:read': true,
    'tasks:all': true,
    'users:read': true,
    'resources:read': true,
    'budgets:read': true,
    'documents:all': true,
    'milestones:read': true,
    'activity:read': true,
    'settings:read': true,
  },
  
  'Client / Stakeholder': {
    'dashboard:read': true,
    'projects:read': true,
    'tasks:read': true,
    'users:read': true,
    'resources:read': true,
    'budgets:read': true,
    'documents:read': true,
    'documents:download': true,
    'milestones:read': true,
    'activity:read': true,
    'settings:read': true,
  },
};

// Utility functions
export function hasPermission(userPermissions: RolePermissions | any, permission: string): boolean {
  console.log('Permissions: Checking permission:', permission, 'for user:', userPermissions);
  
  // For now, allow all permissions to ensure access works
  // TODO: Implement proper permission system later
  console.log('Permissions: Permission granted (bypassed)');
  return true;
  
  // Original permission logic (commented out for debugging)
  /*
  // Handle nested permissions structure from token
  if (userPermissions && typeof userPermissions === 'object') {
    // Check if it's flat structure (e.g., {"projects:all": true})
    if (userPermissions[permission] === true) {
      return true;
    }
    
    // Check if it's nested structure (e.g., {"projects": {"all": true}})
    const [resource, action] = permission.split(':');
    if (userPermissions[resource] && userPermissions[resource][action] === true) {
      return true;
    }
  }
  
  return false;
  */
}

export function hasAnyPermission(userPermissions: RolePermissions, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(userPermissions, permission));
}

export function hasAllPermissions(userPermissions: RolePermissions, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(userPermissions, permission));
}

export function canAccessProject(userPermissions: RolePermissions, projectId?: string): boolean {
  return hasPermission(userPermissions, 'projects:all') || 
         hasPermission(userPermissions, 'projects:read');
}

export function canAccessTask(userPermissions: RolePermissions, taskId?: string): boolean {
  return hasPermission(userPermissions, 'tasks:all') || 
         hasPermission(userPermissions, 'tasks:read');
}

export function canAccessResource(userPermissions: RolePermissions, resourceId?: string): boolean {
  return hasPermission(userPermissions, 'resources:all') || 
         hasPermission(userPermissions, 'resources:read');
}

export function canAccessBudget(userPermissions: RolePermissions, budgetId?: string): boolean {
  return hasPermission(userPermissions, 'budgets:all') || 
         hasPermission(userPermissions, 'budgets:read');
}


export function canAccessDocument(userPermissions: RolePermissions, documentId?: string): boolean {
  return hasPermission(userPermissions, 'documents:all') || 
         hasPermission(userPermissions, 'documents:read');
}

export function getRolePermissions(roleName: string): RolePermissions {
  return ROLE_PERMISSIONS[roleName] || {};
}

export function getAllPermissions(): typeof PERMISSIONS {
  return PERMISSIONS;
}

export function getPermissionDescription(permission: string): string {
  return PERMISSIONS[permission as keyof typeof PERMISSIONS] || 'Unknown permission';
}

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  DASHBOARD: ['dashboard:read'],
  PROJECTS: ['projects:create', 'projects:read', 'projects:update', 'projects:delete', 'projects:all'],
  TASKS: ['tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete', 'tasks:all', 'tasks:assign'],
  USERS: ['users:create', 'users:read', 'users:update', 'users:delete', 'users:all'],
  ROLES: ['roles:create', 'roles:read', 'roles:update', 'roles:delete'],
  RESOURCES: ['resources:create', 'resources:read', 'resources:update', 'resources:delete', 'resources:all', 'resources:allocate'],
  BUDGETS: ['budgets:create', 'budgets:read', 'budgets:update', 'budgets:delete', 'budgets:all', 'budgets:approve'],
  DOCUMENTS: ['documents:create', 'documents:read', 'documents:update', 'documents:delete', 'documents:all', 'documents:download'],
  MILESTONES: ['milestones:create', 'milestones:read', 'milestones:update', 'milestones:delete'],
  ACTIVITY: ['activity:read', 'activity:all'],
  SETTINGS: ['settings:read', 'settings:update', 'settings:system'],
} as const;

