"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DownloadIcon,
  PlusIcon,
  PencilIcon,
  TrashBinIcon,
  EyeIcon,
  CheckCircleIcon,
  CloseIcon,
  TimeIcon,
  AlertIcon,
  InfoIcon,
} from "@/icons";

import { Button } from "@/components/ui/button";
import LicenseForm from "@/components/monitoring/LicenseForm";

// Update interface LicenseData untuk mencocokkan API response
interface LicenseData {
  id: number;
  nama_aplikasi: string;
  bpo: string;
  jenis_lisensi: string;
  jumlah: number;
  harga_satuan: number;
  harga_total: number;
  periode_po: number;
  kontrak_layanan_bulan: number;
  start_layanan: string;
  akhir_layanan: string;
  metode: string;
  keterangan_akun: string;
  tanggal_aktivasi: string;
  tanggal_pembaharuan: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  selling_price: number;
  purchase_price_per_unit: number;
  total_purchase_price: number;
  total_selling_price: number;
}

// Add React.FC type annotation to prevent compilation issues
const MonitoringLicensePage: React.FC = () => {
  // State declarations
  const [licenses, setLicenses] = useState<LicenseData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingLicense, setEditingLicense] = useState<LicenseData | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [viewingLicense, setViewingLicense] = useState<LicenseData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch license data from API
  const fetchLicenses = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
  
      const token = localStorage.getItem('auth_token');
      console.log('Token from localStorage:', token ? 'Present' : 'Missing');
      console.log('Token length:', token ? token.length : 0);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      });
  
      const response = await fetch(`/api/monitoring-license?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal,
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        
        // Handle specific error cases
        if (response.status === 500) {
          if (errorData.details?.includes('Table not found')) {
            throw new Error('Database table is missing. Please contact administrator.');
          } else if (errorData.details?.includes('Database connection failed')) {
            throw new Error('Database connection failed. Please try again later.');
          } else if (errorData.details?.includes('Schema detection failed')) {
            throw new Error('Database schema incompatibility detected. Please contact administrator.');
          }
        }
        
        throw new Error(errorData.details || `HTTP ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      // Validate response structure
      if (!data.data || !Array.isArray(data.data)) {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid response format from server');
      }
  
      if (!data.pagination) {
        console.error('Missing pagination data:', data);
        throw new Error('Missing pagination information');
      }
  
      setLicenses(data.data);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
      
    } catch (error) {
      if (signal?.aborted) {
        return;
      }
  
      console.error('Error fetching licenses:', error);
      
      // Set user-friendly error messages
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred while fetching licenses');
      }
      
      // Reset data on error
      setLicenses([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchLicenses(abortController.signal);
    
    return () => {
      abortController.abort();
    };
  }, [fetchLicenses]);

  // Handle form submission (create/update)
  const handleFormSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      const token = localStorage.getItem('auth_token');
      const url = '/api/monitoring-license';
      const method = editingLicense ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingLicense ? { ...formData, id: editingLicense.id } : formData),
      });

      if (response.ok) {
        await fetchLicenses(); // Refresh data
        setIsFormOpen(false);
        setEditingLicense(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save license');
      }
    } catch (error) {
      console.error('Error saving license:', error);
      alert('Gagal menyimpan data lisensi');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete license
  const handleDelete = async (id: number | undefined) => {
    if (!id || !confirm('Apakah Anda yakin ingin menghapus lisensi ini?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/monitoring-license', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchLicenses(); // Refresh data
      } else {
        throw new Error('Failed to delete license');
      }
    } catch (error) {
      console.error('Error deleting license:', error);
      alert('Gagal menghapus data lisensi');
    }
  };

  // Handle view license details
  const handleView = (license: LicenseData) => {
    setViewingLicense(license);
    setIsViewModalOpen(true);
  };

  // Handle edit license
  const handleEdit = (license: LicenseData) => {
    setEditingLicense({
      ...license
    });
    setIsFormOpen(true);
  };

  // Handle add new license
  const handleAddNew = () => {
    setEditingLicense(null);
    setIsFormOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900";
      case "EXPIRING":
      case "EXPIRING_SOON":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900";
      case "EXPIRED":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900";
      case "PENDING":
      case "INACTIVE":
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900";
    }
  };

  const formatCurrency = (amount: number) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return 'Rp 0';
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numAmount);
  };

  // Compact currency formatter using Indonesian Rupiah notation
  const formatCurrencyCompact = (amount: number) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return 'Rp 0';
    }
    
    if (numAmount >= 1000000000) {
      return `Rp ${(numAmount / 1000000000).toFixed(1)}M`; // M = Milyard (Billion)
    } else if (numAmount >= 1000000) {
      return `Rp ${(numAmount / 1000000).toFixed(1)}Jt`; // Jt = Juta (Million)
    } else if (numAmount >= 1000) {
      return `Rp ${(numAmount / 1000).toFixed(1)}Rb`; // Rb = Ribu (Thousand)
    } else {
      return `Rp ${numAmount.toFixed(0)}`;
    }
  };

  // Add date formatting function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  const filteredData = licenses.filter(item => {
    const statusMatch = statusFilter === "All" || item.status === statusFilter;
    const typeMatch = filterType === "All" || item.jenis_lisensi === filterType;
    return statusMatch && typeMatch;
  });

  // Pagination logic - use API pagination instead of client-side
  const paginatedData = licenses; // Use API paginated data directly

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, filterType]);

  const stats = {
    total: licenses.length,
    active: licenses.filter(item => item.status === "Active").length,
    expiringSoon: licenses.filter(item => item.status === "Expiring Soon").length,
    expired: licenses.filter(item => item.status === "Expired").length,
    perpetual: licenses.filter(item => item.status === "Perpetual").length,
    subscription: licenses.filter(item => (item.jenis_lisensi || "").toLowerCase().includes("subscription")).length,
    totalCost: licenses.reduce((sum, item) => {
      const cost = Number(item.harga_total) || 0;
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading license data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring License</h1>
          <p className="text-muted-foreground">
            Monitor dan kelola lisensi software perusahaan
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <div className="min-w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0">
              {/* Total Licenses Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-r border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Licenses</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">All licenses</p>
                  </div>
                  <div className="bg-blue-500 rounded-full p-3 flex-shrink-0 ml-3">
                    <InfoIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Active Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-r border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Active</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.active}</p>
                    <p className="text-xs text-green-500 dark:text-green-400 mt-1">Currently active</p>
                  </div>
                  <div className="bg-green-500 rounded-full p-3 flex-shrink-0 ml-3">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Expiring Soon Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-r border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">Expiring Soon</p>
                    <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{stats.expiringSoon}</p>
                    <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Need attention</p>
                  </div>
                  <div className="bg-yellow-500 rounded-full p-3 flex-shrink-0 ml-3">
                    <TimeIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Expired Card */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-r border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Expired</p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.expired}</p>
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">Require renewal</p>
                  </div>
                  <div className="bg-red-500 rounded-full p-3 flex-shrink-0 ml-3">
                    <AlertIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Total Purchase Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Total Purchase</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{formatCurrencyCompact(stats.totalCost)}</p>
                    <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">Total investment</p>
                  </div>
                  <div className="bg-purple-500 rounded-full p-3 flex-shrink-0 ml-3">
                    <InfoIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="All">All Types</option>
                  <option value="Perpetual">Perpetual</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Trial">Trial</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Tambah Lisensi
              </Button>
              <Button variant="outline">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* License Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    License Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    BPO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Purchase Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedData.map((item, index) => {
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.nama_aplikasi}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">{item.bpo || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">{item.jenis_lisensi || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status || 'Active')}`}>
                          {item.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(item.akhir_layanan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrencyCompact(Number(item.harga_total) || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrencyCompact(Number(item.selling_price) || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing{' '}
                    <span className="font-medium">{((page - 1) * itemsPerPage) + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(page * itemsPerPage, totalItems)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{totalItems}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(Math.max(page - 1, 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                      return (
                        <button
                          key={`page-${i}-${pageNum}`}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === page
                              ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex">
              <AlertIcon className="w-5 h-5 text-red-400 dark:text-red-300" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error Loading Data
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* License Form Modal */}
        {isFormOpen && (
          <LicenseForm
            isOpen={isFormOpen}
            editData={editingLicense}
            onSubmit={handleFormSubmit}
            onDelete={handleDelete}
            onClose={() => {
              setIsFormOpen(false);
              setEditingLicense(null);
            }}
            loading={formLoading}
          />
        )}

        {/* View License Modal */}
        {isViewModalOpen && viewingLicense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    License Details
                  </h2>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <CloseIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      License Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {viewingLicense.nama_aplikasi}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      BPO
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {viewingLicense.bpo || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      License Type
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {viewingLicense.jenis_lisensi || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quantity
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {viewingLicense.jumlah || 0}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Unit Price
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatCurrencyCompact(Number(viewingLicense.harga_satuan) || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Price
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatCurrencyCompact(Number(viewingLicense.harga_total) || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selling Price
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatCurrencyCompact(Number(viewingLicense.selling_price) || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(viewingLicense.start_layanan)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(viewingLicense.akhir_layanan)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Purchase Method
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {viewingLicense.metode || '-'}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setEditingLicense(viewingLicense);
                      setIsViewModalOpen(false);
                      setIsFormOpen(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this license?')) {
                        handleDelete(viewingLicense.id);
                        setIsViewModalOpen(false);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-2"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default MonitoringLicensePage;
