import type { CheckoutPickupPoint, ShippingMethodId } from '@/lib/checkout-shipping';

export type CheckoutProvider = 'stripe' | 'global-payments';

export type CheckoutItemInput = {
    id?: number | string;
    name?: string;
    price?: number;
    quantity?: number;
    slug?: string;
    sku?: string;
    variant?: string;
};

export type CheckoutLineItem = {
    id: string;
    name: string;
    slug?: string;
    sku?: string;
    variant?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
};

export type CheckoutTotals = {
    subtotal: number;
    shipping: number;
    total: number;
    currency: string;
};

export type CheckoutPayload = {
    provider: CheckoutProvider;
    items: CheckoutItemInput[];
    promoCode?: string;
    useBonusBalance?: boolean;
    shipping?: {
        methodId?: ShippingMethodId;
        label?: string;
        pickupPoint?: CheckoutPickupPoint | null;
    };
    customer?: {
        email: string;
        phone: string;
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        zip: string;
        country: string;
            notes?: string;
    };
    billing?: {
        sameAsShipping?: boolean;
        isCompany?: boolean;
        firstName?: string;
        lastName?: string;
        address?: string;
        city?: string;
        zip?: string;
        country?: string;
        companyName?: string;
        companyId?: string;
        vatId?: string;
    };
};
