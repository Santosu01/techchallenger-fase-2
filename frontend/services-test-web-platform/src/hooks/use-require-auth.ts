import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/api';
import { useAuthContext } from '../context/use-auth-context';
import { toast } from 'sonner';

export const useRequireAuth = () => {
  const { activeApiKey, setActiveApiKey } = useAuthContext();

  const generateKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await authApi.post<{ key: string }>('/admin/keys', {
        name: `auto-key-${Date.now()}`,
      });
      return response.data.key;
    },
    onSuccess: (key) => {
      setActiveApiKey(key);
      toast.success('Chave de API configurada automaticamente!', {
        description: 'Você pode acessar os recursos agora.',
      });
    },
    onError: () => {
      toast.error('Falha ao configurar autenticação', {
        description: 'Verifique se o serviço de autenticação está disponível.',
      });
    },
  });

  // Gerar chave automaticamente se não existir
  const ensureApiKey = () => {
    if (!activeApiKey) {
      generateKeyMutation.mutate();
    }
  };

  return {
    isReady: Boolean(activeApiKey) && !generateKeyMutation.isPending,
    isCreating: generateKeyMutation.isPending,
    error: generateKeyMutation.error,
    ensureApiKey,
  };
};
