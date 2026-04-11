'use client';

import useSWR from 'swr';
import { adminProductService, AdminProduct, AdminProductMeta } from '@/services/api';

interface UseProductListOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
  type?: string;
  category?: string;
  [key: string]: unknown;
}

interface UseProductListReturn {
  products: AdminProduct[];
  meta?: AdminProductMeta;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

export const useProductList = (options?: UseProductListOptions): UseProductListReturn => {
  const key = ['products', options];
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => adminProductService.list(options),
    {
      dedupingInterval: 1000, // 1 second (was 5 minutes) - ensures fresh data on quick navigations
      revalidateOnFocus: true, // Refetch when window regains focus
      errorRetryCount: 1,
    }
  );

  return {
    products: data?.data || [],
    meta: data?.meta,
    isLoading,
    error: error as Error | null,
    isError: !!error,
    refetch: () => mutate(),
  };
};
