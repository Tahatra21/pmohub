'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CurrencyInput } from '@/components/ui/currency-input';
import { PercentInput } from '@/components/ui/percent-input';
import { TotalsCard } from '@/components/cost/TotalsCard';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/cost-calculator';
import { EstimateLineData, ProjectSettings, calculateEstimateTotals } from '@/lib/cost-calculator';
import { authenticatedFetch } from '@/lib/api';
import { Search, Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BlpRate {
  id: string;
  spec: string;
  ref: string;
  monthly: number;
  daily: number;
  isActive: boolean;
}

interface BlnpRate {
  id: string;
  item: string;
  ref: string;
  khs2022: string;
  note?: string;
  numericValue?: number;
  isAtCost: boolean;
}

interface Estimate {
  id: string;
  name: string;
  projectName?: string;
  client?: string;
  description?: string;
  status: string;
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

export default function EstimateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [blpRates, setBlpRates] = useState<BlpRate[]>([]);
  const [blnpRates, setBlnpRates] = useState<BlnpRate[]>([]);
  const [lines, setLines] = useState<EstimateLineData[]>([]);
  const [settings, setSettings] = useState<ProjectSettings>({
    markUpPct: 0,
    contingencyPct: 0,
    discountPct: 0,
    ppnPct: 11,
    escalationPct: 0,
    assumptions: {
      workingDaysPerMonth: 20,
      roundToThousand: false
    }
  });
  const [searchBlp, setSearchBlp] = useState('');
  const [searchBlnp, setSearchBlnp] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchEstimate();
    fetchRates();
  }, [id]);

  const fetchEstimate = async () => {
    try {
      const response = await authenticatedFetch(`/api/cost/estimators/${id}`);
      const data = await response.json();
      setEstimate(data.data);
      // Initialize settings from estimate data
      setSettings({
        markUpPct: data.data.markUpPct || 0,
        contingencyPct: data.data.contingencyPct || 0,
        discountPct: data.data.discountPct || 0,
        ppnPct: data.data.ppnPct || 11,
        escalationPct: data.data.escalationPct || 0,
        assumptions: data.data.assumptions || {
          workingDaysPerMonth: 20,
          roundToThousand: false
        }
      });
      
      // Fetch estimate lines
      await fetchEstimateLines();
    } catch (error) {
      console.error('Error fetching estimate:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data estimasi',
        variant: 'destructive'
      });
    }
  };

  const fetchEstimateLines = async () => {
    try {
      const response = await authenticatedFetch(`/api/cost/estimators/${id}/lines`);
      const data = await response.json();
      setLines(data.data || []);
    } catch (error) {
      console.error('Error fetching estimate lines:', error);
      // Don't show error toast for lines as it might not exist yet
    }
  };

  const fetchRates = async () => {
    try {
      // Use the new HJT API endpoints
      const [blpResponse, blnpResponse] = await Promise.all([
        authenticatedFetch(`/api/cost/hjt-blp`),
        authenticatedFetch(`/api/cost/hjt-blnp`)
      ]);

      const blpData = await blpResponse.json();
      const blnpData = await blnpResponse.json();
      
      setBlpRates(blpData.data || []);
      setBlnpRates(blnpData.data || []);
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addLineFromRate = (rate: BlpRate | BlnpRate, type: 'BLP' | 'BLNP') => {
    const newLine: EstimateLineData = {
      type,
      refId: rate.id,
      description: type === 'BLP' ? rate.spec : rate.item,
      unit: 'man-days',
      qty: 1,
      unitPrice: type === 'BLP' ? rate.daily : (rate as BlnpRate).numericValue || 0,
      isAtCost: type === 'BLNP' ? (rate as BlnpRate).isAtCost : false,
      lineTotal: type === 'BLP' ? rate.daily : (rate as BlnpRate).numericValue || 0,
      sort: lines.length
    };

    setLines([...lines, newLine]);
  };

  const updateLine = (index: number, field: keyof EstimateLineData, value: any) => {
    const updatedLines = [...lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    
    // Recalculate line total
    if (field === 'qty' || field === 'unitPrice') {
      updatedLines[index].lineTotal = updatedLines[index].qty * updatedLines[index].unitPrice;
    }
    
    setLines(updatedLines);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const addCustomLine = () => {
    const newLine: EstimateLineData = {
      type: 'CUSTOM',
      description: '',
      unit: 'unit',
      qty: 1,
      unitPrice: 0,
      isAtCost: false,
      lineTotal: 0,
      sort: lines.length
    };
    setLines([...lines, newLine]);
  };

  const saveEstimate = async () => {
    setIsSaving(true);
    try {
      const totals = calculateEstimateTotals(lines, settings);
      
      // Save estimate data
      await authenticatedFetch(`/api/cost/estimators/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: estimate?.name,
          projectName: estimate?.projectName,
          client: estimate?.client,
          description: estimate?.description,
          status: estimate?.status,
          version: estimate?.version,
          markUpPct: settings.markUpPct,
          contingencyPct: settings.contingencyPct,
          discountPct: settings.discountPct,
          ppnPct: settings.ppnPct,
          escalationPct: settings.escalationPct,
          subtotal: totals.subtotal,
          escalation: totals.escalation,
          overhead: totals.overhead,
          contingency: totals.contingency,
          discount: totals.discount,
          dpp: totals.dpp,
          ppn: totals.ppn,
          grandTotal: totals.grandTotal,
          assumptions: settings.assumptions,
          notes: estimate?.notes
        })
      });

      // Save estimate lines
      await authenticatedFetch(`/api/cost/estimators/${id}/lines`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lines: lines
        })
      });

      toast({
        title: 'Berhasil',
        description: 'Estimasi berhasil disimpan'
      });
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan estimasi',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const changeStatus = async (newStatus: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await authenticatedFetch(`/api/cost/estimators/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      // Update local state
      setEstimate(prev => prev ? { ...prev, status: newStatus } : null);

      toast({
        title: 'Berhasil',
        description: `Status berhasil diubah menjadi ${newStatus}`
      });
    } catch (error) {
      console.error('Error changing status:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengubah status',
        variant: 'destructive'
      });
    }
  };

  const totals = calculateEstimateTotals(lines, settings);

  const filteredBlpRates = blpRates.filter(rate =>
    rate.spec.toLowerCase().includes(searchBlp.toLowerCase())
  );

  const filteredBlnpRates = blnpRates.filter(rate =>
    rate.item.toLowerCase().includes(searchBlnp.toLowerCase())
  );

  if (isLoading) {
    return <div className="container mx-auto py-6">Memuat data...</div>;
  }

  if (!estimate) {
    return <div className="container mx-auto py-6">Estimasi tidak ditemukan</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{estimate.name}</h1>
          <p className="text-gray-600">Proyek: {estimate.projectName || 'N/A'}</p>
          <p className="text-sm text-gray-500">Klien: {estimate.client || 'N/A'}</p>
          <p className="text-sm text-gray-500">Status: {estimate.status}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Kembali
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <Select value={estimate.status} onValueChange={(value: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED') => changeStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={saveEstimate} disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Catalog */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Katalog Tarif</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="blp" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="blp">BLP</TabsTrigger>
                  <TabsTrigger value="blnp">BLNP</TabsTrigger>
                </TabsList>
                
                <TabsContent value="blp" className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cari spesifikasi..."
                      value={searchBlp}
                      onChange={(e) => setSearchBlp(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredBlpRates.map((rate) => (
                      <div
                        key={rate.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => addLineFromRate(rate, 'BLP')}
                      >
                        <div className="font-medium text-sm">{rate.spec}</div>
                        <div className="text-xs text-gray-500">
                          Harian: {formatCurrency(rate.daily)} | 
                          Bulanan: {formatCurrency(rate.monthly)}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="blnp" className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cari item..."
                      value={searchBlnp}
                      onChange={(e) => setSearchBlnp(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredBlnpRates.map((rate) => (
                      <div
                        key={rate.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => addLineFromRate(rate, 'BLNP')}
                      >
                        <div className="font-medium text-sm">{rate.item}</div>
                        <div className="text-xs text-gray-500">
                          {rate.isAtCost ? 'At Cost' : formatCurrency(rate.numericValue || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Center: Estimate Lines */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Baris Estimasi</span>
                <Button size="sm" onClick={addCustomLine}>
                  <Plus className="h-4 w-4 mr-1" />
                  Custom
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lines.map((line, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <Badge variant="outline">{line.type}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeLine(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <Label>Deskripsi</Label>
                      <Input
                        value={line.description}
                        onChange={(e) => updateLine(index, 'description', e.target.value)}
                        placeholder="Deskripsi item"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={line.qty}
                          onChange={(e) => updateLine(index, 'qty', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <select
                          value={line.unit}
                          onChange={(e) => updateLine(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="man-days">Man Days</option>
                          <option value="man-months">Man Months</option>
                          <option value="unit">Unit</option>
                          <option value="hari">Hari</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Harga Satuan</Label>
                      <CurrencyInput
                        value={line.unitPrice}
                        onValueChange={(value) => updateLine(index, 'unitPrice', value)}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="font-medium">{formatCurrency(line.lineTotal)}</span>
                    </div>
                  </div>
                ))}
                
                {lines.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Belum ada baris estimasi</p>
                    <p className="text-sm">Drag item dari katalog atau tambah custom</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Settings & Totals */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Proyek</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Markup (%)</Label>
                  <PercentInput
                    value={settings.markUpPct}
                    onValueChange={(value) => setSettings({...settings, markUpPct: value})}
                  />
                </div>
                <div>
                  <Label>Contingency (%)</Label>
                  <PercentInput
                    value={settings.contingencyPct}
                    onValueChange={(value) => setSettings({...settings, contingencyPct: value})}
                  />
                </div>
                <div>
                  <Label>Discount (%)</Label>
                  <PercentInput
                    value={settings.discountPct}
                    onValueChange={(value) => setSettings({...settings, discountPct: value})}
                  />
                </div>
                <div>
                  <Label>PPN (%)</Label>
                  <PercentInput
                    value={settings.ppnPct}
                    onValueChange={(value) => setSettings({...settings, ppnPct: value})}
                  />
                </div>
                <div>
                  <Label>Escalation (%)</Label>
                  <PercentInput
                    value={settings.escalationPct}
                    onValueChange={(value) => setSettings({...settings, escalationPct: value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <TotalsCard totals={totals} settings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
}
