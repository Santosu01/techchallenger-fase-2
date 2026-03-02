import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';

export const useAnalytics = () => {
  const healthQuery = useQuery({
    queryKey: ['analytics-health'],
    queryFn: async () => {
      try {
        const response = await analyticsApi.get('/health');
        return response.data;
      } catch {
        return { status: 'offline' };
      }
    },
    refetchInterval: 30000,
  });

  return {
    health: healthQuery.data,
    isLoading: healthQuery.isLoading,
    refetch: healthQuery.refetch,
  };
};
