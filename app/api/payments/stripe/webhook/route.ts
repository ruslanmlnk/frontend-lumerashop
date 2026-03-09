import { NextRequest, NextResponse } from 'next/server';
import { updatePaymentOrder } from '@/lib/payments/internal-orders';
import { getStripeClient } from '@/lib/payments/stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const stripe = getStripeClient();
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

    if (!webhookSecret) {
        return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
    }

    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    try {
        const body = await request.text();
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const orderId = session.metadata?.orderId || session.client_reference_id || '';

            if (orderId) {
                await updatePaymentOrder(orderId, {
                    paymentStatus: 'paid',
                    stripeSessionId: session.id,
                    stripePaymentIntentId:
                        typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
                    lastEvent: event.type,
                    providerResponse: {
                        paymentStatus: session.payment_status,
                        customerEmail: session.customer_email,
                        metadata: session.metadata,
                    },
                });
            }
        }

        if (event.type === 'checkout.session.expired') {
            const session = event.data.object;
            const orderId = session.metadata?.orderId || session.client_reference_id || '';

            if (orderId) {
                await updatePaymentOrder(orderId, {
                    paymentStatus: 'canceled',
                    stripeSessionId: session.id,
                    stripePaymentIntentId:
                        typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
                    lastEvent: event.type,
                    providerResponse: {
                        paymentStatus: session.payment_status,
                        metadata: session.metadata,
                    },
                });
            }
        }

        if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata?.orderId || '';

            if (orderId) {
                await updatePaymentOrder(orderId, {
                    paymentStatus: 'failed',
                    stripePaymentIntentId: paymentIntent.id,
                    lastEvent: event.type,
                    lastError: paymentIntent.last_payment_error?.message || '',
                    providerResponse: {
                        status: paymentIntent.status,
                        metadata: paymentIntent.metadata,
                    },
                });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid Stripe webhook payload';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
