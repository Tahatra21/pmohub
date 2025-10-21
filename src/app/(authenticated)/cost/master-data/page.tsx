'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Search, RefreshCw, Database, Upload, Download, Plus, Edit, Trash2 } from 'lucide-react';
import { authenticatedFetch } from '@/lib/api';
import { formatCurrency } from '@/lib/cost-calculator';
import { useToast } from '@/hooks/use-toast';

interface HjtBlp {
  id: string;
  spec: string;
  ref: string;
  monthly: number;
  daily: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HjtBlnp {
  id: string;
  item: string;
  ref: string;
  khs2022: string;
  numericValue?: number;
  isAtCost: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MasterDataPage() {
  const [blpRates, setBlpRates] = useState<HjtBlp[]>([]);
  const [blnpRates, setBlnpRates] = useState<HjtBlnp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'blp' | 'blnp'>('blp');
  
  // CRUD States
  const [isBlpModalOpen, setIsBlpModalOpen] = useState(false);
  const [isBlnpModalOpen, setIsBlnpModalOpen] = useState(false);
  const [editingBlp, setEditingBlp] = useState<HjtBlp | null>(null);
  const [editingBlnp, setEditingBlnp] = useState<HjtBlnp | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form States
  const [blpForm, setBlpForm] = useState({
    spec: '',
    ref: '',
    monthly: 0,
    daily: 0,
    isActive: true
  });
  
  const [blnpForm, setBlnpForm] = useState({
    item: '',
    ref: '',
    khs2022: '',
    numericValue: 0,
    isAtCost: false,
    note: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [activeTab, searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('q', searchQuery);
      }

      if (activeTab === 'blp') {
        const blpResponse = await authenticatedFetch(`/api/cost/hjt-blp?${params}`);
        const blpData = await blpResponse.json();
        setBlpRates(blpData.data || []);
      } else {
        const blnpResponse = await authenticatedFetch(`/api/cost/hjt-blnp?${params}`);
        const blnpData = await blnpResponse.json();
        setBlnpRates(blnpData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleImportTariff = () => {
    // TODO: Implement import tariff functionality
    console.log('Import tariff clicked');
  };

  const handleExportData = () => {
    // TODO: Implement export functionality
    console.log('Export data clicked');
  };

  // CRUD Functions for BLP
  const handleCreateBlp = () => {
    setEditingBlp(null);
    setBlpForm({
      spec: '',
      ref: '',
      monthly: 0,
      daily: 0,
      isActive: true
    });
    setIsBlpModalOpen(true);
  };

  const handleEditBlp = (blp: HjtBlp) => {
    setEditingBlp(blp);
    setBlpForm({
      spec: blp.spec,
      ref: blp.ref,
      monthly: blp.monthly,
      daily: blp.daily,
      isActive: blp.isActive
    });
    setIsBlpModalOpen(true);
  };

  const handleSubmitBlp = async () => {
    setIsSubmitting(true);
    try {
      const url = editingBlp 
        ? `/api/cost/hjt-blp/${editingBlp.id}` 
        : '/api/cost/hjt-blp';
      const method = editingBlp ? 'PUT' : 'POST';

      const response = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blpForm)
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Berhasil',
          description: editingBlp ? 'BLP berhasil diupdate' : 'BLP berhasil dibuat',
        });
        setIsBlpModalOpen(false);
        fetchData();
      } else {
        throw new Error(data.error || 'Gagal menyimpan BLP');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan BLP',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlp = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data BLP ini?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/cost/hjt-blp/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Berhasil',
          description: 'BLP berhasil dihapus',
        });
        fetchData();
      } else {
        throw new Error(data.error || 'Gagal menghapus BLP');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus BLP',
        variant: 'destructive',
      });
    }
  };

  // CRUD Functions for BLNP
  const handleCreateBlnp = () => {
    setEditingBlnp(null);
    setBlnpForm({
      item: '',
      ref: '',
      khs2022: '', // Keep for API compatibility but not used in form
      numericValue: 0,
      isAtCost: false,
      note: ''
    });
    setIsBlnpModalOpen(true);
  };

  const handleEditBlnp = (blnp: HjtBlnp) => {
    setEditingBlnp(blnp);
    setBlnpForm({
      item: blnp.item,
      ref: blnp.ref,
      khs2022: blnp.khs2022, // Keep for API compatibility but not used in form
      numericValue: blnp.numericValue || 0,
      isAtCost: blnp.isAtCost,
      note: blnp.note || ''
    });
    setIsBlnpModalOpen(true);
  };

  const handleSubmitBlnp = async () => {
    setIsSubmitting(true);
    try {
      const url = editingBlnp 
        ? `/api/cost/hjt-blnp/${editingBlnp.id}` 
        : '/api/cost/hjt-blnp';
      const method = editingBlnp ? 'PUT' : 'POST';

      // Prepare data for API - use numericValue as khs2022 for consistency
      const submitData = {
        item: blnpForm.item,
        ref: blnpForm.ref,
        khs2022: blnpForm.numericValue?.toString() || '0', // Use numericValue as khs2022
        numericValue: blnpForm.numericValue,
        isAtCost: blnpForm.isAtCost,
        note: blnpForm.note
      };

      const response = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Berhasil',
          description: editingBlnp ? 'BLNP berhasil diupdate' : 'BLNP berhasil dibuat',
        });
        setIsBlnpModalOpen(false);
        fetchData();
      } else {
        throw new Error(data.error || 'Gagal menyimpan BLNP');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan BLNP',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlnp = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data BLNP ini?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/cost/hjt-blnp/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Berhasil',
          description: 'BLNP berhasil dihapus',
        });
        fetchData();
      } else {
        throw new Error(data.error || 'Gagal menghapus BLNP');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus BLNP',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Master Data</h1>
          <p className="text-gray-600">Kelola data master BLP, BLNP, dan tarif untuk cost estimation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={activeTab === 'blp' ? handleCreateBlp : handleCreateBlnp}>
            <Plus className="h-4 w-4 mr-2" />
            Add {activeTab === 'blp' ? 'BLP' : 'BLNP'}
          </Button>
          <Button onClick={handleImportTariff} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Tarif
          </Button>
          <Button onClick={handleExportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={`Cari ${activeTab === 'blp' ? 'spesifikasi atau referensi' : 'item atau referensi'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'blp' | 'blnp')}>
        <TabsList className="mb-4">
          <TabsTrigger value="blp">
            BLP ({blpRates.length})
          </TabsTrigger>
          <TabsTrigger value="blnp">
            BLNP ({blnpRates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default">BLP</Badge>
                <span>Biaya Langsung Personel</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Memuat data...</div>
              ) : blpRates.length === 0 ? (
                <div className="text-center py-8">Tidak ada data BLP</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Spesifikasi</TableHead>
                        <TableHead>Referensi</TableHead>
                        <TableHead>Harga Bulanan</TableHead>
                        <TableHead>Harga Harian</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blpRates.map((rate) => (
                        <TableRow key={rate.id}>
                          <TableCell className="font-medium">{rate.spec}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{rate.ref}</Badge>
                          </TableCell>
                          <TableCell className="text-green-600 font-medium">
                            {formatCurrency(rate.monthly)}
                          </TableCell>
                          <TableCell className="text-blue-600 font-medium">
                            {formatCurrency(rate.daily)}
                          </TableCell>
                          <TableCell>
                            {rate.isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditBlp(rate)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBlp(rate.id)}
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
        </TabsContent>

        <TabsContent value="blnp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">BLNP</Badge>
                <span>Biaya Langsung Non Personel</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Memuat data...</div>
              ) : blnpRates.length === 0 ? (
                <div className="text-center py-8">Tidak ada data BLNP</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Uraian</TableHead>
                        <TableHead>Referensi</TableHead>
                        <TableHead>KHS 2022</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blnpRates.map((rate) => (
                        <TableRow key={rate.id}>
                          <TableCell className="font-medium">{rate.item}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{rate.ref}</Badge>
                          </TableCell>
                          <TableCell>
                            {rate.isAtCost ? (
                              <div className="text-blue-600 font-medium">At Cost</div>
                            ) : (
                              <div className="text-green-600 font-medium">
                                {rate.numericValue ? formatCurrency(rate.numericValue) : '-'}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {rate.isAtCost ? (
                              <Badge variant="destructive">At Cost</Badge>
                            ) : (
                              <Badge variant="default">Fixed</Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {rate.note || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditBlnp(rate)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBlnp(rate.id)}
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
        </TabsContent>
      </Tabs>

      {/* BLP Modal */}
      <Dialog open={isBlpModalOpen} onOpenChange={setIsBlpModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBlp ? 'Edit BLP Data' : 'Add New BLP Data'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="spec">Spesifikasi</Label>
              <Input
                id="spec"
                value={blpForm.spec}
                onChange={(e) => setBlpForm({ ...blpForm, spec: e.target.value })}
                placeholder="Masukkan spesifikasi"
              />
            </div>
            <div>
              <Label htmlFor="ref">Referensi</Label>
              <Input
                id="ref"
                value={blpForm.ref}
                onChange={(e) => setBlpForm({ ...blpForm, ref: e.target.value })}
                placeholder="Masukkan referensi"
              />
            </div>
            <div>
              <Label htmlFor="monthly">Harga Bulanan (IDR)</Label>
              <Input
                id="monthly"
                type="number"
                value={blpForm.monthly}
                onChange={(e) => setBlpForm({ ...blpForm, monthly: parseInt(e.target.value) || 0 })}
                placeholder="Masukkan harga bulanan"
              />
            </div>
            <div>
              <Label htmlFor="daily">Harga Harian (IDR)</Label>
              <Input
                id="daily"
                type="number"
                value={blpForm.daily}
                onChange={(e) => setBlpForm({ ...blpForm, daily: parseInt(e.target.value) || 0 })}
                placeholder="Masukkan harga harian"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={blpForm.isActive}
                onCheckedChange={(checked) => setBlpForm({ ...blpForm, isActive: checked })}
              />
              <Label htmlFor="isActive">Status Aktif</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBlpModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitBlp} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingBlp ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* BLNP Modal */}
      <Dialog open={isBlnpModalOpen} onOpenChange={setIsBlnpModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBlnp ? 'Edit BLNP Data' : 'Add New BLNP Data'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="item">Uraian Item</Label>
              <Input
                id="item"
                value={blnpForm.item}
                onChange={(e) => setBlnpForm({ ...blnpForm, item: e.target.value })}
                placeholder="Masukkan uraian item"
              />
            </div>
            <div>
              <Label htmlFor="ref">Referensi</Label>
              <Input
                id="ref"
                value={blnpForm.ref}
                onChange={(e) => setBlnpForm({ ...blnpForm, ref: e.target.value })}
                placeholder="Masukkan referensi"
              />
            </div>
            <div>
              <Label htmlFor="numericValue">Nilai (IDR)</Label>
              <Input
                id="numericValue"
                type="number"
                value={blnpForm.numericValue}
                onChange={(e) => setBlnpForm({ ...blnpForm, numericValue: parseInt(e.target.value) || 0 })}
                placeholder="Masukkan nilai dalam IDR"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isAtCost"
                checked={blnpForm.isAtCost}
                onCheckedChange={(checked) => setBlnpForm({ ...blnpForm, isAtCost: checked })}
              />
              <Label htmlFor="isAtCost">At Cost</Label>
            </div>
            <div>
              <Label htmlFor="note">Keterangan</Label>
              <Textarea
                id="note"
                value={blnpForm.note}
                onChange={(e) => setBlnpForm({ ...blnpForm, note: e.target.value })}
                placeholder="Masukkan keterangan (opsional)"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBlnpModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitBlnp} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingBlnp ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
