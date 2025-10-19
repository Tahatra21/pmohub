'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Users, 
  Package, 
  DollarSign, 
  FileText, 
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Monitor,
  ShoppingCart,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NotificationBell from './notification-bell';

interface User {
  id: string;
  email: string;
  name: string;
  role: {
    name: string;
    permissions: Record<string, any>;
  };
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  permission?: string;
  badge?: string;
  badgeColor?: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard:read',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    permission: 'projects:read',
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
    permission: 'tasks:read',
  },
  {
    name: 'Resources',
    href: '/resources',
    icon: Package,
    permission: 'resources:read',
  },
  {
    name: 'Budget',
    href: '/budget',
    icon: DollarSign,
    permission: 'budgets:read',
  },
  {
    name: 'Product Monitoring',
    icon: Monitor,
    permission: 'lifecycle:all',
    children: [
      {
        name: 'Product Catalog',
        href: '/product-lifecycle',
        icon: ShoppingCart,
        permission: 'lifecycle:read',
      },
      {
        name: 'Monitoring License',
        href: '/monitoring-license',
        icon: Activity,
        permission: 'license:read',
      },
    ],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'settings:system',
  },
];

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Check if user has the permission
    if (user.role.permissions?.[permission] === true) {
      return true;
    }
    
    // Check if user has the :all permission for this resource
    const resource = permission.split(':')[0];
    if (user.role.permissions?.[`${resource}:all`] === true) {
      return true;
    }
    
    // Admin has all permissions
    if (user.role.name === 'Admin') {
      return true;
    }
    
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
      } else {
        newSet.add(menuName);
      }
      return newSet;
    });
  };

  if (!user) {
    return null;
  }

  const filteredNavigationItems = navigationItems.filter(item => {
    if (!item.permission || hasPermission(item.permission)) {
      return true;
    }
    
    // If parent doesn't have permission, check if any child has permission
    if (item.children) {
      return item.children.some(child => 
        !child.permission || hasPermission(child.permission)
      );
    }
    
    return false;
  });

  const NavigationContent = () => (
    <nav className="flex flex-col space-y-1">
      {filteredNavigationItems.map((item) => {
        const isActive = pathname === item.href;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus.has(item.name);
        
        if (hasChildren) {
          return (
            <div key={item.name}>
              <button
                onClick={() => toggleSubmenu(item.name)}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children!.map((child) => {
                    const isChildActive = pathname === child.href;
                    const hasChildPermission = !child.permission || hasPermission(child.permission);
                    
                    if (!hasChildPermission) return null;
                    
                    return (
                      <Link
                        key={child.name}
                        href={child.href!}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isChildActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <child.icon className="mr-3 h-4 w-4" />
                        {child.name}
                        {child.badge && (
                          <Badge className={`ml-auto ${child.badgeColor || 'bg-gray-100 text-gray-800'}`}>
                            {child.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }
        
        return (
          <Link
            key={item.name}
            href={item.href!}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
            {item.badge && (
              <Badge className={`ml-auto ${item.badgeColor || 'bg-gray-100 text-gray-800'}`}>
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">ProjectHub</h1>
        </div>
        
        <div className="mt-5 flex-grow flex flex-col">
          <div className="flex-1 px-2 pb-4">
            <NavigationContent />
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center gap-2 w-full">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex-1 justify-start">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.role.name}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile menu */}
    <div className="md:hidden">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="fixed top-4 left-4 z-50">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex items-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">ProjectHub</h1>
          </div>
          <NavigationContent />
          
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="flex items-center px-3 py-2">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-gray-500">{user.role.name}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start mt-2"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
    </>
  );
}

