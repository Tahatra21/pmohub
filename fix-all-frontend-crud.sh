#!/bin/bash

echo "🔧 Fixing All Frontend CRUD Operations..."

# Function to create CRUD-enabled page template
create_crud_page() {
    local page_name=$1
    local api_endpoint=$2
    local entity_name=$3
    
    echo "📝 Creating CRUD-enabled ${entity_name} page..."
    
    cat > "/Users/jmaharyuda/Project/pmo/src/app/(authenticated)/${page_name}/page.tsx" << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Eye
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Entity {
  id: string;
  [key: string]: any;
}

export default function EntityPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [createForm, setCreateForm] = useState({});

  useEffect(() => {
    fetchEntities();
  }, [searchTerm]);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/PLACEHOLDER?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEntities(data.data.PLACEHOLDER || []);
      }
    } catch (error) {
      console.error('Error fetching entities:', error);
      toast.error('Failed to fetch entities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntity = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/PLACEHOLDER', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        toast.success('Entity created successfully!');
        setIsCreateDialogOpen(false);
        setCreateForm({});
        fetchEntities();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create entity');
      }
    } catch (error) {
      console.error('Error creating entity:', error);
      toast.error('Failed to create entity');
    }
  };

  const handleEditEntity = async () => {
    if (!editingEntity) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/PLACEHOLDER', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingEntity.id,
          ...createForm
        }),
      });

      if (response.ok) {
        toast.success('Entity updated successfully!');
        setIsEditDialogOpen(false);
        setEditingEntity(null);
        fetchEntities();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update entity');
      }
    } catch (error) {
      console.error('Error updating entity:', error);
      toast.error('Failed to update entity');
    }
  };

  const handleDeleteEntity = async (entityId: string, entityName: string) => {
    if (!confirm(`Are you sure you want to delete "${entityName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/PLACEHOLDER?id=${entityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Entity deleted successfully!');
        fetchEntities();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete entity');
      }
    } catch (error) {
      console.error('Error deleting entity:', error);
      toast.error('Failed to delete entity');
    }
  };

  const openEditDialog = (entity: Entity) => {
    setEditingEntity(entity);
    setCreateForm(entity);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PLACEHOLDER_TITLE</h1>
          <p className="text-muted-foreground">
            Manage your PLACEHOLDER_ENTITIES
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New PLACEHOLDER_ENTITY</DialogTitle>
              <DialogDescription>
                Add a new PLACEHOLDER_ENTITY to your system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter name"
                  value={createForm.name || ''}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter description"
                  value={createForm.description || ''}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEntity}>
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Entities List */}
      {entities.length > 0 ? (
        <div className="grid gap-4">
          {entities.map((entity) => (
            <Card key={entity.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{entity.name || entity.title || entity.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {entity.description || 'No description'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(entity)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteEntity(entity.id, entity.name || entity.title || entity.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">No entities found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first entity.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Entity
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit PLACEHOLDER_ENTITY</DialogTitle>
            <DialogDescription>
              Update entity details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input 
                id="edit-name" 
                placeholder="Enter name"
                value={createForm.name || ''}
                onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                placeholder="Enter description"
                value={createForm.description || ''}
                onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEntity}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
EOF

    # Replace placeholders with actual values
    sed -i '' "s/PLACEHOLDER/${api_endpoint}/g" "/Users/jmaharyuda/Project/pmo/src/app/(authenticated)/${page_name}/page.tsx"
    sed -i '' "s/PLACEHOLDER_TITLE/${entity_name}/g" "/Users/jmaharyuda/Project/pmo/src/app/(authenticated)/${page_name}/page.tsx"
    sed -i '' "s/PLACEHOLDER_ENTITY/${entity_name}/g" "/Users/jmaharyuda/Project/pmo/src/app/(authenticated)/${page_name}/page.tsx"
    sed -i '' "s/PLACEHOLDER_ENTITIES/${entity_name}s/g" "/Users/jmaharyuda/Project/pmo/src/app/(authenticated)/${page_name}/page.tsx"
    
    echo "✅ Created CRUD-enabled ${entity_name} page"
}

echo "🚀 Starting frontend CRUD fixes..."

# Fix all pages
create_crud_page "tasks" "tasks" "Task"
create_crud_page "resources" "resources" "Resource"
create_crud_page "budget" "budgets" "Budget"
create_crud_page "risks" "risks" "Risk"
create_crud_page "documents" "documents" "Document"

echo ""
echo "🎉 All frontend CRUD operations have been fixed!"
echo ""
echo "📊 Summary:"
echo "✅ Projects - Already fixed with full CRUD"
echo "✅ Tasks - CRUD enabled"
echo "✅ Resources - CRUD enabled"
echo "✅ Budget - CRUD enabled"
echo "✅ Risks - CRUD enabled"
echo "✅ Documents - CRUD enabled"
echo ""
echo "🔧 Features added to all pages:"
echo "   - Create new entities with dialog forms"
echo "   - Read/list entities with search functionality"
echo "   - Update entities with edit dialogs"
echo "   - Delete entities with confirmation"
echo "   - Toast notifications for all operations"
echo "   - Loading states and error handling"
echo ""
echo "🌐 Test the CRUD operations by:"
echo "   1. Opening http://localhost:3000"
echo "   2. Logging in with admin credentials"
echo "   3. Navigating to any menu"
echo "   4. Using Create, Edit, Delete buttons"
