import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
    fetchPaymentOrder,
    type PaymentOrderStatus,
    updatePaymentOrder,
} from '@/lib/payments/internal-orders';

const getProviderLabel = (provider?: string) => {
    if (provider === 'global-payments') {
        return 'Global Payments';
    }

    if (provider === 'stripe') {
        return 'Stripe';
    }

    return provider || '';
};

const getPaymentStatusLabel = (status?: PaymentOrderStatus) => {
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

export default async function CheckoutCancelPage({
    searchParams,
}: {
    searchParams: Promise<{ provider?: string; orderId?: string; code?: string; reason?: string }>;
}) {
    const params = await searchParams;
    const order =
        params.orderId && params.provider === 'stripe'
            ? await updatePaymentOrder(params.orderId, {
                  paymentStatus: 'canceled',
                  lastEvent: 'stripe.checkout.cancel_page',
              }).catch(() => null)
            : params.orderId
              ? await fetchPaymentOrder(params.orderId).catch(() => null)
              : null;
    const providerLabel = getProviderLabel(order?.provider || params.provider);
    const paymentStatus = order?.paymentStatus || 'canceled';
    const displayOrderId = order?.orderId || params.orderId || '';

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Header />

            <main className="flex flex-1 items-start pt-[180px] pb-20 md:pt-[220px]">
                <div className="mx-auto w-full max-w-[820px] px-4 lg:px-0">
                    <div className="border border-[#111111]/10 bg-white p-8 md:p-12">
                        <h1
                            className="text-[40px] leading-[1.05] text-[#111111] md:text-[52px]"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            {'Platba nebyla dokončena'}
                        </h1>

                        <p className="mt-4 text-[16px] leading-[1.6] text-[#444444]">
                            {'Transakce byla zrušena nebo se nepodařila dokončit. Můžete to zkusit znovu.'}
                        </p>

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
                                {getPaymentStatusLabel(paymentStatus)}
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

                        {params.code || params.reason ? (
                            <p className="mt-1 text-[14px] text-[#666666]">
                                {'Kód:'}{' '}
                                <span className="font-semibold text-[#111111]">
                                    {params.code || params.reason}
                                </span>
                            </p>
                        ) : null}

                        <div className="relative z-[1] mt-8 flex flex-wrap gap-4">
                            <a
                                href="/checkout"
                                className="inline-flex h-[46px] items-center justify-center border border-black px-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-black hover:bg-black hover:text-white"
                            >
                                Zkusit znovu
                            </a>

                            <a
                                href="/cart"
                                className="inline-flex h-[46px] items-center justify-center border border-[#111111]/20 px-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-black"
                            >
                                {'Zpět do košíku'}
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
