import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';

export const useAnalytics = () => {
  const healthQuery = useQuery({
    queryKey: ['analytics-health'],
    queryFn: async () => {
      const response = await analyticsApi.get('/health');
      return response.data;
    },
    refetchInterval: 30000,
    retry: 1,
  });

  return {
    health: healthQuery.data ?? { status: 'offline' },
    isLoading: healthQuery.isLoading,
    refetch: healthQuery.refetch,
  };
};
