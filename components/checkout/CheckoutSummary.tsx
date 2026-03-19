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
    subtotalPrice: number;
    couponDiscountAmount: number;
    bonusDiscountAmount: number;
    discountedSubtotal: number;
    vatAmount: number;
    shippingPrice: number;
    orderTotal: number;
    selectedShippingMethod: ShippingMethod;
    formData: CheckoutFormState;
    paymentLabel: string;
    formatPrice: (value: number) => string;
    loyaltySummary?: {
        balance: number;
        spent: number;
        earned: number;
    };
};

export default function CheckoutSummary({
    variant,
    cartItems,
    itemCount,
    itemLabel,
    subtotalPrice,
    couponDiscountAmount,
    bonusDiscountAmount,
    discountedSubtotal,
    vatAmount,
    shippingPrice,
    orderTotal,
    selectedShippingMethod,
    formData,
    paymentLabel,
    formatPrice,
    loyaltySummary,
}: CheckoutSummaryProps) {
    const theme = getCheckoutTheme(variant);

    return (
        <aside className={theme.summary}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                    <p className={theme.eyebrow}>Prehled objednavky</p>
                    <h2 className={theme.summaryTitle}>Kosik a platba</h2>
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
                                {itemMeta ? <p className={theme.summaryMeta}>{itemMeta}</p> : null}
                            </div>

                            <p className={theme.summaryPrice}>{formatPrice(item.price * item.quantity)}</p>
                        </article>
                    );
                })}
            </div>

            <div className={theme.summaryRows}>
                <div className={theme.summaryRow}>
                    <div className={theme.summaryRowLabel}>
                        <span>Mezisoucet</span>
                    </div>
                    <span className={theme.summaryPrice}>{formatPrice(subtotalPrice)}</span>
                </div>

                {couponDiscountAmount > 0 ? (
                    <div className={theme.summaryRow}>
                        <div className={theme.summaryRowLabel}>
                            <span>Kupon</span>
                        </div>
                        <span className={theme.summaryPrice}>- {formatPrice(couponDiscountAmount)}</span>
                    </div>
                ) : null}

                {bonusDiscountAmount > 0 ? (
                    <div className={theme.summaryRow}>
                        <div className={theme.summaryRowLabel}>
                            <span>Bonusy</span>
                            {loyaltySummary?.spent ? (
                                <small className={theme.summaryRowMeta}>{loyaltySummary.spent} jednotek</small>
                            ) : null}
                        </div>
                        <span className={theme.summaryPrice}>- {formatPrice(bonusDiscountAmount)}</span>
                    </div>
                ) : null}

                {couponDiscountAmount > 0 || bonusDiscountAmount > 0 ? (
                    <div className={theme.summaryRow}>
                        <div className={theme.summaryRowLabel}>
                            <span>Po slevach</span>
                        </div>
                        <span className={theme.summaryPrice}>{formatPrice(discountedSubtotal)}</span>
                    </div>
                ) : null}

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
                        {formData.pickupPoint ? (
                            <small className={theme.summaryRowMeta}>
                                {formData.pickupPoint.name}
                                {formatPickupPointAddress(formData.pickupPoint)
                                    ? `, ${formatPickupPointAddress(formData.pickupPoint)}`
                                    : ''}
                            </small>
                        ) : null}
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
                <p>Objednavku dokoncite pres zabezpecenou platebni branu. Vsechny ceny jsou vcetne DPH.</p>
            </div>

            <div className="grid gap-2">
                <div className={theme.summarySelected}>
                    <Shield size={14} />
                    <span>{paymentLabel}</span>
                </div>

                {loyaltySummary ? (
                    <div className={theme.summarySelected}>
                        <Info size={14} />
                        <span>
                            Bonusy: {loyaltySummary.balance} na uctu
                            {loyaltySummary.earned > 0 ? `, +${loyaltySummary.earned} po objednavce` : ''}
                        </span>
                    </div>
                ) : null}

                <Link href="/shop" className={theme.secondary}>
                    <ArrowLeft size={14} />
                    Pokracovat v nakupu
                </Link>
            </div>
        </aside>
    );
}
