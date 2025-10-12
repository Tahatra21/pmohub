-- Safe Role Update Script: 5-Role to 3-Role System
-- This script safely migrates from 5 roles to 3 roles without breaking existing functionality

BEGIN;

-- Step 1: Create new User role first
INSERT INTO tbl_roles (id, name, description, permissions, "createdAt", "updatedAt") VALUES (
  'user_role_' || extract(epoch from now())::text,
  'User',
  'Team member with basic project access',
  '{
    "dashboard:read": true,
    "projects:read": true,
    "tasks:read": true,
    "tasks:update": true,
    "users:read": true,
    "resources:read": true,
    "budgets:read": true,
    "documents:read": true,
    "documents:create": true,
    "documents:download": true,
    "milestones:read": true,
    "activity:read": true,
    "settings:read": true
  }'::json,
  NOW(),
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Step 2: Get the new User role ID
-- We'll use this in subsequent steps

-- Step 3: Update existing users to appropriate roles
-- Move engineer to User role
UPDATE tbl_users SET "roleId" = (
  SELECT id FROM tbl_roles WHERE name = 'User' LIMIT 1
) WHERE email = 'engineer@projecthub.com';

-- Move test user to User role  
UPDATE tbl_users SET "roleId" = (
  SELECT id FROM tbl_roles WHERE name = 'User' LIMIT 1
) WHERE email = 'apitest@example.com';

-- Keep admin as System Admin (will be renamed to Admin later)
-- Keep manager as Project Manager

-- Step 4: Update role names (keeping IDs intact for backward compatibility)
UPDATE tbl_roles SET 
  name = 'Admin',
  description = 'Full system administrator with complete access'
WHERE name = 'System Admin';

-- Step 5: Update permissions for Admin role
UPDATE tbl_roles SET permissions = '{
  "dashboard:read": true,
  "projects:all": true,
  "tasks:all": true,
  "users:all": true,
  "roles:create": true,
  "roles:read": true,
  "roles:update": true,
  "roles:delete": true,
  "resources:all": true,
  "budgets:all": true,
  "documents:all": true,
  "milestones:create": true,
  "milestones:read": true,
  "milestones:update": true,
  "milestones:delete": true,
  "activity:all": true,
  "settings:system": true
}'::json
WHERE name = 'Admin';

-- Step 6: Update permissions for Project Manager role
UPDATE tbl_roles SET permissions = '{
  "dashboard:read": true,
  "projects:create": true,
  "projects:read": true,
  "projects:update": true,
  "tasks:all": true,
  "users:read": true,
  "resources:read": true,
  "resources:create": true,
  "resources:allocate": true,
  "budgets:read": true,
  "budgets:create": true,
  "budgets:approve": true,
  "documents:all": true,
  "milestones:create": true,
  "milestones:read": true,
  "milestones:update": true,
  "milestones:delete": true,
  "activity:read": true,
  "settings:read": true
}'::json
WHERE name = 'Project Manager';

-- Step 7: Mark unused roles as inactive (don't delete to maintain referential integrity)
-- We'll keep the old roles but mark them as deprecated
UPDATE tbl_roles SET 
  description = description || ' (DEPRECATED - Use User role instead)',
  permissions = '{}'::json
WHERE name IN ('Field/Site Engineer', 'IT Developer / Technical Team', 'Client / Stakeholder');

COMMIT;

-- Verification query
SELECT 
  r.name as role_name,
  r.description,
  COUNT(u.id) as user_count
FROM tbl_roles r
LEFT JOIN tbl_users u ON u."roleId" = r.id
GROUP BY r.id, r.name, r.description
ORDER BY user_count DESC, r.name;
