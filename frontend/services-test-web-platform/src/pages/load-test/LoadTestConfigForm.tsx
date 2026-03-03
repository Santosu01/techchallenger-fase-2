import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Zap, Play, RotateCcw } from 'lucide-react';
import FormField from '../../components/form/FormField';
import Input from '../../components/form/Input';
import Select from '../../components/form/Select';
import Button from '../../components/ui/Button';

const loadTestSchema = z.object({
  service: z.enum(['auth', 'flag', 'targeting', 'evaluation', 'analytics']),
  concurrent: z.number().min(1).max(100),
  total: z.number().min(1).max(10000),
});

export type LoadTestFormData = z.infer<typeof loadTestSchema>;

const SERVICES = [
  { value: 'auth', label: 'Auth Service (Go)' },
  { value: 'flag', label: 'Flag Service (Python)' },
  { value: 'targeting', label: 'Targeting Service (Python)' },
  { value: 'evaluation', label: 'Evaluation Service (Go)' },
  { value: 'analytics', label: 'Analytics Service (Python)' },
] as const;

interface LoadTestConfigFormProps {
  isRunning: boolean;
  hasResults: boolean;
  progress: number;
  onSubmit: (data: LoadTestFormData) => Promise<void>;
  onReset: () => void;
}

export const LoadTestConfigForm: React.FC<LoadTestConfigFormProps> = ({
  isRunning,
  hasResults,
  progress,
  onSubmit,
  onReset,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoadTestFormData>({
    resolver: zodResolver(loadTestSchema),
    defaultValues: {
      service: 'evaluation',
      concurrent: 10,
      total: 100,
    },
  });

  return (
    <section className="glass rounded-3xl p-8 border border-white/5 h-fit">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-cyan-500" />
        Configurar Teste
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField label="Serviço Alvo" error={errors.service?.message} required>
          <Select {...register('service')} disabled={isRunning}>
            {SERVICES.map((s) => (
              <option key={s.value} value={s.value} className="bg-bg-secondary">
                {s.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Requisições Simultâneas"
          error={errors.concurrent?.message}
          description="Número de requisições paralelas"
          required
        >
          <Input
            type="number"
            {...register('concurrent', { valueAsNumber: true })}
            min={1}
            max={100}
            disabled={isRunning}
          />
        </FormField>

        <FormField
          label="Total de Requisições"
          error={errors.total?.message}
          description="Quantidade total de requisições"
          required
        >
          <Input
            type="number"
            {...register('total', { valueAsNumber: true })}
            min={1}
            max={10000}
            disabled={isRunning}
          />
        </FormField>

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            isLoading={isRunning}
            disabled={isRunning}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40"
            leftIcon={!isRunning && <Play className="w-5 h-5" />}
          >
            {isRunning ? 'Executando...' : 'Iniciar Teste'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onReset}
            disabled={isRunning || !hasResults}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {isRunning && (
        <div className="mt-6">
          <div className="flex justify-between text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-gradient-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
};
