'use client';

import useSWR from 'swr';
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
  const key = ['orders', options];
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => adminOrderService.list(options),
    {
      dedupingInterval: 15 * 1000,      // 15 s — allow fresh data after brief navigations
      revalidateOnFocus: true,           // refresh when admin returns to the tab
      refreshInterval: 30 * 1000,        // poll every 30 s — picks up cron-job status advances
      errorRetryCount: 1,
    }
  );

  return {
    orders: data?.data || [],
    meta: data?.meta,
    isLoading,
    error: error as Error | null,
    isError: !!error,
    refetch: () => mutate(),
  };
};
