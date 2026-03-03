import React from 'react';
import { Gauge, TrendingUp } from 'lucide-react';
import type { LoadTestStats } from '../../hooks/use-load-test';

interface QuickStatCardProps {
  label: string;
  value: number | string;
  colorClass: string;
  icon?: React.ReactNode;
}

const QuickStatCard: React.FC<QuickStatCardProps> = ({ label, value, colorClass, icon }) => (
  <div className="glass rounded-2xl p-5 border border-white/5">
    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">
      {label}
    </span>
    <div
      className={`text-2xl font-black ${colorClass} mt-1 ${icon ? 'flex items-center gap-1' : ''}`}
    >
      {icon}
      {value}
    </div>
  </div>
);

interface LatencyDisplayProps {
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
}

const LatencyDisplay: React.FC<LatencyDisplayProps> = ({
  avgDuration,
  minDuration,
  maxDuration,
}) => (
  <div className="glass rounded-3xl p-6 border border-white/5">
    <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
      Latência (ms)
    </h4>
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-4 bg-white/5 rounded-2xl">
        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold block mb-1">
          Média
        </span>
        <span className="text-xl font-bold text-white">{avgDuration.toFixed(1)}</span>
      </div>
      <div className="text-center p-4 bg-white/5 rounded-2xl">
        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold block mb-1">
          Mín
        </span>
        <span className="text-xl font-bold text-emerald-400">
          {minDuration === Infinity ? '-' : minDuration.toFixed(1)}
        </span>
      </div>
      <div className="text-center p-4 bg-white/5 rounded-2xl">
        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold block mb-1">
          Máx
        </span>
        <span className="text-xl font-bold text-rose-400">
          {maxDuration === 0 ? '-' : maxDuration.toFixed(1)}
        </span>
      </div>
    </div>
  </div>
);

interface SuccessRateBarProps {
  successRate: number;
}

const SuccessRateBar: React.FC<SuccessRateBarProps> = ({ successRate }) => {
  const getBarColor = (rate: number): string => {
    if (rate === 100) return 'bg-emerald-500';
    if (rate > 90) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/5">
      <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
        Taxa de Sucesso
      </h4>
      <div className="flex items-center gap-4">
        <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getBarColor(successRate)}`}
            style={{ width: `${successRate}%` }}
          />
        </div>
        <span className="text-lg font-bold text-white min-w-15 text-right">
          {successRate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

interface LoadTestStatsProps {
  stats: LoadTestStats;
}

export const LoadTestStats: React.FC<LoadTestStatsProps> = ({ stats }) => {
  const successRate = stats.total > 0 ? (stats.success / stats.total) * 100 : 0;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStatCard label="Total" value={stats.total} colorClass="text-white" />
        <QuickStatCard label="Sucesso" value={stats.success} colorClass="text-emerald-400" />
        <QuickStatCard label="Falhas" value={stats.failed} colorClass="text-rose-400" />
        <QuickStatCard
          label="RPS"
          value={stats.requestsPerSecond}
          colorClass="text-cyan-400"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      <LatencyDisplay
        avgDuration={stats.avgDuration}
        minDuration={stats.minDuration}
        maxDuration={stats.maxDuration}
      />

      <SuccessRateBar successRate={successRate} />
    </>
  );
};

interface LoadTestEmptyStateProps {
  message: string;
}

export const LoadTestEmptyState: React.FC<LoadTestEmptyStateProps> = ({ message }) => (
  <div className="glass rounded-3xl p-12 border border-white/5 text-center">
    <Gauge className="w-16 h-16 text-white/10 mx-auto mb-4" />
    <p className="text-text-secondary text-sm">{message}</p>
  </div>
);
