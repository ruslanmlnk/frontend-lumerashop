'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Shield, ShoppingBag, Tag, Truck, X } from 'lucide-react';
import '@/app/cart2.css';

const formatPrice = (value: number) => `${value.toLocaleString('cs-CZ')} Kč`;

const getUnitLabel = (count: number) => {
    if (count === 1) return 'kus';
    if (count < 5) return 'kusy';
    return 'kusů';
};

const getProductLabel = (count: number) => {
    if (count === 1) return 'produkt';
    if (count < 5) return 'produkty';
    return 'produktů';
};

export default function CartTwoPage() {
    const [isCouponOpen, setIsCouponOpen] = React.useState(false);
    const couponFieldId = React.useId();
    const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const productCount = cartItems.length;
    const vatAmount = Number((totalPrice * 0.21).toFixed(2));

    const perks = [
        '7 způsobů dopravy v pokladně',
        'Bezpečná online platba',
        '14 dní na vrácení',
    ];

    if (cartItems.length === 0) {
        return (
            <div className="cart-slim-shell flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 px-4 pb-20 pt-[170px] md:px-6 md:pt-[210px]">
                    <div className="mx-auto max-w-[760px]">
                        <section className="cart-slim-empty">
                            <div className="cart-slim-empty-icon">
                                <ShoppingBag size={26} />
                            </div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#87755f]">
                                Košík je prázdný
                            </p>
                            <h1 className="mt-3 font-serif text-[32px] leading-none text-[#111] md:text-[42px]">
                                Zatím jste nic nevybrali.
                            </h1>
                            <p className="mx-auto mt-4 max-w-[480px] text-[14px] leading-6 text-[#6b6257]">
                                Vyberte si z kolekce a vraťte se sem, až budete chtít objednávku dokončit.
                            </p>
                            <div className="mt-7 flex justify-center">
                                <Link href="/" className="cart-slim-primary max-w-[250px]">
                                    Pokračovat v nákupu
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
                <div className="mx-auto max-w-[1160px]">
                    <section className="cart-slim-header">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#87755f]">
                                Kontrola objednávky
                            </p>
                            <h1 className="mt-2 font-serif text-[32px] leading-none text-[#111] md:text-[42px]">
                                Nákupní košík
                            </h1>
                            <p className="mt-3 max-w-[46ch] text-[13px] leading-6 text-[#6b6257] md:text-[14px]">
                                Upravte množství, zkontrolujte součet a pokračujte do pokladny.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className="cart-slim-pill">
                                <ShoppingBag size={13} />
                                <span>{itemCount} {getUnitLabel(itemCount)}</span>
                            </div>
                            <div className="cart-slim-pill">
                                <Tag size={13} />
                                <span>{productCount} {getProductLabel(productCount)}</span>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_296px]">
                        <div className="space-y-4">
                            <section className="cart-slim-panel">
                                <div className="cart-slim-panel-head">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c7367]">
                                            Položky
                                        </p>
                                        <h2 className="mt-1 font-serif text-[21px] leading-none text-[#111]">
                                            Obsah košíku
                                        </h2>
                                    </div>

                                    <Link
                                        href="/"
                                        className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b6257] transition-colors hover:text-[#b98743] sm:inline-flex"
                                    >
                                        <ArrowLeft size={13} />
                                        Pokračovat
                                    </Link>
                                </div>

                                <div className="cart-slim-list-head hidden md:grid">
                                    <span>Produkt</span>
                                    <span className="text-center">Cena</span>
                                    <span className="text-center">Množství</span>
                                    <span className="text-right">Celkem</span>
                                    <span />
                                </div>

                                <div className="space-y-2.5">
                                    {cartItems.map((item) => {
                                        const lineTotal = item.price * item.quantity;

                                        return (
                                            <article
                                                key={item.id}
                                                className="cart-slim-row flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_88px_128px_104px_40px] md:items-center"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="relative h-[92px] w-[92px] flex-shrink-0 overflow-hidden rounded-[14px] bg-[#f7f1ea]">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-contain p-2.5"
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <Link
                                                            href={`/product/${item.id}`}
                                                            className="font-serif text-[18px] leading-[1.12] text-[#111] transition-colors hover:text-[#b98743]"
                                                        >
                                                            {item.name}
                                                        </Link>

                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {item.sku && <span className="cart-slim-chip">Ref. {item.sku}</span>}
                                                            {item.variant && <span className="cart-slim-chip">{item.variant}</span>}
                                                        </div>

                                                        <div className="mt-3 flex items-center justify-between gap-3 md:hidden">
                                                            <span className="text-[12px] font-medium text-[#6b6257]">
                                                                {formatPrice(item.price)}
                                                            </span>
                                                            <span className="text-[17px] font-semibold text-[#111]">
                                                                {formatPrice(lineTotal)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="hidden text-center text-[13px] font-medium text-[#111] md:block">
                                                    {formatPrice(item.price)}
                                                </div>

                                                <div className="flex md:justify-center">
                                                    <div className="cart-slim-quantity">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="cart-slim-quantity-button"
                                                            aria-label={`Snížit množství ${item.name}`}
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="min-w-[2ch] text-center text-[13px] font-bold text-[#111]">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="cart-slim-quantity-button"
                                                            aria-label={`Zvýšit množství ${item.name}`}
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="hidden text-right text-[16px] font-semibold text-[#111] md:block">
                                                    {formatPrice(lineTotal)}
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="cart-slim-remove"
                                                        title="Odstranit"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className="cart-slim-panel">
                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => setIsCouponOpen((open) => !open)}
                                            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#111] transition-colors hover:text-[#b98743]"
                                            aria-expanded={isCouponOpen}
                                            aria-controls={couponFieldId}
                                        >
                                            <Tag size={13} />
                                            <span>{isCouponOpen ? 'Skrýt kupón' : 'Přidat slevový kód'}</span>
                                        </button>

                                        {isCouponOpen ? (
                                            <div id={couponFieldId} className="cart-slim-coupon mt-4 animate-fadeIn">
                                                <input
                                                    type="text"
                                                    placeholder="Vložte kód"
                                                    className="h-10 rounded-full border border-[#111]/10 bg-white px-4 text-[13px] text-[#111] outline-none transition-colors placeholder:text-[#92887a] focus:border-[#b98743]"
                                                />
                                                <button
                                                    type="button"
                                                    className="h-10 rounded-full bg-[#111] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#b98743]"
                                                >
                                                    Použít
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="mt-3 text-[13px] leading-6 text-[#6b6257]">
                                                Kupón můžete přidat ještě před odesláním objednávky.
                                            </p>
                                        )}
                                    </div>

                                    <div className="rounded-[13px] border border-[#111]/8 bg-[#f7f2eb] p-3.5">
                                        <div className="flex items-start gap-2.5">
                                            <div className="cart-slim-icon-badge cart-slim-icon-badge-dark">
                                                <Truck size={13} />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-semibold text-[#111]">
                                                    Doprava a platba v pokladně
                                                </p>
                                                <p className="mt-1 text-[12px] leading-5 text-[#6b6257]">
                                                    Po pokračování vyberete dopravu, výdejní místo i platební metodu.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="cart-slim-summary">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7c7367]">
                                Souhrn
                            </p>
                            <h2 className="mt-2 font-serif text-[22px] leading-none text-[#111]">
                                Dokončení objednávky
                            </h2>

                            <div className="mt-5 space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c7367]">
                                        Mezisoučet
                                    </span>
                                    <span className="text-[15px] font-semibold text-[#111]">
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c7367]">
                                        Doprava
                                    </span>
                                    <span className="text-[12px] font-semibold text-[#111]">
                                        Dle volby
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c7367]">
                                        DPH
                                    </span>
                                    <span className="text-[12px] font-semibold text-[#111]">
                                        {formatPrice(vatAmount)}
                                    </span>
                                </div>
                            </div>

                            <div className="cart-slim-total-box mt-5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
                                    Celkem
                                </p>
                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <span className="text-[27px] font-semibold leading-none text-white">
                                        {formatPrice(totalPrice)}
                                    </span>
                                    <span className="rounded-[10px] border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">
                                        Včetně DPH
                                    </span>
                                </div>
                            </div>

                            <ul className="mt-5 space-y-2">
                                {perks.map((perk) => (
                                    <li key={perk} className="flex items-start gap-2.5 text-[12px] leading-5 text-[#5f584e]">
                                        <span className="cart-slim-check-badge">
                                            <Check size={10} />
                                        </span>
                                        <span>{perk}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-5 space-y-2.5">
                                <Link href="/checkout" className="cart-slim-primary">
                                    Do pokladny
                                    <ArrowRight size={15} />
                                </Link>
                                <Link href="/" className="cart-slim-secondary">
                                    <ArrowLeft size={14} />
                                    Pokračovat v nákupu
                                </Link>
                            </div>

                            <div className="mt-4 rounded-[13px] border border-[#111]/8 bg-[#fbf8f4] p-3.5">
                                <div className="flex items-start gap-2.5">
                                    <div className="cart-slim-icon-badge cart-slim-icon-badge-dark">
                                        <Shield size={13} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-semibold text-[#111]">
                                            Bezpečné dokončení
                                        </p>
                                        <p className="mt-1 text-[12px] leading-5 text-[#6b6257]">
                                            Objednávku odešlete až po potvrzení dopravy a platby.
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
