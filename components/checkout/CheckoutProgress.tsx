import { Check, type LucideIcon } from 'lucide-react';
import { cn, getCheckoutTheme } from '@/components/checkout/theme';
import type { CheckoutVariant, Step } from '@/components/checkout/types';

type ProgressStep = {
    id: Step;
    title: string;
    icon: LucideIcon;
};

type CheckoutProgressProps = {
    variant: CheckoutVariant;
    progress: number;
    steps: ProgressStep[];
    currentStep: Step;
    completedSteps: Step[];
    onStepSelect: (step: Step) => void;
};

export default function CheckoutProgress({
    variant,
    progress,
    steps,
    currentStep,
    completedSteps,
    onStepSelect,
}: CheckoutProgressProps) {
    const theme = getCheckoutTheme(variant);

    return (
        <section className={theme.progressWrap}>
            <div className={theme.progressBar}>
                <div className={theme.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <div className={theme.progressSteps}>
                {steps.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isComplete = completedSteps.includes(step.id);
                    const Icon = step.icon;

                    return (
                        <button
                            key={step.id}
                            type="button"
                            className={cn(
                                theme.progressStep,
                                isActive || isComplete ? theme.progressStepActive : theme.progressStepIdle,
                            )}
                            onClick={() => onStepSelect(step.id)}
                        >
                            <span
                                className={cn(
                                    theme.progressStepBadge,
                                    isComplete && theme.progressStepDone,
                                )}
                            >
                                {isComplete ? <Check size={12} /> : index + 1}
                            </span>
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                <Icon size={12} />
                                {step.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
