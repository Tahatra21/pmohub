'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Filter, 
  MoreHorizontal, 
  Calendar, 
  MapPin, 
  User,
  FolderOpen,
  CheckSquare,
  AlertTriangle,
  FileText,
  Edit,
  Trash2,
  Eye,
  Users,
  UserCheck,
  GraduationCap,
  Building,
  Wrench
} from 'lucide-react';
import { TimelineStatusComponent, TimelineWarning, TimelineProgress } from '@/components/ui/timeline-status';
import { TimelineStatus, RiskLevel } from '@/types';
import { getRolePermissions } from '@/lib/permissions';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Extend Window interface for searchTimeout
declare global {
  interface Window {
    searchTimeout?: NodeJS.Timeout;
  }
}

interface Project {
  id: string;
  name: string;
  description?: string;
  type: string;
  client: string;
  location?: string;
  status: string;
  priority: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
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
    task?: {
      id: string;
      title: string;
    };
  }>;
  _count: {
    tasks: number;
    risks: number;
    documents: number;
    resourceAllocations?: number;
  };
  // Timeline tracking fields
  timelineStatus?: TimelineStatus;
  timelineUpdatedAt?: string;
  riskLevel?: RiskLevel;
  delayDays?: number;
  warningThreshold?: number;
  daysRemaining?: number;
  progressPercentage?: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate input state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [progressProject, setProgressProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [resources, setResources] = useState<any[]>([]);
  const [projectTypes, setProjectTypes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to get project type name (all CAPS LOCK)
  const getProjectTypeName = (type: string) => {
    return type.toUpperCase();
  };

  // Load user from token
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        // Use setTimeout to ensure state is updated before setting userLoaded
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
  const [selectedResources, setSelectedResources] = useState<Array<{
    resourceId: string;
    role: string;
    allocationPercentage: number;
  }>>([]);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    type: '',
    client: '',
    location: '',
    priority: 'MEDIUM',
    status: 'PLANNING',
    progress: 0,
    startDate: '',
    endDate: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    type: '',
    client: '',
    location: '',
    priority: 'MEDIUM',
    status: 'PLANNING',
    progress: 0,
    startDate: '',
    endDate: ''
  });
  const [editSelectedResources, setEditSelectedResources] = useState<Array<{
    id?: string; // For existing allocations
    resourceId: string;
    role: string;
    allocationPercentage: number;
  }>>([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProjects();
    }, 800); // Increased debounce to 800ms for better UX

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, typeFilter]);

  // Handle search input changes with immediate UI update but delayed API call
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value); // Update input immediately for responsive UI
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Only update searchTerm (which triggers API call) after debounce
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 800);
  };

  useEffect(() => {
    fetchResources();
    fetchProjectTypes();
    loadUser();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

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
          role: userInfo.role,
          permissions: rolePermissions,
        };
        
        setUser(userWithPermissions);
        setUserLoaded(true);
        console.log('User loaded with permissions:', userWithPermissions);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(typeFilter !== 'ALL' && { type: typeFilter }),
      });

      console.log('Fetching projects with filters:', {
        searchTerm,
        statusFilter,
        typeFilter,
        params: params.toString()
      });

      const response = await fetch(`/api/projects?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/resources', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResources(data.data?.resources || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchProjectTypes = async () => {
    try {
      const response = await fetch('/api/project-types');
      if (response.ok) {
        const data = await response.json();
        setProjectTypes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching project types:', error);
    }
  };

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

  const handleCreateProject = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        const projectData = await response.json();
        const projectId = projectData.data?.id;

        // Create resource allocations if any resources are selected
        if (selectedResources.length > 0 && projectId) {
          for (const resource of selectedResources) {
            try {
              await fetch('/api/resource-allocations', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  resourceId: resource.resourceId,
                  projectId: projectId,
                  role: resource.role,
                  allocationPercentage: resource.allocationPercentage,
                  startDate: createForm.startDate || new Date().toISOString(),
                  endDate: createForm.endDate,
                }),
              });
            } catch (allocationError) {
              console.error('Error creating resource allocation:', allocationError);
              // Continue with other allocations even if one fails
            }
          }
        }

        toast.success('Project created successfully!');
        setIsCreateDialogOpen(false);
        setCreateForm({
          name: '',
          description: '',
          type: '',
          client: '',
          location: '',
          priority: 'MEDIUM',
          status: 'PLANNING',
          progress: 0,
          startDate: '',
          endDate: ''
        });
        setSelectedResources([]);
        fetchProjects();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleEditProject = async () => {
    if (!editingProject) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm
        }),
      });

      if (response.ok) {
        // Handle resource allocations
        if (editSelectedResources.length > 0) {
          // First, get existing allocations to compare
          const existingAllocations = editingProject.resourceAllocations || [];
          
          // Delete allocations that are no longer selected
          for (const existing of existingAllocations) {
            const stillSelected = editSelectedResources.find(sel => sel.id === existing.id);
            if (!stillSelected) {
              try {
                await fetch(`/api/resource-allocations/${existing.id}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
              } catch (deleteError) {
                console.error('Error deleting allocation:', deleteError);
              }
            }
          }
          
          // Update or create allocations
          for (const resource of editSelectedResources) {
            try {
              if (resource.id) {
                // Update existing allocation
                await fetch(`/api/resource-allocations/${resource.id}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    role: resource.role,
                    allocationPercentage: resource.allocationPercentage,
                    startDate: editForm.startDate || new Date().toISOString(),
                    endDate: editForm.endDate,
                  }),
                });
              } else {
                // Create new allocation
                await fetch('/api/resource-allocations', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    resourceId: resource.resourceId,
                    projectId: editingProject.id,
                    role: resource.role,
                    allocationPercentage: resource.allocationPercentage,
                    startDate: editForm.startDate || new Date().toISOString(),
                    endDate: editForm.endDate,
                  }),
                });
              }
            } catch (allocationError) {
              console.error('Error updating resource allocation:', allocationError);
              // Continue with other allocations even if one fails
            }
          }
        } else {
          // Remove all allocations if none are selected
          const existingAllocations = editingProject.resourceAllocations || [];
          for (const existing of existingAllocations) {
            try {
              await fetch(`/api/resource-allocations/${existing.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
            } catch (deleteError) {
              console.error('Error deleting allocation:', deleteError);
            }
          }
        }

        toast.success('Project updated successfully!');
        setIsEditDialogOpen(false);
        setEditingProject(null);
        setEditSelectedResources([]);
        fetchProjects();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Project deleted successfully!');
        fetchProjects();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setEditForm({
      name: project.name,
      description: project.description || '',
      type: project.type,
      client: project.client,
      location: project.location || '',
      priority: project.priority,
      status: project.status,
      progress: project.progress,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : ''
    });
    
    // Load existing resource allocations
    console.log('Loading project for edit:', project);
    console.log('Project resource allocations:', project.resourceAllocations);
    
    if (project.resourceAllocations && project.resourceAllocations.length > 0) {
      const mappedAllocations = project.resourceAllocations.map(allocation => ({
        id: allocation.id,
        resourceId: allocation.resource.id,
        role: allocation.role || '',
        allocationPercentage: allocation.allocationPercentage
      }));
      console.log('Mapped allocations:', mappedAllocations);
      setEditSelectedResources(mappedAllocations);
    } else {
      console.log('No resource allocations found, setting empty array');
      setEditSelectedResources([]);
    }
    
    setIsEditDialogOpen(true);
  };

  const openProgressDialog = (project: Project) => {
    setProgressProject(project);
    setProgressValue(project.progress);
    setIsProgressDialogOpen(true);
  };

  const openViewDialog = (project: Project) => {
    setViewingProject(project);
    setIsViewDialogOpen(true);
  };

  const handleUpdateProgress = async () => {
    if (!progressProject) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/projects/${progressProject.id}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress: progressValue,
        }),
      });

      if (response.ok) {
        toast.success('Project progress updated successfully!');
        setIsProgressDialogOpen(false);
        setProgressProject(null);
        fetchProjects();
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
      case 'PLANNING': return 'bg-yellow-100 text-yellow-800';
      case 'ON_HOLD': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
          <p className="mt-2 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track your electrical and IT projects
          </p>
        </div>
        {user && userLoaded && hasPermission('projects:create') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project to your portfolio. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter project name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter project description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Project Type</Label>
                <Select value={createForm.type} onValueChange={(value) => setCreateForm({...createForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Client</Label>
                <Input 
                  id="client" 
                  placeholder="Enter client name"
                  value={createForm.client}
                  onChange={(e) => setCreateForm({...createForm, client: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="Enter project location"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({...createForm, location: e.target.value})}
                />
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
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Project Status</Label>
                <Select value={createForm.status} onValueChange={(value) => setCreateForm({...createForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label className="text-base font-semibold">Team Members</Label>
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
                
                {selectedResources.length > 0 && (
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
                                <SelectValue placeholder="Select team member" />
                              </SelectTrigger>
                              <SelectContent>
                                {resources.map((res) => (
                                  <SelectItem key={res.id} value={res.id}>
                                    <div className="flex items-center gap-2">
                                      {getResourceTypeIcon(res.type)}
                                      <span>{res.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({res.type.replace('_', ' ')})
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor={`role-${index}`}>Role in Project</Label>
                            <Input 
                              id={`role-${index}`}
                              placeholder="e.g., Project Manager, Lead Developer"
                              value={resource.role}
                              onChange={(e) => updateResource(index, 'role', e.target.value)}
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor={`allocation-${index}`}>
                              Allocation Percentage ({resource.allocationPercentage}%)
                            </Label>
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
                )}
                
                {selectedResources.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No team members assigned yet</p>
                    <p className="text-sm">Click "Add Member" to assign resources to this project</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>
                Create Project
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
                  placeholder="Search projects..."
                  value={searchInput}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
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
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="INFRA NETWORK">INFRA NETWORK</SelectItem>
                <SelectItem value="INFRA CLOUD & DC">INFRA CLOUD & DC</SelectItem>
                <SelectItem value="MULTIMEDIA & IOT">MULTIMEDIA & IOT</SelectItem>
                <SelectItem value="DIGITAL ELECTRICITY">DIGITAL ELECTRICITY</SelectItem>
                <SelectItem value="SAAS BASED">SAAS BASED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openProgressDialog(project)}>
                        <Progress className="h-4 w-4 mr-2" />
                        Update Progress
                      </DropdownMenuItem>
                      {user && userLoaded && hasPermission('projects:update') && (
                        <DropdownMenuItem onClick={() => openEditDialog(project)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {user && userLoaded && hasPermission('projects:all') && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteProject(project.id, project.name)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                  <Badge variant="outline">
                    {getProjectTypeName(project.type)}
                  </Badge>
                  {/* Timeline Status */}
                  {project.timelineStatus && (
                    <TimelineStatusComponent
                      status={project.timelineStatus}
                      riskLevel={project.riskLevel || RiskLevel.LOW}
                      delayDays={project.delayDays}
                      daysRemaining={project.daysRemaining}
                      size="sm"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    {project.creator?.name || 'Unknown Creator'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {project.location || 'No location specified'}
                  </div>
                  {project.startDate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(project.startDate).toLocaleDateString()} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                    </div>
                  )}
                </div>

                {/* Timeline Progress */}
                <TimelineProgress
                  progress={project.progress}
                  daysRemaining={project.daysRemaining || 0}
                  totalDays={project.startDate && project.endDate ? 
                    Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
                  }
                  status={project.timelineStatus || TimelineStatus.ON_TIME}
                />

                {/* Timeline Warning */}
                {project.timelineStatus && (
                  <TimelineWarning
                    status={project.timelineStatus}
                    daysRemaining={project.daysRemaining || 0}
                    delayDays={project.delayDays || 0}
                    projectName={project.name}
                  />
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-4 w-4" />
                      {project._count?.tasks || 0}
                    </div>
                    {user && userLoaded && (hasPermission('resources:read') || hasPermission('projects:all')) && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project._count?.resourceAllocations || 0}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {project._count?.risks || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {project._count?.documents || 0}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openViewDialog(project)}>
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
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {user && userLoaded && hasPermission('projects:create') 
                ? 'Get started by creating your first project.'
                : 'No projects found. Contact your administrator to create projects.'
              }
            </p>
            {user && userLoaded && hasPermission('projects:create') && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Project Name</Label>
              <Input 
                id="edit-name" 
                placeholder="Enter project name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                placeholder="Enter project description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Project Type</Label>
              <Select value={editForm.type} onValueChange={(value) => setEditForm({...editForm, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-client">Client</Label>
              <Input 
                id="edit-client" 
                placeholder="Enter client name"
                value={editForm.client}
                onChange={(e) => setEditForm({...editForm, client: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input 
                id="edit-location" 
                placeholder="Enter project location"
                value={editForm.location}
                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select value={editForm.priority} onValueChange={(value) => setEditForm({...editForm, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Project Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-progress">Progress ({editForm.progress}%)</Label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editForm.progress}
                  onChange={(e) => setEditForm({...editForm, progress: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0%</span>
                  <span>{editForm.progress}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input 
                  id="edit-startDate" 
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input 
                  id="edit-endDate" 
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                />
              </div>

              {/* Resource Allocation Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Team Members</Label>
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
                
                {editSelectedResources && editSelectedResources.length > 0 ? (
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
                                <SelectValue placeholder="Select team member" />
                              </SelectTrigger>
                              <SelectContent>
                                {resources.map((res) => (
                                  <SelectItem key={res.id} value={res.id}>
                                    <div className="flex items-center gap-2">
                                      {getResourceTypeIcon(res.type)}
                                      <span>{res.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({res.type.replace('_', ' ')})
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor={`edit-role-${index}`}>Role in Project</Label>
                            <Input 
                              id={`edit-role-${index}`}
                              placeholder="e.g., Project Manager, Lead Developer"
                              value={resource.role}
                              onChange={(e) => updateEditResource(index, 'role', e.target.value)}
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor={`edit-allocation-${index}`}>
                              Allocation Percentage ({resource.allocationPercentage}%)
                            </Label>
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
                    <p className="text-sm">Click "Add Member" to assign resources to this project</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject}>
              Update Project
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
              Update the progress for {progressProject?.name}
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
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>
              View detailed information about {viewingProject?.name}
            </DialogDescription>
          </DialogHeader>
          {viewingProject && (
            <div className="space-y-6 py-4">
              {/* Project Header */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{viewingProject.name}</h3>
                <p className="text-muted-foreground">{viewingProject.description || 'No description provided'}</p>
              </div>

              {/* Status and Priority */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getStatusColor(viewingProject.status)}>
                    {viewingProject.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Priority:</span>
                  <Badge className={getPriorityColor(viewingProject.priority)}>
                    {viewingProject.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Type:</span>
                  <Badge variant="outline">{viewingProject.type}</Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{viewingProject.progress}%</span>
                </div>
                <Progress value={viewingProject.progress} className="h-3" />
              </div>

              {/* Project Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Client</span>
                    <p className="text-sm">{viewingProject.client}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Location</span>
                    <p className="text-sm">{viewingProject.location || 'No location specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Project Manager</span>
                    <p className="text-sm">{viewingProject.creator.name}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {viewingProject.startDate && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                      <p className="text-sm">{new Date(viewingProject.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {viewingProject.endDate && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">End Date</span>
                      <p className="text-sm">{new Date(viewingProject.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Created</span>
                    <p className="text-sm">{new Date(viewingProject.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Tasks</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">{viewingProject._count.tasks}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Risks</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-500">{viewingProject._count.risks}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Documents</span>
                  </div>
                  <p className="text-2xl font-bold text-green-500">{viewingProject._count.documents}</p>
                </div>
              </div>

              {/* Team Members Detail */}
              {user && userLoaded && (hasPermission('resources:read') || hasPermission('projects:all')) && viewingProject.resourceAllocations && viewingProject.resourceAllocations.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Team Members</h4>
                    <span className="text-sm text-muted-foreground">
                      {viewingProject.resourceAllocations.length} assigned
                    </span>
                  </div>
                  <div className="space-y-3">
                    {viewingProject.resourceAllocations.map((allocation) => (
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
            {viewingProject && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                openEditDialog(viewingProject);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
