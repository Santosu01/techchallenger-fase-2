import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: 'gradient-bg text-white shadow-lg shadow-accent-primary/20 hover:opacity-90',
      secondary: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20',
      ghost: 'bg-transparent hover:bg-white/5 text-text-secondary hover:text-white',
      outline:
        'bg-transparent border border-accent-primary/30 text-accent-primary hover:bg-accent-primary/10',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs rounded-xl',
      md: 'px-6 py-3 text-sm rounded-2xl',
      lg: 'px-8 py-4 text-base rounded-[2rem]',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          'relative font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 group',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span className={cn(isLoading && 'opacity-0')}>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
