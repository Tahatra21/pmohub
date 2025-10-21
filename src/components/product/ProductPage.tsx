"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from './ProductGrid';
import ProductDetailModal from './ProductDetailModal';
import ProductForm from './ProductForm';
import AttachmentModal from './AttachmentModal';
import { Product, Category, Segment, Stage } from '@/types';

interface DropdownOption {
  id: string;
  name: string;
}

interface Filters {
  search?: string;
  stage?: string;
  kategori?: string;
  segmen?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState<{
    stages: DropdownOption[];
    categories: DropdownOption[];
    segments: DropdownOption[];
  }>({
    stages: [],
    categories: [],
    segments: []
  });
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Fetch products from database
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedStage) params.append('stage', selectedStage);
      if (selectedCategory) params.append('kategori', selectedCategory);
      if (selectedSegment) params.append('segmen', selectedSegment);

      const response = await fetch(`/api/lifecycle/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setProducts(data.data || []);
        setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      } else {
        console.error('API Error:', data.message);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown options
  const fetchDropdownOptions = async () => {
    try {
      setLoadingDropdowns(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/lifecycle/dropdowns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setDropdownOptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  useEffect(() => {
    fetchDropdownOptions();
    fetchProducts(1);
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [searchQuery, selectedStage, selectedCategory, selectedSegment]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormMode('edit');
    setShowProductForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/lifecycle/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // Refresh products list
        fetchProducts(pagination.currentPage);
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred while deleting the product');
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleViewAttachments = (product: Product) => {
    setSelectedProduct(product);
    setShowAttachmentModal(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormMode('create');
    setShowProductForm(true);
  };

  const handleFormSuccess = () => {
    // Refresh products list after successful create/edit
    fetchProducts(pagination.currentPage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground">
            Kelola semua produk dalam siklus hidup pengembangan. Total: {pagination.totalItems} produk
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 pt-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </form>

          {/* Filter Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stage</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                disabled={loadingDropdowns}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Semua Stage</option>
                {dropdownOptions.stages.map((stage) => (
                  <option key={stage.id} value={stage.stage}>
                    {stage.stage}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={loadingDropdowns}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Semua Kategori</option>
                {dropdownOptions.categories.map((category) => (
                  <option key={category.id} value={category.kategori}>
                    {category.kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Segmen</label>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                disabled={loadingDropdowns}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Semua Segmen</option>
                {dropdownOptions.segments.map((segment) => (
                  <option key={segment.id} value={segment.segmen}>
                    {segment.segmen}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStage('');
                  setSelectedCategory('');
                  setSelectedSegment('');
                }}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid
        products={products}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewAttachments={handleViewAttachments}
        onAddProduct={handleAddProduct}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
      />

              {/* Product Detail Modal */}
              <ProductDetailModal
                isOpen={showDetailModal}
                onClose={() => {
                  setShowDetailModal(false);
                  setSelectedProduct(null);
                }}
                product={selectedProduct}
              />

              {/* Product Form Modal */}
              <ProductForm
                isOpen={showProductForm}
                onClose={() => {
                  setShowProductForm(false);
                  setSelectedProduct(null);
                }}
                onSuccess={handleFormSuccess}
                product={selectedProduct}
                mode={formMode}
              />

              {/* Attachment Modal */}
              <AttachmentModal
                isOpen={showAttachmentModal}
                onClose={() => {
                  setShowAttachmentModal(false);
                  setSelectedProduct(null);
                }}
                product={selectedProduct}
              />
            </div>
          );
        };

export default ProductPage;
