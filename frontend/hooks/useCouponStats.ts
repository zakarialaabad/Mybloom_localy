'use client';

import useSWR from 'swr';
import { adminCouponService, AdminCouponStats } from '@/services/api';

interface UseCouponStatsReturn {
  stats: AdminCouponStats | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

export const useCouponStats = (): UseCouponStatsReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    ['couponStats'],
    () => adminCouponService.stats(),
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
