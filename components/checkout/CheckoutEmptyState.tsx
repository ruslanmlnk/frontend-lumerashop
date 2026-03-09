import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { getCheckoutTheme } from '@/components/checkout/theme';
import type { CheckoutVariant } from '@/components/checkout/types';

type CheckoutEmptyStateProps = {
    variant: CheckoutVariant;
};

export default function CheckoutEmptyState({ variant }: CheckoutEmptyStateProps) {
    const theme = getCheckoutTheme(variant);

    return (
        <section className={theme.empty}>
            <div className={theme.emptyIcon}>
                <ShoppingBag size={24} />
            </div>
            <p className={theme.eyebrow}>Pokladna je prázdná</p>
            <h1 className={theme.title}>Nejprve přidejte produkty do košíku.</h1>
            <p className={theme.description}>
                Jakmile budete mít v košíku vybrané položky, tady dokončíte dopravu, fakturaci i platbu.
            </p>
            <div className="mt-6 flex justify-center">
                <Link href="/cart" className={theme.secondary}>
                    <ArrowLeft size={14} />
                    Zpět do košíku
                </Link>
            </div>
        </section>
    );
}
