'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, TrendingUp, Users, FileText, DollarSign, Calendar } from 'lucide-react';
import { authenticatedFetch } from '@/lib/api';
import { formatCurrency } from '@/lib/cost-calculator';

interface ReportData {
  summary: {
    totalEstimates: number;
    activeEstimates: number;
    draftEstimates: number;
    completedEstimates: number;
    cancelledEstimates: number;
    totalValue: number;
    averageValue: number;
    period: string;
  };
  charts: {
    estimatesByStatus: Array<{
      status: string;
      _count: { status: number };
      _sum: { grandTotal: number };
    }>;
    monthlyChart: Array<{
      month: string;
      count: number;
      total: number;
      active: number;
      draft: number;
      completed: number;
      cancelled: number;
    }>;
    topClients: Array<{
      name: string;
      count: number;
      totalValue: number;
    }>;
  };
  recentEstimates: Array<{
    id: string;
    name: string;
    projectName?: string;
    client?: string;
    status: string;
    grandTotal: number;
    createdAt: string;
    createdBy?: string;
  }>;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [period, statusFilter]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await authenticatedFetch(`/api/cost/reports?${params}`);
      const data = await response.json();
      setReportData(data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReports();
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">Memuat laporan...</div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">Gagal memuat data laporan</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-600">Analisis dan laporan estimasi biaya</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Hari</SelectItem>
              <SelectItem value="30">30 Hari</SelectItem>
              <SelectItem value="90">90 Hari</SelectItem>
              <SelectItem value="365">1 Tahun</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={handleRefresh}
            className="px-3 py-2 border rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Estimates</p>
                <p className="text-2xl font-bold">{reportData.summary.totalEstimates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.summary.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Average Value</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.summary.averageValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Period</p>
                <p className="text-2xl font-bold">{reportData.summary.period}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.charts.estimatesByStatus.map((item) => (
                <div key={item.status} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    <span className="text-sm">{item._count.status} estimates</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(item._sum.grandTotal || 0)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.charts.topClients.map((client, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(client.totalValue)}</div>
                    <div className="text-xs text-muted-foreground">{client.count} estimates</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Total Estimates</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Draft</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Cancelled</TableHead>
                  <TableHead>Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.charts.monthlyChart.map((month) => (
                  <TableRow key={month.month}>
                    <TableCell className="font-medium">{month.month}</TableCell>
                    <TableCell>{month.count}</TableCell>
                    <TableCell>
                      <Badge variant="default">{month.active}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{month.draft}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{month.completed}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{month.cancelled}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(month.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Estimates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Estimates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.recentEstimates.map((estimate) => (
                  <TableRow key={estimate.id}>
                    <TableCell className="font-medium">{estimate.name}</TableCell>
                    <TableCell>{estimate.projectName || '-'}</TableCell>
                    <TableCell>{estimate.client || '-'}</TableCell>
                    <TableCell>{getStatusBadge(estimate.status)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(estimate.grandTotal)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(estimate.createdAt).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {estimate.createdBy || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}