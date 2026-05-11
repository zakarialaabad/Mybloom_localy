import useSWR from 'swr';
import { useCallback } from 'react';
import { adminCategoryService, AdminCategory } from '@/services/api';

export function useCategoryList() {
  const { data, error, isLoading, mutate } = useSWR<AdminCategory[]>(
    'admin-categories',
    () => adminCategoryService.list(),
    { dedupingInterval: 60000, revalidateOnFocus: false, errorRetryCount: 1 }
  );

  return {
    categories: data ?? [],
    isLoading,
    error,
    refetch: useCallback(() => mutate(undefined, { revalidate: true }), [mutate]),
  };
}
