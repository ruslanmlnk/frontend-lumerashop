import 'server-only';
import type { CheckoutItemInput, CheckoutLineItem, CheckoutTotals } from '@/lib/payments/checkout-types';

const DEFAULT_CURRENCY = (process.env.CHECKOUT_CURRENCY || 'CZK').toUpperCase();

const toSafeString = (value: unknown, fallback: string) => {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : fallback;
};

const toSafeNumber = (value: unknown) => {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return numeric;
};

export const sanitizeCheckoutItems = (items: CheckoutItemInput[]): CheckoutLineItem[] => {
    if (!Array.isArray(items)) return [];

    const sanitized: CheckoutLineItem[] = [];

    for (const raw of items) {
        const quantity = Math.max(0, Math.floor(toSafeNumber(raw?.quantity)));
        const unitPrice = Math.max(0, Math.round(toSafeNumber(raw?.price)));

        if (quantity <= 0 || unitPrice <= 0) {
            continue;
        }

        sanitized.push({
            id: toSafeString(raw?.id, `item-${sanitized.length + 1}`),
            name: toSafeString(raw?.name, 'Produkt'),
            slug: toSafeString(raw?.slug, ''),
            sku: toSafeString(raw?.sku, ''),
            variant: toSafeString(raw?.variant, ''),
            quantity,
            unitPrice,
            lineTotal: quantity * unitPrice,
        });
    }

    return sanitized;
};

export const buildCheckoutTotals = (items: CheckoutLineItem[], shippingAmount = 0): CheckoutTotals => {
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = Math.max(0, Math.round(toSafeNumber(shippingAmount)));

    return {
        subtotal,
        shipping,
        total: subtotal + shipping,
        currency: DEFAULT_CURRENCY,
    };
};

export const getBaseUrl = (hostHeader: string | null, protoHeader: string | null) => {
    const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();
    if (envSiteUrl) {
        return envSiteUrl.replace(/\/+$/, '');
    }

    if (hostHeader) {
        const protocol = protoHeader || 'http';
        return `${protocol}://${hostHeader}`;
    }

    return 'http://localhost:3000';
};
