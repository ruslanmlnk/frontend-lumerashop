import type { CheckoutVariant } from '@/components/checkout/types';

export const cn = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

export const getCheckoutTheme = (variant: CheckoutVariant) => {
    const minimal = variant === 'minimal';

    return {
        shell: minimal
            ? 'bg-white'
            : 'bg-[radial-gradient(circle_at_top,rgba(231,206,174,0.14),transparent_28%),linear-gradient(180deg,#fbf8f4_0%,#f6f2ec_100%)]',
        top: 'flex flex-wrap items-end justify-between gap-4',
        eyebrow: 'block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a775f]',
        title: cn(
            'mt-1 font-serif leading-none text-[#111]',
            minimal ? 'text-[28px] md:text-[34px]' : 'text-[32px] md:text-[44px]',
        ),
        description: cn(
            'mt-3 max-w-[52ch] text-[13px] text-[#6b6257]',
            minimal ? 'leading-6' : 'leading-7',
        ),
        metaWrap: minimal ? 'hidden' : 'flex flex-wrap justify-end gap-2',
        pill: 'inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/90 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5f584e]',
        progressWrap: cn(
            'rounded-[12px] border p-2.5',
            minimal
                ? 'border-[#e8e1d7] bg-white'
                : 'border-black/8 bg-white/80 shadow-[0_10px_24px_rgba(30,22,14,0.03)]',
        ),
        progressBar: 'h-[5px] overflow-hidden rounded-full bg-black/8',
        progressFill: minimal
            ? 'h-full rounded-full bg-[#111]'
            : 'h-full rounded-full bg-gradient-to-r from-[#111] to-[#b98743]',
        progressSteps: 'mt-2 grid grid-cols-2 gap-2',
        progressStep: 'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full border px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] transition',
        progressStepIdle: 'border-black/8 bg-white text-[#6b6257] hover:border-[#d7c29f] hover:text-[#111]',
        progressStepActive: minimal
            ? 'border-[#d7c29f] bg-[#f7f4ef] text-[#111]'
            : 'border-[#d7c29f] bg-[#f7f4ef] text-[#111]',
        progressStepBadge: 'inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#111] text-[10px] text-white',
        progressStepDone: 'bg-[#1f8f52]',
        stage: cn(
            'mb-4 flex flex-wrap items-center justify-between gap-4',
            minimal ? 'pb-1' : 'rounded-[16px] border border-black/8 bg-white/80 p-4 shadow-[0_10px_24px_rgba(30,22,14,0.03)]',
        ),
        stageTitle: cn('mt-1 font-serif leading-tight text-[#111]', minimal ? 'text-[20px] md:text-[22px]' : 'text-[24px] md:text-[26px]'),
        cardTitle: cn('font-serif leading-tight text-[#111]', minimal ? 'text-[18px]' : 'text-[18px] md:text-[20px]'),
        summaryTitle: cn('mt-1 font-serif leading-tight text-[#111]', minimal ? 'text-[18px] md:text-[19px]' : 'text-[20px] md:text-[22px]'),
        stageBack: 'inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111] transition hover:border-[#d7c29f] hover:text-[#b98743]',
        grid: 'grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start',
        main: 'space-y-3.5',
        card: cn(
            'overflow-hidden rounded-[12px] border bg-white',
            minimal ? 'border-[#e8e1d7]' : 'border-black/8 shadow-[0_10px_24px_rgba(30,22,14,0.03)]',
        ),
        cardActive: minimal ? 'border-[#d7c29f]' : 'border-[#d7c29f] shadow-[0_14px_32px_rgba(30,22,14,0.04)]',
        cardHead: 'flex w-full items-start gap-3 px-5 py-3.5 text-left',
        cardBadge: 'inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gradient-to-br from-[#111] to-[#2d241b] text-[12px] font-semibold text-white',
        cardBody: 'grid gap-4 px-5 pb-5 pt-0.5',
        cardSummary: 'px-5 pb-4 pl-[62px] text-[13px] leading-5 text-[#5f584e]',
        field: 'grid gap-1.5',
        inputGrid: 'grid gap-3.5 md:grid-cols-2',
        inlineGrid: 'grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]',
        toggleGrid: 'grid gap-3 md:grid-cols-2',
        label: 'text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6d655a]',
        input: 'h-[42px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[14px] text-[#111] outline-none transition placeholder:text-[#a39788] focus:border-[#d7c29f] focus:ring-4 focus:ring-[#b98743]/10 disabled:cursor-not-allowed disabled:bg-[#f6f3ee] disabled:text-[#7a7164]',
        textarea: 'min-h-[110px] w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 text-[14px] text-[#111] outline-none transition placeholder:text-[#a39788] focus:border-[#d7c29f] focus:ring-4 focus:ring-[#b98743]/10',
        help: 'text-[12px] leading-5 text-[#7a7164]',
        check: 'flex items-start gap-2.5 text-[13px] leading-5 text-[#4e473e]',
        checkCard: cn(
            'rounded-[12px] border p-3.5',
            minimal ? 'border-[#ece5dc] bg-white' : 'border-black/8 bg-white/90',
        ),
        surface: cn(
            'grid gap-3.5 rounded-[12px] border p-4',
            minimal ? 'border-[#ece5dc] bg-[#fcfbf9]' : 'border-black/8 bg-[#faf7f1]',
        ),
        option: 'flex items-start gap-3 rounded-[12px] border p-3.5 text-left transition',
        optionIdle: 'border-black/8 bg-white hover:border-[#d7c29f]',
        optionSelected: 'border-[#d7c29f] bg-[#faf7f1]',
        optionControl: 'mt-[2px] inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-black/20',
        optionDot: 'h-2 w-2 rounded-full bg-[#b98743]',
        optionCopy: 'grid min-w-0 gap-1',
        optionTitle: 'text-[13px] font-medium leading-5 text-[#111]',
        optionMeta: 'text-[12px] leading-5 text-[#7a7164]',
        optionPrice: 'ml-auto whitespace-nowrap pl-3 text-[13px] font-semibold text-[#111]',
        primary: cn(
            'inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition',
            minimal
                ? 'bg-[#111] hover:bg-[#2a241d]'
                : 'bg-gradient-to-br from-[#111] to-[#2d241b] hover:translate-y-[-1px] hover:from-[#b98743] hover:to-[#8c6739] hover:shadow-[0_12px_22px_rgba(17,17,17,0.1)]',
        ),
        secondary: 'inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111] transition hover:border-[#d7c29f] hover:text-[#b98743]',
        summary: cn(
            'grid gap-4 rounded-[12px] border p-[18px] xl:sticky xl:top-[126px]',
            minimal
                ? 'border-[#e8e1d7] bg-white'
                : 'border-black/8 bg-white/85 shadow-[0_10px_24px_rgba(30,22,14,0.03)]',
        ),
        summaryList: 'grid max-h-[360px] gap-3 overflow-y-auto',
        summaryItem: 'grid grid-cols-[52px_minmax(0,1fr)_auto] items-start gap-3 rounded-[12px] border border-black/8 bg-white p-2.5 max-md:grid-cols-[52px_minmax(0,1fr)]',
        summaryThumb: 'relative h-[52px] w-[52px] overflow-hidden rounded-[12px] bg-[#f7f3ee]',
        summaryCount: 'absolute right-[5px] top-[5px] inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#111] px-1.5 text-[10px] font-semibold text-white',
        summaryName: 'text-[13px] font-medium leading-5 text-[#111]',
        summaryMeta: 'mt-0.5 text-[11px] leading-4 text-[#7a7164]',
        summaryPrice: 'whitespace-nowrap text-[13px] font-semibold text-[#111] max-md:col-start-2',
        summaryRows: 'grid gap-3 pt-1',
        summaryRow: 'flex items-start justify-between gap-4 text-[13px] text-[#4e473e]',
        summaryRowLabel: 'grid min-w-0 gap-0.5',
        summaryRowMeta: 'text-[11px] leading-4 text-[#7a7164]',
        summaryTotal: cn(
            'flex items-center justify-between gap-4 rounded-[12px] border p-4 text-[13px] text-[#4e473e] max-md:flex-col max-md:items-start',
            minimal ? 'border-[#e8e1d7] bg-[#faf7f1]' : 'border-black/8 bg-[#f8f3ec]',
        ),
        summaryTotalValue: 'text-[22px] font-semibold leading-none text-[#111]',
        note: cn(
            'flex gap-2.5 rounded-[12px] border p-3.5 text-[12px] leading-5 text-[#6b6257]',
            minimal ? 'border-[#ece5dc] bg-[#faf9f7]' : 'border-black/8 bg-white/90',
        ),
        summarySelected: 'inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-black/8 bg-[#faf9f7] px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5f584e]',
        empty: 'rounded-[12px] border border-[#e8e1d7] bg-white px-6 py-10 text-center',
        emptyIcon: 'mx-auto mb-3 inline-flex h-10 w-14 items-center justify-center rounded-[12px] bg-gradient-to-b from-[#111] to-[#2b241b] text-white shadow-[0_10px_22px_rgba(17,17,17,0.1)]',
    };
};
