import {
  SHIPPING_METHOD_PRESETS,
  type PickupCarrier,
  type ShippingMethodId,
} from '@/data/shipping-methods';

export type { PickupCarrier, ShippingMethodId } from '@/data/shipping-methods';

export type CheckoutPickupPoint = {
  carrier: PickupCarrier;
  id: string;
  code?: string;
  name: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  type?: string;
  providerLabel?: string;
};

export type ShippingMethod = {
  id: ShippingMethodId;
  label: string;
  description: string;
  price: number;
  sortOrder: number;
  pickupCarrier?: PickupCarrier;
  isActive?: boolean;
};

export const SHIPPING_METHODS: ShippingMethod[] = SHIPPING_METHOD_PRESETS.map((method) => ({
  ...method,
  pickupCarrier: method.pickupCarrier ?? undefined,
  isActive: true,
}));

const SHIPPING_METHOD_IDS = new Set<string>(SHIPPING_METHOD_PRESETS.map((method) => method.id));
const SHIPPING_METHOD_MAP = new Map<ShippingMethodId, ShippingMethod>(
  SHIPPING_METHODS.map((method) => [method.id, method]),
);

export const DEFAULT_SHIPPING_METHOD = SHIPPING_METHODS[0].id;

export const formatShippingPrice = (price: number) =>
  price === 0 ? 'Zdarma' : `${price.toLocaleString('cs-CZ')} Kč`;

export const isShippingMethodId = (value: unknown): value is ShippingMethodId =>
  typeof value === 'string' && SHIPPING_METHOD_IDS.has(value);

export const getShippingMethodById = (
  methodId: ShippingMethodId,
  methods: readonly ShippingMethod[] = SHIPPING_METHODS,
) => methods.find((method) => method.id === methodId) ?? SHIPPING_METHOD_MAP.get(methodId);

export const getPickupCarrierForMethod = (methodId: ShippingMethodId) =>
  SHIPPING_METHOD_MAP.get(methodId)?.pickupCarrier;

export const isPickupShippingMethod = (methodId: ShippingMethodId) =>
  Boolean(getPickupCarrierForMethod(methodId));

export const formatPickupPointAddress = (pickupPoint: CheckoutPickupPoint) => {
  const cityLine = [pickupPoint.zip, pickupPoint.city].filter(Boolean).join(' ').trim();
  return [pickupPoint.street, cityLine, pickupPoint.country].filter(Boolean).join(', ');
};
