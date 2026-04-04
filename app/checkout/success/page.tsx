/* eslint-disable @next/next/no-html-link-for-pages */

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClearCartOnSuccess from '@/components/checkout/ClearCartOnSuccess';
import { fetchPaymentOrder, type PaymentOrderStatus } from '@/lib/payments/internal-orders';

const getProviderLabel = (provider?: string) => {
    if (provider === 'cash-on-delivery') {
        return 'Dobírka / platba při převzetí';
    }

    if (provider === 'global-payments') {
        return 'Global Payments';
    }

    if (provider === 'stripe') {
        return 'Stripe';
    }

    return provider || '';
};

const getPaymentStatusLabel = (status?: PaymentOrderStatus, provider?: string) => {
    if (provider === 'cash-on-delivery' && status !== 'paid') {
        return 'Platba při převzetí';
    }

    if (status === 'paid') {
        return 'Zaplaceno';
    }

    if (status === 'failed') {
        return 'Platba selhala';
    }

    if (status === 'canceled') {
        return 'Zrušeno';
    }

    return 'Čeká na potvrzení';
};

export default async function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ provider?: string; orderId?: string; session_id?: string }>;
}) {
    const params = await searchParams;
    const order = params.orderId ? await fetchPaymentOrder(params.orderId).catch(() => null) : null;
    const provider = order?.provider || params.provider;
    const providerLabel = getProviderLabel(provider);
    const paymentStatus = order?.paymentStatus || 'pending';
    const displayOrderId = order?.orderId || params.orderId || '';
    const title =
        provider === 'cash-on-delivery'
            ? 'Objednávku jsme přijali'
            : paymentStatus === 'paid'
              ? 'Platba proběhla úspěšně'
              : 'Objednávku jsme přijali';
    const description =
        provider === 'cash-on-delivery'
            ? 'Děkujeme za objednávku. Jde o dobírku, takže zaplatíte až při převzetí zásilky.'
            : paymentStatus === 'paid'
              ? 'Děkujeme za objednávku. Platba byla přijata a objednávku jsme zaevidovali.'
              : 'Děkujeme za objednávku. Platbu ještě potvrzujeme.';

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Header />
            <ClearCartOnSuccess
                paymentStatus={paymentStatus}
                couponCode={order?.couponCode}
                userId={order?.userId}
            />

            <main className="flex flex-1 items-start pb-20">
                <div className="mx-auto w-full max-w-[820px] px-4 lg:px-0">
                    <div className="border border-[#111111]/10 bg-white p-8 md:p-12">
                        <h1
                            className="text-[40px] leading-[1.05] text-[#111111] md:text-[52px]"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            {title}
                        </h1>

                        <p className="mt-4 text-[16px] leading-[1.6] text-[#444444]">{description}</p>

                        {displayOrderId ? (
                            <p className="mt-2 text-[14px] text-[#666666]">
                                {'Číslo objednávky:'}{' '}
                                <span className="font-semibold text-[#111111]">{displayOrderId}</span>
                            </p>
                        ) : null}

                        {providerLabel ? (
                            <p className="mt-1 text-[14px] text-[#666666]">
                                {'Platební brána:'}{' '}
                                <span className="font-semibold text-[#111111]">{providerLabel}</span>
                            </p>
                        ) : null}

                        <p className="mt-1 text-[14px] text-[#666666]">
                            {'Stav platby:'}{' '}
                            <span className="font-semibold text-[#111111]">
                                {getPaymentStatusLabel(paymentStatus, provider)}
                            </span>
                        </p>

                        {order?.total ? (
                            <p className="mt-1 text-[14px] text-[#666666]">
                                Celkem:{' '}
                                <span className="font-semibold text-[#111111]">
                                    {new Intl.NumberFormat('cs-CZ', {
                                        style: 'currency',
                                        currency: order.currency || 'CZK',
                                        maximumFractionDigits: 0,
                                    }).format(order.total)}
                                </span>
                            </p>
                        ) : null}

                        <div className="relative z-[1] mt-8 flex flex-wrap gap-4">
                            <a
                                href="/shop"
                                className="inline-flex h-[46px] items-center justify-center border border-black px-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-black hover:bg-black hover:text-white"
                            >
                                {'Pokračovat v nákupu'}
                            </a>

                            <a
                                href="/"
                                className="inline-flex h-[46px] items-center justify-center border border-[#111111]/20 px-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-black"
                            >
                                {'Zpět na úvod'}
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
