import React, { useState } from 'react';
import { BarChart3, Activity, Database, Cloud, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { ServiceStatusBadge } from '../components/ServiceStatusBadge';

const AnalyticsPage: React.FC = () => {
  const { health, isLoading, refetch } = useAnalytics();
  const { status } = useSystemStatus();
  const [lastCheck, setLastCheck] = useState<string>('--:--:--');

  React.useEffect(() => {
    if (health) {
      setLastCheck(new Date().toLocaleTimeString());
    }
  }, [health]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.info('Status do Worker atualizado.');
    } catch {
      toast.error('Falha ao verificar status do worker.');
    }
  };

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-500">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-extrabold italic">Analytics Worker Service</h2>
            </div>
            <ServiceStatusBadge
              status={status.analytics}
              className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5"
            />
          </div>
          <p className="text-text-secondary max-w-2xl leading-relaxed">
            O Worker de Analytics processa eventos de avaliação de forma assíncrona. Ele escuta a
            fila SQS do LocalStack e persiste o histórico detalhado no DynamoDB.
          </p>
        </div>

        <div className="glass px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 w-full justify-center"
          >
            <RefreshCw
              className={`w-5 h-5 text-text-secondary ${isLoading ? 'animate-spin' : ''}`}
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
              Refresh Worker Status
            </span>
          </button>
        </div>
      </header>

      {/* Infrastructure Simulation / Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
              <Cloud className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider">AWS SQS (LocalStack)</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-text-secondary">Messages Pending</span>
              <span className="text-white">--</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="w-[15%] h-full bg-orange-500" />
            </div>
          </div>
          <div className="absolute top-2 right-4 text-[8px] font-bold text-orange-500/20 italic">
            SQS QUEUE MANAGER
          </div>
        </div>

        <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider">DynamoDB (LocalStack)</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-text-secondary">Total Events Record</span>
              <span className="text-white">--</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="w-[45%] h-full bg-blue-500" />
            </div>
          </div>
          <div className="absolute top-2 right-4 text-[8px] font-bold text-blue-500/20 italic">
            NOSQL DATA STORE
          </div>
        </div>

        <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider">Service Health</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-text-secondary">Last Check</span>
              <span className="text-white font-mono">{lastCheck}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="w-full h-full bg-emerald-500" />
            </div>
          </div>
          <div className="absolute top-2 right-4 text-[8px] font-bold text-emerald-500/20 italic">
            REALTIME MONITOR
          </div>
        </div>
      </div>

      <section className="glass rounded-4xl border border-white/5 p-12 text-center relative overflow-hidden">
        <div className="max-w-xl mx-auto relative z-10">
          <BarChart3 className="w-16 h-16 text-amber-500 mx-auto mb-6 opacity-40" />
          <h3 className="text-2xl font-bold mb-4">Pipeline de Observabilidade</h3>
          <p className="text-text-secondary leading-relaxed mb-8">
            Este serviço não expõe uma API de dados diretamente por ser um worker. Em produção, os
            dados do DynamoDB seriam consumidos por ferramentas de BI ou dashboards de monitoramento
            como Metabase ou Grafana.
          </p>
          <div className="flex justify-center gap-3">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-secondary">
              Python 3.9
            </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-secondary">
              Boto3
            </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-secondary">
              LocalStack
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/20 to-bg-primary/40 -z-10" />
      </section>
    </div>
  );
};

export default AnalyticsPage;
