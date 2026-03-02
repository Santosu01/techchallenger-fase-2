import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-accent-primary transition-all text-sm placeholder:text-white/20 disabled:opacity-50',
          error && 'border-rose-500/50 focus:border-rose-500',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
