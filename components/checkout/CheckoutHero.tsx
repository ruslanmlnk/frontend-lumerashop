import { Shield, ShoppingBag, Truck, type LucideIcon } from 'lucide-react';
import { cn, getCheckoutTheme } from '@/components/checkout/theme';
import type { CheckoutVariant } from '@/components/checkout/types';

type CheckoutHeroProps = {
    variant: CheckoutVariant;
    title: string;
    description: string;
    itemCount: number;
    itemLabel: string;
    shippingLabel?: string;
};

type HeroPill = {
    icon: LucideIcon;
    label: string;
};

export default function CheckoutHero({
    variant,
    title,
    description,
    itemCount,
    itemLabel,
    shippingLabel,
}: CheckoutHeroProps) {
    const theme = getCheckoutTheme(variant);

    const pills: HeroPill[] = [
        { icon: ShoppingBag, label: `${itemCount} ${itemLabel}` },
        { icon: Truck, label: shippingLabel || 'Doprava neni vybrana' },
        { icon: Shield, label: 'Bezpečná platba' },
    ];

    return (
        <section className={theme.top}>
            <div>
                <p className={theme.eyebrow}>Dokončení objednávky</p>
                <h1 className={theme.title}>{title}</h1>
                <p className={theme.description}>{description}</p>
            </div>

            <div className={theme.metaWrap}>
                {pills.map(({ icon: Icon, label }) => (
                    <div key={label} className={theme.pill}>
                        <Icon size={12} />
                        <span className={cn(variant === 'minimal' && 'sr-only')}>{label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
