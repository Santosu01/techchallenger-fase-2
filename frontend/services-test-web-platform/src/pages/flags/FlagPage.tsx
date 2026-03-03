import React from 'react';
import { Flag } from 'lucide-react';
import { useFlags } from '../../hooks/use-flags';
import { useConfirm } from '../../hooks/use-confirm';
import { useSystemStatus } from '../../hooks/use-system-status';
import { ServiceStatusBadge } from '../../components/ServiceStatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { FlagCreateForm } from './FlagCreateForm';
import { FlagList } from './FlagList';

const FlagPage: React.FC = () => {
  const { flags, isLoading, error, createFlag, isCreating, toggleFlag, deleteFlag } = useFlags();
  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();
  const { status } = useSystemStatus();

  const handleDelete = async (name: string) => {
    const isConfirmed = await confirm({
      title: 'Excluir Flag',
      message: 'Tem certeza que deseja remover esta flag? Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      isDestructive: true,
    });

    if (!isConfirmed) return;

    await deleteFlag(name);
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 text-purple-500">
              <Flag className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold italic">Feature Flag Service</h2>
          </div>
          <ServiceStatusBadge
            status={status.flag}
            className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5"
          />
        </div>
        <p className="text-text-secondary max-w-3xl leading-relaxed">
          O serviço de Flags permite que você gerencie o ciclo de vida de funcionalidades em tempo
          real. Os dados são sincronizados no PostgreSQL para persistência de longo prazo.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <FlagCreateForm isCreating={isCreating} onCreate={createFlag} />
        <FlagList
          flags={flags}
          isLoading={isLoading}
          error={error}
          onToggle={toggleFlag}
          onDelete={handleDelete}
        />
      </div>

      <ConfirmDialog
        isOpen={isOpen}
        title={options?.title || ''}
        message={options?.message || ''}
        confirmLabel={options?.confirmLabel}
        isDestructive={options?.isDestructive}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default FlagPage;
