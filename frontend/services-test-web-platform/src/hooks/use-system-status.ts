import { useQueries } from '@tanstack/react-query';
import { authApi, flagApi, targetingApi, evaluationApi, analyticsApi } from '../services/api';

export type ServiceStatus = 'up' | 'down' | 'checking';
export type ServiceId = keyof SystemStatus;

export interface SystemStatus {
  auth: ServiceStatus;
  flag: ServiceStatus;
  targeting: ServiceStatus;
  evaluation: ServiceStatus;
  analytics: ServiceStatus;
}

const serviceApis: Record<ServiceId, typeof authApi> = {
  auth: authApi,
  flag: flagApi,
  targeting: targetingApi,
  evaluation: evaluationApi,
  analytics: analyticsApi,
};

const checkHealth = async (id: ServiceId): Promise<{ id: ServiceId; status: ServiceStatus }> => {
  try {
    const response = await serviceApis[id].get('/health', { timeout: 5000 });
    return { id, status: response.status === 200 ? 'up' : 'down' };
  } catch {
    return { id, status: 'down' };
  }
};

export const useSystemStatus = () => {
  const queries = useQueries({
    queries: Object.entries(serviceApis).map(([id]) => ({
      queryKey: ['health', id],
      queryFn: () => checkHealth(id as ServiceId),
      refetchInterval: 30000,
      retry: 1,
    })),
  });

  const status = queries.reduce((acc, query, index) => {
    const serviceId = Object.keys(serviceApis)[index] as ServiceId;

    return {
      ...acc,
      [serviceId]: query.isLoading ? 'checking' : (query.data?.status ?? 'down'),
    };
  }, {} as SystemStatus);

  return {
    status,
    refetch: () => queries.forEach((q) => q.refetch()),
    refetchService: (serviceId: ServiceId) => {
      const index = Object.keys(serviceApis).indexOf(serviceId);
      if (index !== -1) queries[index].refetch();
    },
  };
};
