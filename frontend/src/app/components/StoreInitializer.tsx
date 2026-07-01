'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function StoreInitializer() {
  const fetchProducts = useStore((state) => state.fetchProducts);
  const productsLoaded = useStore((state) => state.productsLoaded);

  useEffect(() => {
    if (!productsLoaded) {
      fetchProducts();
    }
  }, []);

  return null;
}
