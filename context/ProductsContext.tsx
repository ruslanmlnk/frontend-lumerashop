'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Product } from '@/types/site';

export const ProductsContext = createContext<{ products: Product[], loading: boolean }>({
    products: [],
    loading: false
});

export function ProductsProvider({ children, initialProducts }: { children: ReactNode, initialProducts: Product[] }) {
    return (
        <ProductsContext.Provider value={{ products: initialProducts, loading: false }}>
            {children}
        </ProductsContext.Provider>
    );
}

export function useProductsContext() {
    return useContext(ProductsContext);
}
