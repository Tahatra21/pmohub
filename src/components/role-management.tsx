'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, UserCheck, Crown, Settings, Eye, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface RoleInfo extends Role {
  icon: React.ComponentType<any>;
  color: string;
  userCount: number;
}

const ROLE_ICONS = {
  'System Admin': Crown,
  'Admin': Crown,
  'Project Manager': UserCheck,
  'Field/Site Engineer': Users,
  'Client / Stakeholder': Users,
  'IT Developer / Technical Team': Settings,
};

const ROLE_COLORS = {
  'System Admin': 'bg-red-100 text-red-800',
  'Admin': 'bg-red-100 text-red-800',
  'Project Manager': 'bg-blue-100 text-blue-800',
  'Field/Site Engineer': 'bg-green-100 text-green-800',
  'Client / Stakeholder': 'bg-purple-100 text-purple-800',
  'IT Developer / Technical Team': 'bg-orange-100 text-orange-800',
};

const PERMISSION_MODULES = [
  { key: 'dashboard', label: 'Dashboard', permissions: ['read'] },
  { key: 'projects', label: 'Projects', permissions: ['read', 'create', 'update', 'delete', 'all'] },
  { key: 'tasks', label: 'Tasks', permissions: ['read', 'create', 'update', 'delete', 'all'] },
  { key: 'users', label: 'Users', permissions: ['read', 'create', 'update', 'delete', 'all'] },
  { key: 'roles', label: 'Roles', permissions: ['read', 'create', 'update', 'delete'] },
  { key: 'resources', label: 'Resources', permissions: ['read', 'create', 'update', 'delete', 'all'] },
  { key: 'budgets', label: 'Budgets', permissions: ['read', 'create', 'update', 'delete', 'all'] },
  { key: 'cost', label: 'Cost Management', permissions: ['read', 'create', 'update', 'delete', 'all'] },
  { key: 'documents', label: 'Documents', permissions: ['read', 'create', 'update', 'delete', 'all'] },
  { key: 'milestones', label: 'Milestones', permissions: ['read', 'create', 'update', 'delete'] },
  { key: 'activity', label: 'Activity Logs', permissions: ['read', 'create', 'update', 'delete', 'all'] },
  { key: 'lifecycle', label: 'Product Lifecycle', permissions: ['read', 'create', 'update', 'delete', 'all'] },
  { key: 'settings', label: 'System Settings', permissions: ['read', 'system'] },
  { key: 'license', label: 'License Monitoring', permissions: ['read', 'write'] },
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {} as Record<string, any>,
  });

  const fetchRoles = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      const result = await response.json();
      if (result.success) {
        // Get user counts for each role
        const rolesWithUserCounts = await Promise.all(
          result.data.roles.map(async (role: Role) => {
            const userCountResponse = await fetch(`/api/users?roleId=${role.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            let userCount = 0;
            if (userCountResponse.ok) {
              const userCountResult = await userCountResponse.json();
              userCount = userCountResult.success ? userCountResult.data.users.length : 0;
            }

            return {
              ...role,
              icon: ROLE_ICONS[role.name as keyof typeof ROLE_ICONS] || Users,
              color: ROLE_COLORS[role.name as keyof typeof ROLE_COLORS] || 'bg-gray-100 text-gray-800',
              userCount,
            };
          })
        );

        setRoles(rolesWithUserCounts);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: {},
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save role');
      }

      const result = await response.json();
      if (result.success) {
        toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
        setIsEditModalOpen(false);
        setIsCreateModalOpen(false);
        fetchRoles();
      }
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete role');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Role deleted successfully');
        fetchRoles();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  const togglePermission = (module: string, permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [permission]: !prev.permissions[module]?.[permission],
        },
      },
    }));
  };

  const getPermissionBadge = (role: RoleInfo, module: string) => {
    const permissions = role.permissions[module];
    if (!permissions) return <Badge variant="outline" className="bg-gray-100 text-gray-800">No Access</Badge>;
    
    if (permissions.all) return <Badge className="bg-red-100 text-red-800">Full Access</Badge>;
    if (permissions.read && permissions.create && permissions.update && permissions.delete) {
      return <Badge className="bg-blue-100 text-blue-800">Full Access</Badge>;
    }
    
    const activePermissions = Object.entries(permissions)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);
    
    if (activePermissions.length === 0) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">No Access</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">{activePermissions.join('/')}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
          <p className="text-gray-500">Loading roles...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
          <p className="text-gray-500">
            Manage user roles and permissions in your PMO system
          </p>
        </div>
        <Button onClick={handleCreateRole} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Role Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => {
          const IconComponent = role.icon;
          return (
            <Card 
              key={role.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedRole === role.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${role.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRole(role);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">
                  {role.description}
                </CardDescription>
                
                {selectedRole === role.id && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Permissions:</h4>
                      <div className="grid gap-1">
                        {Object.entries(role.permissions).slice(0, 5).map(([module, perms]) => {
                          if (typeof perms === 'object' && perms !== null) {
                            const activePerms = Object.entries(perms).filter(([_, value]) => value);
                            if (activePerms.length > 0) {
                              return (
                                <div key={module} className="flex items-center gap-2 text-sm">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="text-gray-600 capitalize">{module}</span>
                                </div>
                              );
                            }
                          }
                          return null;
                        })}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRole(role);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Role
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Role Comparison Matrix
          </CardTitle>
          <CardDescription>
            Detailed comparison of permissions across all roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Module</th>
                  {roles.map((role) => (
                    <th key={role.id} className="text-center p-2">{role.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                {PERMISSION_MODULES.map((module) => (
                  <tr key={module.key} className="border-b">
                    <td className="p-2 font-medium">{module.label}</td>
                    {roles.map((role) => (
                      <td key={role.id} className="text-center p-2">
                        {getPermissionBadge(role, module.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Role Modal */}
      <Dialog open={isEditModalOpen || isCreateModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditModalOpen(false);
          setIsCreateModalOpen(false);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole ? 'Update role permissions and settings' : 'Create a new role with specific permissions'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter role name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Permissions Configuration</h4>
              <div className="grid gap-4">
                {PERMISSION_MODULES.map((module) => (
                  <Card key={module.key}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{module.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 md:grid-cols-3">
                        {module.permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`${module.key}-${permission}`}
                              checked={formData.permissions[module.key]?.[permission] || false}
                              onChange={() => togglePermission(module.key, permission)}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={`${module.key}-${permission}`} className="text-sm capitalize">
                              {permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditModalOpen(false);
              setIsCreateModalOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
