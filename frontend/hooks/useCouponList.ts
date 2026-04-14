'use client';

import useSWR from 'swr';
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
  const key = ['coupons', options];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => adminCouponService.list(options),
    {
      dedupingInterval: 0,
      revalidateOnFocus: false,
      errorRetryCount: 1,
    }
  );

  return {
    coupons: data?.data || [],
    meta: data?.meta,
    isLoading,
    error: error as Error | null,
    isError: !!error,
    refetch: () => mutate(),
  };
};
