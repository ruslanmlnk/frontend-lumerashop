'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_LOCAL_ASSET_FALLBACK, getStoredAssetPath } from '@/lib/local-assets';

export interface CartItem {
    id: number | string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    slug?: string;
    sku?: string;
    variant?: string;
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
    }>;
};

const CART_STORAGE_KEY = 'lumera_cart';
const CartContext = createContext<CartContextType | undefined>(undefined);

const normalizeCartImage = (value: string | null | undefined) => getStoredAssetPath(value);

const sanitizePersistedCart = (value: unknown): CartItem[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((rawItem) => {
            const item =
                typeof rawItem === 'object' && rawItem !== null ? (rawItem as PersistedCartItem) : null;

            if (!item) {
                return null;
            }

            return {
                ...item,
                image: normalizeCartImage(item.image),
            };
        })
        .filter(
            (item): item is CartItem =>
                item !== null &&
                (typeof item.id === 'string' || typeof item.id === 'number') &&
                typeof item.name === 'string' &&
                typeof item.price === 'number' &&
                typeof item.image === 'string' &&
                typeof item.quantity === 'number',
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
        const itemsNeedingImageRepair = cartItems.filter(
            (item) => item.slug && item.image === DEFAULT_LOCAL_ASSET_FALLBACK,
        );

        if (itemsNeedingImageRepair.length === 0) {
            return;
        }

        let cancelled = false;

        const repairImages = async () => {
            const repairedEntries = await Promise.all(
                itemsNeedingImageRepair.map(async (item) => {
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

                        if (!productImage || productImage === DEFAULT_LOCAL_ASSET_FALLBACK) {
                            return null;
                        }

                        return {
                            slug: item.slug ?? '',
                            image: productImage,
                        };
                    } catch {
                        return null;
                    }
                }),
            );

            if (cancelled) {
                return;
            }

            const imageBySlug = new Map(
                repairedEntries
                    .filter((entry): entry is { slug: string; image: string } => Boolean(entry?.slug && entry.image))
                    .map((entry) => [entry.slug, entry.image] as const),
            );

            if (imageBySlug.size === 0) {
                return;
            }

            setCartItems((prev) => {
                let hasChanges = false;

                const next = prev.map((item) => {
                    if (!item.slug || item.image !== DEFAULT_LOCAL_ASSET_FALLBACK) {
                        return item;
                    }

                    const repairedImage = imageBySlug.get(item.slug);
                    if (!repairedImage) {
                        return item;
                    }

                    hasChanges = true;
                    return {
                        ...item,
                        image: repairedImage,
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
            };
            const existingItem = prev.find((entry) => entry.id === item.id);

            if (existingItem) {
                return prev.map((entry) =>
                    entry.id === item.id
                        ? {
                              ...entry,
                              quantity: entry.quantity + normalizedItem.quantity,
                              slug: entry.slug ?? normalizedItem.slug,
                              sku: entry.sku ?? normalizedItem.sku,
                              variant: entry.variant ?? normalizedItem.variant,
                              image: normalizedItem.image,
                          }
                        : entry,
                );
            }

            return [...prev, normalizedItem];
        });
    };

    const removeFromCart = (id: number | string) => {
        setCartItems((prev) => prev.filter((entry) => entry.id !== id));
    };

    const updateQuantity = (id: number | string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }

        setCartItems((prev) =>
            prev.map((entry) => (entry.id === id ? { ...entry, quantity } : entry)),
        );
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
