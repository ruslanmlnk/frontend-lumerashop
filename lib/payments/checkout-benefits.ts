import 'server-only';

import { cookies } from 'next/headers';

import { fetchPayloadShippingMethods } from '@/lib/payload-shipping-methods';
import { getGlobal } from '@/lib/payload-data';
import { getCurrentUser } from '@/lib/auth';
import { getPayloadAuthConfig, parseJsonSafely } from '@/lib/payload-auth';
import { buildCheckoutTotals, sanitizeCheckoutItems } from '@/lib/payments/checkout-utils';
import type { CheckoutItemInput } from '@/lib/payments/checkout-types';

export type LoyaltySettings = {
    bonusesEnabled: boolean;
    earningSpendAmount: number;
    earningBonusUnits: number;
    redemptionBonusUnits: number;
    redemptionAmount: number;
};

export type AppliedCoupon = {
    id: string;
    code: string;
    name: string;
    discountPercent: number;
    discountAmount: number;
};

export type CheckoutQuote = {
    viewer: {
        isAuthenticated: boolean;
        userId?: string;
        bonusBalance: number;
    };
    loyaltySettings: LoyaltySettings;
    coupon?: AppliedCoupon;
    discounts: {
        couponDiscountAmount: number;
        bonusDiscountAmount: number;
        discountedSubtotal: number;
    };
    loyalty: {
        bonusBalance: number;
        bonusUnitsSpent: number;
        bonusUnitsEarned: number;
        availableBonusDiscountAmount: number;
    };
    totals: {
        subtotal: number;
        shipping: number;
        total: number;
        currency: string;
    };
};

type CouponApplyResponse = {
    couponId?: unknown;
    code?: unknown;
    name?: unknown;
    discountPercent?: unknown;
    discountAmount?: unknown;
    error?: unknown;
};

const DEFAULT_SETTINGS: LoyaltySettings = {
    bonusesEnabled: true,
    earningSpendAmount: 100,
    earningBonusUnits: 5,
    redemptionBonusUnits: 5,
    redemptionAmount: 100,
};

const toPositiveMoney = (value: unknown, fallback = 0) => {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
        return fallback;
    }

    return Math.round((numeric + Number.EPSILON) * 100) / 100;
};

const toWholeUnits = (value: unknown, fallback = 0) => {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
        return fallback;
    }

    return Math.max(0, Math.floor(numeric));
};

const parseLoyaltySettings = (value: unknown): LoyaltySettings => {
    const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
    const earning =
        source.earningRule && typeof source.earningRule === 'object'
            ? (source.earningRule as Record<string, unknown>)
            : {};
    const redemption =
        source.redemptionRule && typeof source.redemptionRule === 'object'
            ? (source.redemptionRule as Record<string, unknown>)
            : {};

    return {
        bonusesEnabled: source.bonusesEnabled !== false,
        earningSpendAmount: Math.max(1, toWholeUnits(earning.spendAmount, DEFAULT_SETTINGS.earningSpendAmount)),
        earningBonusUnits: Math.max(1, toWholeUnits(earning.bonusUnits, DEFAULT_SETTINGS.earningBonusUnits)),
        redemptionBonusUnits: Math.max(
            1,
            toWholeUnits(redemption.bonusUnits, DEFAULT_SETTINGS.redemptionBonusUnits),
        ),
        redemptionAmount: Math.max(1, toPositiveMoney(redemption.discountAmount, DEFAULT_SETTINGS.redemptionAmount)),
    };
};

const sanitizeCouponCode = (value: unknown) =>
    (typeof value === 'string' ? value : '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9-]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');

const calculateBonusRedemption = (bonusBalance: number, discountedSubtotal: number, settings: LoyaltySettings) => {
    if (
        !settings.bonusesEnabled ||
        bonusBalance <= 0 ||
        discountedSubtotal <= 0 ||
        settings.redemptionBonusUnits <= 0 ||
        settings.redemptionAmount <= 0
    ) {
        return {
            bonusUnitsSpent: 0,
            discountAmount: 0,
            availableBonusDiscountAmount: 0,
        };
    }

    const maxBlocksByBalance = Math.floor(bonusBalance / settings.redemptionBonusUnits);
    const maxBlocksBySubtotal = Math.floor(discountedSubtotal / settings.redemptionAmount);
    const blocks = Math.max(0, Math.min(maxBlocksByBalance, maxBlocksBySubtotal));

    return {
        bonusUnitsSpent: blocks * settings.redemptionBonusUnits,
        discountAmount: toPositiveMoney(blocks * settings.redemptionAmount),
        availableBonusDiscountAmount: toPositiveMoney(maxBlocksByBalance * settings.redemptionAmount),
    };
};

const calculateBonusEarned = (discountedSubtotal: number, settings: LoyaltySettings) => {
    if (
        !settings.bonusesEnabled ||
        discountedSubtotal <= 0 ||
        settings.earningSpendAmount <= 0 ||
        settings.earningBonusUnits <= 0
    ) {
        return 0;
    }

    return Math.floor(discountedSubtotal / settings.earningSpendAmount) * settings.earningBonusUnits;
};

