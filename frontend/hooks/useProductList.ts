'use client';

import { useQuery } from '@tanstack/react-query';
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
  const queryKey = ['products', options];

  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => adminProductService.list(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    products: data?.data || [],
    meta: data?.meta,
    isLoading,
    error: error as Error | null,
    isError,
    refetch: () => refetch(),
  };
};
