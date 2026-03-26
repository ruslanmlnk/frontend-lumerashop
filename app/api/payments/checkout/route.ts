import { NextRequest, NextResponse } from 'next/server';
import { getPickupCarrierForMethod, isShippingMethodId } from '@/lib/checkout-shipping';
import { fetchPayloadShippingMethods } from '@/lib/payload-shipping-methods';
import { createGlobalPaymentsHppSession } from '@/lib/payments/global-payments';
import { getBaseUrl, sanitizeCheckoutItems } from '@/lib/payments/checkout-utils';
import { buildCheckoutQuote } from '@/lib/payments/checkout-benefits';
import type { CheckoutPayload, CheckoutProvider, OrderProvider } from '@/lib/payments/checkout-types';
import { createPaymentOrder, updatePaymentOrder } from '@/lib/payments/internal-orders';
import { getStripeClient } from '@/lib/payments/stripe';

export const runtime = 'nodejs';

const SUPPORTED_PROVIDERS: CheckoutProvider[] = ['stripe', 'global-payments'];

const isCheckoutProvider = (value: unknown): value is CheckoutProvider =>
    typeof value === 'string' && SUPPORTED_PROVIDERS.includes(value as CheckoutProvider);

const buildStripeLineItems = ({
    items,
    couponDiscountAmount,
    firstPurchaseDiscountAmount,
    bonusDiscountAmount,
    shippingAmount,
    shippingLabel,
    shippingMethodId,
}: {
    items: ReturnType<typeof sanitizeCheckoutItems>;
    couponDiscountAmount: number;
    firstPurchaseDiscountAmount: number;
    bonusDiscountAmount: number;
    shippingAmount: number;
    shippingLabel?: string;
    shippingMethodId?: string;
}) => {
    const subtotalCents = items.reduce((sum, item) => sum + item.lineTotal * 100, 0);
    const discountCents = Math.round((couponDiscountAmount + firstPurchaseDiscountAmount + bonusDiscountAmount) * 100);

    const expandedUnits = items.flatMap((item) =>
        Array.from({ length: item.quantity }, (_, index) => ({
            id: `${item.id}-${index + 1}`,
            itemId: item.id,
            name: item.name,
            unitPriceCents: item.unitPrice * 100,
            slug: item.slug,
            sku: item.sku,
            variant: item.variant,
        })),
    );

    if (subtotalCents > 0 && discountCents > 0) {
        const provisional = expandedUnits.map((unit) => {
            const rawDiscount = (unit.unitPriceCents * discountCents) / subtotalCents;
            const flooredDiscount = Math.floor(rawDiscount);

            return {
                ...unit,
                flooredDiscount,
                fraction: rawDiscount - flooredDiscount,
            };
        });

        let remainder = Math.max(
            0,
            discountCents - provisional.reduce((sum, unit) => sum + unit.flooredDiscount, 0),
        );

        provisional
            .sort((left, right) => right.fraction - left.fraction)
            .forEach((unit) => {
                const extraDiscount = remainder > 0 ? 1 : 0;
                remainder = Math.max(0, remainder - extraDiscount);
                unit.unitPriceCents = Math.max(0, unit.unitPriceCents - unit.flooredDiscount - extraDiscount);
            });

        provisional.sort((left, right) => left.id.localeCompare(right.id));

        return provisional
            .map((unit) => ({
                quantity: 1,
                price_data: {
                    currency: 'czk',
                    unit_amount: unit.unitPriceCents,
                    product_data: {
                        name: unit.name,
                        metadata: {
                            itemId: unit.itemId,
                            slug: unit.slug || '',
                            sku: unit.sku || '',
                            variant: unit.variant || '',
                        },
                    },
                },
            }))
            .concat(
                shippingAmount > 0
                    ? [
                          {
                              quantity: 1,
                              price_data: {
                                  currency: 'czk',
                                  unit_amount: Math.round(shippingAmount * 100),
                                  product_data: {
                                      name: shippingLabel || 'Doprava',
                                      metadata: {
                                          itemId: shippingMethodId || 'shipping',
                                          slug: '',
                                          sku: '',
                                          variant: '',
                                      },
                                  },
                              },
                          },
                      ]
                    : [],
            );
    }

    return items
        .map((item) => ({
            quantity: item.quantity,
            price_data: {
                currency: 'czk',
                unit_amount: item.unitPrice * 100,
                product_data: {
                    name: item.name,
                    metadata: {
                        itemId: item.id,
                        slug: item.slug || '',
                        sku: item.sku || '',
                        variant: item.variant || '',
                    },
                },
            },
        }))
        .concat(
            shippingAmount > 0
                ? [
                      {
                          quantity: 1,
                          price_data: {
                              currency: 'czk',
                              unit_amount: Math.round(shippingAmount * 100),
                              product_data: {
                                  name: shippingLabel || 'Doprava',
                                  metadata: {
                                      itemId: shippingMethodId || 'shipping',
                                      slug: '',
                                      sku: '',
                                      variant: '',
                                  },
                              },
                          },
                      },
                  ]
                : [],
        );
};

