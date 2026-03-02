import { useState, useEffect, useCallback, useRef } from 'react';
import { authApi, flagApi, targetingApi, evaluationApi, analyticsApi } from '../services/api';

export type ServiceStatus = 'up' | 'down' | 'checking';

export interface SystemStatus {
  auth: ServiceStatus;
  flag: ServiceStatus;
  targeting: ServiceStatus;
  evaluation: ServiceStatus;
  analytics: ServiceStatus;
}

export const useSystemStatus = () => {
  const [status, setStatus] = useState<SystemStatus>({
    auth: 'checking',
    flag: 'checking',
    targeting: 'checking',
    evaluation: 'checking',
    analytics: 'checking',
  });
  const isMounted = useRef(true);

  const checkHealth = useCallback(async () => {
    const services = [
      { id: 'auth' as keyof SystemStatus, api: authApi },
      { id: 'flag' as keyof SystemStatus, api: flagApi },
      { id: 'targeting' as keyof SystemStatus, api: targetingApi },
      { id: 'evaluation' as keyof SystemStatus, api: evaluationApi },
      { id: 'analytics' as keyof SystemStatus, api: analyticsApi },
    ];

    const results = await Promise.allSettled(
      services.map(async (service) => {
        try {
          const response = await service.api.get('/health', { timeout: 5000 });
          return { id: service.id, status: response.status === 200 ? 'up' : ('down' as ServiceStatus) };
        } catch {
          return { id: service.id, status: 'down' as ServiceStatus };
        }
      })
    );

    setStatus(prevStatus => {
      if (!isMounted.current) return prevStatus;
      const nextStatus = { ...prevStatus };
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          nextStatus[result.value.id] = result.value.status;
        }
      });
      return nextStatus;
    });
  }, []);

  useEffect(() => {
    isMounted.current = true;

    // Trigger initial check
    checkHealth();

    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [checkHealth]);

  const isAllUp = Object.values(status).every((s) => s === 'up');
  const someDown = Object.values(status).some((s) => s === 'down');
  const allChecking = Object.values(status).every((s) => s === 'checking');

  return { status, isAllUp, someDown, allChecking, checkHealth };
};
