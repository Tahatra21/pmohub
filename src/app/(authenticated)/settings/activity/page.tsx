'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Search, 
  Filter,
  Calendar,
  User,
  ArrowLeft,
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  severity: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
}

interface ActivityLogsResponse {
  success: boolean;
  data: {
    activityLogs: ActivityLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface ActivityStats {
  total: number;
  byAction: Array<{ action: string; _count: { action: number } }>;
  byEntity: Array<{ entity: string; _count: { entity: number } }>;
  bySeverity: Array<{ severity: string; _count: { severity: number } }>;
}

export default function ActivityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token || token === 'undefined' || token === 'null') {
        console.log('No valid token found, redirecting to login');
        toast({
          title: 'Authentication Required',
          description: 'Please login to access activity logs',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      console.log('Fetching activity logs with token:', token.substring(0, 20) + '...');

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filterEntity !== 'all' && { entity: filterEntity }),
        ...(filterSeverity !== 'all' && { severity: filterSeverity }),
        ...(filterAction !== 'all' && { action: filterAction }),
      });

      const url = `/api/activity-logs?${params}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        
        if (response.status === 401) {
          console.log('Unauthorized, redirecting to login');
          toast({
            title: 'Session Expired',
            description: 'Please login again to continue',
            variant: 'destructive',
          });
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        
        if (response.status === 403) {
          console.log('Forbidden, insufficient permissions');
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to view activity logs',
            variant: 'destructive',
          });
          return;
        }
        
        throw new Error(`Failed to fetch activity logs: ${response.status}`);
      }

      const data: ActivityLogsResponse = await response.json();
      console.log('Received data:', data);
      
      if (data.success && data.data) {
        setActivities(data.data.activityLogs);
        setPagination(data.data.pagination);
        console.log('Data set successfully:', data.data.activityLogs.length, 'activities');
      } else {
        console.error('API returned unsuccessful response:', data);
        toast({
          title: 'Error',
          description: 'API returned unsuccessful response',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch activity logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filterEntity, filterSeverity, filterAction, router, toast]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/activity-logs/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchActivityLogs();
    fetchStats();
  }, [fetchActivityLogs, fetchStats]);

  // Filter activities based on search term
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeBadgeColor = (entity: string) => {
    switch (entity) {
      case 'User':
        return 'bg-blue-100 text-blue-800';
      case 'Project':
        return 'bg-purple-100 text-purple-800';
      case 'Task':
        return 'bg-green-100 text-green-800';
      case 'Budget':
        return 'bg-yellow-100 text-yellow-800';
      case 'Document':
        return 'bg-indigo-100 text-indigo-800';
      case 'Authentication':
        return 'bg-orange-100 text-orange-800';
      case 'Permission':
        return 'bg-red-100 text-red-800';
      case 'System':
        return 'bg-gray-100 text-gray-800';
      case 'Frontend':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              Activity Log
            </h1>
            <p className="text-gray-500">Monitor system activities and audit trails</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => {
            fetchActivityLogs();
            fetchStats();
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold">{new Set(activities.map(a => a.userId)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Activities</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => {
                    const today = new Date().toDateString();
                    return new Date(a.createdAt).toDateString() === today;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Filter className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Filtered Results</p>
                <p className="text-2xl font-bold">{filteredActivities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="Task">Task</SelectItem>
                <SelectItem value="Budget">Budget</SelectItem>
                <SelectItem value="Document">Document</SelectItem>
                <SelectItem value="Authentication">Authentication</SelectItem>
                <SelectItem value="Permission">Permission</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="Frontend">Frontend</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="READ">Read</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
                <SelectItem value="PASSWORD_CHANGE">Password Change</SelectItem>
                <SelectItem value="ACCESS_GRANTED">Access Granted</SelectItem>
                <SelectItem value="ACCESS_DENIED">Access Denied</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({filteredActivities.length})</CardTitle>
          <CardDescription>
            System activities and user actions recorded in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading activity logs...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No activity logs found</p>
                <p className="text-sm text-gray-400 mt-2">Try refreshing or check your permissions</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.action}</TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate" title={activity.description}>
                      {activity.description}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {activity.user ? (
                        <div>
                          <div className="font-medium">{activity.user.name}</div>
                          <div className="text-sm text-gray-500">{activity.user.email}</div>
                        </div>
                      ) : (
                        'System'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeBadgeColor(activity.entity)}>
                        {activity.entity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityBadgeColor(activity.severity)}>
                        {activity.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {activity.ipAddress || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(activity.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedActivity(activity);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
            <DialogDescription>
              Detailed information about this activity log entry
            </DialogDescription>
          </DialogHeader>
          
          {selectedActivity && (
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Action</label>
                  <p className="text-sm">{selectedActivity.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Entity</label>
                  <p className="text-sm">{selectedActivity.entity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Severity</label>
                  <Badge className={getSeverityBadgeColor(selectedActivity.severity)}>
                    {selectedActivity.severity}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Entity ID</label>
                  <p className="text-sm font-mono text-xs">{selectedActivity.entityId || 'N/A'}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm mt-1">{selectedActivity.description}</p>
              </div>

              {/* User Information */}
              {selectedActivity.user && (
                <div>
                  <label className="text-sm font-medium text-gray-500">User</label>
                  <div className="mt-1">
                    <p className="text-sm font-medium">{selectedActivity.user.name}</p>
                    <p className="text-sm text-gray-500">{selectedActivity.user.email}</p>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">IP Address</label>
                  <p className="text-sm font-mono">{selectedActivity.ipAddress || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Timestamp</label>
                  <p className="text-sm">{new Date(selectedActivity.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* User Agent */}
              {selectedActivity.userAgent && (
                <div>
                  <label className="text-sm font-medium text-gray-500">User Agent</label>
                  <p className="text-sm font-mono text-xs break-all">{selectedActivity.userAgent}</p>
                </div>
              )}

              {/* Metadata */}
              {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Metadata</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
