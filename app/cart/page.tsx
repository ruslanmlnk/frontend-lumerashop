'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Minus,
    Plus,
    Shield,
    ShoppingBag,
    Tag,
    Truck,
    X,
} from 'lucide-react';

import type { CheckoutQuoteResponse } from '@/components/checkout/types';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import {
    PENDING_COUPON_EVENT,
    clearPendingCoupon,
    persistPendingCoupon,
    readPendingCoupon,
    sanitizeCouponCode,
} from '@/lib/coupon-storage';
import { getRenderableAssetPath } from '@/lib/local-assets';

import '@/app/cart-compact.css';

const formatPrice = (value: number) =>
    `${value.toLocaleString('cs-CZ', {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
    })} Kc`;

const getUnitLabel = (count: number) => {
    if (count === 1) return 'kus';
    if (count < 5) return 'kusy';
    return 'kusu';
};

const getProductLabel = (count: number) => {
    if (count === 1) return 'produkt';
    if (count < 5) return 'produkty';
    return 'produktu';
};

export default function CartPage() {
    const [isCouponOpen, setIsCouponOpen] = React.useState(false);
    const [couponCode, setCouponCode] = React.useState('');
    const [appliedCouponCode, setAppliedCouponCode] = React.useState('');
    const [couponMessage, setCouponMessage] = React.useState('');
    const [couponErrorMessage, setCouponErrorMessage] = React.useState('');
    const [isQuoteLoading, setIsQuoteLoading] = React.useState(false);
    const [quote, setQuote] = React.useState<CheckoutQuoteResponse | null>(null);
    const couponFieldId = React.useId();

    const { cartItems, removeFromCart, totalPrice, updateQuantity } = useCart();

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const productCount = cartItems.length;
    const subtotalPrice = totalPrice;
    const couponDiscountAmount = quote?.discounts?.couponDiscountAmount ?? 0;
    const discountedSubtotal = quote?.discounts?.discountedSubtotal ?? subtotalPrice;
    const vatAmount = Number((discountedSubtotal * 0.21).toFixed(2));

    const perks = [
        'Dopravu a platbu vyberete v pokladne',
        '14 dni na vraceni bez slozitosti',
        'Souhrn se prepocita okamzite',
    ];

    const requestCartQuote = React.useCallback(
        async (nextCouponCode: string) => {
            const normalizedCode = sanitizeCouponCode(nextCouponCode);

            if (!normalizedCode) {
                setQuote(null);
                setCouponMessage('');
                setCouponErrorMessage('');
                return;
            }

            setIsQuoteLoading(true);
            setCouponMessage('');
            setCouponErrorMessage('');

            try {
                const response = await fetch('/api/checkout/quote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        items: cartItems,
                        promoCode: normalizedCode,
                    }),
                });

                const payload = (await response.json().catch(() => null)) as CheckoutQuoteResponse | null;

                if (!response.ok || payload?.error || !payload?.totals) {
                    setQuote(null);
                    setCouponErrorMessage(
                        payload?.error ||
                            'Kupon je ulozeny, ale sleva bude vypoctena az po prihlaseni v pokladne.',
                    );
                    return;
                }

                setQuote(payload);
                if (payload.coupon) {
                    setCouponMessage(
                        `Kupon ${payload.coupon.code} je aktivni. Sleva ${formatPrice(payload.coupon.discountAmount)}.`,
                    );
                }
            } catch {
                setQuote(null);
                setCouponErrorMessage('Slevu z kuponu se nepodarilo prepocitat.');
            } finally {
                setIsQuoteLoading(false);
            }
        },
        [cartItems],
    );

    React.useEffect(() => {
        const pendingCoupon = readPendingCoupon();
        if (!pendingCoupon) {
            return;
        }

        setCouponCode(pendingCoupon);
        setAppliedCouponCode(pendingCoupon);
        setIsCouponOpen(true);
    }, []);

    React.useEffect(() => {
        const handleCouponPersisted = (event: Event) => {
            const detail =
                event instanceof CustomEvent && event.detail && typeof event.detail === 'object'
                    ? (event.detail as { couponCode?: unknown })
                    : {};
            const nextCouponCode = sanitizeCouponCode(detail.couponCode);

            if (!nextCouponCode) {
                return;
            }

            setCouponCode(nextCouponCode);
            setAppliedCouponCode(nextCouponCode);
            setIsCouponOpen(true);
        };

        window.addEventListener(PENDING_COUPON_EVENT, handleCouponPersisted);
        return () => {
            window.removeEventListener(PENDING_COUPON_EVENT, handleCouponPersisted);
        };
    }, []);

    React.useEffect(() => {
        if (!appliedCouponCode) {
            setQuote(null);
            return;
        }

        void requestCartQuote(appliedCouponCode);
    }, [appliedCouponCode, cartItems, requestCartQuote]);

    const handleApplyCoupon = async () => {
        const normalizedCode = sanitizeCouponCode(couponCode);

        if (!normalizedCode) {
            setCouponCode('');
            setAppliedCouponCode('');
            clearPendingCoupon();
            setQuote(null);
            setCouponMessage('');
            setCouponErrorMessage('');
            return;
        }

        persistPendingCoupon(normalizedCode);
        setAppliedCouponCode(normalizedCode);
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-slim-shell flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 px-4 pb-20 pt-[170px] md:px-6 md:pt-[210px]">
                    <div className="mx-auto max-w-[720px]">
                        <section className="cart-slim-empty">
                            <div className="cart-slim-empty-icon">
                                <ShoppingBag size={24} />
                            </div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#87755f]">
                                Kosik je prazdny
                            </p>
                            <h1 className="mt-3 font-serif text-[30px] leading-none text-[#111] md:text-[38px]">
                                Zatim tu nic neni.
                            </h1>
                            <p className="mx-auto mt-3 max-w-[440px] text-[13px] leading-6 text-[#6b6257]">
                                Vyber si produkt a vrat se sem, az budes chtit objednavku dokoncit.
                            </p>
                            <div className="mt-6 flex justify-center">
                                <Link href="/" className="cart-slim-primary max-w-[240px]">
                                    Pokracovat v nakupu
                                    <ArrowRight size={15} />
                                </Link>
                            </div>
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="cart-slim-shell flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 px-4 pb-20 pt-[170px] md:px-6 md:pt-[210px]">
                <div className="mx-auto max-w-[1080px]">
                    <section className="cart-slim-top">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#87755f]">
                                Kontrola objednavky
                            </p>
                            <h1 className="mt-2 font-serif text-[30px] leading-none text-[#111] md:text-[38px]">
                                Nakupni kosik
                            </h1>
                            <p className="mt-2.5 max-w-[44ch] text-[12px] leading-5 text-[#6b6257] md:text-[13px]">
                                Pokud jsi prisel z QR kodu s kuponem, kod se ulozi automaticky a tady uvidis, jestli je uz sleva aktivni.
                            </p>
                        </div>

                        <div className="cart-slim-meta">
                            <div className="cart-slim-pill">
                                <ShoppingBag size={12} />
                                <span>
                                    {itemCount} {getUnitLabel(itemCount)}
                                </span>
                            </div>
                            <div className="cart-slim-pill">
                                <Tag size={12} />
                                <span>
                                    {productCount} {getProductLabel(productCount)}
                                </span>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_272px]">
                        <div className="space-y-3">
                            <section className="cart-slim-panel">
                                <div className="cart-slim-panel-head">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7367]">
                                            Polozky
                                        </p>
                                        <h2 className="mt-1 font-serif text-[19px] leading-none text-[#111]">
                                            Obsah kosiku
                                        </h2>
                                    </div>

                                    <Link
                                        href="/"
                                        className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6b6257] transition-colors hover:text-[#b98743] sm:inline-flex"
                                    >
                                        <ArrowLeft size={12} />
                                        Pokracovat
                                    </Link>
                                </div>

                                <div className="cart-slim-list-head hidden md:grid">
                                    <span>Produkt</span>
                                    <span className="text-center">Cena</span>
                                    <span className="text-center">Mnozstvi</span>
                                    <span className="text-right">Celkem</span>
                                    <span />
                                </div>

                                <div className="space-y-2">
                                    {cartItems.map((item) => {
                                        const lineTotal = item.price * item.quantity;
                                        const itemImage = getRenderableAssetPath(item.image);

                                        return (
                                            <article
                                                key={item.id}
                                                className="cart-slim-row flex flex-col gap-2.5 md:grid md:grid-cols-[minmax(0,1fr)_82px_120px_98px_36px] md:items-center"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="relative h-[78px] w-[78px] flex-shrink-0 overflow-hidden rounded-[12px] bg-[#f7f3ee]">
                                                        <Image
                                                            src={itemImage}
                                                            alt={item.name}
                                                            fill
                                                            className="object-contain p-2"
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <Link
                                                            href={`/product/${item.slug || item.id}`}
                                                            className="font-serif text-[17px] leading-[1.1] text-[#111] transition-colors hover:text-[#b98743]"
                                                        >
                                                            {item.name}
                                                        </Link>

                                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                            {item.sku ? <span className="cart-slim-chip">Ref. {item.sku}</span> : null}
                                                            {item.variant ? <span className="cart-slim-chip">{item.variant}</span> : null}
                                                        </div>

                                                        <div className="mt-2.5 flex items-center justify-between gap-3 md:hidden">
                                                            <span className="text-[11px] font-medium text-[#6b6257]">
                                                                {formatPrice(item.price)}
                                                            </span>
                                                            <span className="text-[16px] font-semibold text-[#111]">
                                                                {formatPrice(lineTotal)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="hidden text-center text-[12px] font-medium text-[#111] md:block">
                                                    {formatPrice(item.price)}
                                                </div>

                                                <div className="flex md:justify-center">
                                                    <div className="cart-slim-quantity">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="cart-slim-quantity-button"
                                                            aria-label={`Snizit mnozstvi ${item.name}`}
                                                        >
                                                            <Minus size={11} />
                                                        </button>
                                                        <span className="min-w-[2ch] text-center text-[12px] font-bold text-[#111]">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="cart-slim-quantity-button"
                                                            aria-label={`Zvysit mnozstvi ${item.name}`}
                                                        >
                                                            <Plus size={11} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="hidden text-right text-[15px] font-semibold text-[#111] md:block">
                                                    {formatPrice(lineTotal)}
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="cart-slim-remove"
                                                        title="Odstranit"
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className="cart-slim-inline-grid">
                                <div className="cart-slim-panel cart-slim-panel-soft">
                                    <button
                                        type="button"
                                        onClick={() => setIsCouponOpen((open) => !open)}
                                        className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#111] transition-colors hover:text-[#b98743]"
                                        aria-expanded={isCouponOpen}
                                        aria-controls={couponFieldId}
                                    >
                                        <span className="cart-slim-icon-badge cart-slim-icon-badge-soft">
                                            <Tag size={12} />
                                        </span>
                                        <span>{isCouponOpen ? 'Skryt kupon' : 'Pridat kupon'}</span>
                                    </button>

                                    {isCouponOpen ? (
                                        <div id={couponFieldId} className="cart-slim-coupon mt-3 animate-fadeIn">
                                            <input
                                                type="text"
                                                placeholder="Vlozte kod"
                                                value={couponCode}
                                                onChange={(event) => setCouponCode(event.target.value)}
                                                className="h-9 rounded-full border border-[#111]/10 bg-white px-4 text-[12px] text-[#111] outline-none transition-colors placeholder:text-[#92887a] focus:border-[#b98743]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => void handleApplyCoupon()}
                                                className="h-9 rounded-full bg-[#111] px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#b98743]"
                                            >
                                                {isQuoteLoading ? 'Pockam...' : 'Pouzit'}
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-[12px] leading-5 text-[#6b6257]">
                                            Kod muzes doplnit i pozdeji v pokladne.
                                        </p>
                                    )}

                                    {appliedCouponCode ? (
                                        <p className="mt-3 text-[12px] leading-5 text-[#6b6257]">
                                            Ulozeny kod: <span className="font-semibold text-[#111]">{appliedCouponCode}</span>
                                        </p>
                                    ) : null}

                                    {couponMessage ? (
                                        <p className="mt-3 text-[12px] leading-5 text-[#1f6f43]">{couponMessage}</p>
                                    ) : null}

                                    {couponErrorMessage ? (
                                        <p className="mt-3 text-[12px] leading-5 text-[#b42318]">{couponErrorMessage}</p>
                                    ) : null}
                                </div>

                                <div className="cart-slim-panel cart-slim-panel-soft">
                                    <div className="flex items-start gap-2.5">
                                        <span className="cart-slim-icon-badge cart-slim-icon-badge-dark">
                                            <Truck size={12} />
                                        </span>
                                        <div>
                                            <p className="text-[11px] font-semibold text-[#111]">Doprava az v pokladne</p>
                                            <p className="mt-1 text-[12px] leading-5 text-[#6b6257]">
                                                Po pokracovani vyberes metodu doruceni i platebni branu.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="cart-slim-summary">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7c7367]">
                                Souhrn
                            </p>
                            <h2 className="mt-2 font-serif text-[20px] leading-none text-[#111]">K zaplaceni</h2>

                            <div className="cart-slim-summary-rows mt-4">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c7367]">
                                        Mezisoucet
                                    </span>
                                    <span className="text-[14px] font-semibold text-[#111]">
                                        {formatPrice(subtotalPrice)}
                                    </span>
                                </div>

                                {couponDiscountAmount > 0 ? (
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c7367]">
                                            Sleva kupon
                                        </span>
                                        <span className="text-[14px] font-semibold text-[#111]">
                                            - {formatPrice(couponDiscountAmount)}
                                        </span>
                                    </div>
                                ) : null}

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c7367]">
                                        Doprava
                                    </span>
                                    <span className="text-[11px] font-semibold text-[#111]">Dle volby</span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c7367]">
                                        DPH
                                    </span>
                                    <span className="text-[11px] font-semibold text-[#111]">{formatPrice(vatAmount)}</span>
                                </div>
                            </div>

                            <div className="cart-slim-total-line mt-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7367]">
                                    Celkem
                                </p>
                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <span className="text-[24px] font-semibold leading-none text-[#111]">
                                        {formatPrice(discountedSubtotal)}
                                    </span>
                                    <span className="rounded-[10px] border border-[#111]/8 bg-white px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6b6257]">
                                        Vcetne DPH
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2.5">
                                <Link href="/checkout" className="cart-slim-primary">
                                    Do pokladny
                                    <ArrowRight size={15} />
                                </Link>
                                <Link href="/" className="cart-slim-secondary">
                                    <ArrowLeft size={14} />
                                    Pokracovat
                                </Link>
                            </div>

                            <ul className="cart-slim-note-list mt-4 space-y-2">
                                {perks.map((perk) => (
                                    <li key={perk} className="flex items-start gap-2.5 text-[11px] leading-5 text-[#5f584e]">
                                        <span className="cart-slim-check-badge">
                                            <Check size={10} />
                                        </span>
                                        <span>{perk}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="cart-slim-security mt-4">
                                <div className="flex items-start gap-2.5">
                                    <span className="cart-slim-icon-badge cart-slim-icon-badge-soft">
                                        <Shield size={12} />
                                    </span>
                                    <div>
                                        <p className="text-[11px] font-semibold text-[#111]">Bezpecne dokonceni</p>
                                        <p className="mt-1 text-[11px] leading-5 text-[#6b6257]">
                                            Pokud jsi prihlaseny, sleva z kuponu se prepocita uz tady a stejna zustane i v checkoutu.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
