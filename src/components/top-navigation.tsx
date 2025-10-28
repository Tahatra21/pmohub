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
  RefreshCw,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Monitor,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Calculator,
  FileSpreadsheet,
  Database,
  BarChart3
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
import { hasPermission, getRolePermissions } from '@/lib/permissions';

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
  color?: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard:read',
    color: 'blue',
  },
  {
    name: 'Project Management',
    icon: FolderOpen,
    permission: 'projects:read',
    color: 'green',
    children: [
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
    ],
  },
  {
    name: 'Financial Management',
    icon: DollarSign,
    permission: 'budgets:read',
    color: 'emerald',
    children: [
      {
        name: 'Budget',
        href: '/budget',
        icon: DollarSign,
        permission: 'budgets:read',
      },
      {
        name: 'Cost Estimation',
        icon: Calculator,
        permission: 'cost:read',
        children: [
          {
            name: 'Estimates',
            href: '/cost/estimates',
            icon: FileSpreadsheet,
            permission: 'cost:read',
          },
          {
            name: 'Master Data',
            href: '/cost/master-data',
            icon: Database,
            permission: 'cost:read',
          },
        ],
      },
      {
        name: 'Reports',
        href: '/cost/reports',
        icon: BarChart3,
        permission: 'cost:read',
      },
    ],
  },
  {
    name: 'Product Management',
    icon: Monitor,
    permission: 'lifecycle:all',
    color: 'purple',
    children: [
      {
        name: 'Product Catalog',
        href: '/product-lifecycle',
        icon: ShoppingCart,
        permission: 'lifecycle:read',
      },
      {
        name: 'License Monitoring',
        href: '/monitoring-license',
        icon: Activity,
        permission: 'license:read',
      },
    ],
  },
];

