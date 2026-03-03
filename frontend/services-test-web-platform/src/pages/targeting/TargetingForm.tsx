import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import FormField from '../../components/form/FormField';
import Select from '../../components/form/Select';
import Button from '../../components/ui/Button';

const targetingSchema = z.object({
  flag_name: z.string().min(1, 'Selecione uma flag'),
  rule_type: z.string().min(1, 'Selecione o tipo de regra'),
  rule_value: z.string().min(1),
  rollout_percent: z.number().min(0).max(100),
});

export type TargetingFormData = z.infer<typeof targetingSchema>;

interface FlagOption {
  name: string;
}

interface TargetingFormProps {
  flags: FlagOption[];
  isCreating: boolean;
  isLoading: boolean;
  onCreate: (data: TargetingFormData) => Promise<void>;
  onRefresh: () => Promise<unknown>;
}

export const TargetingForm: React.FC<TargetingFormProps> = ({
  flags,
  isCreating,
  isLoading,
  onCreate,
  onRefresh,
}) => {
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

  // eslint-disable-next-line react-hooks/incompatible-library
  const rolloutValue = watch('rollout_percent');

  React.useEffect(() => {
    if (flags.length > 0) {
      setValue('flag_name', flags[0].name, { shouldValidate: true });
    }
  }, [flags, setValue]);

  const handleRefresh = async () => {
    try {
      await onRefresh();
      toast.info('Regras atualizadas.');
    } catch {
      toast.error('Falha ao sincronizar regras.');
    }
  };

  return (
    <section className="lg:col-span-1 glass rounded-3xl p-8 border border-white/5 h-fit">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 text-pink-500" />
          Configurar Regra
        </h3>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-white/5 rounded-full text-text-secondary transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onCreate)} className="space-y-6">
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
  );
};
