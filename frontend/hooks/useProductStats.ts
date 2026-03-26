'use client';

import { useQuery } from '@tanstack/react-query';
import { adminProductService, AdminProductMeta } from '@/services/api';

// Products uses client-side stats (computed from product list), not server stats
// So this hook computes stats from the product list data
interface ProductStatsData {
  total: number;
  active: number;
  low_stock: number;
  inactive: number;
}

const PRODUCT_LOW_STOCK_THRESHOLD = 10;

function computeProductStats(products: any[]): ProductStatsData {
  return {
    total: products.length,
    active: products.filter((p) => p.stock > PRODUCT_LOW_STOCK_THRESHOLD).length,
    low_stock: products.filter(
      (p) => p.stock > 0 && p.stock <= PRODUCT_LOW_STOCK_THRESHOLD
    ).length,
    inactive: products.filter((p) => p.stock === 0).length,
  };
}

interface UseProductStatsReturn {
  stats: ProductStatsData | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}

export const useProductStats = (): UseProductStatsReturn => {
  const { data: products, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['products', { limit: 200 }],
    queryFn: () => adminProductService.list({ limit: 200 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const stats = products ? computeProductStats(products.data) : null;

  return {
    stats,
    isLoading,
    error: error as Error | null,
    isError,
    refetch: () => refetch(),
  };
};
