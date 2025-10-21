// Utility functions for handling product relations
export const getProductStageName = (stage: any): string => {
  if (typeof stage === 'string') {
    return stage;
  }
  return stage?.stage || 'Unknown';
};

export const getProductSegmentName = (segment: any): string => {
  if (typeof segment === 'string') {
    return segment;
  }
  return segment?.segmen || 'Unknown';
};

export const getProductCategoryName = (category: any): string => {
  if (typeof category === 'string') {
    return category;
  }
  return category?.kategori || 'Unknown';
};

// Badge color utilities
export const getStageBadgeColor = (stage: any): string => {
  const stageName = getProductStageName(stage);
  switch (stageName?.toLowerCase()) {
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

export const getSegmentBadgeColor = (segment: any): string => {
  const segmentName = getProductSegmentName(segment);
  switch (segmentName?.toLowerCase()) {
    case 'enterprise':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    case 'consumer':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
    case 'sme':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
    case 'government':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    case 'distribusi':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'ep & pembangkit':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'korporat':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    case 'pelayanan pelanggan':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
    case 'transmisi':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

// Format currency for Indonesian Rupiah
export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'Rp 0';
  
  if (numAmount >= 1000000000) {
    return `Rp ${(numAmount / 1000000000).toFixed(2)}M`; // M = Milyard (Billion)
  } else if (numAmount >= 1000000) {
    return `Rp ${(numAmount / 1000000).toFixed(2)}Jt`; // Jt = Juta (Million)
  } else if (numAmount >= 1000) {
    return `Rp ${(numAmount / 1000).toFixed(2)}Rb`; // Rb = Ribu (Thousand)
  } else {
    return `Rp ${numAmount.toLocaleString('id-ID')}`;
  }
};

// Format date for Indonesian locale
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};
