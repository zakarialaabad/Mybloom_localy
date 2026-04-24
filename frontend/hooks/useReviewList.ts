'use client';

import useSWR from 'swr';
import { adminReviewService, AdminReview, AdminProductMeta } from '@/services/api';

interface UseReviewListOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
  [key: string]: unknown;
}

interface UseReviewListReturn {
  reviews: AdminReview[];
  meta?: AdminProductMeta;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

export const useReviewList = (options?: UseReviewListOptions): UseReviewListReturn => {
  const key = ['reviews', options];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => adminReviewService.list(options),
    {
      dedupingInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
      errorRetryCount: 1,
    }
  );

  return {
    reviews: data?.data || [],
    meta: data?.meta,
    isLoading,
    error: error as Error | null,
    isError: !!error,
    refetch: () => mutate(undefined, { revalidate: true }),
  };
};
