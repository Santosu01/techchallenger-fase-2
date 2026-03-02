import React from 'react';
import { Target, Trash2, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTargeting } from '../hooks/useTargeting';
import { useFlags } from '../hooks/useFlags';
import { useConfirm } from '../hooks/useConfirm';
import ConfirmDialog from '../components/ConfirmDialog';
import FormField from '../components/form/FormField';
import Select from '../components/form/Select';
import Button from '../components/ui/Button';

import { useSystemStatus } from '../hooks/useSystemStatus';
import { ServiceStatusBadge } from '../components/ServiceStatusBadge';

const targetingSchema = z.object({
  flag_name: z.string().min(1, 'Selecione uma flag'),
  rule_type: z.string().min(1, 'Selecione o tipo de regra'),
  rule_value: z.string().min(1),
  rollout_percent: z.number().min(0).max(100),
});

type TargetingFormData = z.infer<typeof targetingSchema>;

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TargetingFormData>({
    resolver: zodResolver(targetingSchema),
    defaultValues: {
      flag_name: '',
      rule_type: 'rollout',
      rule_value: 'default',
      rollout_percent: 100,
    },
  });

  const rolloutValue = watch('rollout_percent');

  // Set default flag if not set and flags are available
  React.useEffect(() => {
    if (flags.length > 0) {
      // We don't want to overwrite if the user already selected something or it's already set
      setValue('flag_name', flags[0].name, { shouldValidate: true });
    }
  }, [flags, setValue]);

  const handleCreate = async (data: TargetingFormData) => {
    await createRule(data);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Remover Regra',
      message: 'Tem certeza que deseja excluir esta regra de segmentação?',
      confirmLabel: 'Excluir',
      isDestructive: true,
    });

    if (!isConfirmed) return;

    await deleteRule(id);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.info('Regras atualizadas.');
    } catch {
      toast.error('Falha ao sincronizar regras.');
    }
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
        {/* Rules Form */}
        <section className="lg:col-span-1 glass rounded-3xl p-8 border border-white/5 h-fit">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-pink-500" />
            Configurar Regra
          </h3>

          <form onSubmit={handleSubmit(handleCreate)} className="space-y-6">
            <FormField label="Flag Alvo" error={errors.flag_name?.message} required>
              <Select {...register('flag_name')} disabled={isCreating || flags.length === 0}>
                {flags.map((f) => (
                  <option key={f.name} value={f.name} className="bg-bg-secondary">
                    {f.name}
                  </option>
                ))}
                {flags.length === 0 && <option value="">Nenhuma flag disponível</option>}
              </Select>
            </FormField>

            <FormField
              label={`Percentual de Rollout (${rolloutValue}%)`}
              error={errors.rollout_percent?.message}
            >
              <input
                type="range"
                min="0"
                max="100"
                {...register('rollout_percent', { valueAsNumber: true })}
                className="w-full accent-pink-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                disabled={isCreating}
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating}
              disabled={flags.length === 0}
              className="w-full bg-pink-600 hover:bg-pink-500 shadow-pink-900/40"
            >
              Adicionar Regra
            </Button>
          </form>
        </section>

        {/* Rules List */}
        <section className="lg:col-span-3">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold">Regras Ativas</h3>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-white/5 rounded-full text-text-secondary transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingRules ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto glass rounded-3xl border border-white/5">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-white/5">
                    Flag
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-white/5">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-white/5">
                    Rollout
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-white/5 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rules.map((rule) => {
                  // O backend retorna 'rules' como um objeto JSONB.
                  // Precisamos extrair 'type' e 'rollout_percent' de dentro dele.
                  const ruleData =
                    typeof rule.rules === 'string' ? JSON.parse(rule.rules) : rule.rules;

                  return (
                    <tr key={rule.flag_name} className="hover:bg-white/2.5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-white text-sm">{rule.flag_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20 italic">
                          {ruleData?.type || 'rollout'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-pink-500"
                              style={{ width: `${ruleData?.rollout_percent ?? 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-text-secondary">
                            {ruleData?.rollout_percent ?? 100}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(rule.flag_name as unknown as number)}
                          className="p-2 hover:bg-rose-500/10 rounded-lg text-text-secondary hover:text-rose-500 transition-all font-bold"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rules.length === 0 && !isLoadingRules && (
              <div className="py-20 text-center italic text-text-secondary/50 text-sm">
                Nenhuma regra de segmentação configurada.
              </div>
            )}
          </div>
        </section>
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
