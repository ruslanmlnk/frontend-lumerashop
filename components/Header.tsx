'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { NavItem } from '@/types/site';
import { useCart } from '@/context/CartContext';
import { useNavigation } from '@/context/NavigationContext';
import { getRenderableAssetPath } from '@/lib/local-assets';
import HeaderSearchForm from '@/components/header/HeaderSearchForm';
import { Menu, X, ChevronDown, ArrowRight, Phone, Mail, Facebook, Instagram, Tag } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

const MENU_ARROW_DOWN_BG =
  'url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTYgMTYiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHBhdGggZmlsbD0iIzgwODA4MCIgZD0iTTIuMSw1LjJMMi4xLDUuMmMwLjMtMC4zLDAuOC0wLjMsMS4xLDBMOCwxMC4zbDQuNy01QzEzLDUsMTMuNSw1LDEzLjksNS4zbDAsMGMwLjMsMC4zLDAuMSwwLjctMC4yLDENCglsLTUsNS40Yy0wLjMsMC4zLTAuOCwwLjMtMS4xLDBMMi40LDYuNEMyLjEsNi4xLDEuOCw1LjUsMi4xLDUuMnoiLz4NCjwvc3ZnPg0K)';

const formatPrice = (value: number) => `${value.toLocaleString('cs-CZ')} Kč`;

const HOME_MENU_ITEM: NavItem = { label: 'Domů', href: '/' };

