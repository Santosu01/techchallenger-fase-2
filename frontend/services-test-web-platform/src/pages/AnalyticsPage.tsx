import React, { useState } from 'react';
import { BarChart3, Activity, Database, Cloud, RefreshCw, Check, X, Clock, User, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalytics } from '../hooks/use-analytics';
import { useSystemStatus } from '../hooks/use-system-status';
import { ServiceStatusBadge } from '../components/ServiceStatusBadge';

const AnalyticsPage: React.FC = () => {
  const { health, events, eventsCount, stats, isLoading, refetch } = useAnalytics();
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
      toast.success('Dados de analytics atualizados!');
    } catch {
      toast.error('Falha ao atualizar dados.');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('pt-BR');
    } catch {
      return timestamp;
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
              <h2 className="text-3xl font-extrabold italic">Analytics Dashboard</h2>
            </div>
            <ServiceStatusBadge
              status={status.analytics}
              className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5"
            />
          </div>
          <p className="text-text-secondary max-w-2xl leading-relaxed">
            Visualize em tempo real os eventos de avaliação de feature flags processados pelo sistema.
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
              Atualizar Dados
            </span>
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider">Total Eventos</h4>
          </div>
          <div className="text-4xl font-extrabold text-white">
            {stats?.total_events ?? 0}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Check className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider">Resultados TRUE</h4>
          </div>
          <div className="text-4xl font-extrabold text-emerald-500">
            {stats?.true_results ?? 0}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
              <X className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider">Resultados FALSE</h4>
          </div>
          <div className="text-4xl font-extrabold text-red-500">
            {stats?.false_results ?? 0}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
              <Flag className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider">Flags Rastreadas</h4>
          </div>
          <div className="text-4xl font-extrabold text-amber-500">
            {Object.keys(stats?.flags ?? {}).length}
          </div>
        </div>
      </div>

      {/* Flag Stats */}
      {stats && Object.keys(stats.flags).length > 0 && (
        <section className="glass rounded-3xl border border-white/5 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            Estatísticas por Flag
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.flags).map(([flagName, flagStats]) => (
              <div key={flagName} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm font-bold text-amber-500">{flagName}</span>
                  <span className="text-xs text-text-secondary">{flagStats.total} eventos</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-emerald-500/20 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-emerald-500">{flagStats.true}</div>
                    <div className="text-[10px] text-text-secondary">TRUE</div>
                  </div>
                  <div className="flex-1 bg-red-500/20 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-red-500">{flagStats.false}</div>
                    <div className="text-[10px] text-text-secondary">FALSE</div>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(flagStats.true / flagStats.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{ width: `${(flagStats.false / flagStats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Events Table */}
      <section className="glass rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            Eventos Recentes
          </h3>
          <span className="text-xs text-text-secondary">{eventsCount} eventos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Timestamp</div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  <div className="flex items-center gap-2"><User className="w-4 h-4" /> User ID</div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  <div className="flex items-center gap-2"><Flag className="w-4 h-4" /> Flag</div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-text-secondary">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-text-secondary">
                    Nenhum evento registrado ainda.
                  </td>
                </tr>
              ) : (
                events.slice(0, 20).map((event) => (
                  <tr key={event.event_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-text-secondary">
                      {formatTimestamp(event.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">
                      {event.user_id}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-500 rounded-lg text-xs font-bold">
                        {event.flag_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {event.result ? (
                        <span className="flex items-center gap-1 text-emerald-500 text-sm font-bold">
                          <Check className="w-4 h-4" /> TRUE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-sm font-bold">
                          <X className="w-4 h-4" /> FALSE
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Infrastructure Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
              <Cloud className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider">AWS SQS</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-text-secondary">Status</span>
              <span className={health?.aws === 'connected' ? 'text-emerald-500' : 'text-amber-500'}>
                {health?.aws === 'connected' ? 'Conectado' : 'Conectando...'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider">DynamoDB</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-text-secondary">Registros</span>
              <span className="text-white">{stats?.total_events ?? 0}</span>
            </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
