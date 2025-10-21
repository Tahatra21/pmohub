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
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Building,
  Calendar,
  FileText
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Budget } from '@/types';

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [costCenterFilter, setCostCenterFilter] = useState('ALL');
  const [kategoriFilter, setKategoriFilter] = useState('ALL');
  const [tahunFilter, setTahunFilter] = useState('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [viewingBudget, setViewingBudget] = useState<Budget | null>(null);
  const [createForm, setCreateForm] = useState({
    costCenter: '',
    manager: '',
    prkNumber: '',
    prkName: '',
    kategoriBeban: '',
    coaNumber: '',
    anggaranTersedia: 0,
    nilaiPo: 0,
    nilaiNonPo: 0,
    totalSpr: 0,
    totalPenyerapan: 0,
    tahun: new Date().getFullYear(),
    projectId: '',
    taskId: '',
    budgetType: 'PROJECT' as 'PROJECT' | 'TASK' | 'GENERAL'
  });

  useEffect(() => {
    fetchBudgets();
  }, [searchTerm, costCenterFilter, kategoriFilter, tahunFilter]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(costCenterFilter !== 'ALL' && { costCenter: costCenterFilter }),
        ...(kategoriFilter !== 'ALL' && { kategoriBeban: kategoriFilter }),
        ...(tahunFilter !== 'ALL' && { tahun: tahunFilter }),
      });

      const response = await fetch(`/api/budgets?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBudgets(data.data.budgets || []);
      } else {
        console.error('Failed to fetch budgets');
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        toast.success('Budget created successfully!');
        setIsCreateDialogOpen(false);
        setCreateForm({
          costCenter: '',
          manager: '',
          prkNumber: '',
          prkName: '',
          kategoriBeban: '',
          coaNumber: '',
          anggaranTersedia: 0,
          nilaiPo: 0,
          nilaiNonPo: 0,
          totalSpr: 0,
          totalPenyerapan: 0,
          tahun: new Date().getFullYear(),
          projectId: ''
        });
        fetchBudgets();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create budget');
      }
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    }
  };

  const handleEditBudget = async () => {
    if (!editingBudget) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/budgets', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingBudget.id,
          ...createForm
        }),
      });

      if (response.ok) {
        toast.success('Budget updated successfully!');
        setIsEditDialogOpen(false);
        setEditingBudget(null);
        fetchBudgets();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update budget');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    }
  };

  const handleDeleteBudget = async (budgetId: string, prkName: string) => {
    if (!confirm(`Are you sure you want to delete "${prkName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/budgets?id=${budgetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Budget deleted successfully!');
        fetchBudgets();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget);
    setCreateForm({
      costCenter: budget.costCenter,
      manager: budget.manager,
      prkNumber: budget.prkNumber,
      prkName: budget.prkName,
      kategoriBeban: budget.kategoriBeban,
      coaNumber: budget.coaNumber,
      anggaranTersedia: budget.anggaranTersedia,
      nilaiPo: budget.nilaiPo,
      nilaiNonPo: budget.nilaiNonPo,
      totalSpr: budget.totalSpr,
      totalPenyerapan: budget.totalPenyerapan,
      tahun: budget.tahun,
      projectId: budget.projectId || ''
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (budget: Budget) => {
    setViewingBudget(budget);
    setIsViewDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUniqueValues = (key: keyof Budget) => {
    const values = budgets.map(budget => budget[key]).filter(Boolean);
    return [...new Set(values)];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600 mt-1">Manage project budgets and financial tracking</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>
                Add a new budget entry to track project finances.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="costCenter">Cost Center</Label>
                  <Input 
                    id="costCenter" 
                    placeholder="e.g., I0326"
                    value={createForm.costCenter}
                    onChange={(e) => setCreateForm({...createForm, costCenter: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Input 
                    id="manager" 
                    placeholder="Manager name"
                    value={createForm.manager}
                    onChange={(e) => setCreateForm({...createForm, manager: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="prkNumber">PRK Number</Label>
                  <Input 
                    id="prkNumber" 
                    placeholder="e.g., IC00472022"
                    value={createForm.prkNumber}
                    onChange={(e) => setCreateForm({...createForm, prkNumber: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tahun">Tahun</Label>
                  <Input 
                    id="tahun" 
                    type="number"
                    placeholder="2025"
                    value={createForm.tahun}
                    onChange={(e) => setCreateForm({...createForm, tahun: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prkName">PRK Name</Label>
                <Input 
                  id="prkName" 
                  placeholder="Project name"
                  value={createForm.prkName}
                  onChange={(e) => setCreateForm({...createForm, prkName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="kategoriBeban">Kategori Beban</Label>
                  <Select value={createForm.kategoriBeban} onValueChange={(value) => setCreateForm({...createForm, kategoriBeban: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Produksi Langsung">Produksi Langsung</SelectItem>
                      <SelectItem value="Pemasaran">Pemasaran</SelectItem>
                      <SelectItem value="Administrasi">Administrasi</SelectItem>
                      <SelectItem value="Operasional">Operasional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="coaNumber">COA Number</Label>
                  <Input 
                    id="coaNumber" 
                    placeholder="e.g., 5111110003"
                    value={createForm.coaNumber}
                    onChange={(e) => setCreateForm({...createForm, coaNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="anggaranTersedia">Anggaran Tersedia</Label>
                  <Input 
                    id="anggaranTersedia" 
                    type="number"
                    placeholder="0"
                    value={createForm.anggaranTersedia}
                    onChange={(e) => setCreateForm({...createForm, anggaranTersedia: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nilaiPo">Nilai PO</Label>
                  <Input 
                    id="nilaiPo" 
                    type="number"
                    placeholder="0"
                    value={createForm.nilaiPo}
                    onChange={(e) => setCreateForm({...createForm, nilaiPo: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nilaiNonPo">Nilai Non PO</Label>
                  <Input 
                    id="nilaiNonPo" 
                    type="number"
                    placeholder="0"
                    value={createForm.nilaiNonPo}
                    onChange={(e) => setCreateForm({...createForm, nilaiNonPo: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="totalSpr">Total SPR</Label>
                  <Input 
                    id="totalSpr" 
                    type="number"
                    placeholder="0"
                    value={createForm.totalSpr}
                    onChange={(e) => setCreateForm({...createForm, totalSpr: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="totalPenyerapan">Total Penyerapan</Label>
                  <Input 
                    id="totalPenyerapan" 
                    type="number"
                    placeholder="0"
                    value={createForm.totalPenyerapan}
                    onChange={(e) => setCreateForm({...createForm, totalPenyerapan: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sisaAnggaran">Sisa Anggaran</Label>
                  <Input 
                    id="sisaAnggaran" 
                    type="number"
                    placeholder="0"
                    value={createForm.anggaranTersedia - createForm.totalPenyerapan}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBudget}>
                Create Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by PRK name, number, or manager..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={costCenterFilter} onValueChange={setCostCenterFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Cost Center" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Centers</SelectItem>
                {getUniqueValues('costCenter').map((center) => (
                  <SelectItem key={center as string} value={center as string}>
                    {center as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {getUniqueValues('kategoriBeban').map((kategori) => (
                  <SelectItem key={kategori as string} value={kategori as string}>
                    {kategori as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tahunFilter} onValueChange={setTahunFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Years</SelectItem>
                {getUniqueValues('tahun').map((tahun) => (
                  <SelectItem key={tahun as string} value={tahun as string}>
                    {tahun as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Budget List */}
      {budgets.length > 0 ? (
        <div className="grid gap-4">
          {budgets.map((budget) => (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {budget.costCenter}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {budget.tahun}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {budget.kategoriBeban}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{budget.prkName}</CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-4 text-sm">
                        <span><strong>PRK:</strong> {budget.prkNumber}</span>
                        <span><strong>Manager:</strong> {budget.manager}</span>
                        <span><strong>COA:</strong> {budget.coaNumber}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openViewDialog(budget)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(budget)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteBudget(budget.id, budget.prkName)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Anggaran Tersedia</p>
                    <p className="font-semibold text-green-600">{formatCurrency(budget.anggaranTersedia)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Penyerapan</p>
                    <p className="font-semibold text-blue-600">{formatCurrency(budget.totalPenyerapan)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Sisa Anggaran</p>
                    <p className={`font-semibold ${budget.sisaAnggaran >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(budget.sisaAnggaran)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Utilization</p>
                    <p className="font-semibold">
                      {((budget.totalPenyerapan / budget.anggaranTersedia) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No budgets found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first budget entry.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>
              Update budget details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-costCenter">Cost Center</Label>
                <Input 
                  id="edit-costCenter" 
                  placeholder="e.g., I0326"
                  value={createForm.costCenter}
                  onChange={(e) => setCreateForm({...createForm, costCenter: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-manager">Manager</Label>
                <Input 
                  id="edit-manager" 
                  placeholder="Manager name"
                  value={createForm.manager}
                  onChange={(e) => setCreateForm({...createForm, manager: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-prkNumber">PRK Number</Label>
                <Input 
                  id="edit-prkNumber" 
                  placeholder="e.g., IC00472022"
                  value={createForm.prkNumber}
                  onChange={(e) => setCreateForm({...createForm, prkNumber: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tahun">Tahun</Label>
                <Input 
                  id="edit-tahun" 
                  type="number"
                  placeholder="2025"
                  value={createForm.tahun}
                  onChange={(e) => setCreateForm({...createForm, tahun: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-prkName">PRK Name</Label>
              <Input 
                id="edit-prkName" 
                placeholder="Project name"
                value={createForm.prkName}
                onChange={(e) => setCreateForm({...createForm, prkName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-kategoriBeban">Kategori Beban</Label>
                <Select value={createForm.kategoriBeban} onValueChange={(value) => setCreateForm({...createForm, kategoriBeban: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Produksi Langsung">Produksi Langsung</SelectItem>
                    <SelectItem value="Pemasaran">Pemasaran</SelectItem>
                    <SelectItem value="Administrasi">Administrasi</SelectItem>
                    <SelectItem value="Operasional">Operasional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-coaNumber">COA Number</Label>
                <Input 
                  id="edit-coaNumber" 
                  placeholder="e.g., 5111110003"
                  value={createForm.coaNumber}
                  onChange={(e) => setCreateForm({...createForm, coaNumber: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-anggaranTersedia">Anggaran Tersedia</Label>
                <Input 
                  id="edit-anggaranTersedia" 
                  type="number"
                  placeholder="0"
                  value={createForm.anggaranTersedia}
                  onChange={(e) => setCreateForm({...createForm, anggaranTersedia: parseFloat(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-nilaiPo">Nilai PO</Label>
                <Input 
                  id="edit-nilaiPo" 
                  type="number"
                  placeholder="0"
                  value={createForm.nilaiPo}
                  onChange={(e) => setCreateForm({...createForm, nilaiPo: parseFloat(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-nilaiNonPo">Nilai Non PO</Label>
                <Input 
                  id="edit-nilaiNonPo" 
                  type="number"
                  placeholder="0"
                  value={createForm.nilaiNonPo}
                  onChange={(e) => setCreateForm({...createForm, nilaiNonPo: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-totalSpr">Total SPR</Label>
                <Input 
                  id="edit-totalSpr" 
                  type="number"
                  placeholder="0"
                  value={createForm.totalSpr}
                  onChange={(e) => setCreateForm({...createForm, totalSpr: parseFloat(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-totalPenyerapan">Total Penyerapan</Label>
                <Input 
                  id="edit-totalPenyerapan" 
                  type="number"
                  placeholder="0"
                  value={createForm.totalPenyerapan}
                  onChange={(e) => setCreateForm({...createForm, totalPenyerapan: parseFloat(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-sisaAnggaran">Sisa Anggaran</Label>
                <Input 
                  id="edit-sisaAnggaran" 
                  type="number"
                  placeholder="0"
                  value={createForm.anggaranTersedia - createForm.totalPenyerapan}
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBudget}>
              Update Budget
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Budget Details</DialogTitle>
            <DialogDescription>
              Complete budget information for {viewingBudget?.prkName}
            </DialogDescription>
          </DialogHeader>
          {viewingBudget && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Cost Center</Label>
                  <p className="text-lg font-semibold">{viewingBudget.costCenter}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Manager</Label>
                  <p className="text-lg font-semibold">{viewingBudget.manager}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">PRK Number</Label>
                  <p className="text-lg font-semibold">{viewingBudget.prkNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tahun</Label>
                  <p className="text-lg font-semibold">{viewingBudget.tahun}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">PRK Name</Label>
                <p className="text-lg font-semibold">{viewingBudget.prkName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Kategori Beban</Label>
                  <p className="text-lg font-semibold">{viewingBudget.kategoriBeban}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">COA Number</Label>
                  <p className="text-lg font-semibold">{viewingBudget.coaNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Anggaran Tersedia</Label>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(viewingBudget.anggaranTersedia)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nilai PO</Label>
                  <p className="text-lg font-semibold text-blue-600">{formatCurrency(viewingBudget.nilaiPo)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nilai Non PO</Label>
                  <p className="text-lg font-semibold text-orange-600">{formatCurrency(viewingBudget.nilaiNonPo)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total SPR</Label>
                  <p className="text-lg font-semibold text-purple-600">{formatCurrency(viewingBudget.totalSpr)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Penyerapan</Label>
                  <p className="text-lg font-semibold text-blue-600">{formatCurrency(viewingBudget.totalPenyerapan)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Sisa Anggaran</Label>
                  <p className={`text-lg font-semibold ${viewingBudget.sisaAnggaran >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(viewingBudget.sisaAnggaran)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-sm font-medium text-gray-500">Budget Utilization</Label>
                <p className="text-2xl font-bold">
                  {((viewingBudget.totalPenyerapan / viewingBudget.anggaranTersedia) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {viewingBudget && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                openEditDialog(viewingBudget);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Budget
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}