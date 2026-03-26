'use client';

import { useQuery } from '@tanstack/react-query';
import { adminOrderService, AdminOrderStats } from '@/services/api';

interface UseOrderStatsReturn {
  stats: AdminOrderStats | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

export const useOrderStats = (): UseOrderStatsReturn => {
  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['orderStats'],
    queryFn: () => adminOrderService.stats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    stats: data || null,
    isLoading,
    error: error as Error | null,
    isError,
    refetch: () => refetch(),
  };
};
