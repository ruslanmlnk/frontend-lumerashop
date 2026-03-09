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
};
