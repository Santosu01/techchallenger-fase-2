import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Key, Flag, Target, PlayCircle, BarChart3, Gauge } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarNavProps {
  onClose: () => void;
}

const MENU_ITEMS = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Authentication', path: '/auth', icon: Key },
  { title: 'Feature Flags', path: '/flags', icon: Flag },
  { title: 'Targeting Rules', path: '/targeting', icon: Target },
  { title: 'Evaluation API', path: '/evaluation', icon: PlayCircle },
  { title: 'Analytics', path: '/analytics', icon: BarChart3 },
  { title: 'Load Test', path: '/load-test', icon: Gauge },
] as const;

export const SidebarNav: React.FC<SidebarNavProps> = ({ onClose }) => {
  return (
    <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
      {MENU_ITEMS.map((item) => (
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
  );
};
