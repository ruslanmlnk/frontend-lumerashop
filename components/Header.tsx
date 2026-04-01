'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { CheckoutQuoteResponse } from '@/components/checkout/types';
import type { NavItem } from '@/types/site';
import { useCart } from '@/context/CartContext';
import { useNavigation } from '@/context/NavigationContext';
import {
  PENDING_COUPON_EVENT,
  clearPendingCoupon,
  persistPendingCoupon,
  readPendingCoupon,
  sanitizeCouponCode,
} from '@/lib/coupon-storage';
import { getStoredAssetPath, isPayloadMediaProxyPath } from '@/lib/local-assets';
import HeaderSearchForm from '@/components/header/HeaderSearchForm';
import { Menu, X, ChevronDown, ArrowRight, Phone, Mail, Facebook, Instagram, Tag } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

const MENU_ARROW_DOWN_BG =
  'url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTYgMTYiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHBhdGggZmlsbD0iIzgwODA4MCIgZD0iTTIuMSw1LjJMMi4xLDUuMmMwLjMtMC4zLDAuOC0wLjMsMS4xLDBMOCwxMC4zbDQuNy01QzEzLDUsMTMuNSw1LDEzLjksNS4zbDAsMGMwLjMsMC4zLDAuMSwwLjctMC4yLDENCglsLTUsNS40Yy0wLjMsMC4zLTAuOCwwLjMtMS4xLDBMMi40LDYuNEMyLjEsNi4xLDEuOCw1LjUsMi4xLDUuMnoiLz4NCjwvc3ZnPg0K)';

const headerPriceFormatter = new Intl.NumberFormat('cs-CZ');
const formatPrice = (value: number) => `${headerPriceFormatter.format(value)} Kč`;

const HOME_MENU_ITEM: NavItem = { label: 'Domů', href: '/' };

const STATIC_PAGE_ITEMS: NavItem[] = [
  { label: 'O obchodě', href: '/o-nas' },
  { label: 'Blog', href: '/blog' },
  { label: 'Kontakt', href: '/kontakt' },
];

