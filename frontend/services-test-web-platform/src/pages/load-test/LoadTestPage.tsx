import React from 'react';
import { Gauge } from 'lucide-react';
import { useLoadTest, type ServiceId } from '../../hooks/use-load-test';
import { useSystemStatus } from '../../hooks/use-system-status';
import { ServiceStatusBadge } from '../../components/ServiceStatusBadge';
import { LoadTestConfigForm, type LoadTestFormData } from './LoadTestConfigForm';
import { LoadTestStats, LoadTestEmptyState } from './LoadTestStats';

const LoadTestPage: React.FC = () => {
  const { isRunning, results, stats, progress, runTest, reset } = useLoadTest();
  const { status } = useSystemStatus();

  const handleSubmit = async (data: LoadTestFormData) => {
    await runTest(data.service as ServiceId, {
      concurrent: data.concurrent,
      total: data.total,
    });
  };

  const hasResults = results.length > 0;
  const showEmptyState = results.length === 0 && !isRunning;

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 text-cyan-500">
              <Gauge className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold italic">Load Testing & Escalabilidade</h2>
          </div>
          <ServiceStatusBadge
            status={status.evaluation}
            className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5"
          />
        </div>
        <p className="text-text-secondary max-w-3xl leading-relaxed">
          Teste a escalabilidade dos serviços simulando múltiplas requisições simultâneas. Acompanhe
          métricas em tempo real e valide o comportamento sob carga.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <LoadTestConfigForm
          isRunning={isRunning}
          hasResults={hasResults}
          progress={progress}
          onSubmit={handleSubmit}
          onReset={reset}
        />

        <section className="lg:col-span-2 space-y-6">
          {showEmptyState ? (
            <LoadTestEmptyState message="Configure e inicie um teste de carga." />
          ) : (
            <LoadTestStats stats={stats} />
          )}
        </section>
      </div>
    </div>
  );
};

export default LoadTestPage;
