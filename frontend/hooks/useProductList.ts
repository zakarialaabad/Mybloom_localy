'use client';

import { useCallback } from 'react';
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
  refetch: () => Promise<any>;  // Promise that resolves when refetch is complete
}

export const useProductList = (options?: UseProductListOptions): UseProductListReturn => {
  const key = ['products', options];
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => adminProductService.list(options),
    {
      dedupingInterval: 60000,         // 60 seconds - prevent unnecessary refetches
      revalidateOnFocus: false,        // DISABLED - do NOT refetch when user returns to tab
      revalidateOnReconnect: false,    // DISABLED - do NOT refetch on network reconnect
      errorRetryCount: 1,
    }
  );

  return {
    products: data?.data || [],
    meta: data?.meta,
    isLoading,
    error: error as Error | null,
    isError: !!error,
    // Force fresh fetch from server by passing { revalidate: true }
    // This bypasses the dedupingInterval cache and fetches immediately
    // useCallback ensures stable reference — prevents infinite useEffect loops
    refetch: useCallback(() => mutate(undefined, { revalidate: true }), [mutate]),
  };
};
