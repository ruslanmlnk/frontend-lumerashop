import 'server-only';

import type { CheckoutPickupPoint } from '@/lib/checkout-shipping';
import type { CheckoutPayload, CheckoutProvider } from '@/lib/payments/checkout-types';

export type PaymentOrderStatus = 'pending' | 'paid' | 'failed' | 'canceled';

export type PaymentOrderSummary = {
    id: number;
    orderId: string;
    provider: CheckoutProvider;
    paymentStatus: PaymentOrderStatus;
    userId: string;
    customerEmail: string;
    currency: string;
    total: number;
    purchaseCountRecorded: boolean;
    bonusLedgerRecorded: boolean;
    couponCode: string;
    couponDiscountAmount: number;
    firstPurchaseDiscountAmount: number;
    bonusDiscountAmount: number;
    discountedSubtotal: number;
    bonusUnitsSpent: number;
    bonusUnitsEarned: number;
    providerData: {
        stripeSessionId: string;
        stripePaymentIntentId: string;
        globalTransactionId: string;
        globalAuthCode: string;
        lastEvent: string;
        lastError: string;
    };
};

export type CreatePaymentOrderInput = {
    orderId: string;
    provider: CheckoutProvider;
    currency: string;
    subtotal: number;
    shippingTotal: number;
    total: number;
    userId?: number | string;
    items: Array<{
        id?: number | string;
        name?: string;
        slug?: string;
        sku?: string;
        variant?: string;
        quantity?: number;
        unitPrice?: number;
        lineTotal?: number;
    }>;
    coupon?: {
        id?: number | string;
        code?: string;
        discountPercent?: number;
        discountAmount?: number;
    } | null;
    discounts?: {
        couponDiscountAmount?: number;
        firstPurchaseDiscountAmount?: number;
        bonusDiscountAmount?: number;
        discountedSubtotal?: number;
    } | null;
    loyalty?: {
        bonusUnitsSpent?: number;
        bonusUnitsEarned?: number;
    } | null;
    customer: NonNullable<CheckoutPayload['customer']>;
    shipping?: {
        methodId?: string;
        label?: string;
        price?: number;
        pickupPoint?: CheckoutPickupPoint | null;
    };
    billing?: CheckoutPayload['billing'];
};

export type UpdatePaymentOrderInput = {
    paymentStatus?: PaymentOrderStatus;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    globalTransactionId?: string;
    globalAuthCode?: string;
    lastEvent?: string;
    lastError?: string;
    providerResponse?: unknown;
};

const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001';
const INTERNAL_HEADER_NAME = 'x-lumera-internal-secret';

const getPayloadBaseUrl = () =>
    (process.env.PAYLOAD_API_URL?.trim() || DEFAULT_PAYLOAD_API_URL).replace(/\/+$/, '');

const getInternalApiSecret = () => {
    const secret = process.env.INTERNAL_API_SECRET?.trim() || process.env.PAYLOAD_SECRET?.trim();

    if (!secret) {
        throw new Error('Missing INTERNAL_API_SECRET');
    }

    return secret;
};

const requestInternalOrders = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${getPayloadBaseUrl()}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            [INTERNAL_HEADER_NAME]: getInternalApiSecret(),
            ...(init?.headers || {}),
        },
        cache: 'no-store',
        next: { revalidate: 0 },
    });

    const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

    if (!response.ok) {
        throw new Error(payload.error || `Internal order request failed: ${response.status}`);
    }

    return payload;
};

export const createPaymentOrder = (input: CreatePaymentOrderInput) =>
    requestInternalOrders<PaymentOrderSummary>('/internal/orders', {
        method: 'POST',
        body: JSON.stringify(input),
    });

export const updatePaymentOrder = (orderId: string, input: UpdatePaymentOrderInput) =>
    requestInternalOrders<PaymentOrderSummary>(`/internal/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
    });

export const fetchPaymentOrder = (orderId: string) =>
    requestInternalOrders<PaymentOrderSummary>(`/internal/orders/${encodeURIComponent(orderId)}`, {
        method: 'GET',
    });
