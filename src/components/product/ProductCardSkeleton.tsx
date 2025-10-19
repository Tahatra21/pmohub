import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md mb-2 animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Product Info */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Price and Launch Date */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="h-3 w-14 bg-gray-200 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Description */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
