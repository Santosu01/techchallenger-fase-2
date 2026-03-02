import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { flagApi } from '../services/api';
import { useAuthContext } from '../context/useAuthContext';

export interface FeatureFlag {
  id: number;
  name: string;
  description: string;
  is_enabled: boolean;
}

export const useFlags = () => {
  const queryClient = useQueryClient();
  const { activeApiKey } = useAuthContext();

  const flagsQuery = useQuery({
    queryKey: ['flags'],
    queryFn: async () => {
      const response = await flagApi.get<FeatureFlag[]>('/flags', {
        headers: {
          Authorization: `Bearer ${activeApiKey}`,
        },
      });
      return response.data;
    },
  });

  const createFlagMutation = useMutation({
    mutationFn: async (newFlag: Omit<FeatureFlag, 'id'>) => {
      const response = await flagApi.post('/flags', newFlag, {
        headers: {
          Authorization: `Bearer ${activeApiKey}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      toast.success('Feature flag criada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar feature flag.');
    },
  });

  const toggleFlagMutation = useMutation({
    mutationFn: async ({ name, isEnabled }: { name: string; isEnabled: boolean }) => {
      const response = await flagApi.put(
        `/flags/${name}`,
        { is_enabled: isEnabled },
        {
          headers: {
            Authorization: `Bearer ${activeApiKey}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      toast.success('Status da flag atualizado.');
    },
    onError: () => {
      toast.error('Erro ao atualizar status.');
    },
  });

  const deleteFlagMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await flagApi.delete(`/flags/${name}`, {
        headers: {
          Authorization: `Bearer ${activeApiKey}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
      toast.success('Flag excluída permanentemente.');
    },
    onError: () => {
      toast.error('Erro ao excluir a flag.');
    },
  });

  return {
    flags: flagsQuery.data || [],
    isLoading: flagsQuery.isLoading,
    error: flagsQuery.error,
    createFlag: createFlagMutation.mutateAsync,
    isCreating: createFlagMutation.isPending,
    toggleFlag: toggleFlagMutation.mutate,
    deleteFlag: deleteFlagMutation.mutateAsync,
    refetch: flagsQuery.refetch,
  };
};
