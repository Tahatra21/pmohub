/**
 * Currency formatting utilities for the PMO application
 * Provides consistent currency formatting across the application
 * Uses Indonesian Rupiah (IDR) formatting conventions:
 * - T = Triliun (Trillion)
 * - M = Milyard (Billion) 
 * - Jt = Juta (Million)
 * - Rb = Ribu (Thousand)
 */

/**
 * Format currency with abbreviated notation (e.g., Rp 26.77 M)
 * @param amount - The amount to format
 * @returns Formatted currency string with abbreviation
 */
export const formatCurrencyAbbreviated = (amount: number): string => {
  if (amount === 0) return 'Rp 0';
  
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1e12) {
    // Trillions (T) - Triliun
    return `Rp ${(amount / 1e12).toFixed(2)} T`;
  } else if (absAmount >= 1e9) {
    // Billions (M) - Milyard untuk Rupiah Indonesia
    return `Rp ${(amount / 1e9).toFixed(2)} M`;
  } else if (absAmount >= 1e6) {
    // Millions (Jt) - Juta untuk Rupiah Indonesia
    return `Rp ${(amount / 1e6).toFixed(2)} Jt`;
  } else if (absAmount >= 1e3) {
    // Thousands (Rb) - Ribu untuk Rupiah Indonesia
    return `Rp ${(amount / 1e3).toFixed(2)} Rb`;
  } else {
    // Less than 1000
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
};

/**
 * Format currency with full notation (e.g., Rp 26.774.704.518)
 * @param amount - The amount to format
 * @returns Formatted currency string with full notation
 */
export const formatCurrencyFull = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })}`;
};

/**
 * Format currency with custom decimal places
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted currency string with custom decimals
 */
export const formatCurrencyWithDecimals = (amount: number, decimals: number = 0): string => {
  return `Rp ${amount.toLocaleString('id-ID', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  })}`;
};

/**
 * Get currency abbreviation suffix based on amount
 * @param amount - The amount to check
 * @returns The appropriate suffix (T, M, Jt, Rb, or empty) for Indonesian Rupiah
 */
export const getCurrencySuffix = (amount: number): string => {
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1e12) return 'T';  // Triliun
  if (absAmount >= 1e9) return 'M';    // Milyard
  if (absAmount >= 1e6) return 'Jt';  // Juta
  if (absAmount >= 1e3) return 'Rb';  // Ribu
  return '';
};

/**
 * Convert amount to abbreviated value (without currency symbol)
 * @param amount - The amount to convert
 * @returns Object with value and suffix
 */
export const getAbbreviatedValue = (amount: number): { value: number; suffix: string } => {
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1e12) {
    return { value: amount / 1e12, suffix: 'T' };  // Triliun
  } else if (absAmount >= 1e9) {
    return { value: amount / 1e9, suffix: 'M' };   // Milyard
  } else if (absAmount >= 1e6) {
    return { value: amount / 1e6, suffix: 'Jt' };  // Juta
  } else if (absAmount >= 1e3) {
    return { value: amount / 1e3, suffix: 'Rb' };  // Ribu
  } else {
    return { value: amount, suffix: '' };
  }
};

/**
 * Parse abbreviated currency string back to number
 * @param currencyString - The currency string to parse (e.g., "Rp 26.77 M")
 * @returns The parsed number
 */
export const parseAbbreviatedCurrency = (currencyString: string): number => {
  if (!currencyString || currencyString === 'Rp 0') return 0;
  
  const cleanString = currencyString.replace('Rp ', '').trim();
  const lastChar = cleanString.slice(-1).toUpperCase();
  const numberPart = cleanString.slice(0, -1).trim();
  
  const multiplier = {
    'T': 1e12,   // Triliun
    'M': 1e9,    // Milyard
    'Jt': 1e6,   // Juta
    'Rb': 1e3,   // Ribu
  }[lastChar] || 1;
  
  const number = parseFloat(numberPart);
  return isNaN(number) ? 0 : number * multiplier;
};

/**
 * Format currency for tooltips and detailed views
 * Shows both abbreviated and full format
 * @param amount - The amount to format
 * @returns Object with abbreviated and full formats
 */
export const formatCurrencyDetailed = (amount: number): {
  abbreviated: string;
  full: string;
  value: number;
  suffix: string;
} => {
  const abbreviated = formatCurrencyAbbreviated(amount);
  const full = formatCurrencyFull(amount);
  const { value, suffix } = getAbbreviatedValue(amount);
  
  return {
    abbreviated,
    full,
    value,
    suffix
  };
};

// Example usage and test cases
export const currencyExamples = {
  // Test cases for different amounts
  examples: [
    { amount: 0, expected: 'Rp 0' },
    { amount: 500, expected: 'Rp 500' },
    { amount: 1500, expected: 'Rp 1.50 Rb' },
    { amount: 1500000, expected: 'Rp 1.50 Jt' },
    { amount: 1500000000, expected: 'Rp 1.50 M' },
    { amount: 1500000000000, expected: 'Rp 1.50 T' },
    { amount: 26774704518, expected: 'Rp 26.77 M' }, // Current budget
    { amount: 19109961146, expected: 'Rp 19.11 M' }, // Current spent
    { amount: 2434064047, expected: 'Rp 2.43 M' }, // Average per project
  ]
};
