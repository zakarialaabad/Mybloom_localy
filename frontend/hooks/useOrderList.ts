'use client';

import { useQuery } from '@tanstack/react-query';
import { adminOrderService, AdminOrder, AdminOrderMeta } from '@/services/api';

interface UseOrderListOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
  [key: string]: unknown;
}

interface UseOrderListReturn {
  orders: AdminOrder[];
  meta?: AdminOrderMeta;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

export const useOrderList = (options?: UseOrderListOptions): UseOrderListReturn => {
  const queryKey = ['orders', options];

  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => adminOrderService.list(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    orders: data?.data || [],
    meta: data?.meta,
    isLoading,
    error: error as Error | null,
    isError,
    refetch: () => refetch(),
  };
};
