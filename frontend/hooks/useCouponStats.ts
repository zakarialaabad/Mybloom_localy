'use client';

import { useQuery } from '@tanstack/react-query';
import { adminCouponService, AdminCouponStats } from '@/services/api';

interface UseCouponStatsReturn {
  stats: AdminCouponStats | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

export const useCouponStats = (): UseCouponStatsReturn => {
  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['couponStats'],
    queryFn: () => adminCouponService.stats(),
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
