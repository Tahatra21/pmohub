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
  Users,
  UserCheck,
  UserX,
  User,
  Phone,
  Mail,
  Building,
  GraduationCap,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Resource {
  id: string;
  userId: string;
  name: string;
  type: 'PROJECT_MANAGER' | 'FIELD_ENGINEER' | 'IT_DEVELOPER' | 'TECHNICAL_TEAM' | 'CLIENT_STAKEHOLDER';
  description?: string;
  status: 'AVAILABLE' | 'ALLOCATED' | 'BUSY' | 'ON_LEAVE';
  skills?: string;
  department?: string;
  phone?: string;
  email?: string;
  maxProjects: number;
  hourlyRate?: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
  creator: {
    id: string;
    name: string;
  };
  currentProjects: number;
  totalAllocationPercentage: number;
  isOverAllocated: boolean;
  isAtCapacity: boolean;
  utilizationRate: number;
  allocations: Array<{
    id: string;
    allocationPercentage: number;
    status: string;
    role?: string;
    task?: { title: string };
    project: { name: string };
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false);
  
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [allocatingResource, setAllocatingResource] = useState<Resource | null>(null);
  
  const [createForm, setCreateForm] = useState({
    userId: '',
    name: '',
    type: 'TECHNICAL_TEAM' as const,
    description: '',
    skills: '',
    department: '',
    phone: '',
    email: '',
    maxProjects: 3,
    hourlyRate: 0,
  });

  const [allocateForm, setAllocateForm] = useState({
    projectId: '',
    taskId: '',
    role: '',
    allocationPercentage: 100,
    notes: '',
  });

  useEffect(() => {
    fetchResources();
    fetchProjects();
    fetchUsers();
  }, [searchTerm, typeFilter, statusFilter]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'ALL' && { type: typeFilter }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      });

      const response = await fetch(`/api/resources?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setResources(data.data.resources || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/projects?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/users?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateResource = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createForm,
          maxProjects: Number(createForm.maxProjects),
          hourlyRate: Number(createForm.hourlyRate),
        }),
      });

      if (response.ok) {
        toast.success('Person added successfully');
        setIsCreateDialogOpen(false);
        setCreateForm({
          userId: '',
          name: '',
          type: 'TECHNICAL_TEAM',
          description: '',
          skills: '',
          department: '',
          phone: '',
          email: '',
          maxProjects: 3,
          hourlyRate: 0,
        });
        fetchResources();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add person');
      }
    } catch (error) {
      console.error('Error creating resource:', error);
      toast.error('Failed to add person');
    }
  };

  const handleEditResource = async () => {
    if (!editingResource) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/resources', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingResource.id,
          ...createForm,
          maxProjects: Number(createForm.maxProjects),
          hourlyRate: Number(createForm.hourlyRate),
        }),
      });

      if (response.ok) {
        toast.success('Person updated successfully');
        setIsEditDialogOpen(false);
        setEditingResource(null);
        fetchResources();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update person');
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update person');
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to remove this person from the resource pool?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/resources?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Person removed successfully');
        fetchResources();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove person');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to remove person');
    }
  };

  const handleAllocateResource = async () => {
    if (!allocatingResource) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/resource-allocations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: allocatingResource.id,
          ...allocateForm,
          allocationPercentage: Number(allocateForm.allocationPercentage),
        }),
      });

      if (response.ok) {
        toast.success('Person allocated successfully');
        setIsAllocateDialogOpen(false);
        setAllocatingResource(null);
        setAllocateForm({
          projectId: '',
          taskId: '',
          role: '',
          allocationPercentage: 100,
          notes: '',
        });
        fetchResources();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to allocate person');
      }
    } catch (error) {
      console.error('Error allocating resource:', error);
      toast.error('Failed to allocate person');
    }
  };

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource);
    setCreateForm({
      userId: resource.userId,
      name: resource.name,
      type: resource.type,
      description: resource.description || '',
      skills: resource.skills || '',
      department: resource.department || '',
      phone: resource.phone || '',
      email: resource.email || '',
      maxProjects: resource.maxProjects,
      hourlyRate: resource.hourlyRate || 0,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (resource: Resource) => {
    setViewingResource(resource);
    setIsViewDialogOpen(true);
  };

  const openAllocateDialog = (resource: Resource) => {
    setAllocatingResource(resource);
    setIsAllocateDialogOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PROJECT_MANAGER': return <UserCheck className="h-4 w-4" />;
      case 'FIELD_ENGINEER': return <Users className="h-4 w-4" />;
      case 'IT_DEVELOPER': return <User className="h-4 w-4" />;
      case 'TECHNICAL_TEAM': return <GraduationCap className="h-4 w-4" />;
      case 'CLIENT_STAKEHOLDER': return <Building className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'ALLOCATED': return 'bg-blue-100 text-blue-800';
      case 'BUSY': return 'bg-yellow-100 text-yellow-800';
      case 'ON_LEAVE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationColor = (rate: number, isOverAllocated: boolean) => {
    if (isOverAllocated) return 'text-red-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-green-600';
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
          <h1 className="text-3xl font-bold tracking-tight">Person in Charge (PIC) Management</h1>
          <p className="text-gray-500">Manage and allocate team members to projects and tasks</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Person to Resource Pool</DialogTitle>
              <DialogDescription>
                Add a team member to the resource pool for project allocation
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user">Select User *</Label>
                  <Select value={createForm.userId} onValueChange={(value) => {
                    const user = users.find(u => u.id === value);
                    setCreateForm({ 
                      ...createForm, 
                      userId: value,
                      name: user?.name || '',
                      email: user?.email || ''
                    });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Role Type *</Label>
                  <Select value={createForm.type} onValueChange={(value: any) => setCreateForm({ ...createForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                      <SelectItem value="FIELD_ENGINEER">Field Engineer</SelectItem>
                      <SelectItem value="IT_DEVELOPER">IT Developer</SelectItem>
                      <SelectItem value="TECHNICAL_TEAM">Technical Team</SelectItem>
                      <SelectItem value="CLIENT_STAKEHOLDER">Client Stakeholder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Additional information about this person"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="skills">Skills/Expertise</Label>
                  <Input
                    id="skills"
                    value={createForm.skills}
                    onChange={(e) => setCreateForm({ ...createForm, skills: e.target.value })}
                    placeholder="e.g., React, Node.js, Project Management"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    placeholder="Department or team"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="Contact phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="Contact email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxProjects">Max Concurrent Projects</Label>
                  <Input
                    id="maxProjects"
                    type="number"
                    min="1"
                    max="10"
                    value={createForm.maxProjects}
                    onChange={(e) => setCreateForm({ ...createForm, maxProjects: Number(e.target.value) })}
                    placeholder="3"
                  />
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    value={createForm.hourlyRate}
                    onChange={(e) => setCreateForm({ ...createForm, hourlyRate: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateResource}>
                Add Person
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, skills, department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type">Role Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                  <SelectItem value="FIELD_ENGINEER">Field Engineer</SelectItem>
                  <SelectItem value="IT_DEVELOPER">IT Developer</SelectItem>
                  <SelectItem value="TECHNICAL_TEAM">Technical Team</SelectItem>
                  <SelectItem value="CLIENT_STAKEHOLDER">Client Stakeholder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="ALLOCATED">Allocated</SelectItem>
                  <SelectItem value="BUSY">Busy</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(resource.type)}
                  <CardTitle className="text-lg">{resource.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openViewDialog(resource)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(resource)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openAllocateDialog(resource)}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Allocate to Project
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteResource(resource.id)}
                      className="text-red-600"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="capitalize">
                  {resource.type.replace('_', ' ').toLowerCase()}
                </Badge>
                <Badge className={getStatusColor(resource.status)}>
                  {resource.status.replace('_', ' ')}
                </Badge>
                {resource.isOverAllocated && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Over-allocated
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resource.description && (
                <p className="text-sm text-gray-600">{resource.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Current Projects:</span>
                  <p className={resource.isAtCapacity ? 'text-red-600' : ''}>
                    {resource.currentProjects} / {resource.maxProjects}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Allocation:</span>
                  <p className={resource.isOverAllocated ? 'text-red-600' : ''}>
                    {resource.totalAllocationPercentage}%
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Utilization</span>
                  <span className={getUtilizationColor(resource.utilizationRate, resource.isOverAllocated)}>
                    {resource.utilizationRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={Math.min(resource.utilizationRate, 100)} className="h-2" />
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {resource.skills && (
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>{resource.skills}</span>
                  </div>
                )}
                {resource.department && (
                  <div className="flex items-center space-x-1">
                    <Building className="h-3 w-3" />
                    <span>{resource.department}</span>
                  </div>
                )}
                {resource.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{resource.phone}</span>
                  </div>
                )}
                {resource.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>{resource.email}</span>
                  </div>
                )}
                {resource.hourlyRate && resource.hourlyRate > 0 && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${resource.hourlyRate}/hour</span>
                  </div>
                )}
              </div>

              {resource.allocations.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium">Current Allocations:</span>
                  <div className="space-y-1 mt-1">
                    {resource.allocations.slice(0, 2).map((allocation) => (
                      <div key={allocation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <span>{allocation.project.name}</span>
                        <span>{allocation.allocationPercentage}%</span>
                      </div>
                    ))}
                    {resource.allocations.length > 2 && (
                      <p className="text-xs text-gray-500">+{resource.allocations.length - 2} more...</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {resources.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
            <p className="text-gray-500 mb-4">
              Get started by adding team members to the resource pool.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Person Details</DialogTitle>
            <DialogDescription>
              Update person information and allocation settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Person's name"
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Role Type *</Label>
                <Select value={createForm.type} onValueChange={(value: any) => setCreateForm({ ...createForm, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                    <SelectItem value="FIELD_ENGINEER">Field Engineer</SelectItem>
                    <SelectItem value="IT_DEVELOPER">IT Developer</SelectItem>
                    <SelectItem value="TECHNICAL_TEAM">Technical Team</SelectItem>
                    <SelectItem value="CLIENT_STAKEHOLDER">Client Stakeholder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Additional information"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-skills">Skills/Expertise</Label>
                <Input
                  id="edit-skills"
                  value={createForm.skills}
                  onChange={(e) => setCreateForm({ ...createForm, skills: e.target.value })}
                  placeholder="Skills and expertise"
                />
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={createForm.department}
                  onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                  placeholder="Department"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-maxProjects">Max Concurrent Projects</Label>
                <Input
                  id="edit-maxProjects"
                  type="number"
                  min="1"
                  max="10"
                  value={createForm.maxProjects}
                  onChange={(e) => setCreateForm({ ...createForm, maxProjects: Number(e.target.value) })}
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="edit-hourlyRate">Hourly Rate</Label>
                <Input
                  id="edit-hourlyRate"
                  type="number"
                  min="0"
                  value={createForm.hourlyRate}
                  onChange={(e) => setCreateForm({ ...createForm, hourlyRate: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditResource}>
              Update Person
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {viewingResource && getTypeIcon(viewingResource.type)}
              <span>{viewingResource?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Person details and allocation history
            </DialogDescription>
          </DialogHeader>
          {viewingResource && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Role Type</Label>
                  <p className="capitalize">{viewingResource.type.replace('_', ' ').toLowerCase()}</p>
                </div>
                <div>
                  <Label className="font-medium">Status</Label>
                  <Badge className={getStatusColor(viewingResource.status)}>
                    {viewingResource.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {viewingResource.description && (
                <div>
                  <Label className="font-medium">Description</Label>
                  <p className="text-gray-600">{viewingResource.description}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="font-medium">Current Projects</Label>
                  <p className="text-lg font-semibold">
                    {viewingResource.currentProjects} / {viewingResource.maxProjects}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Total Allocation</Label>
                  <p className={`text-lg font-semibold ${viewingResource.isOverAllocated ? 'text-red-600' : ''}`}>
                    {viewingResource.totalAllocationPercentage}%
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Utilization</Label>
                  <p className="text-lg font-semibold">
                    {viewingResource.utilizationRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Utilization Rate</Label>
                <div className="flex items-center space-x-2">
                  <Progress value={Math.min(viewingResource.utilizationRate, 100)} className="flex-1" />
                  <span className={`font-semibold ${getUtilizationColor(viewingResource.utilizationRate, viewingResource.isOverAllocated)}`}>
                    {viewingResource.utilizationRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {(viewingResource.skills || viewingResource.department) && (
                <div className="grid grid-cols-2 gap-4">
                  {viewingResource.skills && (
                    <div>
                      <Label className="font-medium">Skills/Expertise</Label>
                      <p className="text-gray-600">{viewingResource.skills}</p>
                    </div>
                  )}
                  {viewingResource.department && (
                    <div>
                      <Label className="font-medium">Department</Label>
                      <p className="text-gray-600">{viewingResource.department}</p>
                    </div>
                  )}
                </div>
              )}

              {(viewingResource.phone || viewingResource.email) && (
                <div className="grid grid-cols-2 gap-4">
                  {viewingResource.phone && (
                    <div>
                      <Label className="font-medium">Phone</Label>
                      <p className="text-gray-600">{viewingResource.phone}</p>
                    </div>
                  )}
                  {viewingResource.email && (
                    <div>
                      <Label className="font-medium">Email</Label>
                      <p className="text-gray-600">{viewingResource.email}</p>
                    </div>
                  )}
                </div>
              )}

              {viewingResource.hourlyRate && viewingResource.hourlyRate > 0 && (
                <div>
                  <Label className="font-medium">Hourly Rate</Label>
                  <p className="text-gray-600">${viewingResource.hourlyRate} / hour</p>
                </div>
              )}

              <div>
                <Label className="font-medium">Added by</Label>
                <p className="text-gray-600">{viewingResource.creator.name}</p>
              </div>

              {viewingResource.allocations.length > 0 && (
                <div>
                  <Label className="font-medium">Current Allocations</Label>
                  <div className="space-y-2">
                    {viewingResource.allocations.map((allocation) => (
                      <div key={allocation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{allocation.project.name}</p>
                          {allocation.role && <p className="text-sm text-gray-600">{allocation.role}</p>}
                          {allocation.task && <p className="text-sm text-gray-600">Task: {allocation.task.title}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{allocation.allocationPercentage}%</p>
                          <Badge variant="outline">{allocation.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              if (viewingResource) {
                openEditDialog(viewingResource);
              }
            }}>
              Edit Person
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Allocate Dialog */}
      <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Allocate Person to Project</DialogTitle>
            <DialogDescription>
              Allocate {allocatingResource?.name} to a project or task
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="allocate-project">Project *</Label>
              <Select value={allocateForm.projectId} onValueChange={(value) => setAllocateForm({ ...allocateForm, projectId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="allocate-role">Role in Project</Label>
              <Input
                id="allocate-role"
                value={allocateForm.role}
                onChange={(e) => setAllocateForm({ ...allocateForm, role: e.target.value })}
                placeholder="e.g., Lead Developer, Site Supervisor"
              />
            </div>
            <div>
              <Label htmlFor="allocate-percentage">Allocation Percentage *</Label>
              <Input
                id="allocate-percentage"
                type="number"
                min="1"
                max="100"
                value={allocateForm.allocationPercentage}
                onChange={(e) => setAllocateForm({ ...allocateForm, allocationPercentage: Number(e.target.value) })}
                placeholder="100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Percentage of time allocated to this project (1-100%)
              </p>
            </div>
            <div>
              <Label htmlFor="allocate-notes">Notes</Label>
              <Textarea
                id="allocate-notes"
                value={allocateForm.notes}
                onChange={(e) => setAllocateForm({ ...allocateForm, notes: e.target.value })}
                placeholder="Additional notes about this allocation"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAllocateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAllocateResource}>
              Allocate Person
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}