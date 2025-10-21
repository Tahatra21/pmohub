'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FileText, 
  Activity, 
  Users, 
  Settings as SettingsIcon,
  ChevronRight,
  ArrowLeft,
  Shield,
  Database,
  Bell,
  Palette,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SubMenuItem {
  id: string;
  name: string;
  description: string;
  icon: any;
  href: string;
}

const subMenuItems: SubMenuItem[] = [
  {
    id: 'documents',
    name: 'Documents',
    description: 'Manage project documents, files, and attachments',
    icon: FileText,
    href: '/settings/documents',
  },
  {
    id: 'activity',
    name: 'Activity Log',
    description: 'View system activity logs and audit trails',
    icon: Activity,
    href: '/settings/activity',
  },
  {
    id: 'users',
    name: 'User Management',
    description: 'Manage users, roles, and permissions',
    icon: Users,
    href: '/settings/users',
  },
  {
    id: 'security',
    name: 'Security Settings',
    description: 'Configure security policies and access controls',
    icon: Shield,
    href: '/settings/security',
  },
  {
    id: 'database',
    name: 'Database Management',
    description: 'Manage database connections and backups',
    icon: Database,
    href: '/settings/database',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Configure notification preferences and alerts',
    icon: Bell,
    href: '/settings/notifications',
  },
  {
    id: 'roles',
    name: 'Role Management',
    description: 'Manage user roles and permissions',
    icon: UserCheck,
    href: '/settings/roles',
  },
];

// Permission mapping for each settings module
const settingsPermissions: Record<string, string> = {
  'documents': 'documents:read',
  'activity': 'activity:read',
  'users': 'users:all',
  'security': 'settings:system',
  'database': 'settings:system',
  'notifications': 'settings:read',
  'roles': 'roles:read',
};

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [user, setUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Load user from token
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        setTimeout(() => {
          setUserLoaded(true);
        }, 0);
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserLoaded(true);
      }
    } else {
      setUserLoaded(true);
    }
  }, []);

  // Permission check function
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Check if user has the permission
    if (user.permissions?.[permission] === true) {
      return true;
    }
    
    // Check if user has the :all permission for this resource
    const resource = permission.split(':')[0];
    if (user.permissions?.[`${resource}:all`] === true) {
      return true;
    }
    
    // Admin has all permissions
    if (user.role?.name === 'Admin') {
      return true;
    }
    
    return false;
  };

  // Filter sub-menu items based on permissions
  const filteredSubMenuItems = subMenuItems.filter(item => {
    const permission = settingsPermissions[item.id];
    return !permission || hasPermission(permission);
  });

  const handleSubMenuClick = (item: SubMenuItem) => {
    router.push(item.href);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-500">Manage your system settings and configurations</p>
        </div>
      </div>

      {/* Settings Overview */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure and manage various aspects of your project management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredSubMenuItems.map((item) => (
                <Card 
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                  onClick={() => handleSubMenuClick(item)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <item.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}