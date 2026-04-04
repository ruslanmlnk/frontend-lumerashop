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
        discounts?: {
            couponCode?: unknown;
        } | null;
        loyalty?: {
            bonusUnitsSpent?: unknown;
            bonusUnitsEarned?: unknown;
        } | null;
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

export default async function Orders({ showBonusProgram = true }: { showBonusProgram?: boolean }) {
    const config = getPayloadAuthConfig();
    const cookieStore = await cookies();
    const token = config ? cookieStore.get(config.cookieName)?.value : '';

    if (!config || !token) {
        return (
            <div className="space-y-6">
                <div className="border-t-4 border-blue-400 bg-blue-50 p-4 text-[15px] text-blue-700">
                    Pro zobrazení objednávek je potřeba být přihlášený.
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

        if (!response.ok || docs.length === 0) {
            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-t-4 border-blue-400 bg-blue-50 p-4">
                        <span className="text-[15px] text-blue-700">Zatím nebyly vytvořeny žádné objednávky.</span>
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
                {docs.map((order, index) => {
                    const orderId = typeof order.orderId === 'string' ? order.orderId : `OBJ-${index + 1}`;
                    const paymentStatus =
                        typeof order.paymentStatus === 'string' ? order.paymentStatus : 'pending';
                    const total =
                        typeof order.total === 'number' || typeof order.total === 'string'
                            ? Number(order.total)
                            : 0;
                    const currency = typeof order.currency === 'string' ? order.currency : 'CZK';
                    const couponCode =
                        order.discounts && typeof order.discounts.couponCode === 'string'
                            ? order.discounts.couponCode
                            : '';
                    const bonusEarned =
                        order.loyalty &&
                        (typeof order.loyalty.bonusUnitsEarned === 'number' ||
                            typeof order.loyalty.bonusUnitsEarned === 'string')
                            ? Number(order.loyalty.bonusUnitsEarned)
                            : 0;
                    const bonusSpent =
                        order.loyalty &&
                        (typeof order.loyalty.bonusUnitsSpent === 'number' ||
                            typeof order.loyalty.bonusUnitsSpent === 'string')
                            ? Number(order.loyalty.bonusUnitsSpent)
                            : 0;
                    const createdAt =
                        typeof order.createdAt === 'string' ? new Date(order.createdAt) : null;

                    return (
                        <article key={orderId} className="rounded-[18px] border border-[#111111]/10 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-[18px] font-semibold text-[#111111]">{orderId}</h3>
                                    <p className="text-[14px] text-[#6b6257]">{getStatusLabel(paymentStatus)}</p>
                                    {createdAt ? (
                                        <p className="text-[13px] text-[#8a8275]">
                                            {createdAt.toLocaleDateString('cs-CZ')}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="text-right">
                                    <p className="text-[18px] font-semibold text-[#111111]">
                                        {formatMoney(Number.isFinite(total) ? total : 0, currency)}
                                    </p>
                                    {couponCode ? (
                                        <p className="text-[13px] text-[#6b6257]">Kupón: {couponCode}</p>
                                    ) : null}
                                    {showBonusProgram && (bonusSpent > 0 || bonusEarned > 0) ? (
                                        <p className="text-[13px] text-[#6b6257]">
                                            {bonusSpent > 0 ? `-${bonusSpent} bonusů` : ''}
                                            {bonusSpent > 0 && bonusEarned > 0 ? ' | ' : ''}
                                            {bonusEarned > 0 ? `+${bonusEarned} bonusů` : ''}
                                        </p>
                                    ) : null}
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
                Nepodařilo se načíst objednávky. Zkus to prosím znovu o něco později.
            </div>
        );
    }
}
