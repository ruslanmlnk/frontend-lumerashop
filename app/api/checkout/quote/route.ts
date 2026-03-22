import { NextRequest, NextResponse } from 'next/server';

import { buildCheckoutQuote } from '@/lib/payments/checkout-benefits';
import type { CheckoutItemInput } from '@/lib/payments/checkout-types';

type QuoteBody = {
    items?: CheckoutItemInput[];
    shippingMethodId?: unknown;
    promoCode?: unknown;
    useBonusBalance?: unknown;
};

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    let body: QuoteBody;

    try {
        body = (await request.json()) as QuoteBody;
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    try {
        const quote = await buildCheckoutQuote({
            items: Array.isArray(body.items) ? body.items : [],
            shippingMethodId: typeof body.shippingMethodId === 'string' ? body.shippingMethodId : undefined,
            couponCode: typeof body.promoCode === 'string' ? body.promoCode : undefined,
            useBonusBalance: body.useBonusBalance === true,
        });

        return NextResponse.json(quote, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not calculate checkout quote.';
        const status = /sign in|coupon|košíku|košík|dostupný|vyprodan|skladem/i.test(message) ? 400 : 500;

        return NextResponse.json({ error: message }, { status });
    }
}
