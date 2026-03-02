import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-accent-primary transition-all text-sm appearance-none disabled:opacity-50 pr-10',
            error && 'border-rose-500/50 focus:border-rose-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
