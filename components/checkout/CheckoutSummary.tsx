import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Info, Shield } from 'lucide-react';
import { getCheckoutTheme } from '@/components/checkout/theme';
import type { CheckoutFormState, CheckoutVariant } from '@/components/checkout/types';
import { formatPickupPointAddress, formatShippingPrice, type ShippingMethod } from '@/lib/checkout-shipping';
import { getRenderableAssetPath } from '@/lib/local-assets';
import type { CartItem } from '@/context/CartContext';

type CheckoutSummaryProps = {
    variant: CheckoutVariant;
    cartItems: CartItem[];
    itemCount: number;
    itemLabel: string;
    totalPrice: number;
    vatAmount: number;
    shippingPrice: number;
    orderTotal: number;
    selectedShippingMethod: ShippingMethod;
    formData: CheckoutFormState;
    paymentLabel: string;
    formatPrice: (value: number) => string;
};

export default function CheckoutSummary({
    variant,
    cartItems,
    itemCount,
    itemLabel,
    totalPrice,
    vatAmount,
    shippingPrice,
    orderTotal,
    selectedShippingMethod,
    formData,
    paymentLabel,
    formatPrice,
}: CheckoutSummaryProps) {
    const theme = getCheckoutTheme(variant);

    return (
        <aside className={theme.summary}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                    <p className={theme.eyebrow}>Přehled objednávky</p>
                    <h2 className={theme.summaryTitle}>Košík a platba</h2>
                </div>
                <div className={theme.pill}>
                    {itemCount} {itemLabel}
                </div>
            </div>

            <div className={theme.summaryList}>
                {cartItems.map((item) => {
                    const itemImage = getRenderableAssetPath(item.image);
                    const itemMeta = [item.sku ? `Ref. ${item.sku}` : null, item.variant]
                        .filter(Boolean)
                        .join(' · ');

                    return (
                        <article key={item.id} className={theme.summaryItem}>
                            <div className={theme.summaryThumb}>
                                <Image src={itemImage} alt={item.name} fill className="object-contain p-2" />
                                <span className={theme.summaryCount}>{item.quantity}</span>
                            </div>

                            <div className="min-w-0">
                                <p className={theme.summaryName}>{item.name}</p>
                                {itemMeta && <p className={theme.summaryMeta}>{itemMeta}</p>}
                            </div>

                            <p className={theme.summaryPrice}>{formatPrice(item.price * item.quantity)}</p>
                        </article>
                    );
                })}
            </div>

            <div className={theme.summaryRows}>
                <div className={theme.summaryRow}>
                    <div className={theme.summaryRowLabel}>
                        <span>Mezisoučet</span>
                    </div>
                    <span className={theme.summaryPrice}>{formatPrice(totalPrice)}</span>
                </div>

                <div className={theme.summaryRow}>
                    <div className={theme.summaryRowLabel}>
                        <span>DPH (21 %)</span>
                    </div>
                    <span className={theme.summaryPrice}>{formatPrice(vatAmount)}</span>
                </div>

                <div className={theme.summaryRow}>
                    <div className={theme.summaryRowLabel}>
                        <span>Doprava</span>
                        <small className={theme.summaryRowMeta}>{selectedShippingMethod.label}</small>
                        {formData.pickupPoint && (
                            <small className={theme.summaryRowMeta}>
                                {formData.pickupPoint.name}
                                {formatPickupPointAddress(formData.pickupPoint)
                                    ? `, ${formatPickupPointAddress(formData.pickupPoint)}`
                                    : ''}
                            </small>
                        )}
                    </div>
                    <span className={theme.summaryPrice}>{formatShippingPrice(shippingPrice)}</span>
                </div>
            </div>

            <div className={theme.summaryTotal}>
                <span>Celkem</span>
                <strong className={theme.summaryTotalValue}>{formatPrice(orderTotal)}</strong>
            </div>

            <div className={theme.note}>
                <Info size={16} className="mt-[2px] shrink-0 text-[#b98743]" />
                <p>Objednávku dokončíte přes zabezpečenou platební bránu. Všechny ceny jsou včetně DPH.</p>
            </div>

            <div className="grid gap-2">
                <div className={theme.summarySelected}>
                    <Shield size={14} />
                    <span>{paymentLabel}</span>
                </div>

                <Link href="/cart" className={theme.secondary}>
                    <ArrowLeft size={14} />
                    Zpět do košíku
                </Link>
            </div>
        </aside>
    );
}
