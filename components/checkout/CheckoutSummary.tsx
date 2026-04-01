import Link from 'next/link';
import { ArrowLeft, Info, Shield } from 'lucide-react';

import { getCheckoutTheme } from '@/components/checkout/theme';
import type { CheckoutFormState, CheckoutVariant } from '@/components/checkout/types';
import { formatPickupPointAddress, formatShippingPrice, type ShippingMethod } from '@/lib/checkout-shipping';

type CheckoutSummaryProps = {
    variant: CheckoutVariant;
    subtotalPrice: number;
    couponDiscountAmount: number;
    firstPurchaseDiscountAmount: number;
    bonusDiscountAmount: number;
    discountedSubtotal: number;
    vatAmount: number;
    shippingPrice: number;
    orderTotal: number;
    selectedShippingMethod?: ShippingMethod;
    formData: CheckoutFormState;
    paymentLabel: string;
    isCashOnDelivery?: boolean;
    formatPrice: (value: number) => string;
    loyaltySummary?: {
        balance: number;
        spent: number;
        earned: number;
    };
};

export default function CheckoutSummary({
    variant,
    subtotalPrice,
    couponDiscountAmount,
    firstPurchaseDiscountAmount,
    bonusDiscountAmount,
    discountedSubtotal,
    vatAmount,
    shippingPrice,
    orderTotal,
    selectedShippingMethod,
    formData,
    paymentLabel,
    isCashOnDelivery = false,
    formatPrice,
    loyaltySummary,
}: CheckoutSummaryProps) {
    const theme = getCheckoutTheme(variant);
    const hasAnyDiscount = couponDiscountAmount > 0 || firstPurchaseDiscountAmount > 0 || bonusDiscountAmount > 0;

    return (
        <aside className={theme.summary}>
            <div className={theme.summaryRows}>
                <div className={theme.summaryRow}>
                    <div className={theme.summaryRowLabel}>
                        <span>Mezisoučet</span>
                    </div>
                    <span className={theme.summaryPrice}>{formatPrice(subtotalPrice)}</span>
                </div>

                {couponDiscountAmount > 0 ? (
                    <div className={theme.summaryRow}>
                        <div className={theme.summaryRowLabel}>
                            <span>Kupón</span>
                        </div>
                        <span className={theme.summaryPrice}>- {formatPrice(couponDiscountAmount)}</span>
                    </div>
                ) : null}

                {firstPurchaseDiscountAmount > 0 ? (
                    <div className={theme.summaryRow}>
                        <div className={theme.summaryRowLabel}>
                            <span>Sleva po registraci na první nákup</span>
                        </div>
                        <span className={theme.summaryPrice}>- {formatPrice(firstPurchaseDiscountAmount)}</span>
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

                {hasAnyDiscount ? (
                    <div className={theme.summaryRow}>
                        <div className={theme.summaryRowLabel}>
                            <span>Po slevách</span>
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
                        <small className={theme.summaryRowMeta}>
                            {selectedShippingMethod?.label || 'Zatím není vybraná'}
                        </small>
                        {selectedShippingMethod && formData.pickupPoint ? (
                            <small className={theme.summaryRowMeta}>
                                {formData.pickupPoint.name}
                                {formatPickupPointAddress(formData.pickupPoint)
                                    ? `, ${formatPickupPointAddress(formData.pickupPoint)}`
                                    : ''}
                            </small>
                        ) : null}
                    </div>
                    <span className={theme.summaryPrice}>
                        {selectedShippingMethod ? formatShippingPrice(shippingPrice) : '-'}
                    </span>
                </div>
            </div>

            <div className={theme.summaryTotal}>
                <span>Celkem</span>
                <strong className={theme.summaryTotalValue}>{formatPrice(orderTotal)}</strong>
            </div>

            <div className={theme.note}>
                <Info size={16} className="mt-[2px] shrink-0 text-[#b98743]" />
                <p>
                    {isCashOnDelivery
                        ? 'Objednávku odešlete bez online platby. Částku uhradíte při převzetí, všechny ceny jsou včetně DPH.'
                        : 'Objednávku dokončíte přes zabezpečenou platební bránu. Všechny ceny jsou včetně DPH.'}
                </p>
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
                            Bonusy: {loyaltySummary.balance} na účtu
                            {loyaltySummary.earned > 0 ? `, +${loyaltySummary.earned} po objednávce` : ''}
                        </span>
                    </div>
                ) : null}

                <Link href="/shop" className={theme.secondary}>
                    <ArrowLeft size={14} />
                    Pokračovat v nákupu
                </Link>
            </div>
        </aside>
    );
}
