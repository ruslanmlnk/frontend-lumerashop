import type { CheckoutPickupPoint, ShippingMethodId } from '@/lib/checkout-shipping';

export type PaymentProvider = 'global-payments' | 'stripe';
export type Step = 'contact' | 'shipping' | 'billing' | 'payment';
export type CheckoutVariant = 'minimal' | 'refined';

export type CheckoutStartResponse = {
    provider?: PaymentProvider;
    orderId?: string;
    redirectUrl?: string;
    actionUrl?: string;
    fields?: Record<string, string>;
    error?: string;
};

export type CheckoutQuoteResponse = {
    viewer?: {
        isAuthenticated: boolean;
        userId?: string;
        bonusBalance: number;
    };
    loyaltySettings?: {
        bonusesEnabled: boolean;
        earningSpendAmount: number;
        earningBonusUnits: number;
        redemptionBonusUnits: number;
        redemptionAmount: number;
    };
    coupon?: {
        id: string;
        code: string;
        name: string;
        discountPercent: number;
        discountAmount: number;
    };
    discounts?: {
        couponDiscountAmount: number;
        bonusDiscountAmount: number;
        discountedSubtotal: number;
    };
    loyalty?: {
        bonusBalance: number;
        bonusUnitsSpent: number;
        bonusUnitsEarned: number;
        availableBonusDiscountAmount: number;
    };
    totals?: {
        subtotal: number;
        shipping: number;
        total: number;
        currency: string;
    };
    error?: string;
};

export type CheckoutFormState = {
    email: string;
    phone: string;
    createAccount: boolean;
    firstName: string;
    lastName: string;
    country: string;
    address: string;
    city: string;
    zip: string;
    notes: string;
    shippingMethod: ShippingMethodId;
    pickupPoint: CheckoutPickupPoint | null;
    billingSameAsShipping: boolean;
    billingFirstName: string;
    billingLastName: string;
    billingAddress: string;
    billingCity: string;
    billingZip: string;
    isCompany: boolean;
    companyName: string;
    companyId: string;
    vatId: string;
    paymentProvider: PaymentProvider;
    termsAccepted: boolean;
    promoCode: string;
    useBonusBalance: boolean;
};
