import React, { useState } from 'react';
import { Eye, Edit, Trash2, Paperclip } from 'lucide-react';

interface Product {
  id: number;
  produk: string;
  deskripsi: string;
  id_kategori: number;
  id_segmen: number;
  id_stage: number;
  harga: number;
  tanggal_launch: string;
  pelanggan: string;
  created_at: string;
  updated_at: string;
  tanggal_stage_end: string;
  tanggal_stage_start: string;
  segmen: string;
  stage: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onViewAttachments: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onViewAttachments,
  onViewDetails
}) => {
  const [showActions, setShowActions] = useState(false);


  const getStageBadgeColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case 'introduction':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'growth':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'maturity':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'decline':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getSegmentBadgeColor = (segment: string) => {
    switch (segment?.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'consumer':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
      case 'sme':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'government':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-3">
              {product.produk}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStageBadgeColor(product.stage)}`}>
                {product.stage}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getSegmentBadgeColor(product.segmen)}`}>
                {product.segmen}
              </span>
            </div>
          </div>
        </div>

        {/* Key Information Section - Kategori & Customer */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Category {product.id_kategori || 'N/A'}</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]" title={product.pelanggan}>
              {product.pelanggan || 'PLN'}
            </span>
          </div>
        </div>

        {/* Product Description */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30 mb-6">
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Deskripsi Produk</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
            {product.deskripsi || 'Tidak ada deskripsi produk yang tersedia.'}
          </p>
        </div>

        {/* Attachments Section */}
        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
          <div className="flex items-center">
            <Paperclip className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Attachments</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">0</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onViewDetails(product)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 border border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Edit Product"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
