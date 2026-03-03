import React from 'react';
import { Target } from 'lucide-react';
import { useTargeting } from '../../hooks/use-targeting';
import { useFlags } from '../../hooks/use-flags';
import { useConfirm } from '../../hooks/use-confirm';
import { useSystemStatus } from '../../hooks/use-system-status';
import { ServiceStatusBadge } from '../../components/ServiceStatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { TargetingForm, type TargetingFormData } from './TargetingForm';
import { TargetingRulesTable } from './TargetingRulesTable';

const TargetingPage: React.FC = () => {
  const {
    rules,
    isLoading: isLoadingRules,
    createRule,
    isCreating,
    deleteRule,
    refetch,
  } = useTargeting();
  const { flags } = useFlags();
  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();
  const { status } = useSystemStatus();

  const handleCreate = async (data: TargetingFormData) => {
    await createRule(data);
  };

  const handleDelete = async (flagName: string) => {
    const isConfirmed = await confirm({
      title: 'Remover Regra',
      message: 'Tem certeza que deseja excluir esta regra de segmentação?',
      confirmLabel: 'Excluir',
      isDestructive: true,
    });

    if (!isConfirmed) return;

    await deleteRule(flagName);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-700">
      <header>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30 text-pink-500">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold italic">Targeting Rules Service</h2>
          </div>
          <ServiceStatusBadge
            status={status.targeting}
            className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5"
          />
        </div>
        <p className="text-text-secondary max-w-3xl leading-relaxed">
          Defina regras de segmentação granular. Determine quem vê o quê através de rollouts
          baseados em porcentagem, IDs de usuário específicos ou atributos customizados.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <TargetingForm
          flags={flags}
          isCreating={isCreating}
          isLoading={isLoadingRules}
          onCreate={handleCreate}
          onRefresh={refetch}
        />
        <TargetingRulesTable
          rules={rules}
          isLoading={isLoadingRules}
          onDelete={handleDelete}
          onRefresh={refetch}
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

export default TargetingPage;