const getPayloadBaseUrl = () => (process.env.PAYLOAD_API_URL?.trim() || 'http://127.0.0.1:3001').replace(/\/+$/, '');

const fetchAppliedCoupon = async (code: string, subtotal: number): Promise<AppliedCoupon | undefined> => {
    const normalizedCode = sanitizeCouponCode(code);
    if (!normalizedCode) {
        return undefined;
    }

    const config = getPayloadAuthConfig();
    if (!config) {
        throw new Error('Auth backend is not configured. Set PAYLOAD_API_URL.');
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(config.cookieName)?.value;
    if (!token) {
        throw new Error('Please sign in to use a coupon.');
    }

    const response = await fetch(`${getPayloadBaseUrl()}/api/coupons/apply`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
            code: normalizedCode,
            subtotal,
        }),
        cache: 'no-store',
    });

    const payload = await parseJsonSafely<CouponApplyResponse>(response);

    if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Coupon could not be applied.';
        throw new Error(message);
    }

    const couponId = payload?.couponId;
    const couponCode = typeof payload?.code === 'string' ? payload.code.trim() : normalizedCode;
    const discountPercent =
        typeof payload?.discountPercent === 'number' || typeof payload?.discountPercent === 'string'
            ? Number(payload.discountPercent)
            : NaN;
    const discountAmount =
        typeof payload?.discountAmount === 'number' || typeof payload?.discountAmount === 'string'
            ? Number(payload.discountAmount)
            : NaN;

    return {
        id: typeof couponId === 'string' || typeof couponId === 'number' ? String(couponId) : normalizedCode,
        code: couponCode,
        name: typeof payload?.name === 'string' ? payload.name : 'Coupon',
        discountPercent: Number.isFinite(discountPercent) ? Math.max(0, Math.round(discountPercent)) : 0,
        discountAmount: Number.isFinite(discountAmount) ? toPositiveMoney(discountAmount) : 0,
    };
};

export const fetchLoyaltySettings = async (): Promise<LoyaltySettings> => {
    const global = await getGlobal('loyalty-settings');
    return parseLoyaltySettings(global);
};

export const buildCheckoutQuote = async ({
    items,
    shippingMethodId,
    couponCode,
    useBonusBalance,
}: {
    items: CheckoutItemInput[];
    shippingMethodId?: string;
    couponCode?: string;
    useBonusBalance?: boolean;
}): Promise<CheckoutQuote> => {
    const [shippingMethods, currentUser, loyaltySettings] = await Promise.all([
        fetchPayloadShippingMethods(),
        getCurrentUser(),
        fetchLoyaltySettings(),
    ]);

    const sanitizedItems = sanitizeCheckoutItems(items);
    const selectedShippingMethod = shippingMethodId
        ? shippingMethods.find((method) => method.id === shippingMethodId)
        : undefined;
    const totals = buildCheckoutTotals(sanitizedItems, selectedShippingMethod?.price ?? 0);
    const bonusBalance = Math.max(0, currentUser?.bonusBalance ?? 0);

    let appliedCoupon: AppliedCoupon | undefined;
    if (couponCode && couponCode.trim().length > 0) {
        appliedCoupon = await fetchAppliedCoupon(couponCode, totals.subtotal);
    }

    const couponDiscountAmount = Math.min(
        totals.subtotal,
        toPositiveMoney(appliedCoupon?.discountAmount),
    );
    const subtotalAfterCoupon = Math.max(0, totals.subtotal - couponDiscountAmount);

    const bonusRedemption =
        useBonusBalance && currentUser
            ? calculateBonusRedemption(bonusBalance, subtotalAfterCoupon, loyaltySettings)
            : {
                  bonusUnitsSpent: 0,
                  discountAmount: 0,
                  availableBonusDiscountAmount: 0,
              };

    const discountedSubtotal = Math.max(0, subtotalAfterCoupon - bonusRedemption.discountAmount);
    const total = Math.max(0, discountedSubtotal + totals.shipping);

    return {
        viewer: {
            isAuthenticated: Boolean(currentUser),
            userId: currentUser?.id,
            bonusBalance,
        },
        loyaltySettings,
        coupon: appliedCoupon,
        discounts: {
            couponDiscountAmount,
            bonusDiscountAmount: bonusRedemption.discountAmount,
            discountedSubtotal,
        },
        loyalty: {
            bonusBalance,
            bonusUnitsSpent: bonusRedemption.bonusUnitsSpent,
            bonusUnitsEarned: currentUser ? calculateBonusEarned(discountedSubtotal, loyaltySettings) : 0,
            availableBonusDiscountAmount: bonusRedemption.availableBonusDiscountAmount,
        },
        totals: {
            subtotal: totals.subtotal,
            shipping: totals.shipping,
            total,
            currency: totals.currency,
        },
    };
};
