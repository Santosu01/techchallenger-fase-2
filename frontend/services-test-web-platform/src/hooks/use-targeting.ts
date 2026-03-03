import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { targetingApi } from '../services/api';

export interface Rule {
  id: number;
  flag_name: string;
  is_enabled: boolean;
  rules:
    | {
        type: string;
        value: string;
        rollout_percent: number;
      }
    | string;
}

interface CreateRuleParams {
  flag_name: string;
  rule_type: string;
  rule_value: string;
  rollout_percent: number;
}

export const useTargeting = () => {
  const queryClient = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ['rules'],
    queryFn: async () => {
      const response = await targetingApi.get<Rule[]>('/rules');
      // A regra vinda do backend tem o campo 'rules' como um JSONB (objeto)
      // Precisamos garantir que o frontend entenda essa estrutura
      return response.data;
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async (newRule: CreateRuleParams) => {
      // Ajusta o payload para o formato esperado pelo backend:
      // { flag_name: string, rules: { type, value, rollout_percent } }
      const payload = {
        flag_name: newRule.flag_name,
        rules: {
          type: newRule.rule_type,
          value: newRule.rule_value,
          rollout_percent: newRule.rollout_percent,
        },
      };

      const response = await targetingApi.post('/rules', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast.success('Regra de segmentação adicionada.');
    },
    onError: () => {
      toast.error('Erro ao criar regra.');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (flagName: string) => {
      // O backend usa flag_name como identificador na URL DELETE /rules/<string:flag_name>
      const response = await targetingApi.delete(`/rules/${flagName}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast.success('Regra removida com sucesso.');
    },
    onError: () => {
      toast.error('Erro ao remover regra.');
    },
  });

  return {
    rules: rulesQuery.data || [],
    isLoading: rulesQuery.isLoading,
    error: rulesQuery.error,
    createRule: createRuleMutation.mutateAsync,
    isCreating: createRuleMutation.isPending,
    deleteRule: deleteRuleMutation.mutateAsync,
    refetch: rulesQuery.refetch,
  };
};
