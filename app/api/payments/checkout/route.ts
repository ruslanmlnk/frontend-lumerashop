import { NextRequest, NextResponse } from 'next/server';
import { getPickupCarrierForMethod, isShippingMethodId } from '@/lib/checkout-shipping';
import { fetchPayloadShippingMethods } from '@/lib/payload-shipping-methods';
import { createGlobalPaymentsHppSession } from '@/lib/payments/global-payments';
import { buildCheckoutTotals, getBaseUrl, sanitizeCheckoutItems } from '@/lib/payments/checkout-utils';
import type { CheckoutPayload, CheckoutProvider } from '@/lib/payments/checkout-types';
import { createPaymentOrder, updatePaymentOrder } from '@/lib/payments/internal-orders';
import { getStripeClient } from '@/lib/payments/stripe';

export const runtime = 'nodejs';

const SUPPORTED_PROVIDERS: CheckoutProvider[] = ['stripe', 'global-payments'];

const isCheckoutProvider = (value: unknown): value is CheckoutProvider =>
    typeof value === 'string' && SUPPORTED_PROVIDERS.includes(value as CheckoutProvider);

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

        const totals = buildCheckoutTotals(items, selectedShippingMethod?.price ?? 0);
        const baseUrl = getBaseUrl(
            request.headers.get('x-forwarded-host') || request.headers.get('host'),
            request.headers.get('x-forwarded-proto'),
        );

        const orderId = `LMR-${Date.now()}`;
        createdOrderId = orderId;

        await createPaymentOrder({
            orderId,
            provider: payload.provider,
            currency: totals.currency,
            subtotal: totals.subtotal,
            shippingTotal: totals.shipping,
            total: totals.total,
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
            customer: payload.customer,
            shipping: {
                methodId: shippingMethodId,
                label: payload.shipping?.label,
                price: totals.shipping,
                pickupPoint: pickupPoint || undefined,
            },
            billing: payload.billing,
        });

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
                line_items: items.map((item) => ({
                    quantity: item.quantity,
                    price_data: {
                        currency: totals.currency.toLowerCase(),
                        unit_amount: item.unitPrice * 100,
                        product_data: {
                            name: item.name,
                            metadata: {
                                itemId: item.id,
                            },
                        },
                    },
                })).concat(
                    totals.shipping > 0
                        ? [
                              {
                                  quantity: 1,
                                  price_data: {
                                      currency: totals.currency.toLowerCase(),
                                      unit_amount: totals.shipping * 100,
                                      product_data: {
                                          name: selectedShippingMethod?.label || 'Doprava',
                                          metadata: {
                                              itemId: shippingMethodId || 'shipping',
                                          },
                                      },
                                  },
                              },
                          ]
                        : [],
                ),
                metadata: {
                    orderId,
                    provider: 'stripe',
                    shippingMethodId: shippingMethodId || '',
                    shippingLabel: payload.shipping?.label?.slice(0, 500) || '',
                    shippingPrice: String(totals.shipping),
                    pickupCarrier: pickupPoint?.carrier || '',
                    pickupPointId: pickupPoint?.id || '',
                    pickupPointCode: pickupPoint?.code || '',
                    pickupPointName: pickupPoint?.name?.slice(0, 500) || '',
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
            amount: totals.total,
            currency: totals.currency,
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

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
