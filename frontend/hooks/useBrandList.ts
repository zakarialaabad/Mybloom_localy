import useSWR from 'swr';
import { useCallback } from 'react';
import { adminBrandService, AdminBrand } from '@/services/api';

export function useBrandList() {
  const { data, error, isLoading, mutate } = useSWR<AdminBrand[]>(
    'admin-brands',
    () => adminBrandService.list(),
    { dedupingInterval: 60000, revalidateOnFocus: false, errorRetryCount: 1 }
  );

  return {
    brands: data ?? [],
    isLoading,
    error,
    refetch: useCallback(() => mutate(undefined, { revalidate: true }), [mutate]),
  };
}
