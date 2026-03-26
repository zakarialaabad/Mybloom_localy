'use client';

import { useQuery } from '@tanstack/react-query';
import { adminReviewService, AdminReviewStats } from '@/services/api';

interface UseReviewStatsReturn {
  stats: AdminReviewStats | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

export const useReviewStats = (): UseReviewStatsReturn => {
  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['reviewStats'],
    queryFn: () => adminReviewService.stats(),
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
