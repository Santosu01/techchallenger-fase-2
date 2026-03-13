import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';

export interface AnalyticsEvent {
  event_id: string;
  user_id: string;
  flag_name: string;
  result: boolean;
  timestamp: string;
}

export interface FlagStats {
  total: number;
  true: number;
  false: number;
}

export interface AnalyticsStats {
  total_events: number;
  true_results: number;
  false_results: number;
  flags: Record<string, FlagStats>;
}

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

  const eventsQuery = useQuery({
    queryKey: ['analytics-events'],
    queryFn: async () => {
      const response = await analyticsApi.get('/events');
      return response.data as { events: AnalyticsEvent[]; count: number };
    },
    refetchInterval: 10000,
    retry: 1,
  });

  const statsQuery = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: async () => {
      const response = await analyticsApi.get('/events/stats');
      return response.data as AnalyticsStats;
    },
    refetchInterval: 10000,
    retry: 1,
  });

  return {
    health: healthQuery.data ?? { status: 'offline' },
    events: eventsQuery.data?.events ?? [],
    eventsCount: eventsQuery.data?.count ?? 0,
    stats: statsQuery.data,
    isLoading: healthQuery.isLoading || eventsQuery.isLoading || statsQuery.isLoading,
    refetch: () => {
      healthQuery.refetch();
      eventsQuery.refetch();
      statsQuery.refetch();
    },
  };
};