const STATIC_PAGE_ITEMS: NavItem[] = [
  { label: 'O obchodě', href: '/o-nas' },
  { label: 'Blog', href: '/blog' },
  { label: 'Kontakt', href: '/kontakt' },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMiniCartCouponOpen, setIsMiniCartCouponOpen] = useState(false);
  const { cartItems, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const { menuItems } = useNavigation();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const desktopMenuItems = [HOME_MENU_ITEM, ...menuItems, ...STATIC_PAGE_ITEMS];
  const mobileMenuItems = [HOME_MENU_ITEM, ...menuItems, ...STATIC_PAGE_ITEMS];
  const hasCartItems = cartItems.length > 0;
  const vatAmount = Number((totalPrice * 0.21).toFixed(2));
  const hasFreeShipping = totalPrice >= 1500;

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
    if (latest > 20 && !scrolled) {
      setScrolled(true);
    } else if (latest <= 20 && scrolled) {
      setScrolled(false);
    }
  });

  useEffect(() => {
    const handleCartOpen = () => openCartDrawer();

    window.addEventListener('lumera:cart-open', handleCartOpen);

    return () => {
      window.removeEventListener('lumera:cart-open', handleCartOpen);
    };
  }, []);

  const renderDesktopChildren = (items: NavItem[], level = 1) => {
    const containerClass =
      level === 1
        ? 'invisible absolute left-0 top-full z-50 min-w-[220px] border border-[#e8d0ab] bg-[#C8A16A] opacity-0 shadow-[0_18px_40px_rgba(17,17,17,0.12)] transition-all duration-200 group-hover/top:visible group-hover/top:opacity-100'
        : 'invisible absolute left-full top-[-1px] z-50 ml-[1px] min-w-[220px] border border-[#e8d0ab] bg-[#B88E56] opacity-0 shadow-[0_18px_40px_rgba(17,17,17,0.12)] transition-all duration-200 group-hover/sub:visible group-hover/sub:opacity-100';

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

                {hasChildren ? renderDesktopChildren(item.children ?? [], level + 1) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMobileItems = (items: NavItem[], depth = 0) =>
    items.map((item) => {
      const itemKey = `${depth}:${item.href}`;
      const isExpanded = expandedItems.includes(itemKey);
      const hasChildren = Boolean(item.children?.length);
      const rowClass = depth === 0 ? 'py-[10px]' : depth === 1 ? 'py-[8px]' : 'py-[6px]';
      const linkClass =
        depth === 0
          ? 'flex-1 text-[22px] font-normal leading-[1.3] text-[#F2F2F2] transition-colors hover:text-[#c8a16a]'
          : depth === 1
            ? 'flex-1 text-[18px] font-light leading-[1.4] text-white/70 transition-colors hover:text-[#c8a16a]'
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleExpand(itemKey);
                }}
                className="flex h-10 w-12 items-center justify-end text-white/40 transition-colors hover:text-white"
              >
                <ChevronDown
                  size={20}
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

        {desktopMenuItems.length > 0 ? (
        <nav className="mx-auto hidden h-[53px] max-w-[1140px] px-4 md:block lg:px-0">
          <ul className="flex h-full items-center justify-center gap-[52px] font-sans text-[#111111]">
            {desktopMenuItems.map((item) => {
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

                {hasChildren ? renderDesktopChildren(item.children ?? []) : null}
              </li>
            )})}
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
                  <a href="https://wa.me/420606731316" className="flex items-center gap-3 text-[16px] font-normal text-[#F2F2F2] transition-colors hover:text-[#c8a16a]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white/60">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.284l-.582 2.126 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.766-5.764-5.766zm3.392 8.221c-.142-.072-.843-.416-.973-.463-.13-.047-.225-.072-.319.072-.095.143-.367.462-.449.546-.083.084-.131.096-.273.023-.142-.072-.601-.221-1.144-.705-.423-.377-.709-.842-.792-.985-.083-.143-.009-.22.063-.291.065-.064.142-.165.213-.248.071-.083.095-.143.142-.238.047-.095.024-.179-.012-.25-.036-.071-.314-.757-.43-.104-.113-.034-.234-.142-.32-.271z" opacity=".2" />
                      <path d="M19.057 4.93C17.18 3.053 14.688 2 12.033 2 6.633 2 2.245 6.39 2.243 11.79c0 1.727.451 3.412 1.308 4.899L2 22l5.33-1.4c1.426.776 3.033 1.185 4.673 1.187h.004c5.399 0 9.789-4.39 9.791-9.79 0-2.617-1.017-5.077-2.895-6.957zm-7.024 14.75h-.003c-1.528 0-3.027-.41-4.336-1.186l-.311-.184-3.221.845.859-3.137-.203-.322c-.852-1.355-1.301-2.922-1.301-4.533 0-4.647 3.781-8.428 8.432-8.428 2.25 0 4.366.877 5.959 2.472s2.47 3.709 2.47 5.958c-.001 4.648-3.784 8.427-8.431 8.427zm4.629-6.319c-.253-.127-1.5-.741-1.732-.826-.233-.085-.403-.127-.572.127-.169.254-.656.826-.804.995-.148.169-.296.19-.549.063-.254-.127-1.072-.395-2.042-1.26-.754-.672-1.263-1.503-1.411-1.757-.148-.254-.016-.392.111-.518.114-.114.254-.296.381-.444.127-.148.17-.254.254-.423.085-.169.042-.317-.021-.444-.063-.127-.572-1.376-.783-1.884-.206-.411-.43-.45-.572-.45h-.486c-.169 0-.444.063-.677.317s-.89.868-.89 2.114 1.545 2.455 1.757 2.751c.212.296 3.041 4.643 7.365 6.513.844.364 1.574.625 2.112.796.848.269 1.621.231 2.232.131.681-.111 2.063-.844 2.353-1.659.29-.815.29-1.513.203-1.659-.088-.146-.324-.229-.623-.356z" />
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="mt-auto flex gap-6 px-[30px] pt-10">
                  <a href="#" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white transition-all hover:border-[#c8a16a] hover:text-[#c8a16a]">
                    <Facebook size={24} />
                  </a>
                  <a href="#" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white transition-all hover:border-[#c8a16a] hover:text-[#c8a16a]">
                    <Instagram size={24} />
                  </a>
                  <a href="#" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white transition-all hover:border-[#c8a16a] hover:text-[#c8a16a]">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.47-.15-.1-.3-.21-.45-.32-.01 1.03-.02 2.06-.03 3.09 0 .59-.04 1.18-.12 1.77-.14 1.11-.46 2.19-1.04 3.16-.9 1.58-2.43 2.87-4.18 3.48-1.74.61-3.69.69-5.48.24-1.7-.44-3.23-1.52-4.27-2.92-1.04-1.4-1.56-3.15-1.51-4.89.06-1.74.65-3.46 1.75-4.8 1.11-1.36 2.7-2.31 4.45-2.65 1.48-.28 3.02-.19 4.45.27.01 1.43.01 2.86.02 4.29-.86-.41-1.84-.57-2.79-.44-.95.12-1.87.58-2.5 1.3-.63.72-.94 1.7-.86 2.65.07.95.53 1.84 1.25 2.47.72.63 1.7.94 2.65.86.95-.07 1.84-.53 2.47-1.25.13-.15.25-.3.35-.46.3-.53.44-1.13.43-1.74-.01-4.96-.02-9.92-.03-14.88z" />
                    </svg>
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
                <div className="flex h-[72px] shrink-0 items-center justify-between px-6">
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
                  <div className="flex-1 overflow-y-auto px-6 pb-5">
                    <div className="space-y-1">
                      {cartItems.map((item) => (
                        <article
                          key={item.id}
                          className="grid grid-cols-[64px_minmax(0,1fr)_68px] items-start gap-4 border-b border-[#111]/8 py-4 last:border-b-0"
                        >
                          <div className="relative h-[72px] w-[64px] shrink-0 overflow-hidden rounded-[12px] border border-[#111]/6 bg-[#f7f6f3]">
                            <Image
                              src={getRenderableAssetPath(item.image)}
                              alt={item.name}
                              fill
                              className="object-contain p-2"
                            />
                          </div>

                          <div className="min-w-0">
                            <Link
                              href={item.slug ? `/product/${item.slug}` : '/cart'}
                              onClick={closeCartDrawer}
                              className="block text-[11px] font-semibold uppercase leading-5 tracking-[0.04em] text-[#111111] transition-colors hover:text-[#b98743]"
                            >
                              {item.name}
                            </Link>

                            <div className="mt-3 inline-flex items-center rounded-[10px] bg-[#f3f3f3] p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[18px] leading-none text-[#b0aba4] transition-colors hover:bg-white hover:text-[#111111]"
                              >
                                -
                              </button>
                              <input
                                type="text"
                                value={item.quantity}
                                readOnly
                                className="w-8 bg-transparent text-center text-[12px] font-semibold text-[#111111] focus:outline-none"
                              />
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[18px] leading-none text-[#b0aba4] transition-colors hover:bg-white hover:text-[#111111]"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex min-h-[72px] flex-col items-end justify-between">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ef4444] text-white transition-colors hover:bg-[#dc2626]"
                              aria-label={`Odstranit ${item.name}`}
                            >
                              <X size={13} />
                            </button>

                            <p className="text-[14px] font-semibold leading-none text-[#111111]">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
                    <div className="inline-flex h-12 w-16 items-center justify-center rounded-[16px] bg-[#111111] text-white shadow-[0_16px_32px_rgba(17,17,17,0.12)]">
                      <svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M6.55 13.0581L9.225 21.4481C9.425 22.0456 9.95 22.444 10.575 22.444H20.9C21.5 22.444 22.075 22.0705 22.275 21.5228L26.225 10.9917H28.5C29.05 10.9917 29.5 10.5436 29.5 9.99585C29.5 9.44813 29.05 9 28.5 9H25.525C25.1 9 24.725 9.27386 24.575 9.6722L20.5 20.4523H11L8.875 13.7303H20.65C21.2 13.7303 21.65 13.2822 21.65 12.7344C21.65 12.1867 21.2 11.7386 20.65 11.7386H7.5C7.175 11.7386 6.875 11.9129 6.7 12.1618C6.5 12.4108 6.45 12.7593 6.55 13.0581Z" />
                      </svg>
                    </div>
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d7b64]">
                      {'Zatím prázdné'}
                    </p>
                    <h3 className="mt-3 font-serif text-[28px] leading-none text-[#111111]">
                      {'Košík čeká na výběr.'}
                    </h3>
                    <p className="mt-3 max-w-[260px] text-[13px] leading-6 text-[#6b6257]">
                      {'Podívejte se do obchodu a přidejte si první produkt.'}
                    </p>
                  </div>
                )}

                <div className="shrink-0 border-t border-[#111]/8 bg-[#f8f6f3] px-6 py-5">
                  {hasCartItems ? (
                    <>
                      <div className="rounded-[14px] border border-dashed border-[#111]/12 bg-white px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setIsMiniCartCouponOpen((open) => !open)}
                          className="flex w-full items-center justify-between gap-3"
                          aria-expanded={isMiniCartCouponOpen}
                          aria-controls="mini-cart-coupon-field"
                        >
                          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f665a]">
                            <Tag size={14} />
                            {'Máte slevový kód?'}
                          </span>
                          <ChevronDown
                            size={15}
                            className={`text-[#a39a8e] transition-transform ${isMiniCartCouponOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {isMiniCartCouponOpen ? (
                          <div id="mini-cart-coupon-field" className="mt-3 flex items-center gap-2">
                            <input
                              type="text"
                              placeholder={'Vložte kód'}
                              className="h-10 min-w-0 flex-1 rounded-[10px] border border-[#111]/10 bg-[#fbfaf8] px-3 text-[13px] text-[#111111] outline-none transition-colors placeholder:text-[#a39a8e] focus:border-[#c79200]"
                            />
                            <button
                              type="button"
                              className="inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] bg-[#111111] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c79200]"
                            >
                              {'Použít'}
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-5 grid grid-cols-3 divide-x divide-[#111]/8">
                        <div className="pr-3 text-left">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f665a]">
                            {'Zboží'}
                          </p>
                          <p className="mt-1 text-[16px] font-semibold leading-none text-[#111111]">
                            {formatPrice(totalPrice)}
                          </p>
                        </div>
                        <div className="px-3 text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f665a]">
                            Doprava
                          </p>
                          <p className={`mt-1 text-[16px] font-semibold leading-none ${hasFreeShipping ? 'text-[#16a34a]' : 'text-[#111111]'}`}>
                            {hasFreeShipping ? 'Zdarma' : 'Dle volby'}
                          </p>
                        </div>
                        <div className="pl-3 text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f665a]">
                            DPH
                          </p>
                          <p className="mt-1 text-[16px] font-semibold leading-none text-[#a5a09a]">
                            {formatPrice(vatAmount)}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/cart"
                        onClick={closeCartDrawer}
                        className="mt-5 flex h-[44px] w-full items-center justify-center gap-2 rounded-[16px] border border-[#111]/10 bg-white text-[11px] font-semibold uppercase tracking-[0.14em] text-[#111111] transition-colors hover:border-[#b98743] hover:text-[#b98743]"
                      >
                        {'Do košíku'} <ArrowRight size={16} />
                      </Link>

                      <Link
                        href="/checkout"
                        onClick={closeCartDrawer}
                        className="mt-2.5 flex h-[56px] w-full items-center justify-between rounded-[18px] bg-[#c79200] px-6 text-white transition-colors hover:bg-[#af8100]"
                      >
                        <span className="text-[14px] font-semibold uppercase tracking-[0.12em]">
                          {'K pokladně'}
                        </span>
                        <span className="mx-4 h-6 w-px bg-white/25" />
                        <span className="inline-flex items-center gap-3 text-[14px] font-semibold">
                          {formatPrice(totalPrice)}
                          <ArrowRight size={18} />
                        </span>
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/shop"
                      onClick={closeCartDrawer}
                      className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#111111] text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#b98743]"
                    >
                      Do obchodu <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
