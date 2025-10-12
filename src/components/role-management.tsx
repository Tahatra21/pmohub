'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, UserCheck, Crown, Settings, Eye } from 'lucide-react';

interface RoleInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  permissions: string[];
  userCount: number;
}

const ROLES: RoleInfo[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system administrator with complete access',
    icon: Crown,
    color: 'bg-red-100 text-red-800',
    permissions: [
      'User Management',
      'Role Management', 
      'System Settings',
      'Database Management',
      'Security Settings',
      'All Module Access',
      'Activity Logs'
    ],
    userCount: 1
  },
  {
    id: 'manager',
    name: 'Project Manager',
    description: 'Project leader with team management capabilities',
    icon: UserCheck,
    color: 'bg-blue-100 text-blue-800',
    permissions: [
      'Create Projects',
      'Manage Tasks',
      'Assign Resources',
      'Approve Budgets',
      'Document Management',
      'Team Coordination',
      'Milestone Tracking'
    ],
    userCount: 1
  },
  {
    id: 'user',
    name: 'User',
    description: 'Team member with basic project access',
    icon: Users,
    color: 'bg-green-100 text-green-800',
    permissions: [
      'View Projects',
      'Update Task Progress',
      'Upload Documents',
      'View Team Members',
      'View Budgets',
      'View Resources'
    ],
    userCount: 2
  }
];

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
        <p className="text-gray-500">
          Manage user roles and permissions in your PMO system
        </p>
      </div>

      {/* Role Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {ROLES.map((role) => {
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
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">
                  {role.description}
                </CardDescription>
                
                {selectedRole === role.id && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Permissions:</h4>
                      <div className="grid gap-1">
                        {role.permissions.map((permission, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">{permission}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <Button size="sm" variant="outline" className="w-full">
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
                  <th className="text-center p-2">Admin</th>
                  <th className="text-center p-2">Project Manager</th>
                  <th className="text-center p-2">User</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="p-2 font-medium">Dashboard</td>
                  <td className="text-center p-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800">Read</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800">Read</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800">Read</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Projects</td>
                  <td className="text-center p-2">
                    <Badge className="bg-red-100 text-red-800">Full Access</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge className="bg-blue-100 text-blue-800">Create/Read/Update</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">Read Only</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Tasks</td>
                  <td className="text-center p-2">
                    <Badge className="bg-red-100 text-red-800">Full Access</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge className="bg-blue-100 text-blue-800">Full Access</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge className="bg-green-100 text-green-800">Read/Update</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Users</td>
                  <td className="text-center p-2">
                    <Badge className="bg-red-100 text-red-800">Full Access</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">Read Only</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">Read Only</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Resources</td>
                  <td className="text-center p-2">
                    <Badge className="bg-red-100 text-red-800">Full Access</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge className="bg-blue-100 text-blue-800">Create/Read/Allocate</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">Read Only</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Budgets</td>
                  <td className="text-center p-2">
                    <Badge className="bg-red-100 text-red-800">Full Access</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge className="bg-blue-100 text-blue-800">Read/Create/Approve</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">Read Only</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Documents</td>
                  <td className="text-center p-2">
                    <Badge className="bg-red-100 text-red-800">Full Access</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge className="bg-blue-100 text-blue-800">Full Access</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge className="bg-green-100 text-green-800">Read/Create/Download</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">System Settings</td>
                  <td className="text-center p-2">
                    <Badge className="bg-red-100 text-red-800">Full Access</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">Read Only</Badge>
                  </td>
                  <td className="text-center p-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">Read Only</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Implementation Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-red-800">Admin Role</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• System administrators only</li>
                <li>• IT department staff</li>
                <li>• Maximum 2-3 users</li>
                <li>• Full system control</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Project Manager</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Team leads & supervisors</li>
                <li>• Project coordinators</li>
                <li>• Department heads</li>
                <li>• Project oversight role</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">User Role</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Field engineers</li>
                <li>• Technical staff</li>
                <li>• Client stakeholders</li>
                <li>• General team members</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
