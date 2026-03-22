'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_LOCAL_ASSET_FALLBACK, getStoredAssetPath } from '@/lib/local-assets';
import { clampQuantityToStock, normalizeStockQuantity } from '@/lib/stock';

export interface CartItem {
    id: number | string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    slug?: string;
    sku?: string;
    variant?: string;
    stockQuantity?: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number | string) => void;
    updateQuantity: (id: number | string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

type PersistedCartItem = Partial<CartItem> & { image?: string };
type ProductApiResponse = {
    products?: Array<{
        image?: unknown;
        stockQuantity?: unknown;
    }>;
};
type NormalizedPersistedCartItem = Partial<CartItem> & {
    image: string;
    quantity: number;
    stockQuantity?: number;
};
type SyncedCartProduct = {
    slug: string;
    image?: string;
    stockQuantity?: number;
};

const CART_STORAGE_KEY = 'lumera_cart';
const CartContext = createContext<CartContextType | undefined>(undefined);

const normalizeCartImage = (value: string | null | undefined) => getStoredAssetPath(value);
const clampCartQuantity = (quantity: number, stockQuantity?: number) => clampQuantityToStock(quantity, stockQuantity);

const sanitizePersistedCart = (value: unknown): CartItem[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((rawItem): NormalizedPersistedCartItem | null => {
            const item =
                typeof rawItem === 'object' && rawItem !== null ? (rawItem as PersistedCartItem) : null;

            if (!item) {
                return null;
            }

            const stockQuantity = normalizeStockQuantity(item.stockQuantity);

            return {
                ...item,
                image: normalizeCartImage(item.image),
                stockQuantity,
                quantity: clampCartQuantity(item.quantity ?? 0, stockQuantity),
            };
        })
        .filter(
            (item): item is CartItem =>
                item !== null &&
                (typeof item.id === 'string' || typeof item.id === 'number') &&
                typeof item.name === 'string' &&
                typeof item.price === 'number' &&
                typeof item.image === 'string' &&
                typeof item.quantity === 'number' &&
                clampCartQuantity(item.quantity, item.stockQuantity) > 0,
        );
};

const getInitialCartItems = (): CartItem[] => {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (!savedCart) {
            return [];
        }

        return sanitizePersistedCart(JSON.parse(savedCart));
    } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
        return [];
    }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(getInitialCartItems);

    useEffect(() => {
        if (cartItems.length > 0) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
            return;
        }

        localStorage.removeItem(CART_STORAGE_KEY);
    }, [cartItems]);

    useEffect(() => {
        const itemsNeedingSync = cartItems.filter(
            (item) =>
                item.slug &&
                (item.image === DEFAULT_LOCAL_ASSET_FALLBACK || typeof item.stockQuantity !== 'number'),
        );

        if (itemsNeedingSync.length === 0) {
            return;
        }

        let cancelled = false;

        const repairImages = async () => {
            const repairedEntries = await Promise.all(
                itemsNeedingSync.map(async (item): Promise<SyncedCartProduct | null> => {
                    try {
                        const response = await fetch(`/api/products?slug=${encodeURIComponent(item.slug ?? '')}`);
                        if (!response.ok) {
                            return null;
                        }

                        const payload = (await response.json()) as ProductApiResponse;
                        const productImage =
                            typeof payload.products?.[0]?.image === 'string'
                                ? normalizeCartImage(payload.products[0].image)
                                : null;
                        const stockQuantity = normalizeStockQuantity(payload.products?.[0]?.stockQuantity);

                        if ((!productImage || productImage === DEFAULT_LOCAL_ASSET_FALLBACK) && typeof stockQuantity !== 'number') {
                            return null;
                        }

                        return {
                            slug: item.slug ?? '',
                            image: productImage ?? undefined,
                            stockQuantity,
                        };
                    } catch {
                        return null;
                    }
                }),
            );

            if (cancelled) {
                return;
            }

            const productMetaBySlug = new Map(
                repairedEntries
                    .filter(
                        (
                            entry,
                        ): entry is SyncedCartProduct =>
                            Boolean(entry?.slug),
                    )
                    .map((entry) => [entry.slug, entry] as const),
            );

            if (productMetaBySlug.size === 0) {
                return;
            }

            setCartItems((prev) => {
                let hasChanges = false;

                const next = prev.flatMap((item) => {
                    if (!item.slug) {
                        return [item];
                    }

                    const syncedProduct = productMetaBySlug.get(item.slug);
                    if (!syncedProduct) {
                        return [item];
                    }

                    const nextImage =
                        syncedProduct.image && syncedProduct.image !== DEFAULT_LOCAL_ASSET_FALLBACK
                            ? syncedProduct.image
                            : item.image;
                    const nextStockQuantity = syncedProduct.stockQuantity ?? item.stockQuantity;
                    const nextQuantity = clampCartQuantity(item.quantity, nextStockQuantity);

                    if (nextQuantity <= 0) {
                        hasChanges = true;
                        return [];
                    }

                    if (
                        item.image === nextImage &&
                        item.stockQuantity === nextStockQuantity &&
                        item.quantity === nextQuantity
                    ) {
                        return [item];
                    }

                    hasChanges = true;
                    return {
                        ...item,
                        image: nextImage,
                        stockQuantity: nextStockQuantity,
                        quantity: nextQuantity,
                    };
                });

                return hasChanges ? next : prev;
            });
        };

        void repairImages();

        return () => {
            cancelled = true;
        };
    }, [cartItems]);

    const addToCart = (item: CartItem) => {
        setCartItems((prev) => {
            const normalizedItem = {
                ...item,
                image: normalizeCartImage(item.image),
                stockQuantity: normalizeStockQuantity(item.stockQuantity),
            };
            const existingItem = prev.find((entry) => entry.id === item.id);

            if (existingItem) {
                return prev.flatMap((entry) => {
                    if (entry.id !== item.id) {
                        return [entry];
                    }

                    const stockQuantity = normalizedItem.stockQuantity ?? entry.stockQuantity;
                    const nextQuantity = clampCartQuantity(entry.quantity + normalizedItem.quantity, stockQuantity);

                    if (nextQuantity <= 0) {
                        return [];
                    }

                    return [
                        {
                            ...entry,
                            quantity: nextQuantity,
                            slug: entry.slug ?? normalizedItem.slug,
                            sku: entry.sku ?? normalizedItem.sku,
                            variant: entry.variant ?? normalizedItem.variant,
                            image: normalizedItem.image,
                            stockQuantity,
                        },
                    ];
                });
            }

            const nextQuantity = clampCartQuantity(normalizedItem.quantity, normalizedItem.stockQuantity);
            if (nextQuantity <= 0) {
                return prev;
            }

            return [
                ...prev,
                {
                    ...normalizedItem,
                    quantity: nextQuantity,
                },
            ];
        });
    };

    const removeFromCart = (id: number | string) => {
        setCartItems((prev) => prev.filter((entry) => entry.id !== id));
    };

    const updateQuantity = (id: number | string, quantity: number) => {
        setCartItems((prev) => {
            const item = prev.find((entry) => entry.id === id);
            if (!item) {
                return prev;
            }
            const nextQuantity = clampCartQuantity(quantity, item.stockQuantity);

            if (nextQuantity <= 0) {
                return prev.filter((entry) => entry.id !== id);
            }

            return prev.map((entry) => (entry.id === id ? { ...entry, quantity: nextQuantity } : entry));
        });
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }

    return context;
};
