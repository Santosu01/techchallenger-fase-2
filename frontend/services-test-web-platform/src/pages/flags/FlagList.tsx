import React from 'react';
import { Flag, List, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Flag {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
}

interface FlagListProps {
  flags: Flag[];
  isLoading: boolean;
  error: unknown;
  onToggle: (name: string, currentStatus: boolean) => void;
  onDelete: (name: string) => void;
}

const FlagCard: React.FC<{
  flag: Flag;
  onToggle: (name: string, currentStatus: boolean) => void;
  onDelete: (name: string) => void;
}> = ({ flag, onToggle, onDelete }) => (
  <div className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight text-sm">
          {flag.name}
        </h4>
        <p className="text-[10px] text-text-secondary mt-1 max-w-[200px] line-clamp-1 italic">
          {flag.description || 'Sem descrição'}
        </p>
      </div>
      <button
        onClick={() => onToggle(flag.name, flag.is_enabled)}
        className={cn(
          'w-12 h-6 rounded-full p-1 transition-colors duration-300 relative',
          flag.is_enabled ? 'bg-purple-500' : 'bg-white/10'
        )}
      >
        <div
          className={cn(
            'w-4 h-4 bg-white rounded-full transition-transform duration-300',
            flag.is_enabled ? 'translate-x-6' : 'translate-x-0'
          )}
        />
      </button>
    </div>

    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            flag.is_enabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/30'
          )}
        />
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
          {flag.is_enabled ? 'Ativa' : 'Inativa'}
        </span>
      </div>
      <button
        onClick={() => onDelete(flag.name)}
        className="p-2 hover:bg-rose-500/10 rounded-lg text-text-secondary hover:text-rose-500 transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="col-span-full py-16 text-center glass rounded-3xl border border-dashed border-white/10">
    <Flag className="w-12 h-12 text-white/10 mx-auto mb-4" />
    <p className="text-text-secondary text-sm">Nenhuma flag encontrada.</p>
  </div>
);

const LoadingState: React.FC = () => (
  <div className="col-span-full p-4 rounded-2xl flex items-center gap-3 text-sm bg-white/5 text-text-secondary">
    <Loader2 className="w-5 h-5 animate-spin" />
    Carregando flags...
  </div>
);

const ErrorState: React.FC = () => (
  <div className="col-span-full p-4 rounded-2xl flex items-center gap-3 text-sm bg-rose-500/10 border border-rose-500/20 text-rose-400">
    <AlertCircle className="w-5 h-5" />
    Erro ao carregar flags.
  </div>
);

export const FlagList: React.FC<FlagListProps> = ({
  flags,
  isLoading,
  error,
  onToggle,
  onDelete,
}) => {
  if (error) return <ErrorState />;
  if (isLoading && flags.length === 0) return <LoadingState />;

  return (
    <section className="lg:col-span-2 space-y-4">
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <List className="w-5 h-5 text-purple-500" />
          Flags Ativas
        </h3>
        <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-text-secondary uppercase tracking-widest border border-white/5">
          {flags.length} total
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flags.map((flag) => (
          <FlagCard key={flag.id} flag={flag} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </div>

      {flags.length === 0 && !isLoading && <EmptyState />}
    </section>
  );
};
