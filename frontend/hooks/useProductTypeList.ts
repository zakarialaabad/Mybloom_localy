import useSWR from 'swr';
import { useCallback } from 'react';
import { adminProductTypeService, AdminProductType } from '@/services/api';

export function useProductTypeList() {
  const { data, error, isLoading, mutate } = useSWR<AdminProductType[]>(
    'admin-product-types',
    () => adminProductTypeService.list(),
    { dedupingInterval: 60000, revalidateOnFocus: false, errorRetryCount: 1 }
  );

  return {
    productTypes: data ?? [],
    isLoading,
    error,
    refetch: useCallback(() => mutate(undefined, { revalidate: true }), [mutate]),
  };
}
