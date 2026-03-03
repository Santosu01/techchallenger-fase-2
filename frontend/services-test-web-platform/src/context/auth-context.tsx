import React, { useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/api';
import { toast } from 'sonner';
import { AuthContext, type AuthContextType } from './auth-context-types';

const API_KEY_STORAGE_KEY = 'togglemaster_api_key';

const getStoredApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

const setStoredApiKey = (key: string | null): void => {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeApiKey, setActiveApiKey] = React.useState<string | null>(() => getStoredApiKey());

  // Mutação para gerar nova API key
  const generateKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await authApi.post<{ key: string }>('/admin/keys', {
        name: `Portal-Key-${Date.now()}`,
      });
      return response.data.key;
    },
    onSuccess: (key) => {
      setActiveApiKey(key);
      setStoredApiKey(key);
    },
    onError: (error) => {
      console.error('Erro ao gerar API Key:', error);
      toast.error('Erro ao inicializar autenticação');
    },
  });

  // Inicializar - gerar chave se não existir
  useEffect(() => {
    const existingKey = getStoredApiKey();
    if (existingKey) {
      return;
    }

    generateKeyMutation.mutate();
  }, [generateKeyMutation]);

  // Sincronizar com localStorage quando activeApiKey mudar externamente
  useEffect(() => {
    setStoredApiKey(activeApiKey);
  }, [activeApiKey]);

  const isInitialized = Boolean(activeApiKey) || generateKeyMutation.isError;

  const value = useMemo<AuthContextType>(
    () => ({
      activeApiKey,
      setActiveApiKey,
      isInitialized,
    }),
    [activeApiKey, setActiveApiKey, isInitialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
