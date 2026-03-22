import 'server-only';
import type { CheckoutItemInput, CheckoutLineItem, CheckoutTotals } from '@/lib/payments/checkout-types';
import { fetchPayloadProducts } from '@/lib/payload-products';

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

export const assertCheckoutItemsWithinStock = async (items: CheckoutLineItem[]) => {
    if (items.length === 0) {
        return;
    }

    const products = await fetchPayloadProducts();
    const productsById = new Map(products.map((product) => [product.id, product] as const));
    const productsBySlug = new Map(products.map((product) => [product.slug, product] as const));

    for (const item of items) {
        const product = (item.slug && productsBySlug.get(item.slug)) || productsById.get(item.id);

        if (!product) {
            throw new Error(`Produkt "${item.name}" už není dostupný. Odeberte ho z košíku a zkuste to znovu.`);
        }

        if (typeof product.stockQuantity !== 'number') {
            continue;
        }

        if (item.quantity > product.stockQuantity) {
            if (product.stockQuantity <= 0) {
                throw new Error(`Produkt "${product.name}" je momentálně vyprodaný. Odeberte ho z košíku a zkuste to znovu.`);
            }

            throw new Error(
                `U produktu "${product.name}" jsou skladem už jen ${product.stockQuantity} ks. Upravte množství v košíku a zkuste to znovu.`,
            );
        }
    }
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
