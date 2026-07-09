'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function StoreInitializer() {
  const fetchProducts = useStore((state) => state.fetchProducts);

  useEffect(() => {
    fetchProducts(true); // Force fetch on mount to bypass any stale localStorage cache
  }, [fetchProducts]);

  return null;
}
