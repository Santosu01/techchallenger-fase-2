import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Key,
  Flag,
  Target,
  PlayCircle,
  BarChart3,
  ToggleLeft,
  X,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { useAuthContext } from '../context/useAuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { status, isAllUp, someDown } = useSystemStatus();
  const { activeApiKey, setActiveApiKey } = useAuthContext();

  const menuItems = [
    { title: 'Dashboard', path: '/', icon: LayoutDashboard },
    { title: 'Authentication', path: '/auth', icon: Key },
    { title: 'Feature Flags', path: '/flags', icon: Flag },
    { title: 'Targeting Rules', path: '/targeting', icon: Target },
    { title: 'Evaluation API', path: '/evaluation', icon: PlayCircle },
    { title: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 w-64 glass border-r border-glass-border flex flex-col p-6 z-50 transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
              <ToggleLeft className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Toggle<span className="gradient-text">Master</span>
            </h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group',
                  isActive
                    ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                )
              }
            >
              <item.icon
                className={cn('w-5 h-5 transition-transform duration-300', 'group-hover:scale-110')}
              />
              <span className="font-medium text-sm">{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* API Key Management */}
        <div className="mt-8 mb-6 p-4 glass rounded-2xl border border-blue-500/20 bg-blue-500/5">
          <label className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-2 block">
            Active API Key
          </label>
          <div className="relative">
            <input
              type="password"
              value={activeApiKey || ''}
              onChange={(e) => setActiveApiKey(e.target.value || null)}
              placeholder="Nenhuma chave ativa"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-blue-300 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-500/50" />
          </div>
          <p className="mt-2 text-[9px] text-text-secondary leading-tight italic">
            Esta chave autentica todas as chamadas de serviço.
          </p>
        </div>

        <div className="p-4 glass rounded-2xl border border-glass-border">
          <div className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-3">
            Status do Sistema
          </div>

          <div className="space-y-3">
            {Object.entries(status).map(([service, state]) => (
              <div key={service} className="flex items-center justify-between group/status">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-shadow duration-300',
                      state === 'up' && 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
                      state === 'down' && 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]',
                      state === 'checking' && 'bg-amber-500 animate-pulse'
                    )}
                  />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary group-hover/status:text-text-primary transition-colors text-ellipsis overflow-hidden whitespace-nowrap max-w-[80px]">
                    {service}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-tighter',
                    state === 'up' && 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
                    state === 'down' && 'text-rose-500 border-rose-500/20 bg-rose-500/5',
                    state === 'checking' && 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                  )}
                >
                  {state}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-glass-border flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isAllUp
                  ? 'bg-emerald-500 animate-pulse'
                  : someDown
                    ? 'bg-rose-500'
                    : 'bg-amber-500 animate-pulse'
              )}
            />
            <span className="text-[11px] font-semibold text-ellipsis overflow-hidden whitespace-nowrap">
              {isAllUp ? 'Sistemas OK' : someDown ? 'Instabilidade' : 'Verificando...'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
