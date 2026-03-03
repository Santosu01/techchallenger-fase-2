import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSystemStatus, type ServiceStatus } from '../../hooks/use-system-status';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const StatusDot: React.FC<{ status: ServiceStatus }> = ({ status }) => (
  <div
    className={cn(
      'w-1.5 h-1.5 rounded-full transition-shadow duration-300',
      status === 'up' && 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
      status === 'down' && 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]',
      status === 'checking' && 'bg-amber-500 animate-pulse'
    )}
  />
);

const StatusBadge: React.FC<{ status: ServiceStatus }> = ({ status }) => (
  <span
    className={cn(
      'text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-tighter',
      status === 'up' && 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
      status === 'down' && 'text-rose-500 border-rose-500/20 bg-rose-500/5',
      status === 'checking' && 'text-amber-500 border-amber-500/20 bg-amber-500/5'
    )}
  >
    {status}
  </span>
);

const SystemHealthIndicator: React.FC<{
  isAllUp: boolean;
  someDown: boolean;
}> = ({ isAllUp, someDown }) => {
  const indicatorColor = () => {
    if (isAllUp) return 'bg-emerald-500 animate-pulse';
    if (someDown) return 'bg-rose-500';
    return 'bg-amber-500 animate-pulse';
  };

  const statusText = () => {
    if (isAllUp) return 'Sistemas OK';
    if (someDown) return 'Instabilidade';
    return 'Verificando...';
  };

  return (
    <>
      <div className={cn('w-2 h-2 rounded-full', indicatorColor())} />
      <span className="text-[11px] font-semibold text-ellipsis overflow-hidden whitespace-nowrap">
        {statusText()}
      </span>
    </>
  );
};

export const SystemStatusPanel: React.FC = () => {
  const { status } = useSystemStatus();

  const isAllUp = Object.values(status).every((state) => state === 'up');
  const someDown = Object.values(status).includes('down');

  return (
    <div className="p-4 glass rounded-2xl border border-glass-border">
      <div className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-3">
        Status do Sistema
      </div>

      <div className="space-y-3">
        {Object.entries(status).map(([service, state]) => (
          <div key={service} className="flex items-center justify-between group/status">
            <div className="flex items-center gap-2">
              <StatusDot status={state} />
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary group-hover/status:text-text-primary transition-colors text-ellipsis overflow-hidden whitespace-nowrap max-w-20">
                {service}
              </span>
            </div>
            <StatusBadge status={state} />
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-glass-border flex items-center gap-2">
        <SystemHealthIndicator isAllUp={isAllUp} someDown={someDown} />
      </div>
    </div>
  );
};