export async function POST(request: NextRequest) {
    let createdOrderId: string | null = null;

    try {
        const payload = (await request.json()) as CheckoutPayload;

        if (!isCheckoutProvider(payload?.provider)) {
            return NextResponse.json({ error: 'Unsupported payment provider.' }, { status: 400 });
        }

        const items = sanitizeCheckoutItems(payload.items);
        if (!items.length) {
            return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
        }

        if (!payload.customer?.email?.trim()) {
            return NextResponse.json({ error: 'Customer email is required.' }, { status: 400 });
        }

        if (payload.shipping?.methodId && !isShippingMethodId(payload.shipping.methodId)) {
            return NextResponse.json({ error: 'Unsupported shipping method.' }, { status: 400 });
        }

        const shippingMethodId = payload.shipping?.methodId;
        if (!shippingMethodId) {
            return NextResponse.json({ error: 'Shipping method is required.' }, { status: 400 });
        }

        const shippingMethods = await fetchPayloadShippingMethods();
        const selectedShippingMethod = shippingMethodId
            ? shippingMethods.find((method) => method.id === shippingMethodId)
            : undefined;

        if (shippingMethodId && !selectedShippingMethod) {
            return NextResponse.json({ error: 'Selected shipping method is not available.' }, { status: 400 });
        }

        const expectedPickupCarrier = shippingMethodId ? getPickupCarrierForMethod(shippingMethodId) : undefined;
        const pickupPoint = payload.shipping?.pickupPoint;

        if (expectedPickupCarrier) {
            if (
                !pickupPoint ||
                pickupPoint.carrier !== expectedPickupCarrier ||
                !pickupPoint.id ||
                !pickupPoint.name
            ) {
                return NextResponse.json(
                    { error: 'Pickup shipping requires a selected pickup point or parcel box.' },
                    { status: 400 },
                );
            }
        }

        const quote = await buildCheckoutQuote({
            items: payload.items,
            shippingMethodId,
            couponCode: payload.promoCode,
            useBonusBalance: payload.useBonusBalance,
        });

        if (payload.promoCode?.trim() && !quote.viewer.isAuthenticated) {
            return NextResponse.json(
                { error: 'Please sign in before completing an order with a coupon.' },
                { status: 400 },
            );
        }

        const baseUrl = getBaseUrl(
            request.headers.get('x-forwarded-host') || request.headers.get('host'),
            request.headers.get('x-forwarded-proto'),
        );
        const orderProvider: OrderProvider =
            selectedShippingMethod?.cashOnDelivery === true ? 'cash-on-delivery' : payload.provider;

        const orderId = `LMR-${Date.now()}`;
        createdOrderId = orderId;

        await createPaymentOrder({
            orderId,
            provider: orderProvider,
            currency: quote.totals.currency,
            subtotal: quote.totals.subtotal,
            shippingTotal: quote.totals.shipping,
            total: quote.totals.total,
            userId: quote.viewer.userId,
            items: items.map((item) => ({
                id: item.id,
                name: item.name,
                slug: item.slug,
                sku: item.sku,
                variant: item.variant,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineTotal: item.lineTotal,
            })),
            coupon: quote.coupon
                ? {
                      id: quote.coupon.id,
                      code: quote.coupon.code,
                      discountPercent: quote.coupon.discountPercent,
                      discountAmount: quote.coupon.discountAmount,
                  }
                : null,
            discounts: {
                couponDiscountAmount: quote.discounts.couponDiscountAmount,
                firstPurchaseDiscountAmount: quote.discounts.firstPurchaseDiscountAmount,
                bonusDiscountAmount: quote.discounts.bonusDiscountAmount,
                discountedSubtotal: quote.discounts.discountedSubtotal,
            },
            loyalty: {
                bonusUnitsSpent: quote.loyalty.bonusUnitsSpent,
                bonusUnitsEarned: quote.loyalty.bonusUnitsEarned,
            },
            customer: payload.customer,
            shipping: {
                methodId: shippingMethodId,
                label: selectedShippingMethod?.label || payload.shipping?.label,
                price: quote.totals.shipping,
                cashOnDelivery: selectedShippingMethod?.cashOnDelivery === true,
                pickupPoint: pickupPoint || undefined,
            },
            billing: payload.billing,
        });

        if (orderProvider === 'cash-on-delivery') {
            return NextResponse.json({
                provider: orderProvider,
                orderId,
                redirectUrl: `${baseUrl}/checkout/success?provider=${encodeURIComponent(orderProvider)}&orderId=${encodeURIComponent(orderId)}`,
            });
        }

        if (payload.provider === 'stripe') {
            const stripe = getStripeClient();
            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                client_reference_id: orderId,
                customer_email: payload.customer?.email,
                payment_intent_data: {
                    metadata: {
                        orderId,
                        provider: 'stripe',
                    },
                },
                line_items: buildStripeLineItems({
                    items,
                    couponDiscountAmount: quote.discounts.couponDiscountAmount,
                    firstPurchaseDiscountAmount: quote.discounts.firstPurchaseDiscountAmount,
                    bonusDiscountAmount: quote.discounts.bonusDiscountAmount,
                    shippingAmount: quote.totals.shipping,
                    shippingLabel: selectedShippingMethod?.label || payload.shipping?.label,
                    shippingMethodId,
                }),
                metadata: {
                    orderId,
                    provider: 'stripe',
                    shippingMethodId: shippingMethodId || '',
                    shippingLabel: payload.shipping?.label?.slice(0, 500) || '',
                    shippingPrice: String(quote.totals.shipping),
                    pickupCarrier: pickupPoint?.carrier || '',
                    pickupPointId: pickupPoint?.id || '',
                    pickupPointCode: pickupPoint?.code || '',
                    pickupPointName: pickupPoint?.name?.slice(0, 500) || '',
                    couponCode: quote.coupon?.code || '',
                    couponDiscountAmount: String(quote.discounts.couponDiscountAmount),
                    firstPurchaseDiscountAmount: String(quote.discounts.firstPurchaseDiscountAmount),
                    bonusDiscountAmount: String(quote.discounts.bonusDiscountAmount),
                    bonusUnitsSpent: String(quote.loyalty.bonusUnitsSpent),
                },
                success_url: `${baseUrl}/checkout/success?provider=stripe&orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/checkout/cancel?provider=stripe&orderId=${orderId}`,
            });

            if (!session.url) {
                return NextResponse.json({ error: 'Stripe checkout URL was not generated.' }, { status: 500 });
            }

            await updatePaymentOrder(orderId, {
                stripeSessionId: session.id,
                stripePaymentIntentId:
                    typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
                lastEvent: 'stripe.checkout.session.created',
            });

            return NextResponse.json({
                provider: 'stripe',
                orderId,
                redirectUrl: session.url,
            });
        }

        // Global Payments
        const responseUrl = process.env.GP_HPP_RESPONSE_URL?.trim() || `${baseUrl}/api/payments/global-payments/response`;
        const hppSession = createGlobalPaymentsHppSession({
            amount: quote.totals.total,
            currency: quote.totals.currency,
            orderId,
            description: `Lumera order ${orderId}`,
            responseUrl,
        });

        await updatePaymentOrder(orderId, {
            lastEvent: 'global-payments.session.created',
        });

        return NextResponse.json({
            provider: 'global-payments',
            orderId: hppSession.orderId,
            actionUrl: hppSession.actionUrl,
            fields: hppSession.fields,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown checkout error.';

        if (createdOrderId) {
            try {
                await updatePaymentOrder(createdOrderId, {
                    paymentStatus: 'failed',
                    lastEvent: 'checkout.init.error',
                    lastError: message,
                });
            } catch {
                // Ignore secondary order update failures and return the primary checkout error.
            }
        }

        const status = /coupon|bonus|sign in|cart is empty|required|unsupported|not available|košíku|košík|dostupný|vyprodan|skladem/i.test(message)
            ? 400
            : 500;

        return NextResponse.json({ error: message }, { status });
    }
}
