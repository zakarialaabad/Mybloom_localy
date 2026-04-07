'use client';

import useSWR from 'swr';
import { adminReviewService, AdminReviewStats } from '@/services/api';

interface UseReviewStatsReturn {
  stats: AdminReviewStats | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

export const useReviewStats = (): UseReviewStatsReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    ['reviewStats'],
    () => adminReviewService.stats(),
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
