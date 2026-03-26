'use client';

import { useQuery } from '@tanstack/react-query';
import { adminCouponService, AdminCoupon, AdminProductMeta } from '@/services/api';

interface UseCouponListOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
  [key: string]: unknown;
}

interface UseCouponListReturn {
  coupons: AdminCoupon[];
  meta?: AdminProductMeta;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

export const useCouponList = (options?: UseCouponListOptions): UseCouponListReturn => {
  const queryKey = ['coupons', options];

  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => adminCouponService.list(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    coupons: data?.data || [],
    meta: data?.meta,
    isLoading,
    error: error as Error | null,
    isError,
    refetch: () => refetch(),
  };
};
