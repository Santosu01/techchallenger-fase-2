import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 glass border-b border-glass-border sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">ToggleMaster</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-white/5 rounded-xl text-text-secondary border border-glass-border"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:ml-64 overflow-y-auto w-full transition-all duration-300">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Background Orbs for Premium Look */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/20 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/20 blur-[120px] rounded-full -z-10" />
    </div>
  );
};

export default Layout;
