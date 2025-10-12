'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  AlertTriangle,
  CheckSquare,
  Users,
  UserCheck,
  GraduationCap,
  Building,
  Wrench
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
  resourceAllocations?: Array<{
    id: string;
    role?: string;
    allocationPercentage: number;
    status: string;
    resource: {
      id: string;
      name: string;
      type: string;
      skills?: string;
      department?: string;
      email?: string;
      phone?: string;
    };
  }>;
  _count?: {
    resourceAllocations: number;
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [progressTask, setProgressTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [resources, setResources] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Load user from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        setUserLoaded(true);
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

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    progress: 0,
    startDate: '',
    endDate: '',
    projectId: '',
    assigneeId: ''
  });
  const [selectedResources, setSelectedResources] = useState<Array<{
    resourceId: string;
    role: string;
    allocationPercentage: number;
  }>>([]);
  const [editSelectedResources, setEditSelectedResources] = useState<Array<{
    id?: string; // For existing allocations
    resourceId: string;
    role: string;
    allocationPercentage: number;
  }>>([]);

  useEffect(() => {
    fetchTasks();
    fetchResources();
  }, [searchTerm, statusFilter, priorityFilter]);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for resources API');
        return;
      }

      console.log('Fetching resources...');
      const response = await fetch('/api/resources', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Resources fetched:', data.data.resources?.length || 0, 'resources');
        setResources(data.data.resources || []);
      } else {
        console.error('Resources API error:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  // Resource management functions
  const addResource = () => {
    setSelectedResources([...selectedResources, {
      resourceId: '',
      role: '',
      allocationPercentage: 100
    }]);
  };

  const removeResource = (index: number) => {
    setSelectedResources(selectedResources.filter((_, i) => i !== index));
  };

  const updateResource = (index: number, field: string, value: any) => {
    const updated = [...selectedResources];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedResources(updated);
  };

  const addEditResource = () => {
    setEditSelectedResources([...editSelectedResources, {
      resourceId: '',
      role: '',
      allocationPercentage: 100
    }]);
  };

  const removeEditResource = (index: number) => {
    setEditSelectedResources(editSelectedResources.filter((_, i) => i !== index));
  };

  const updateEditResource = (index: number, field: string, value: any) => {
    const updated = [...editSelectedResources];
    updated[index] = { ...updated[index], [field]: value };
    setEditSelectedResources(updated);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(priorityFilter !== 'ALL' && { priority: priorityFilter }),
      });

      const response = await fetch(`/api/tasks?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        const taskData = await response.json();
        
        // Create resource allocations for the task
        if (selectedResources.length > 0) {
          for (const resource of selectedResources) {
            if (resource.resourceId && resource.role) {
              try {
                await fetch('/api/resource-allocations', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    resourceId: resource.resourceId,
                    taskId: taskData.data.id,
                    role: resource.role,
                    allocationPercentage: resource.allocationPercentage,
                  }),
                });
              } catch (allocationError) {
                console.error('Error creating resource allocation:', allocationError);
                // Continue with other allocations even if one fails
              }
            }
          }
        }

        toast.success('Task created successfully!');
        setIsCreateDialogOpen(false);
        setCreateForm({
          title: '',
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
          progress: 0,
          startDate: '',
          endDate: '',
          projectId: '',
          assigneeId: ''
        });
        setSelectedResources([]);
        fetchTasks();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleEditTask = async () => {
    if (!editingTask) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createForm
        }),
      });

      if (response.ok) {
        // Update resource allocations
        if (editSelectedResources.length > 0) {
          // First, delete existing allocations for this task
          try {
            const existingAllocations = await fetch(`/api/resource-allocations?taskId=${editingTask.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (existingAllocations.ok) {
              const existingData = await existingAllocations.json();
              const allocations = existingData.data.allocations || [];
              
              // Delete existing allocations
              for (const allocation of allocations) {
                await fetch(`/api/resource-allocations/${allocation.id}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
              }
            }
          } catch (deleteError) {
            console.error('Error deleting existing allocations:', deleteError);
          }

          // Create new allocations
          for (const resource of editSelectedResources) {
            if (resource.resourceId && resource.role) {
              try {
                await fetch('/api/resource-allocations', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    resourceId: resource.resourceId,
                    taskId: editingTask.id,
                    role: resource.role,
                    allocationPercentage: resource.allocationPercentage,
                  }),
                });
              } catch (allocationError) {
                console.error('Error creating resource allocation:', allocationError);
                // Continue with other allocations even if one fails
              }
            }
          }
        }

        toast.success('Task updated successfully!');
        setIsEditDialogOpen(false);
        setEditingTask(null);
        setEditSelectedResources([]);
        fetchTasks();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Task deleted successfully!');
        fetchTasks();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const openEditDialog = async (task: Task) => {
    setEditingTask(task);
    setCreateForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      progress: task.progress,
      startDate: task.startDate ? task.startDate.split('T')[0] : '',
      endDate: task.endDate ? task.endDate.split('T')[0] : '',
      projectId: task.project.id,
      assigneeId: task.assignee?.id || ''
    });

    // Load existing resource allocations for this task
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`/api/resource-allocations?taskId=${task.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const allocations = data.data.allocations || [];
          setEditSelectedResources(allocations.map((allocation: any) => ({
            id: allocation.id,
            resourceId: allocation.resourceId,
            role: allocation.role,
            allocationPercentage: allocation.allocationPercentage,
          })));
        }
      }
    } catch (error) {
      console.error('Error loading resource allocations:', error);
      setEditSelectedResources([]);
    }

    setIsEditDialogOpen(true);
  };

  const openProgressDialog = (task: Task) => {
    setProgressTask(task);
    setProgressValue(task.progress);
    setIsProgressDialogOpen(true);
  };

  const openViewDialog = (task: Task) => {
    setViewingTask(task);
    setIsViewDialogOpen(true);
  };

  const handleUpdateProgress = async () => {
    if (!progressTask) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/tasks/${progressTask.id}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress: progressValue,
          status: progressValue === 100 ? 'COMPLETED' : progressValue > 0 ? 'IN_PROGRESS' : 'TODO'
        }),
      });

      if (response.ok) {
        toast.success('Task progress updated successfully!');
        setIsProgressDialogOpen(false);
        setProgressTask(null);
        fetchTasks();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'TODO': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'PROJECT_MANAGER': return <UserCheck className="h-3 w-3" />;
      case 'FIELD_ENGINEER': return <Users className="h-3 w-3" />;
      case 'IT_DEVELOPER': return <User className="h-3 w-3" />;
      case 'TECHNICAL_TEAM': return <GraduationCap className="h-3 w-3" />;
      case 'CLIENT_STAKEHOLDER': return <Building className="h-3 w-3" />;
      default: return <Wrench className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your project tasks
          </p>
        </div>
        {user && userLoaded && hasPermission('tasks:all') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input 
                  id="title" 
                  placeholder="Enter task title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter task description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={createForm.status} onValueChange={(value) => setCreateForm({...createForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={createForm.priority} onValueChange={(value) => setCreateForm({...createForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="progress">Initial Progress ({createForm.progress}%)</Label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={createForm.progress}
                    onChange={(e) => setCreateForm({...createForm, progress: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0%</span>
                    <span>{createForm.progress}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({...createForm, startDate: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({...createForm, endDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Resource Allocation Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Team Members ({resources.length} available)</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addResource}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                
                {selectedResources.length > 0 ? (
                  <div className="space-y-3">
                    {selectedResources.map((resource, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Team Member {index + 1}</span>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeResource(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor={`resource-${index}`}>Select Resource</Label>
                            <Select 
                              value={resource.resourceId} 
                              onValueChange={(value) => updateResource(index, 'resourceId', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a team member" />
                              </SelectTrigger>
                              <SelectContent>
                                {resources.map((res) => (
                                  <SelectItem key={res.id} value={res.id}>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        {(res.type === 'FIELD_ENGINEER' || res.type === 'ENGINEER') && <Wrench className="h-4 w-4" />}
                                        {(res.type === 'PROJECT_MANAGER' || res.type === 'MANAGER') && <UserCheck className="h-4 w-4" />}
                                        {(res.type === 'IT_DEVELOPER' || res.type === 'DEVELOPER') && <GraduationCap className="h-4 w-4" />}
                                        {(res.type === 'TECHNICAL_TEAM' || res.type === 'ADMIN') && <Building className="h-4 w-4" />}
                                      </div>
                                      <span>{res.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {res.type}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor={`role-${index}`}>Role in Task</Label>
                            <Input 
                              id={`role-${index}`}
                              placeholder="e.g., Lead Developer, QA Tester"
                              value={resource.role}
                              onChange={(e) => updateResource(index, 'role', e.target.value)}
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor={`allocation-${index}`}>Allocation ({resource.allocationPercentage}%)</Label>
                            <div className="space-y-2">
                              <input
                                type="range"
                                min="1"
                                max="100"
                                value={resource.allocationPercentage}
                                onChange={(e) => updateResource(index, 'allocationPercentage', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>1%</span>
                                <span>{resource.allocationPercentage}%</span>
                                <span>100%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No team members assigned yet</p>
                    <p className="text-sm">Click "Add Member" to assign resources to this task</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                Create Task
              </Button>
            </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      {tasks.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {task.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openProgressDialog(task)}>
                        <Progress className="h-4 w-4 mr-2" />
                        Update Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(task)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteTask(task.id, task.title)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckSquare className="h-4 w-4 mr-2" />
                    {task.project.name}
                  </div>
                  {task.assignee && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      {task.assignee.name}
                    </div>
                  )}
                  {task.startDate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(task.startDate).toLocaleDateString()} - {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'Ongoing'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>

                {/* Assigned Team - Simple Display */}
                {user && userLoaded && (hasPermission('resources:read') || hasPermission('tasks:all')) && task.resourceAllocations && task.resourceAllocations.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Assigned Team</span>
                    <span className="text-muted-foreground">{task.resourceAllocations.length} member(s)</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {user && userLoaded && (hasPermission('resources:read') || hasPermission('tasks:all')) && task.resourceAllocations && task.resourceAllocations.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {task.resourceAllocations.length}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openViewDialog(task)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {user && userLoaded && hasPermission('tasks:all') 
                ? 'Get started by creating your first task.'
                : 'No tasks found. Contact your administrator to create tasks.'
              }
            </p>
            {user && userLoaded && hasPermission('tasks:all') && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Task Title</Label>
              <Input 
                id="edit-title" 
                placeholder="Enter task title"
                value={createForm.title}
                onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                placeholder="Enter task description"
                value={createForm.description}
                onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={createForm.status} onValueChange={(value) => setCreateForm({...createForm, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select value={createForm.priority} onValueChange={(value) => setCreateForm({...createForm, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-progress">Progress ({createForm.progress}%)</Label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={createForm.progress}
                  onChange={(e) => setCreateForm({...createForm, progress: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0%</span>
                  <span>{createForm.progress}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Resource Allocation Section for Edit */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Team Members ({resources.length} available)</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addEditResource}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                
                {editSelectedResources.length > 0 ? (
                  <div className="space-y-3">
                    {editSelectedResources.map((resource, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Team Member {index + 1}</span>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeEditResource(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor={`edit-resource-${index}`}>Select Resource</Label>
                            <Select 
                              value={resource.resourceId} 
                              onValueChange={(value) => updateEditResource(index, 'resourceId', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a team member" />
                              </SelectTrigger>
                              <SelectContent>
                                {resources.map((res) => (
                                  <SelectItem key={res.id} value={res.id}>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        {(res.type === 'FIELD_ENGINEER' || res.type === 'ENGINEER') && <Wrench className="h-4 w-4" />}
                                        {(res.type === 'PROJECT_MANAGER' || res.type === 'MANAGER') && <UserCheck className="h-4 w-4" />}
                                        {(res.type === 'IT_DEVELOPER' || res.type === 'DEVELOPER') && <GraduationCap className="h-4 w-4" />}
                                        {(res.type === 'TECHNICAL_TEAM' || res.type === 'ADMIN') && <Building className="h-4 w-4" />}
                                      </div>
                                      <span>{res.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {res.type}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor={`edit-role-${index}`}>Role in Task</Label>
                            <Input 
                              id={`edit-role-${index}`}
                              placeholder="e.g., Lead Developer, QA Tester"
                              value={resource.role}
                              onChange={(e) => updateEditResource(index, 'role', e.target.value)}
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor={`edit-allocation-${index}`}>Allocation ({resource.allocationPercentage}%)</Label>
                            <div className="space-y-2">
                              <input
                                type="range"
                                min="1"
                                max="100"
                                value={resource.allocationPercentage}
                                onChange={(e) => updateEditResource(index, 'allocationPercentage', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>1%</span>
                                <span>{resource.allocationPercentage}%</span>
                                <span>100%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No team members assigned yet</p>
                    <p className="text-sm">Click "Add Member" to assign resources to this task</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask}>
              Update Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Update Dialog */}
      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>
              Update the progress for {progressTask?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="progress">Progress ({progressValue}%)</Label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0%</span>
                  <span>{progressValue}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm">{progressValue}%</span>
                </div>
                <Progress value={progressValue} className="h-2 mt-2" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProgress}>
              Update Progress
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>
              View detailed information about {viewingTask?.title}
            </DialogDescription>
          </DialogHeader>
          {viewingTask && (
            <div className="space-y-6 py-4">
              {/* Task Header */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{viewingTask.title}</h3>
                <p className="text-muted-foreground">{viewingTask.description || 'No description provided'}</p>
              </div>

              {/* Status and Priority */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getStatusColor(viewingTask.status)}>
                    {viewingTask.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Priority:</span>
                  <Badge className={getPriorityColor(viewingTask.priority)}>
                    {viewingTask.priority}
                  </Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{viewingTask.progress}%</span>
                </div>
                <Progress value={viewingTask.progress} className="h-3" />
              </div>

              {/* Task Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Project</span>
                    <p className="text-sm">{viewingTask.project.name}</p>
                  </div>
                  {viewingTask.assignee && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Assignee</span>
                      <p className="text-sm">{viewingTask.assignee.name}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Created by</span>
                    <p className="text-sm">{viewingTask.creator.name}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {viewingTask.startDate && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                      <p className="text-sm">{new Date(viewingTask.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {viewingTask.endDate && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Due Date</span>
                      <p className="text-sm">{new Date(viewingTask.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Created</span>
                    <p className="text-sm">{new Date(viewingTask.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Assigned Team Detail */}
              {user && userLoaded && (hasPermission('resources:read') || hasPermission('tasks:all')) && viewingTask.resourceAllocations && viewingTask.resourceAllocations.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Assigned Team</h4>
                    <span className="text-sm text-muted-foreground">
                      {viewingTask.resourceAllocations.length} member(s)
                    </span>
                  </div>
                  <div className="space-y-3">
                    {viewingTask.resourceAllocations.map((allocation) => (
                      <div key={allocation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getResourceTypeIcon(allocation.resource.type)}
                          <div>
                            <p className="font-medium">{allocation.resource.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {allocation.role || allocation.resource.type.replace('_', ' ')}
                              </Badge>
                              {allocation.resource.department && (
                                <span className="text-xs text-muted-foreground">
                                  {allocation.resource.department}
                                </span>
                              )}
                            </div>
                            {allocation.resource.skills && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {allocation.resource.skills}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">{allocation.allocationPercentage}%</p>
                          <p className="text-xs text-muted-foreground">allocation</p>
                          {allocation.resource.email && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {allocation.resource.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {viewingTask && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                openEditDialog(viewingTask);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
