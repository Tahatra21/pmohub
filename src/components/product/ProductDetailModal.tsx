import React from 'react';
import { X, Calendar, DollarSign, User, Tag, Building, FileText } from 'lucide-react';
import { Product } from '@/types';
import { 
  getProductStageName, 
  getProductSegmentName, 
  getProductCategoryName,
  formatCurrency,
  formatDate
} from '@/utils/productUtils';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detail Produk
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Name & Stage */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {product.produk}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageBadgeColor(product.stage)}`}>
                  {getProductStageName(product.stage)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {product.id}
                </span>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Kategori</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{getProductCategoryName(product.kategori)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Building className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Segmen</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{getProductSegmentName(product.segmen)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Customer</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{product.pelanggan || '-'}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Harga</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{formatCurrency(product.harga)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Tanggal Launch</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{formatDate(product.tanggal_launch)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Dibuat</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{formatDate(product.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.deskripsi && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Deskripsi</h4>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.deskripsi}
                </p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <span className="font-medium">Dibuat:</span> {formatDate(product.created_at)}
              </div>
              <div>
                <span className="font-medium">Diperbarui:</span> {formatDate(product.updated_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
