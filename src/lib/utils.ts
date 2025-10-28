import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  try {
    if (!clsx || !twMerge) {
      console.warn('clsx or twMerge is undefined, falling back to basic string concatenation');
      return inputs.filter(Boolean).join(' ');
    }
    return twMerge(clsx(inputs));
  } catch (error) {
    console.error('Error in cn function:', error);
    return inputs.filter(Boolean).join(' ');
  }
}
