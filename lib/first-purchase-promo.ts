import 'server-only';

import {
    getAbsolutePayloadAssetUrl,
    getLocalAssetPath,
    getPayloadMediaProxyPath,
    isRemoteAssetPath,
} from '@/lib/local-assets';
import { fetchPayloadGlobal, getPayloadGlobalsBaseUrl } from '@/lib/payload-globals';
import type { FirstPurchasePromoConfig } from '@/types/commerce';

type PayloadMediaValue =
    | {
          url?: unknown;
          filename?: unknown;
      }
    | string
    | number
    | null
    | undefined;

type PayloadFirstPurchasePromoGlobal = {
    discountAmount?: unknown;
    icon?: PayloadMediaValue;
} | null;

const DEFAULT_FIRST_PURCHASE_AMOUNT = 100;
const DEFAULT_FIRST_PURCHASE_ICON = '/discount.png';

const toPositiveMoney = (value: unknown, fallback: number) => {
    const numeric = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(numeric) || numeric < 0) {
        return fallback;
    }

    return Math.round((numeric + Number.EPSILON) * 100) / 100;
};

const formatAmountLabel = (amount: number) =>
    `${amount.toLocaleString('cs-CZ', {
        minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
        maximumFractionDigits: 2,
    })} Kc`;

const resolvePayloadMediaPath = (value: unknown, baseUrl: string): string | null => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return null;
    }

    const normalized = getLocalAssetPath(value);
    if (!normalized) {
        return null;
    }

    if (normalized.startsWith('/assets/') || normalized === DEFAULT_FIRST_PURCHASE_ICON) {
        return normalized;
    }

    if (isRemoteAssetPath(normalized)) {
        return getPayloadMediaProxyPath(normalized);
    }

    return getPayloadMediaProxyPath(getAbsolutePayloadAssetUrl(normalized, baseUrl));
};

const resolvePromoIconSrc = (icon: PayloadMediaValue, baseUrl: string): string => {
    if (icon && typeof icon === 'object') {
        const resolvedFromRelation =
            resolvePayloadMediaPath(icon.url, baseUrl) || resolvePayloadMediaPath(icon.filename, baseUrl);

        if (resolvedFromRelation) {
            return resolvedFromRelation;
        }
    }

    if (typeof icon === 'string') {
        const resolvedFromString = resolvePayloadMediaPath(icon, baseUrl);

        if (resolvedFromString) {
            return resolvedFromString;
        }
    }

    return DEFAULT_FIRST_PURCHASE_ICON;
};

export async function fetchFirstPurchasePromo(): Promise<FirstPurchasePromoConfig> {
    const baseUrl = getPayloadGlobalsBaseUrl();
    const global = await fetchPayloadGlobal<PayloadFirstPurchasePromoGlobal>('first-purchase-promo');
    const amount = toPositiveMoney(global?.discountAmount, DEFAULT_FIRST_PURCHASE_AMOUNT);
    const amountLabel = formatAmountLabel(amount);

    return {
        amount,
        iconSrc: resolvePromoIconSrc(global?.icon, baseUrl),
        productMessage: `${amountLabel} sleva po registraci na prvni nakup`,
        modalMessage: `Ziskejte ${amountLabel} slevu po registraci.`,
    };
}
