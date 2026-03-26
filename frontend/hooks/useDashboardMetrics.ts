import { useQuery } from '@tanstack/react-query';
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
  const query = useQuery<DashboardData, Error>({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const res = await dashboardService.get();
      return res;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isPending,
    error: query.error?.message ?? null,
    isError: query.isError,
    refetch: () => query.refetch(),
  };
}
