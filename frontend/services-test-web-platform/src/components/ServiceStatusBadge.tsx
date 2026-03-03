import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type ServiceStatus } from '../hooks/use-system-status';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
  className?: string;
  showText?: boolean;
}

export const ServiceStatusBadge = React.memo<ServiceStatusBadgeProps>(
  ({ status, className, showText = true }) => {
    const getStatusText = (): string => {
      if (status === 'checking') return 'Checking';
      if (status === 'up') return 'Online';
      return 'Offline';
    };

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div
          className={cn(
            'w-2 h-2 rounded-full transition-shadow duration-300',
            status === 'up' && 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
            status === 'down' && 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]',
            status === 'checking' && 'bg-amber-500 animate-pulse'
          )}
        />
        {showText && (
          <span
            className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider transition-colors',
              status === 'up' && 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
              status === 'down' && 'text-rose-500 border-rose-500/20 bg-rose-500/5',
              status === 'checking' && 'text-amber-500 border-amber-500/20 bg-amber-500/5'
            )}
          >
            {getStatusText()}
          </span>
        )}
      </div>
    );
  }
);

ServiceStatusBadge.displayName = 'ServiceStatusBadge';
