'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, Plus, FileEdit, Trash2, Download, Eye, BarChart3 } from 'lucide-react';
import { authenticatedFetch } from '@/lib/api';
import { formatCurrency } from '@/lib/cost-calculator';
import { useToast } from '@/hooks/use-toast';

interface CostEstimator {
  id: string;
  name: string;
  projectName?: string;
  client?: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  version: string;
  markUpPct: number;
  contingencyPct: number;
  discountPct: number;
  ppnPct: number;
  escalationPct: number;
  subtotal: number;
  escalation: number;
  overhead: number;
  contingency: number;
  discount: number;
  dpp: number;
  ppn: number;
  grandTotal: number;
  assumptions?: any;
  notes?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<CostEstimator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchEstimates();
  }, [searchQuery, statusFilter, currentPage]);

  const fetchEstimates = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', currentPage.toString());
      params.append('limit', '10');

      const response = await authenticatedFetch(`/api/cost/estimators?${params}`);
      const data = await response.json();
      setEstimates(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching estimates:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data estimasi',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEstimates();
  };

  const handleCreateNew = () => {
    router.push('/cost/estimates/create');
  };

  const handleEdit = (id: string) => {
    router.push(`/cost/estimates/${id}`);
  };

  const handleView = (id: string) => {
    router.push(`/cost/estimates/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus estimasi ini?')) {
      return;
    }

    try {
      await authenticatedFetch(`/api/cost/estimators/${id}`, {
        method: 'DELETE',
      });

      toast({
        title: 'Berhasil',
        description: 'Estimasi berhasil dihapus',
      });

      fetchEstimates();
    } catch (error) {
      console.error('Error deleting estimate:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus estimasi',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/cost/estimators/${id}/export`, {
        method: 'POST'
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estimasi-${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Berhasil',
        description: 'Estimasi berhasil diekspor',
      });
    } catch (error) {
      console.error('Error exporting estimate:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengekspor estimasi',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">Active</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        estimate.name.toLowerCase().includes(query) ||
        estimate.projectName?.toLowerCase().includes(query) ||
        estimate.client?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Estimates</h1>
          <p className="text-gray-600">Kelola estimasi biaya proyek dengan fitur lengkap</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Estimate
          </Button>
          <Button onClick={() => router.push('/cost/reports')} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {estimates.filter(e => e.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {estimates.filter(e => e.status === 'DRAFT').length}
              </div>
              <div className="text-sm text-gray-600">Draft</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {estimates.filter(e => e.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(estimates.reduce((sum, e) => sum + e.grandTotal, 0))}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari nama estimasi, proyek, atau klien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estimates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estimates List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : filteredEstimates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Tidak ada estimasi ditemukan</p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Estimasi Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Estimasi</TableHead>
                    <TableHead>Proyek</TableHead>
                    <TableHead>Klien</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Grand Total</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEstimates.map((estimate) => (
                    <TableRow key={estimate.id}>
                      <TableCell className="font-medium">{estimate.name}</TableCell>
                      <TableCell>{estimate.projectName || '-'}</TableCell>
                      <TableCell>{estimate.client || '-'}</TableCell>
                      <TableCell>{getStatusBadge(estimate.status)}</TableCell>
                      <TableCell>{estimate.version}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(estimate.grandTotal)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(estimate.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(estimate.id)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(estimate.id)}
                            title="Edit"
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExport(estimate.id)}
                            title="Export"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(estimate.id)}
                            title="Delete"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 text-sm text-gray-600">
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
    </div>
  );
}