import { useState } from 'react';
import { authApi, flagApi, targetingApi, evaluationApi, analyticsApi } from '../services/api';

export type ServiceId = 'auth' | 'flag' | 'targeting' | 'evaluation' | 'analytics';

const serviceApis: Record<ServiceId, typeof authApi> = {
  auth: authApi,
  flag: flagApi,
  targeting: targetingApi,
  evaluation: evaluationApi,
  analytics: analyticsApi,
};

export interface LoadTestResult {
  success: boolean;
  status: number;
  duration: number;
  timestamp: number;
}

export interface LoadTestStats {
  total: number;
  success: number;
  failed: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  requestsPerSecond: number;
}

export const useLoadTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<LoadTestResult[]>([]);
  const [progress, setProgress] = useState(0);

  const runTest = async (serviceId: ServiceId, options: { concurrent: number; total: number }) => {
    const { concurrent, total } = options;
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    const api = serviceApis[serviceId];
    const allResults: LoadTestResult[] = [];
    let completed = 0;

    const makeRequest = async (): Promise<LoadTestResult> => {
      const start = performance.now();
      try {
        const response = await api.get('/health');
        return {
          success: response.status === 200,
          status: response.status,
          duration: performance.now() - start,
          timestamp: Date.now(),
        };
      } catch {
        return {
          success: false,
          status: 0,
          duration: performance.now() - start,
          timestamp: Date.now(),
        };
      }
    };

    const processBatch = async (batchSize: number): Promise<void> => {
      const batch = Array.from({ length: batchSize }, () => makeRequest());
      const batchResults = await Promise.all(batch);
      allResults.push(...batchResults);
      completed += batchSize;
      setProgress(Math.round((completed / total) * 100));
      setResults([...allResults]);
    };

    const batches = Math.ceil(total / concurrent);

    for (let i = 0; i < batches; i++) {
      const remaining = total - i * concurrent;
      const batchSize = Math.min(concurrent, remaining);
      await processBatch(batchSize);
    }

    setIsRunning(false);
    return allResults;
  };

  const stats: LoadTestStats = results.reduce(
    (acc, result) => ({
      ...acc,
      total: acc.total + 1,
      success: acc.success + (result.success ? 1 : 0),
      failed: acc.failed + (result.success ? 0 : 1),
      avgDuration: acc.avgDuration + result.duration,
      minDuration: Math.min(acc.minDuration, result.duration),
      maxDuration: Math.max(acc.maxDuration, result.duration),
    }),
    {
      total: 0,
      success: 0,
      failed: 0,
      avgDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      requestsPerSecond: 0,
    }
  );

  if (stats.total > 0) {
    stats.avgDuration = stats.avgDuration / stats.total;
    const timeSpan = (results.at(-1)?.timestamp ?? 0) - results[0]?.timestamp;
    stats.requestsPerSecond = timeSpan > 0 ? Math.round((stats.total / timeSpan) * 1000) : 0;
  }

  const reset = () => {
    setResults([]);
    setProgress(0);
  };

  return {
    isRunning,
    results,
    stats,
    progress,
    runTest,
    reset,
  };
};
