import useSWR from 'swr';
import { useCallback } from 'react';
import { adminIngredientService, AdminIngredient } from '@/services/api';

export function useIngredientList() {
  const { data, error, isLoading, mutate } = useSWR<AdminIngredient[]>(
    'admin-ingredients',
    () => adminIngredientService.list(),
    { dedupingInterval: 60000, revalidateOnFocus: false, errorRetryCount: 1 }
  );

  return {
    ingredients: data ?? [],
    isLoading,
    error,
    refetch: useCallback(() => mutate(undefined, { revalidate: true }), [mutate]),
  };
}
