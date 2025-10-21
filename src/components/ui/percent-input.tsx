'use client';

import { forwardRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PercentInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: number;
  onValueChange?: (value: number) => void;
  max?: number;
}

export const PercentInput = forwardRef<HTMLInputElement, PercentInputProps>(
  ({ className, value, onValueChange, onChange, max = 100, ...props }, ref) => {
    const [inputValue, setInputValue] = useState('');

    // Update internal state when external value changes
    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value.toString());
      }
    }, [value]);

    const parsePercent = (str: string): number => {
      // Allow empty string and handle various input formats
      if (str === '' || str === '.') return 0;
      
      // Replace comma with dot for Indonesian locale support
      const normalizedStr = str.replace(',', '.');
      const numericValue = parseFloat(normalizedStr) || 0;
      return Math.min(Math.max(numericValue, 0), max);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      // Allow only numbers, dots, commas, and empty string
      const validPattern = /^[0-9]*[.,]?[0-9]*$/;
      if (!validPattern.test(newValue)) {
        return; // Don't update if invalid input
      }
      
      // Update internal state immediately for free typing
      setInputValue(newValue);
      
      // Parse and send numeric value to parent
      const numericValue = parsePercent(newValue);
      
      // Call both onChange handlers
      if (onChange) {
        onChange(e);
      }
      
      if (onValueChange) {
        onValueChange(numericValue);
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          className={cn('pr-8', className)}
          value={inputValue}
          onChange={handleChange}
          placeholder="0.00"
          type="text"
          {...props}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
          %
        </span>
      </div>
    );
  }
);

PercentInput.displayName = 'PercentInput';
