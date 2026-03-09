'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getRenderableAssetPath } from '@/lib/local-assets';

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

const CART_STORAGE_KEY = 'lumera_cart';
const CartContext = createContext<CartContextType | undefined>(undefined);

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
                image: getRenderableAssetPath(item.image),
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

    const addToCart = (item: CartItem) => {
        setCartItems((prev) => {
            const normalizedItem = {
                ...item,
                image: getRenderableAssetPath(item.image),
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
                              image: getRenderableAssetPath(entry.image),
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
