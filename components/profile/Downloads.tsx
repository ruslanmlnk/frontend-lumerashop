import Link from 'next/link';
import { cookies } from 'next/headers';

import { getPayloadAuthConfig, parseJsonSafely } from '@/lib/payload-auth';

type OrdersResponse = {
    docs?: Array<{
        id?: unknown;
        orderId?: unknown;
        paymentStatus?: unknown;
        total?: unknown;
        currency?: unknown;
        createdAt?: unknown;
        invoiceGeneratedAt?: unknown;
        invoiceFileName?: unknown;
    }>;
};

const formatMoney = (value: number, currency: string) =>
    new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);

const getStatusLabel = (value: string) => {
    switch (value) {
        case 'paid':
            return 'Zaplaceno';
        case 'failed':
            return 'Platba selhala';
        case 'canceled':
            return 'Zrušeno';
        default:
            return 'Čeká na potvrzení';
    }
};

export default async function Downloads() {
    const config = getPayloadAuthConfig();
    const cookieStore = await cookies();
    const token = config ? cookieStore.get(config.cookieName)?.value : '';

    if (!config || !token) {
        return (
            <div className="space-y-6">
                <div className="border-t-4 border-blue-400 bg-blue-50 p-4 text-[15px] text-blue-700">
                    Pro zobrazení faktur je potřeba být přihlášený.
                </div>
            </div>
        );
    }

    try {
        const response = await fetch(`${config.baseUrl}/api/orders?limit=50&sort=-createdAt`, {
            headers: {
                Authorization: `JWT ${token}`,
            },
            cache: 'no-store',
        });

        const payload = await parseJsonSafely<OrdersResponse>(response);
        const docs = Array.isArray(payload?.docs) ? payload.docs : [];
        const invoiceDocs = docs.filter((order) => {
            const invoiceGeneratedAt =
                typeof order.invoiceGeneratedAt === 'string' ? order.invoiceGeneratedAt.trim() : '';
            const invoiceFileName =
                typeof order.invoiceFileName === 'string' ? order.invoiceFileName.trim() : '';

            return invoiceGeneratedAt.length > 0 && invoiceFileName.length > 0;
        });

        if (!response.ok) {
            return (
                <div className="rounded-[18px] border border-[#b42318]/10 bg-[#fff4f2] p-5 text-[15px] text-[#b42318]">
                    Nepodařilo se načíst faktury. Zkus to prosím znovu o něco později.
                </div>
            );
        }

        if (invoiceDocs.length === 0) {
            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-t-4 border-blue-400 bg-blue-50 p-4">
                        <span className="text-[15px] text-blue-700">
                            Faktury se tu objeví po jejich vystavení v administraci.
                        </span>
                        <Link
                            href="/shop"
                            className="rounded-sm bg-[#E1B12C] px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#c79a24]"
                        >
                            ZPĚT DO OBCHODU
                        </Link>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {invoiceDocs.map((order, index) => {
                    const documentId =
                        typeof order.id === 'string' || typeof order.id === 'number'
                            ? String(order.id)
                            : '';
                    const orderId = typeof order.orderId === 'string' ? order.orderId : `OBJ-${index + 1}`;
                    const paymentStatus =
                        typeof order.paymentStatus === 'string' ? order.paymentStatus : 'pending';
                    const total =
                        typeof order.total === 'number' || typeof order.total === 'string'
                            ? Number(order.total)
                            : 0;
                    const currency = typeof order.currency === 'string' ? order.currency : 'CZK';
                    const createdAt =
                        typeof order.createdAt === 'string' ? new Date(order.createdAt) : null;
                    const invoiceGeneratedAt =
                        typeof order.invoiceGeneratedAt === 'string'
                            ? new Date(order.invoiceGeneratedAt)
                            : null;

                    if (!documentId) {
                        return null;
                    }

                    return (
                        <article
                            key={documentId}
                            className="rounded-[18px] border border-[#111111]/10 bg-white p-5 shadow-sm"
                        >
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-1">
                                    <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#8a8275]">
                                        Faktura PDF
                                    </p>
                                    <h3 className="text-[18px] font-semibold text-[#111111]">{orderId}</h3>
                                    <p className="text-[14px] text-[#6b6257]">{getStatusLabel(paymentStatus)}</p>
                                    {invoiceGeneratedAt ? (
                                        <p className="text-[13px] text-[#8a8275]">
                                            Faktura vystavena {invoiceGeneratedAt.toLocaleDateString('cs-CZ')}
                                        </p>
                                    ) : createdAt ? (
                                        <p className="text-[13px] text-[#8a8275]">
                                            Objednávka z {createdAt.toLocaleDateString('cs-CZ')}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="flex flex-col items-start gap-3 md:items-end">
                                    <p className="text-[18px] font-semibold text-[#111111]">
                                        {formatMoney(Number.isFinite(total) ? total : 0, currency)}
                                    </p>
                                    <a
                                        href={`/api/account/orders/${encodeURIComponent(documentId)}/invoice`}
                                        className="inline-flex items-center justify-center rounded-sm bg-[#111111] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2c2c2c]"
                                        download
                                    >
                                        Stáhnout fakturu
                                    </a>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        );
    } catch {
        return (
            <div className="rounded-[18px] border border-[#b42318]/10 bg-[#fff4f2] p-5 text-[15px] text-[#b42318]">
                Nepodařilo se načíst faktury. Zkus to prosím znovu o něco později.
            </div>
        );
    }
}
