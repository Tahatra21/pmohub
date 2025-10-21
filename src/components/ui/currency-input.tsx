'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: number;
  onValueChange?: (value: number) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, onChange, ...props }, ref) => {
    const formatCurrency = (val: number): string => {
      return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val);
    };

    const parseCurrency = (str: string): number => {
      // Remove all non-digit characters
      const numericString = str.replace(/\D/g, '');
      return parseInt(numericString, 10) || 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = parseCurrency(e.target.value);
      
      // Call both onChange handlers
      if (onChange) {
        onChange(e);
      }
      
      if (onValueChange) {
        onValueChange(numericValue);
      }
    };

    const displayValue = value !== undefined ? formatCurrency(value) : '';

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
          Rp
        </span>
        <Input
          ref={ref}
          className={cn('pl-10', className)}
          value={displayValue}
          onChange={handleChange}
          placeholder="0"
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