export default function TopNavigation() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        console.log('Loading user, token exists:', !!token);
        
        if (!token) {
          console.log('No token found, redirecting to login');
          router.push('/login');
          return;
        }

        // Load real user data
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          const userInfo = userData.data;
          
          // Get role permissions
          const rolePermissions = getRolePermissions(userInfo.role.name);
          
          const userWithPermissions = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            role: {
              name: userInfo.role.name,
              permissions: rolePermissions
            }
          };
          
          console.log('Setting real user with permissions:', userWithPermissions);
          setUser(userWithPermissions);
        } else {
          console.log('Failed to load user, redirecting to login');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        router.push('/login');
      } finally {
        setUserLoaded(true);
      }
    };

    loadUser();
  }, [router]);

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    return hasPermission(user.role.permissions, permission);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
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

  const closeAllSubmenus = () => {
    setExpandedMenus(new Set());
  };

  const handleMouseEnter = () => {
    // Clear any existing timeout when mouse enters navigation area
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleMouseLeave = () => {
    // Set a delay before closing submenus
    const timeout = setTimeout(() => {
      setExpandedMenus(new Set());
    }, 300); // 300ms delay
    setHoverTimeout(timeout);
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap = {
      blue: {
        active: 'bg-blue-50 text-blue-700 border-blue-200',
        hover: 'hover:bg-blue-50 hover:text-blue-700',
        icon: 'text-blue-600'
      },
      green: {
        active: 'bg-green-50 text-green-700 border-green-200',
        hover: 'hover:bg-green-50 hover:text-green-700',
        icon: 'text-green-600'
      },
      emerald: {
        active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        hover: 'hover:bg-emerald-50 hover:text-emerald-700',
        icon: 'text-emerald-600'
      },
      purple: {
        active: 'bg-purple-50 text-purple-700 border-purple-200',
        hover: 'hover:bg-purple-50 hover:text-purple-700',
        icon: 'text-purple-600'
      },
      gray: {
        active: 'bg-gray-50 text-gray-700 border-gray-200',
        hover: 'hover:bg-gray-50 hover:text-gray-700',
        icon: 'text-gray-600'
      }
    };
    
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  // Auto close submenus when pathname changes
  useEffect(() => {
    setExpandedMenus(new Set());
  }, [pathname]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Auto close submenus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside navigation area
      if (!target.closest('[data-navigation]')) {
        setExpandedMenus(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNavigationItems = navigationItems.filter(item => {
    console.log('Filtering navigation item:', item.name, 'permission:', item.permission);
    
    if (!item.permission || checkPermission(item.permission)) {
      console.log('Item included:', item.name);
      return true;
    }
    
    // If parent doesn't have permission, check if any child has permission
    if (item.children) {
      const hasChildPermission = item.children.some(child => 
        !child.permission || checkPermission(child.permission)
      );
      console.log('Item included via children:', item.name, hasChildPermission);
      return hasChildPermission;
    }
    
    console.log('Item excluded:', item.name);
    return false;
  });

  console.log('Filtered navigation items:', filteredNavigationItems.map(item => item.name));

  if (!userLoaded) {
    return (
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="ml-3 h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50" data-navigation>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-18">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-4">
                <div className="h-30 w-30">
                  <img 
                    src="/icon.png" 
                    alt="SOLAR Hub Logo" 
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black">
                    <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-black">
                      SOLAR
                    </span>
                    <span className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 bg-clip-text text-transparent ml-2 font-black">
                      HUB
                    </span>
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                    <div className="w-2 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                    <div className="w-1.5 h-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Items */}
            <div className="hidden lg:flex items-center space-x-2">
              {filteredNavigationItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedMenus.has(item.name);
                
                if (hasChildren) {
                  const colorClasses = getColorClasses(item.color || 'blue', isExpanded);
                  return (
                    <div 
                      key={item.name} 
                      className="relative" 
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={`flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          isExpanded
                            ? `${colorClasses.active} shadow-sm`
                            : `text-gray-600 ${colorClasses.hover}`
                        }`}
                      >
                        <Icon className={`h-4 w-4 mr-2 ${isExpanded ? colorClasses.icon : ''}`} />
                        {item.name}
                        <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isExpanded && (
                        <div 
                          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          {item.children!.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                            const hasChildPermission = !child.permission || checkPermission(child.permission);
                            
                            if (!hasChildPermission) return null;
                            
                            // Check if child has sub-children (multi-level)
                            if (child.children && child.children.length > 0) {
                              const childIsExpanded = expandedMenus.has(child.name);
                              return (
                                <div key={child.name} className="border-b border-gray-50 last:border-b-0">
                                  <button
                                    onClick={() => toggleSubmenu(child.name)}
                                    className={`flex items-center justify-between w-full px-4 py-3 text-xs transition-colors ${
                                      childIsExpanded
                                        ? 'bg-gray-50 text-gray-900'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <ChildIcon className="h-3 w-3 mr-2 text-gray-500" />
                                      {child.name}
                                    </div>
                                    <ChevronRight className={`h-3 w-3 transition-transform ${childIsExpanded ? 'rotate-90' : ''}`} />
                                  </button>
                                  
                                  {childIsExpanded && (
                                    <div className="bg-gray-50">
                                      {child.children!.map((grandChild) => {
                                        const GrandChildIcon = grandChild.icon;
                                        const isGrandChildActive = pathname === grandChild.href || pathname.startsWith(grandChild.href + '/');
                                        const hasGrandChildPermission = !grandChild.permission || checkPermission(grandChild.permission);
                                        
                                        if (!hasGrandChildPermission) return null;
                                        
                                        return (
                                          <Link
                                            key={grandChild.name}
                                            href={grandChild.href!}
                                            className={`flex items-center px-6 py-2 text-xs transition-colors ${
                                              isGrandChildActive
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                          >
                                            <GrandChildIcon className="h-3 w-3 mr-2" />
                                            {grandChild.name}
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
                                key={child.name}
                                href={child.href!}
                                className={`flex items-center px-4 py-3 text-xs transition-colors ${
                                  isChildActive
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                <ChildIcon className="h-3 w-3 mr-2 text-gray-500" />
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const colorClasses = getColorClasses(item.color || 'blue', isActive);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className={`flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? `${colorClasses.active} shadow-sm`
                        : `text-gray-600 ${colorClasses.hover}`
                    }`}
                  >
                    <Icon className={`h-4 w-4 mr-2 ${isActive ? colorClasses.icon : ''}`} />
                    {item.name}
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 text-xs ${item.badgeColor || 'bg-gray-100 text-gray-600'}`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side - Notifications and User Menu */}
            <div className="flex items-center space-x-6">
              {/* Notifications */}
              {checkPermission('notifications:read') && (
                <NotificationBell />
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <Badge variant="outline" className="w-fit text-xs">
                        {user.role.name}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-3 w-3" />
                    <span className="text-xs">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-3 w-3" />
                    <span className="text-xs">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-3 w-3" />
                    <span className="text-xs">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-64">
                    <div className="flex flex-col space-y-4 mt-6">
                      {/* Mobile Navigation Items */}
                      {filteredNavigationItems.map((item) => {
                        const Icon = item.icon;
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedMenus.has(item.name);
                        
                        if (hasChildren) {
                          return (
                            <div key={item.name}>
                              <button
                                onClick={() => toggleSubmenu(item.name)}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                  isExpanded
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center">
                                  <Icon className="h-4 w-4 mr-3" />
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
                                    const ChildIcon = child.icon;
                                    const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                                    const hasChildPermission = !child.permission || checkPermission(child.permission);
                                    
                                    if (!hasChildPermission) return null;
                                    
                                    // Check if child has sub-children (multi-level)
                                    if (child.children && child.children.length > 0) {
                                      const childIsExpanded = expandedMenus.has(child.name);
                                      return (
                                        <div key={child.name}>
                                          <button
                                            onClick={() => toggleSubmenu(child.name)}
                                            className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                              childIsExpanded
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                          >
                                            <div className="flex items-center">
                                              <ChildIcon className="h-4 w-4 mr-3" />
                                              {child.name}
                                            </div>
                                            {childIsExpanded ? (
                                              <ChevronDown className="h-4 w-4" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4" />
                                            )}
                                          </button>
                                          
                                          {childIsExpanded && (
                                            <div className="ml-6 mt-1 space-y-1">
                                              {child.children!.map((grandChild) => {
                                                const GrandChildIcon = grandChild.icon;
                                                const isGrandChildActive = pathname === grandChild.href || pathname.startsWith(grandChild.href + '/');
                                                const hasGrandChildPermission = !grandChild.permission || checkPermission(grandChild.permission);
                                                
                                                if (!hasGrandChildPermission) return null;
                                                
                                                return (
                                                  <Link
                                                    key={grandChild.name}
                                                    href={grandChild.href!}
                                                    className={`flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                                                      isGrandChildActive
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                                    }`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                  >
                                                    <GrandChildIcon className="h-3 w-3 mr-2" />
                                                    {grandChild.name}
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
                                        key={child.name}
                                        href={child.href!}
                                        className={`flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                                          isChildActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        <ChildIcon className="h-3 w-3 mr-2" />
                                        {child.name}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        
                        return (
                          <Link
                            key={item.name}
                            href={item.href!}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="h-3 w-3 mr-2" />
                            {item.name}
                            {item.badge && (
                              <Badge 
                                variant="secondary" 
                                className={`ml-auto text-xs ${item.badgeColor || 'bg-gray-100 text-gray-600'}`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                    
                    {/* Mobile User Info Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-200">
                      <div className="flex items-center px-3 py-2">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src="" alt={user.name} />
                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{user.name}</span>
                          <span className="text-xs text-gray-500">{user.role.name}</span>
                        </div>
                      </div>
                      <div className="px-3 space-y-1">
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            router.push('/profile');
                            setMobileMenuOpen(false);
                          }}
                          className="w-full justify-start text-xs"
                        >
                          <User className="mr-2 h-3 w-3" />
                          Profile
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            router.push('/settings');
                            setMobileMenuOpen(false);
                          }}
                          className="w-full justify-start text-xs"
                        >
                          <Settings className="mr-2 h-3 w-3" />
                          Settings
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full justify-start text-xs text-red-600 hover:text-red-700"
                        >
                          <LogOut className="mr-2 h-3 w-3" />
                          Log out
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
