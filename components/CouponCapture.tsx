'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { persistPendingCoupon, sanitizeCouponCode } from '@/lib/coupon-storage';

export default function CouponCapture() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const couponCode = sanitizeCouponCode(searchParams.get('coupon'));
        if (!couponCode) {
            return;
        }

        persistPendingCoupon(couponCode);

        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete('coupon');

        const nextQuery = nextParams.toString();
        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

        router.replace(nextUrl, { scroll: false });
    }, [pathname, router, searchParams]);

    return null;
}
