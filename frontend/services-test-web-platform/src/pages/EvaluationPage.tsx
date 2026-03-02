import React from 'react';
import { PlayCircle, Zap, Terminal, Cpu } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEvaluation } from '../hooks/useEvaluation';
import FormField from '../components/form/FormField';
import Input from '../components/form/Input';
import Button from '../components/ui/Button';

import { useSystemStatus } from '../hooks/useSystemStatus';
import { ServiceStatusBadge } from '../components/ServiceStatusBadge';

const evaluationSchema = z.object({
  user_id: z.string().min(1, 'Identify the user'),
  flag_name: z.string().min(1, 'Target flag name is required'),
  apiKey: z.string().min(10, 'A valid API Key is required (min 10 chars)'),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

const EvaluationPage: React.FC = () => {
  const { evaluate, isEvaluating, error, result } = useEvaluation();
  const { status } = useSystemStatus();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      user_id: 'user-123',
      flag_name: '',
      apiKey: '',
    },
  });

  const onSubmit = async (data: EvaluationFormData) => {
    await evaluate(data);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-500">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold italic">Evaluation API (Hot Path)</h2>
          </div>
          <ServiceStatusBadge
            status={status.evaluation}
            className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5"
          />
        </div>
        <p className="text-text-secondary max-w-3xl leading-relaxed">
          Este é o motor do ToggleMaster. Desenvolvido em Go para máxima performance, este endpoint
          consulta o Redis para cache de regras e flags, garantindo latências inferiores a 10ms.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test UI */}
        <section className="glass rounded-3xl p-8 border border-white/5">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-500" />
            Simulação de Requisição
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="User ID" error={errors.user_id?.message} required>
                <Input
                  {...register('user_id')}
                  placeholder="ex: user-123"
                  error={!!errors.user_id}
                />
              </FormField>

              <FormField label="Flag Name" error={errors.flag_name?.message} required>
                <Input
                  {...register('flag_name')}
                  placeholder="ex: enable-v8"
                  error={!!errors.flag_name}
                />
              </FormField>
            </div>

            <FormField
              label="SERVICE API KEY"
              error={errors.apiKey?.message}
              description="Header: X-API-Key"
              required
            >
              <Input
                type="password"
                {...register('apiKey')}
                placeholder="Cole sua chave gerada no Auth Service"
                className="font-mono"
                error={!!errors.apiKey}
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              isLoading={isEvaluating}
              className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40"
              leftIcon={!isEvaluating && <Zap className="w-5 h-5" />}
            >
              Executar Avaliação
            </Button>
          </form>
        </section>

        {/* JSON Result Output */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-500" />
              Console Output
            </h3>
            {result && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold uppercase tracking-wider">
                Success 200 OK
              </span>
            )}
          </div>

          <div className="flex-1 glass rounded-3xl border border-white/5 overflow-hidden flex flex-col min-h-[300px]">
            {result ? (
              <div className="p-6 font-mono text-sm h-full flex flex-col">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">
                      Resultado Final
                    </span>
                    <div
                      className={`text-2xl font-bold mt-1 ${result.enabled ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      {result.enabled ? 'ENABLED' : 'DISABLED'}
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">
                      Fonte
                    </span>
                    <div className="text-lg font-bold mt-1 text-white">
                      {result.reason || 'Evaluation Engine'}
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-2 block">
                    Raw Response
                  </span>
                  <pre className="bg-black/30 p-4 rounded-xl text-emerald-300 text-xs overflow-x-auto border border-white/5">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-rose-500/5">
                <h4 className="font-bold text-rose-500 mb-2">Erro na Execução</h4>
                <p className="text-rose-400/70 text-sm italic">
                  {error instanceof Error
                    ? error.message
                    : 'Erro na avaliação. Verifique a chave e se o serviço está rodando.'}
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-secondary/20 italic">
                Aguardando parâmetros para execução...
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EvaluationPage;