const DesktopOverflowMenuIcon = () => (
  <span aria-hidden="true" className="flex h-[14px] w-[20px] flex-col justify-between">
    <span className="block h-[2px] w-[20px] rounded-full bg-current" />
    <span className="block h-[2px] w-[12px] rounded-full bg-current" />
    <span className="block h-[2px] w-[18px] rounded-full bg-current" />
  </span>
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMiniCartCouponOpen, setIsMiniCartCouponOpen] = useState(false);
  const [miniCartCouponCode, setMiniCartCouponCode] = useState('');
  const [appliedMiniCartCouponCode, setAppliedMiniCartCouponCode] = useState('');
  const [miniCartCouponErrorMessage, setMiniCartCouponErrorMessage] = useState('');
  const [isMiniCartQuoteLoading, setIsMiniCartQuoteLoading] = useState(false);
  const [miniCartQuote, setMiniCartQuote] = useState<CheckoutQuoteResponse | null>(null);
  const { cartItems, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const {
    desktopMenuItems: payloadDesktopMenuItems,
    desktopOverflowMenuItems: payloadDesktopOverflowMenuItems,
    mobileMenuItems: payloadMobileMenuItems,
  } = useNavigation();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const desktopPrimaryMenuItems = useMemo(() => payloadDesktopMenuItems, [payloadDesktopMenuItems]);
  const desktopOverflowMenuItems = useMemo(
    () => [HOME_MENU_ITEM, ...STATIC_PAGE_ITEMS, ...payloadDesktopOverflowMenuItems],
    [payloadDesktopOverflowMenuItems],
  );
  const mobileMenuItems = useMemo(
    () => [HOME_MENU_ITEM, ...payloadMobileMenuItems, ...STATIC_PAGE_ITEMS],
    [payloadMobileMenuItems],
  );
  const hasDesktopOverflowMenu = desktopOverflowMenuItems.length > 0;
  const hasCartItems = cartItems.length > 0;
  const miniCartSubtotal = miniCartQuote?.totals?.subtotal ?? totalPrice;
  const miniCartCouponDiscountAmount = miniCartQuote?.discounts?.couponDiscountAmount ?? 0;
  const miniCartDiscountedSubtotal = miniCartQuote?.discounts?.discountedSubtotal ?? miniCartSubtotal;
  const vatAmount = Number((miniCartDiscountedSubtotal * 0.21).toFixed(2));
  const hasFreeShipping = miniCartDiscountedSubtotal >= 1500;

  const openCartDrawer = () => setIsCartOpen(true);
  const closeCartDrawer = () => {
    setIsCartOpen(false);
    setIsMiniCartCouponOpen(false);
  };

  const toggleExpand = (itemKey: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemKey) ? prev.filter((item) => item !== itemKey) : [...prev, itemKey],
    );
  };

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  useEffect(() => {
    const handleCartOpen = () => openCartDrawer();
    window.addEventListener('lumera:cart-open', handleCartOpen);
    return () => window.removeEventListener('lumera:cart-open', handleCartOpen);
  }, []);

  useEffect(() => {
    const pendingCoupon = readPendingCoupon();
    if (pendingCoupon) {
      setMiniCartCouponCode((prev) => prev || pendingCoupon);
      setAppliedMiniCartCouponCode((prev) => prev || pendingCoupon);
      setIsMiniCartCouponOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleCouponPersisted = (event: Event) => {
      const detail =
        event instanceof CustomEvent && event.detail && typeof event.detail === 'object'
          ? (event.detail as { couponCode?: unknown })
          : {};
      const couponCode = sanitizeCouponCode(detail.couponCode);

      if (couponCode) {
        setMiniCartCouponCode(couponCode);
        setAppliedMiniCartCouponCode(couponCode);
        setMiniCartCouponErrorMessage('');
        setIsMiniCartCouponOpen(true);
      }
    };

    window.addEventListener(PENDING_COUPON_EVENT, handleCouponPersisted);
    return () => window.removeEventListener(PENDING_COUPON_EVENT, handleCouponPersisted);
  }, []);

  useEffect(() => {
    if (!isCartOpen || !appliedMiniCartCouponCode) {
      setMiniCartQuote(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsMiniCartQuoteLoading(true);
      setMiniCartCouponErrorMessage('');

      try {
        const response = await fetch('/api/checkout/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
            promoCode: appliedMiniCartCouponCode,
          }),
        });

        const payload = (await response.json().catch(() => null)) as CheckoutQuoteResponse | null;

        if (!response.ok || payload?.error || !payload?.totals) {
          if (!cancelled) {
            const message = payload?.error || 'Kupón se nepodařilo přepočítat.';
            setMiniCartQuote(null);
            setMiniCartCouponErrorMessage(message);

            if (/not found|not active|valid discount/i.test(message)) {
              clearPendingCoupon();
            }
          }
          return;
        }

        if (!cancelled) {
          setMiniCartQuote(payload);
        }
      } catch {
        if (!cancelled) {
          setMiniCartQuote(null);
          setMiniCartCouponErrorMessage('Slevu z kupónu se nepodařilo přepočítat.');
        }
      } finally {
        if (!cancelled) {
          setIsMiniCartQuoteLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [appliedMiniCartCouponCode, cartItems, isCartOpen]);

  const handleApplyMiniCartCoupon = () => {
    const normalizedCode = sanitizeCouponCode(miniCartCouponCode);

    if (!normalizedCode) {
      setMiniCartCouponCode('');
      setAppliedMiniCartCouponCode('');
      setMiniCartCouponErrorMessage('');
      setMiniCartQuote(null);
      clearPendingCoupon();
      return;
    }

    persistPendingCoupon(normalizedCode);
    setMiniCartCouponCode(normalizedCode);
    setAppliedMiniCartCouponCode(normalizedCode);
  };

  const renderDesktopChildren = (items: NavItem[], level = 1, rootVariant: 'top' | 'overflow' = 'top') => {
    const containerClass =
      level === 1
        ? rootVariant === 'top'
          ? 'invisible absolute left-0 top-full z-50 min-w-[220px] border border-[#e8d0ab] bg-[#C8A16A] opacity-0 shadow-[0_18px_40px_rgba(17,17,17,0.12)] transition-all duration-200 group-hover/top:visible group-hover/top:opacity-100 group-focus-within/top:visible group-focus-within/top:opacity-100'
          : 'invisible absolute left-full top-[-1px] z-50 ml-[1px] min-w-[220px] border border-[#e8d0ab] bg-[#B88E56] opacity-0 shadow-[0_18px_40px_rgba(17,17,17,0.12)] transition-all duration-200 group-hover/overflow:visible group-hover/overflow:opacity-100 group-focus-within/overflow:visible group-focus-within/overflow:opacity-100'
        : 'invisible absolute left-full top-[-1px] z-50 ml-[1px] min-w-[220px] border border-[#e8d0ab] bg-[#B88E56] opacity-0 shadow-[0_18px_40px_rgba(17,17,17,0.12)] transition-all duration-200 group-hover/sub:visible group-hover/sub:opacity-100 group-focus-within/sub:visible group-focus-within/sub:opacity-100';

    return (
      <div className={containerClass}>
        <div className="py-1">
          {items.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            return (
              <div key={`${level}-${item.href}`} className="group/sub relative">
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-[#b07f40]"
                >
                  <span>{item.label}</span>
                  {hasChildren ? <ArrowRight size={14} className="shrink-0" /> : null}
                </Link>
                {hasChildren ? renderDesktopChildren(item.children ?? [], level + 1, rootVariant) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDesktopOverflowItems = (items: NavItem[]) => (
    <div className="py-2">
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        return (
          <div key={item.href} className="group/overflow relative">
            <Link
              href={item.href}
              className="flex items-center justify-between gap-4 px-5 py-3 text-[16px] font-medium text-[#111111] transition-colors hover:bg-[#f7f4ef] hover:text-[#b98743]"
            >
              <span>{item.label}</span>
              {hasChildren ? <ArrowRight size={15} className="shrink-0" /> : null}
            </Link>
            {hasChildren ? renderDesktopChildren(item.children ?? [], 1, 'overflow') : null}
          </div>
        );
      })}
    </div>
  );

  const renderMobileItems = (items: NavItem[], depth = 0) =>
    items.map((item) => {
      const itemKey = `${depth}:${item.href}`;
      const isExpanded = expandedItems.includes(itemKey);
      const hasChildren = Boolean(item.children?.length);
      const rowClass = depth === 0 ? 'py-[10px]' : depth === 1 ? 'py-[8px]' : 'py-[6px]';
      const linkClass =
        depth === 0
          ? 'flex-1 text-[16px] font-normal leading-[1.3] text-[#F2F2F2] transition-colors hover:text-[#c8a16a]'
          : depth === 1
            ? 'flex-1 text-[16px] font-light leading-[1.4] text-white/70 transition-colors hover:text-[#c8a16a]'
            : 'flex-1 text-[16px] font-light leading-[1.5] text-white/55 transition-colors hover:text-[#c8a16a]';
      const childWrapClass = depth === 0 ? 'space-y-3 pb-4 pl-4 pt-2' : 'space-y-2 pb-3 pl-5 pt-2';

      return (
        <div key={itemKey} className="group border-b border-white/5 last:border-0">
          <div className={`flex items-center justify-between ${rowClass}`}>
            <Link href={item.href} onClick={() => setIsOpen(false)} className={linkClass}>
              {item.label}
            </Link>
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleExpand(itemKey);
                }}
                className="ml-3 inline-flex shrink-0 items-center justify-center p-1 text-white/40 transition-colors hover:text-white"
              >
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>
            ) : null}
          </div>
          {hasChildren && isExpanded ? <div className={childWrapClass}>{renderMobileItems(item.children ?? [], depth + 1)}</div> : null}
        </div>
      );
    });

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 w-full bg-white transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}
        style={{ fontVariantNumeric: 'lining-nums' }}
      >
        <div className="border-b border-gray-100">
          <div className="relative mx-auto flex h-[82px] max-w-[1140px] items-center justify-between px-4 md:h-[81px] md:items-start lg:px-0">
            <div className="flex flex-1 items-center md:items-start">
              <div className="hidden items-center pt-0 md:flex md:pt-[34px]">
                <HeaderSearchForm
                  placeholder="Hledat"
                  wrapperClassName="relative flex h-[38px] w-[200px] items-center border-[0.8px] border-[#B3B3B3] bg-white"
                  inputClassName="h-full w-full bg-transparent pl-[13px] pr-[35px] font-sans text-[16px] text-[#111111] placeholder:text-[#808080] focus:outline-none"
                  iconClassName="text-[#111111]"
                  iconSize={16}
                  buttonClassName="absolute right-0 top-0 h-full px-[10px] text-[#111111]"
                />
              </div>
              <button
                className="p-1 text-gray-900 focus:outline-none md:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Menu size={32} strokeWidth={1.5} />
              </button>
            </div>

            <Link href="/" className="absolute left-1/2 top-[14px] -translate-x-1/2 md:top-[24px]">
              <div className="relative h-[53px] w-[80px]">
                <Image
                  src="/assets/logo.webp"
                  alt="LUMERA"
                  fill
                  sizes="80px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <div className="flex flex-1 items-center justify-end space-x-2 pt-0 md:items-start md:space-x-[38px] md:pr-[12px] md:pt-[26px]">
              <Link
                href="/my-account"
                className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#1a1a1a] transition-opacity hover:opacity-90 md:h-[48px] md:w-[48px]"
              >
                <svg width="24" height="24" viewBox="0 0 32 32" fill="white">
                  <path d="M16 4C13.7909 4 12 5.79086 12 8C12 10.2091 13.7909 12 16 12C18.2091 12 20 10.2091 20 8C20 5.79086 18.2091 4 16 4ZM8 8C8 3.58172 11.5817 0 16 0C20.4183 0 24 3.58172 24 8C24 12.4183 20.4183 16 16 16C11.5817 16 8 12.4183 8 8ZM16 18C10.4772 18 6 22.4772 6 28C6 28.5523 5.55228 29 5 29C4.44772 29 4 28.5523 4 28C4 21.3726 9.37258 16 16 16C22.6274 16 28 21.3726 28 28C28 28.5523 27.5523 29 27 29C26.4477 29 26 28.5523 26 28C26 22.4772 21.5228 18 16 18Z" />
                </svg>
              </Link>
              <button
                onClick={openCartDrawer}
                className="group relative flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#1a1a1a] transition-opacity hover:opacity-90 md:h-[48px] md:w-[48px]"
              >
                <svg width="24" height="24" viewBox="0 0 32 32" fill="white">
                  <path d="M6.55 13.0581L9.225 21.4481C9.425 22.0456 9.95 22.444 10.575 22.444H20.9C21.5 22.444 22.075 22.0705 22.275 21.5228L26.225 10.9917H28.5C29.05 10.9917 29.5 10.5436 29.5 9.99585C29.5 9.44813 29.05 9 28.5 9H25.525C25.1 9 24.725 9.27386 24.575 9.6722L20.5 20.4523H11L8.875 13.7303H20.65C21.2 13.7303 21.65 13.2822 21.65 12.7344C21.65 12.1867 21.2 11.7386 20.65 11.7386H7.5C7.175 11.7386 6.875 11.9129 6.7 12.1618C6.5 12.4108 6.45 12.7593 6.55 13.0581ZM20.4 23.7635C20.825 23.7635 21.25 23.9378 21.55 24.2365C21.85 24.5353 22.025 24.9585 22.025 25.3817C22.025 25.805 21.85 26.2282 21.55 26.527C21.25 26.8257 20.825 27 20.4 27C19.975 27 19.55 26.8257 19.25 26.527C18.95 26.2282 18.775 25.805 18.775 25.3817C18.775 24.9585 18.95 24.5353 19.25 24.2365C19.55 23.9378 19.975 23.7635 20.4 23.7635ZM11.425 23.7635C11.85 23.7635 12.275 23.9378 12.575 24.2365C12.875 24.5353 13.05 24.9585 13.05 25.3817C13.05 25.805 12.875 26.2282 12.575 26.527C12.275 26.8257 11.85 27 11.425 27C11 27 10.575 26.8257 10.275 26.527C9.975 26.2282 9.8 25.805 9.8 25.3817C9.8 24.9585 9.975 24.5353 10.275 24.2365C10.575 23.9378 11 23.7635 11.425 23.7635Z" />
                </svg>
                <span className="absolute -top-[2px] right-[29px] flex h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] border-[#1a1a1a] bg-[#E3A651] text-[10px] font-bold text-white md:h-[22px] md:w-[22px] md:text-[11px]">
                  {totalItems}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100 bg-white px-4 py-3 md:hidden">
          <HeaderSearchForm
            placeholder="Hledat"
            wrapperClassName="relative flex h-[44px] w-full items-center border-[0.8px] border-[#B3B3B3] bg-white"
            inputClassName="h-full w-full bg-transparent pl-[15px] pr-[40px] font-sans text-[16px] text-[#111111] placeholder:text-[#808080] focus:outline-none"
            iconClassName="text-[#111111]"
            iconSize={20}
            buttonClassName="absolute right-0 top-0 h-full px-[12px] text-[#111111]"
          />
        </div>

        {desktopPrimaryMenuItems.length > 0 || hasDesktopOverflowMenu ? (
          <nav className="mx-auto hidden h-[53px] max-w-[1140px] px-4 md:block lg:px-0">
            <ul className="flex h-full items-center justify-center gap-[32px] font-sans text-[#111111] lg:gap-[40px] xl:gap-[52px]">
              {desktopPrimaryMenuItems.map((item) => {
                const hasChildren = Boolean(item.children?.length);
                return (
                  <li key={item.href} className="group/top relative flex h-full items-center">
                    <Link
                      href={item.href}
                      className="flex h-full items-center whitespace-nowrap py-[10px] text-[15px] font-[400] leading-[1] tracking-[0.04em] transition-colors hover:text-[#C8A16A]"
                    >
                      {item.label}
                      {hasChildren && (
                        <span
                          aria-hidden="true"
                          className="inline-block h-4 w-4 shrink-0 bg-contain bg-center bg-no-repeat"
                          style={{ backgroundImage: MENU_ARROW_DOWN_BG }}
                        />
                      )}
                    </Link>
                    {hasChildren ? renderDesktopChildren(item.children ?? [], 1, 'top') : null}
                  </li>
                );
              })}
              {hasDesktopOverflowMenu ? (
                <li className="group/overflow-menu relative flex h-full items-center">
                  <button
                    type="button"
                    aria-label="Další kategorie"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#111111] transition-colors hover:text-[#C8A16A]"
                  >
                    <DesktopOverflowMenuIcon />
                  </button>
                  <div className="invisible absolute right-0 top-full z-50 mt-[1px] min-w-[280px] border border-[#111111]/10 bg-white opacity-0 shadow-[0_18px_40px_rgba(17,17,17,0.12)] transition-all duration-200 group-hover/overflow-menu:visible group-hover/overflow-menu:opacity-100 group-focus-within/overflow-menu:visible group-focus-within/overflow-menu:opacity-100">
                    {renderDesktopOverflowItems(desktopOverflowMenuItems)}
                  </div>
                </li>
              ) : null}
            </ul>
          </nav>
        ) : null}

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[60] bg-black/60"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                className="fixed left-0 top-0 z-[70] flex h-full w-[280px] flex-col overflow-y-auto bg-[#111111] pb-10 shadow-2xl no-scrollbar md:hidden"
                style={{ fontFamily: '"Work Sans", sans-serif' }}
              >
                <div className="mb-8 flex items-center justify-between px-[30px] pt-[30px]">
                  <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center text-[20px] leading-none tracking-[0.1em]">
                    <span className="font-bold text-white">LUMERA</span>
                    <span className="ml-[6px] text-[#c8a16a]">Shop</span>
                  </Link>
                  <button
                    className="p-1 text-white transition-colors hover:text-[#c8a16a]"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close menu"
                  >
                    <X size={28} strokeWidth={1} />
                  </button>
                </div>
                <nav className="mb-10 flex flex-col space-y-1 px-[30px]">
                  {renderMobileItems(mobileMenuItems)}
                </nav>
                <div className="mb-10 px-[30px]">
                  <HeaderSearchForm
                    placeholder="Hledat"
                    wrapperClassName="group relative"
                    inputClassName="h-10 w-full rounded-full border border-white/20 bg-transparent pl-5 pr-12 text-[14px] text-white placeholder:text-white/40 transition-colors focus:border-[#c8a16a] focus:outline-none"
                    iconClassName="text-white/40 transition-colors group-focus-within:text-[#c8a16a]"
                    iconSize={18}
                    buttonClassName="absolute right-0 top-0 h-full px-4 text-white/40 transition-colors group-focus-within:text-[#c8a16a]"
                    onSubmitComplete={() => setIsOpen(false)}
                  />
                </div>
                <div className="mb-12 space-y-5 px-[30px]">
                  <a href="tel:+420606731316" className="flex items-center gap-3 text-[16px] font-normal text-[#F2F2F2] transition-colors hover:text-[#c8a16a]">
                    <Phone size={18} strokeWidth={1.5} className="text-white/60" />
                    <span>+420 606 731 316</span>
                  </a>
                  <a href="mailto:info@lumerashop.cz" className="flex items-center gap-3 text-[16px] font-normal text-[#F2F2F2] transition-colors hover:text-[#c8a16a]">
                    <Mail size={18} strokeWidth={1.5} className="text-white/60" />
                    <span>info@lumerashop.cz</span>
                  </a>
                </div>
                <div className="mt-auto flex gap-6 px-[30px] pt-10">
                  <a href="#" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white transition-all hover:border-[#c8a16a] hover:text-[#c8a16a]">
                    <Facebook size={24} />
                  </a>
                  <a href="#" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white transition-all hover:border-[#c8a16a] hover:text-[#c8a16a]">
                    <Instagram size={24} />
                  </a>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCartOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeCartDrawer}
                className="fixed inset-0 z-[90] bg-black/40"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed right-0 top-0 z-[100] flex h-full w-full flex-col bg-white shadow-2xl md:w-[396px]"
              >
                <div className="flex h-[72px] shrink-0 items-center justify-between pl-4 pr-6">
                  <button
                    onClick={closeCartDrawer}
                    className="inline-flex h-8 w-8 items-center justify-center text-[#90867a] transition-colors hover:text-[#111111]"
                    aria-label={'Zavřít košík'}
                  >
                    <ArrowRight size={20} className="rotate-180" />
                  </button>
                  <h2 className="text-center text-[14px] font-semibold uppercase tracking-[0.08em] text-[#111111]">
                    {hasCartItems ? 'Zkontrolujte košík' : 'Košík je prázdný'}
                  </h2>
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-[12px] font-semibold text-white">
                    {totalItems}
                  </div>
                </div>

                {hasCartItems ? (
                  <div className="flex-1 overflow-y-auto pl-4 pr-6 pb-5 no-scrollbar">
                    <div className="space-y-1">
                      {cartItems.map((item) => {
                        const itemImageSrc = getStoredAssetPath(item.image);
                        const canIncreaseQuantity = typeof item.stockQuantity !== 'number' || item.quantity < item.stockQuantity;
                        return (
                          <article key={item.id} className="grid grid-cols-[64px_minmax(0,1fr)_68px] items-start gap-4 border-b border-[#111]/8 py-4 last:border-b-0">
                            <div className="relative h-[72px] w-[64px] shrink-0 overflow-hidden rounded-[12px] border border-[#111]/6 bg-[#f7f6f3]">
                              <Image
                                src={itemImageSrc}
                                alt={item.name}
                                fill
                                sizes="64px"
                                decoding="async"
                                unoptimized={isPayloadMediaProxyPath(itemImageSrc)}
                                className="object-contain p-2"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link href={item.slug ? `/product/${item.slug}` : '/shop'} onClick={closeCartDrawer} className="block text-[11px] font-semibold uppercase leading-5 tracking-[0.04em] text-[#111111] transition-colors hover:text-[#b98743]">
                                {item.name}
                              </Link>
                              <div className="mt-3 inline-flex items-center rounded-[10px] bg-[#f3f3f3] p-1">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[18px] leading-none text-[#b0aba4] transition-colors hover:bg-white hover:text-[#111111]">-</button>
                                <input type="text" value={item.quantity} readOnly className="w-8 bg-transparent text-center text-[12px] font-semibold text-[#111111] focus:outline-none" />
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[18px] leading-none text-[#b0aba4] transition-colors hover:bg-white hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-35" disabled={!canIncreaseQuantity}>+</button>
                              </div>
                            </div>
                            <div className="flex min-h-[72px] flex-col items-end justify-between">
                              <button onClick={() => removeFromCart(item.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] text-[#111111] transition-colors hover:bg-[#e6e6e6]"><X size={13} /></button>
                              <p className="text-[14px] font-semibold leading-none text-[#111111]">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d7b64]">Zatím prázdné</p>
                    <h3 className="mt-3 font-serif text-[28px] leading-none text-[#111111]">Košík čeká na výběr.</h3>
                    <p className="mt-3 max-w-[260px] text-[13px] leading-6 text-[#6b6257]">Podívejte se do obchodu a přidejte si první produkt.</p>
                  </div>
                )}

                <div className="shrink-0 border-t border-[#111]/8 bg-[#f8f6f3] pl-4 pr-6 py-5">
                  {hasCartItems ? (
                    <>
                      <div className="rounded-[14px] border border-dashed border-[#111]/12 bg-white px-4 py-3">
                        <button type="button" onClick={() => setIsMiniCartCouponOpen(!isMiniCartCouponOpen)} className="flex w-full items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f665a]"><Tag size={14} />Máte slevový kód?</span>
                          <ChevronDown size={15} className={`text-[#a39a8e] transition-transform ${isMiniCartCouponOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isMiniCartCouponOpen && (
                          <div className="mt-3 flex items-center gap-2">
                            <input type="text" placeholder="Vložte kód" className="h-10 min-w-0 flex-1 rounded-[10px] border border-[#111]/10 bg-[#fbfaf8] px-3 text-[13px] text-[#111111] outline-none transition-colors focus:border-[#c79200]" value={miniCartCouponCode} onChange={(e) => setMiniCartCouponCode(e.target.value)} />
                            <button type="button" className="inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] bg-[#111111] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c79200]" onClick={handleApplyMiniCartCoupon}>{isMiniCartQuoteLoading ? 'Počkejte...' : 'Použít'}</button>
                          </div>
                        )}
                        {appliedMiniCartCouponCode && (
                          <p className="mt-3 text-[12px] leading-5 text-[#6b6257]">Aktivní kód: <span className="font-semibold text-[#111111]">{appliedMiniCartCouponCode}</span></p>
                        )}
                        {miniCartCouponErrorMessage && (
                          <p className="mt-3 text-[12px] leading-5 text-[#b42318]">{miniCartCouponErrorMessage}</p>
                        )}
                      </div>
                      <div className="mt-5 grid grid-cols-3 divide-x divide-[#111]/8">
                        <div className="pr-3 text-left">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f665a]">Zboží</p>
                          <p className="mt-1 text-[16px] font-semibold leading-none text-[#111111]">{formatPrice(miniCartSubtotal)}</p>
                        </div>
                        <div className="px-3 text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f665a]">Doprava</p>
                          <p className={`mt-1 text-[16px] font-semibold leading-none ${hasFreeShipping ? 'text-[#16a34a]' : 'text-[#111111]'}`}>{hasFreeShipping ? 'Zdarma' : 'Dle volby'}</p>
                        </div>
                        <div className="pl-3 text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f665a]">DPH</p>
                          <p className="mt-1 text-[16px] font-semibold leading-none text-[#a5a09a]">{formatPrice(vatAmount)}</p>
                        </div>
                      </div>
                      <Link href="/checkout" onClick={closeCartDrawer} className="mt-5 flex h-[56px] w-full items-center justify-between rounded-[18px] bg-[#c79200] px-6 text-white transition-colors hover:bg-[#af8100]">
                        <span className="text-[14px] font-semibold uppercase tracking-[0.12em]">K pokladně</span>
                        <span className="mx-4 h-6 w-px bg-white/25" />
                        <span className="inline-flex items-center gap-3">
                          {miniCartCouponDiscountAmount > 0 ? (
                            <span className="flex flex-col items-end leading-none">
                              <span className="text-[11px] font-medium text-white/70 line-through decoration-white/60">{formatPrice(miniCartSubtotal)}</span>
                              <span className="mt-1 text-[15px] font-semibold text-white">{formatPrice(miniCartDiscountedSubtotal)}</span>
                            </span>
                          ) : (
                            <span className="text-[14px] font-semibold text-white">{formatPrice(miniCartDiscountedSubtotal)}</span>
                          )}
                          <ArrowRight size={18} />
                        </span>
                      </Link>
                    </>
                  ) : (
                    <Link href="/shop" onClick={closeCartDrawer} className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#111111] text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#b98743]">
                      Do obchodu <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
      <div aria-hidden="true" className="h-[var(--lumera-header-mobile-height)] md:h-[var(--lumera-header-desktop-height)]" />
    </>
  );
};

export default Header;
