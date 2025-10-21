import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Upload, File } from 'lucide-react';
import { Product, Category, Segment, Stage } from '@/types';

interface DropdownOption {
  id: string;
  stage?: string;
  kategori?: string;
  segmen?: string;
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
  mode: 'create' | 'edit';
}

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
  mode
}) => {
  const [formData, setFormData] = useState({
    produk: '',
    deskripsi: '',
    id_kategori: '',
    id_segmen: '',
    id_stage: '',
    harga: '',
    tanggal_launch: '',
    pelanggan: ''
  });

  const [dropdownOptions, setDropdownOptions] = useState<{
    stages: DropdownOption[];
    categories: DropdownOption[];
    segments: DropdownOption[];
  }>({
    stages: [],
    categories: [],
    segments: []
  });

  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Fetch dropdown options
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        setLoadingDropdowns(true);
        const token = localStorage.getItem('auth_token');
        console.log('Token from localStorage:', token ? 'exists' : 'missing');
        
        const response = await fetch('/api/lifecycle/dropdowns', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
          console.log('Dropdown data received:', data.data);
          console.log('Categories:', data.data.categories);
          console.log('Segments:', data.data.segments);
          console.log('Stages:', data.data.stages);
          setDropdownOptions(data.data);
        } else {
          console.error('API Error:', data.message);
        }
      } catch (error) {
        console.error('Error fetching dropdown options:', error);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    if (isOpen) {
      fetchDropdownOptions();
    }
  }, [isOpen]);

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        produk: product.produk || '',
        deskripsi: product.deskripsi || '',
        id_kategori: product.id_kategori || '',
        id_segmen: product.id_segmen || '',
        id_stage: product.id_stage || '',
        harga: product.harga || '',
        tanggal_launch: product.tanggal_launch || '',
        pelanggan: product.pelanggan || ''
      });
    } else {
      setFormData({
        produk: '',
        deskripsi: '',
        id_kategori: '',
        id_segmen: '',
        id_stage: '',
        harga: '',
        tanggal_launch: '',
        pelanggan: ''
      });
    }
    setErrors({});
  }, [mode, product, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.produk.trim()) {
      newErrors.produk = 'Product name is required';
    }
    if (!formData.id_kategori) {
      newErrors.id_kategori = 'Category is required';
    }
    if (!formData.id_segmen) {
      newErrors.id_segmen = 'Segment is required';
    }
    if (!formData.id_stage) {
      newErrors.id_stage = 'Stage is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const url = mode === 'create' 
        ? '/api/lifecycle/products'
        : `/api/lifecycle/products/${product?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('produk', formData.produk);
      formDataToSend.append('deskripsi', formData.deskripsi || '');
      formDataToSend.append('id_kategori', formData.id_kategori);
      formDataToSend.append('id_segmen', formData.id_segmen);
      formDataToSend.append('id_stage', formData.id_stage);
      formDataToSend.append('harga', formData.harga || '');
      formDataToSend.append('tanggal_launch', formData.tanggal_launch || '');
      formDataToSend.append('pelanggan', formData.pelanggan || '');

      // Add files to FormData
      selectedFiles.forEach((file, index) => {
        formDataToSend.append(`files`, file);
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        setSelectedFiles([]); // Clear selected files
      } else {
        setErrors({ submit: data.message || 'An error occurred' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'An error occurred while saving' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Create New Product' : 'Edit Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="produk"
              value={formData.produk}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.produk ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              placeholder="Enter product name"
            />
            {errors.produk && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.produk}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter product description"
            />
          </div>

          {/* Category, Segment, Stage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="id_kategori"
                value={formData.id_kategori}
                onChange={handleInputChange}
                disabled={loadingDropdowns}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.id_kategori ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              >
                <option value="">Select Category</option>
                {dropdownOptions.categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.kategori}
                  </option>
                )) || <option disabled>Loading categories...</option>}
              </select>
              {loadingDropdowns && <p className="text-xs text-gray-500 mt-1">Loading categories...</p>}
              {!loadingDropdowns && dropdownOptions.categories?.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No categories available</p>
              )}
              {errors.id_kategori && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.id_kategori}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Segment *
              </label>
              <select
                name="id_segmen"
                value={formData.id_segmen}
                onChange={handleInputChange}
                disabled={loadingDropdowns}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.id_segmen ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              >
                <option value="">Select Segment</option>
                {dropdownOptions.segments?.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.segmen}
                  </option>
                )) || <option disabled>Loading segments...</option>}
              </select>
              {loadingDropdowns && <p className="text-xs text-gray-500 mt-1">Loading segments...</p>}
              {!loadingDropdowns && dropdownOptions.segments?.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No segments available</p>
              )}
              {errors.id_segmen && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.id_segmen}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stage *
              </label>
              <select
                name="id_stage"
                value={formData.id_stage}
                onChange={handleInputChange}
                disabled={loadingDropdowns}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.id_stage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              >
                <option value="">Select Stage</option>
                {dropdownOptions.stages?.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.stage}
                  </option>
                )) || <option disabled>Loading stages...</option>}
              </select>
              {loadingDropdowns && <p className="text-xs text-gray-500 mt-1">Loading stages...</p>}
              {!loadingDropdowns && dropdownOptions.stages?.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No stages available</p>
              )}
              {errors.id_stage && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.id_stage}</p>
              )}
            </div>
          </div>

          {/* Price and Launch Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price
              </label>
              <input
                type="number"
                name="harga"
                value={formData.harga}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter price"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Launch Date
              </label>
              <input
                type="date"
                name="tanggal_launch"
                value={formData.tanggal_launch}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Customer
            </label>
            <input
              type="text"
              name="pelanggan"
              value={formData.pelanggan}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter customer name"
            />
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attachments
            </label>
            <div className="space-y-4">
              {/* File Input */}
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload files or drag and drop
                  </span>
                </label>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected Files ({selectedFiles.length}):
                  </p>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center">
                          <File className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingDropdowns}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Saving...' : (mode === 'create' ? 'Create Product' : 'Update Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
