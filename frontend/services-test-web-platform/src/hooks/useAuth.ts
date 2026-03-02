import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '../services/api';

export const useAuth = () => {
  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await authApi.post(
        '/admin/keys',
        { name },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_MASTER_KEY}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Chave de API gerada com sucesso!', {
        description: 'Não esqueça de copiar e salvar em um local seguro.',
      });
    },
    onError: () => {
      toast.error('Erro ao gerar chave de API.', {
        description: 'Verifique se o serviço de autenticação está disponível.',
      });
    },
  });

  return {
    createKey: createKeyMutation.mutateAsync,
    isCreating: createKeyMutation.isPending,
    error: createKeyMutation.error,
  };
};
