import React from 'react';
import { ToggleLeft, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SidebarNav } from './SidebarNav';
import { SystemStatusPanel } from './SystemStatusPanel';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
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

        <SidebarNav onClose={onClose} />
        <SystemStatusPanel />
      </aside>
    </>
  );
};
