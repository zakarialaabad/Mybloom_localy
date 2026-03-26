'use client';

import { useQuery } from '@tanstack/react-query';
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
  const queryKey = ['reviews', options];

  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => adminReviewService.list(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    reviews: data?.data || [],
    meta: data?.meta,
    isLoading,
    error: error as Error | null,
    isError,
    refetch: () => refetch(),
  };
};
