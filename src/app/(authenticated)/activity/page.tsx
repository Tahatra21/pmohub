'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Activity,
  User,
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  FolderOpen,
  Package,
  DollarSign,
  Shield,
  CheckSquare
} from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  description?: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  entityDetails?: {
    id: string;
    name?: string;
    title?: string;
    status?: string;
    severity?: string;
    type?: string;
  };
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, [searchTerm, entityFilter, actionFilter, userFilter, dateFrom, dateTo, currentPage]);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(entityFilter && { entity: entityFilter }),
        ...(actionFilter && { action: actionFilter }),
        ...(userFilter && { userId: userFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await fetch(`/api/activity-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data.activityLogs);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'VIEW':
        return <Eye className="h-4 w-4 text-gray-600" />;
      case 'DOWNLOAD':
        return <Download className="h-4 w-4 text-purple-600" />;
      case 'APPROVE':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECT':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'ASSIGN':
        return <User className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'Project':
        return <FolderOpen className="h-4 w-4" />;
      case 'Task':
        return <CheckSquare className="h-4 w-4" />;
      case 'User':
        return <User className="h-4 w-4" />;
      case 'Resource':
        return <Package className="h-4 w-4" />;
      case 'Budget':
        return <DollarSign className="h-4 w-4" />;
      case 'Risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Document':
        return <FileText className="h-4 w-4" />;
      case 'Role':
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'VIEW':
        return 'bg-gray-100 text-gray-800';
      case 'DOWNLOAD':
        return 'bg-purple-100 text-purple-800';
      case 'APPROVE':
        return 'bg-green-100 text-green-800';
      case 'REJECT':
        return 'bg-red-100 text-red-800';
      case 'ASSIGN':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-gray-500">Track all system activities and changes</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
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
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Entities</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="Task">Task</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Resource">Resource</SelectItem>
                <SelectItem value="Budget">Budget</SelectItem>
                <SelectItem value="Risk">Risk</SelectItem>
                <SelectItem value="Document">Document</SelectItem>
                <SelectItem value="Role">Role</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="VIEW">View</SelectItem>
                <SelectItem value="DOWNLOAD">Download</SelectItem>
                <SelectItem value="APPROVE">Approve</SelectItem>
                <SelectItem value="REJECT">Reject</SelectItem>
                <SelectItem value="ASSIGN">Assign</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Activities Timeline */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getActionIcon(activity.action)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge className={getActionColor(activity.action)}>
                      {activity.action}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getEntityIcon(activity.entity)}
                      <span>{activity.entity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{activity.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatRelativeTime(activity.createdAt)}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">{activity.description}</h3>
                    {activity.entityDetails && (
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Entity:</span>
                          <span>{activity.entityDetails.name || activity.entityDetails.title}</span>
                          {activity.entityDetails.status && (
                            <Badge variant="outline" className="text-xs">
                              {activity.entityDetails.status}
                            </Badge>
                          )}
                          {activity.entityDetails.severity && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                activity.entityDetails.severity === 'CRITICAL' ? 'text-red-600 border-red-200' :
                                activity.entityDetails.severity === 'HIGH' ? 'text-orange-600 border-orange-200' :
                                activity.entityDetails.severity === 'MEDIUM' ? 'text-yellow-600 border-yellow-200' :
                                'text-green-600 border-green-200'
                              }`}
                            >
                              {activity.entityDetails.severity}
                            </Badge>
                          )}
                          {activity.entityDetails.type && (
                            <Badge variant="outline" className="text-xs">
                              {activity.entityDetails.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <div className="text-sm text-gray-600 mb-2">Additional Details:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-500 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="font-medium">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-sm text-gray-500">
                  {new Date(activity.createdAt).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {activities.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm || entityFilter || actionFilter || userFilter || dateFrom || dateTo
                ? 'No activities match your current filters.'
                : 'Activity logs will appear here as users interact with the system.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
