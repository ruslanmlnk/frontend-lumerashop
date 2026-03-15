'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { clearPendingCoupon, readPendingCoupon } from '@/lib/coupon-storage';

type ClearCartOnSuccessProps = {
    paymentStatus?: string;
    couponCode?: string;
    userId?: string;
};

const getUsedCouponsStorageKey = (userId: string) => `lumera_used_coupons:${userId}`;

export default function ClearCartOnSuccess({ paymentStatus, couponCode, userId }: ClearCartOnSuccessProps) {
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();

        if (paymentStatus !== 'paid' || !couponCode || !userId) {
            return;
        }

        const normalizedCode = couponCode.trim().toUpperCase();
        if (!normalizedCode) {
            return;
        }

        try {
            const storageKey = getUsedCouponsStorageKey(userId);
            const existing = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];
            const next = Array.from(new Set([...existing, normalizedCode]));
            localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
            // Ignore local persistence issues and still clear the cart.
        }

        if (readPendingCoupon() === normalizedCode) {
            clearPendingCoupon();
        }

        document.cookie = `lumera_used_coupon_${encodeURIComponent(userId)}_${encodeURIComponent(normalizedCode)}=1; path=/; max-age=31536000; SameSite=Lax`;
    }, [clearCart, couponCode, paymentStatus, userId]);

    return null;
}
