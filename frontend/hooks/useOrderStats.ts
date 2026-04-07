'use client';

import useSWR from 'swr';
import { adminOrderService, AdminOrderStats } from '@/services/api';

interface UseOrderStatsReturn {
  stats: AdminOrderStats | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

export const useOrderStats = (): UseOrderStatsReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    ['orderStats'],
    () => adminOrderService.stats(),
    {
      dedupingInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
      errorRetryCount: 1,
    }
  );

  return {
    stats: data || null,
    isLoading,
    error: error as Error | null,
    isError: !!error,
    refetch: () => mutate(),
  };
};
