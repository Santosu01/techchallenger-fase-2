import React from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface RuleData {
  type?: string;
  rollout_percent?: number;
}

interface TargetingRule {
  flag_name: string;
  rules: RuleData | string;
}

interface TargetingRulesTableProps {
  rules: TargetingRule[];
  isLoading: boolean;
  onDelete: (flagName: string) => Promise<void>;
  onRefresh: () => Promise<unknown>;
}

const parseRuleData = (rules: RuleData | string): RuleData => {
  if (typeof rules === 'string') {
    try {
      return JSON.parse(rules);
    } catch {
      return { type: 'rollout', rollout_percent: 100 };
    }
  }
  return rules;
};

export const TargetingRulesTable: React.FC<TargetingRulesTableProps> = ({
  rules,
  isLoading,
  onDelete,
  onRefresh,
}) => {
  const handleRefresh = async () => {
    try {
      await onRefresh();
      toast.info('Regras atualizadas.');
    } catch {
      toast.error('Falha ao sincronizar regras.');
    }
  };

  return (
    <section className="lg:col-span-3">
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-xl font-bold">Regras Ativas</h3>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-white/5 rounded-full text-text-secondary transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="overflow-x-auto glass rounded-3xl border border-white/5">
        <table className="w-full text-left border-collapse min-w-150">
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
              const ruleData = parseRuleData(rule.rules);

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
                      onClick={() => onDelete(rule.flag_name)}
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
        {rules.length === 0 && !isLoading && (
          <div className="py-20 text-center italic text-text-secondary/50 text-sm">
            Nenhuma regra de segmentação configurada.
          </div>
        )}
      </div>
    </section>
  );
};
