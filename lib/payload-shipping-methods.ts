import 'server-only';

import { SHIPPING_METHOD_PRESETS } from '@/data/shipping-methods';
import type { ShippingMethod, ShippingMethodId } from '@/lib/checkout-shipping';

const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001';

type PayloadShippingMethodDoc = {
  methodId?: unknown;
  price?: unknown;
  isActive?: unknown;
  sortOrder?: unknown;
};

type PayloadListResponse<T> = {
  docs?: T[];
};

const defaultShippingMethods: ShippingMethod[] = SHIPPING_METHOD_PRESETS.map((method) => ({
  ...method,
  pickupCarrier: method.pickupCarrier ?? undefined,
  isActive: true,
}));

const DEFAULT_SHIPPING_MAP = new Map<ShippingMethodId, ShippingMethod>(
  defaultShippingMethods.map((method) => [method.id, method]),
);

const isShippingMethodId = (value: unknown): value is ShippingMethodId =>
  typeof value === 'string' && DEFAULT_SHIPPING_MAP.has(value as ShippingMethodId);

export async function fetchPayloadShippingMethods(): Promise<ShippingMethod[]> {
  const baseUrlRaw = process.env.PAYLOAD_API_URL?.trim() || DEFAULT_PAYLOAD_API_URL;
  const baseUrl = baseUrlRaw.replace(/\/+$/, '');

  try {
    const response = await fetch(
      `${baseUrl}/api/shipping-methods?limit=100&sort=sortOrder`,
      {
        cache: 'no-store',
        next: { revalidate: 0 },
      },
    );

    if (!response.ok) {
      return defaultShippingMethods;
    }

    const payload = (await response.json()) as PayloadListResponse<PayloadShippingMethodDoc>;
    const docs = Array.isArray(payload.docs) ? payload.docs : [];
    const configuredMap = new Map<ShippingMethodId, PayloadShippingMethodDoc>();

    for (const doc of docs) {
      if (isShippingMethodId(doc.methodId)) {
        configuredMap.set(doc.methodId, doc);
      }
    }

    const methods = defaultShippingMethods
      .map((method) => {
        const configured = configuredMap.get(method.id);
        if (!configured) {
          return method;
        }

        const numericPrice = typeof configured.price === 'number' ? configured.price : Number(configured.price);
        const numericSortOrder =
          typeof configured.sortOrder === 'number' ? configured.sortOrder : Number(configured.sortOrder);

        return {
          ...method,
          price: Number.isFinite(numericPrice) && numericPrice >= 0 ? numericPrice : method.price,
          sortOrder: Number.isFinite(numericSortOrder) ? numericSortOrder : method.sortOrder,
          isActive: configured.isActive !== false,
        };
      })
      .filter((method) => method.isActive !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return methods.length ? methods : defaultShippingMethods;
  } catch {
    return defaultShippingMethods;
  }
}
