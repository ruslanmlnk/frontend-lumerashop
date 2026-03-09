import { Check } from 'lucide-react';
import { cn, getCheckoutTheme } from '@/components/checkout/theme';
import type { CheckoutVariant } from '@/components/checkout/types';
import type { ReactNode } from 'react';

type CheckoutSectionCardProps = {
    variant: CheckoutVariant;
    stepNumber: number;
    eyebrow: string;
    title: string;
    active: boolean;
    completed: boolean;
    onOpen: () => void;
    summary?: ReactNode;
    children: ReactNode;
};

export default function CheckoutSectionCard({
    variant,
    stepNumber,
    eyebrow,
    title,
    active,
    completed,
    onOpen,
    summary,
    children,
}: CheckoutSectionCardProps) {
    const theme = getCheckoutTheme(variant);

    return (
        <section className={cn(theme.card, active && theme.cardActive)}>
            <button type="button" className={theme.cardHead} onClick={onOpen}>
                <span className={theme.cardBadge}>
                    {completed ? <Check size={14} /> : stepNumber}
                </span>
                <span className="min-w-0 space-y-1 pt-0.5">
                    <span className={theme.eyebrow}>{eyebrow}</span>
                    <span className={theme.cardTitle}>{title}</span>
                </span>
            </button>

            {active ? <div className={theme.cardBody}>{children}</div> : summary ? <div className={theme.cardSummary}>{summary}</div> : null}
        </section>
    );
}
