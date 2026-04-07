'use client';

import useSWR from 'swr';
import { dashboardService, DashboardData } from '@/services/api';

/**
 * useDashboardMetrics Hook
 * Fetches dashboard metrics with React Query caching & deduplication
 *
 * Benefits:
 * - Automatic caching (5 min staleTime)
 * - Automatic deduplication (same request within staleTime)
 * - Retry on failure (1 retry)
 * - No refetch on window focus (optional, can be enabled)
 * - Devtools support for debugging
 *
 * Usage:
 *   const { data, isLoading, error } = useDashboardMetrics();
 */
export function useDashboardMetrics() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData, Error>(
    ['dashboard', 'metrics'],
    () => dashboardService.get(),
    {
      dedupingInterval: 1000 * 60 * 5,
      revalidateOnFocus: false,
      errorRetryCount: 1,
    }
  );

  return {
    data: data ?? null,
    isLoading,
    error: error?.message ?? null,
    isError: !!error,
    refetch: () => mutate(),
  };
}
