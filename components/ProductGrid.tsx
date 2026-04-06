'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Product } from '../types/site';
import ProductCard from './ProductCard';

type ProductGridProps = {
    title: string;
    products: Product[];
    description?: string;
    isSlider?: boolean;
    alignLeft?: boolean;
    variant?: 'default' | 'novinky';
    autoPlay?: boolean;
    arrowTheme?: 'default' | 'gold';
    cardVariant?: 'default' | 'featured';
    showShopButton?: boolean;
};

const ProductGrid = ({
    title,
    products,
    description,
    isSlider = false,
    alignLeft = false,
    variant = 'default',
    autoPlay = true,
    arrowTheme,
    cardVariant,
    showShopButton,
}: ProductGridProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleItems, setVisibleItems] = useState(4);
    const autoplayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isNovinky = variant === 'novinky';
    const resolvedArrowTheme = arrowTheme ?? (isNovinky ? 'gold' : 'default');
    const resolvedCardVariant = cardVariant ?? (isNovinky ? 'featured' : 'default');
    const shouldShowShopButton = showShopButton ?? !isNovinky;

    useEffect(() => {
        if (!isSlider) return;

        const updateVisibleItems = () => {
            const width = window.innerWidth;

            if (width < 640) {
                setVisibleItems(1);
                return;
            }

            if (width < 768) {
                setVisibleItems(2);
                return;
            }

            setVisibleItems(4);
        };

        updateVisibleItems();
        window.addEventListener('resize', updateVisibleItems);

        return () => window.removeEventListener('resize', updateVisibleItems);
    }, [isSlider]);

    const maxIndex = Math.max(0, products.length - visibleItems);
    const activeIndex = Math.min(currentIndex, maxIndex);

    const clearAutoplay = useCallback(() => {
        if (autoplayTimeoutRef.current !== null) {
            clearTimeout(autoplayTimeoutRef.current);
            autoplayTimeoutRef.current = null;
        }
    }, []);

    const advanceSlide = useCallback(() => {
        setCurrentIndex((prev) => {
            const boundedPrev = Math.min(prev, maxIndex);
            return boundedPrev < maxIndex ? boundedPrev + 1 : 0;
        });
    }, [maxIndex]);

    const nextSlide = useCallback(() => {
        clearAutoplay();
        setCurrentIndex((prev) => {
            const boundedPrev = Math.min(prev, maxIndex);
            return boundedPrev < maxIndex ? boundedPrev + 1 : 0;
        });
    }, [clearAutoplay, maxIndex]);

    const prevSlide = useCallback(() => {
        clearAutoplay();
        setCurrentIndex((prev) => {
            const boundedPrev = Math.min(prev, maxIndex);
            return boundedPrev > 0 ? boundedPrev - 1 : maxIndex;
        });
    }, [clearAutoplay, maxIndex]);

    useEffect(() => {
        if (!isSlider || !autoPlay || products.length <= visibleItems) {
            clearAutoplay();
            return;
        }

        autoplayTimeoutRef.current = setTimeout(() => {
            advanceSlide();
        }, 7000);

        return clearAutoplay;
    }, [activeIndex, advanceSlide, autoPlay, clearAutoplay, isSlider, products.length, visibleItems]);

    const gridHeader = (
        <div className={`mb-0 ${alignLeft ? 'text-left' : 'text-center'}`}>
            <h2
                className={`${isNovinky ? 'text-[36px] md:text-[48px]' : 'text-[30px] md:text-[36px]'} mb-0 font-serif font-bold leading-[1.1] text-[#111111]`}
                style={{ fontFamily: '"Cormorant Garamond", serif', marginTop: 0 }}
            >
                {title}
            </h2>
            {description && (
                <p
                    className={`mt-[20px] mb-0 text-base font-normal leading-[1.6] text-[#111111] max-w-[340px] md:max-w-full ${alignLeft ? '' : 'mx-auto'}`}
                    style={{ fontFamily: '"Work Sans", sans-serif' }}
                >
                    {/* ${isNovinky ? 'max-w-[720px]' : 'max-w-[578px]'} */}
                    {description}
                </p>
            )}
        </div>
    );

    const shopButton = shouldShowShopButton ? (
        <div className="mt-[17px] mb-[40px] text-center">
            <Link href="/shop" className="lumera-btn">
                {'Zobrazit celý obchod'}
            </Link>
        </div>
    ) : null;

    if (isSlider) {
        return (
            <section
                className={`${isNovinky ? 'pt-[35px] pb-[10px]' : 'pb-[41px] md:pb-15'} overflow-hidden bg-white text-center`}
                id="block-5"
            >
                <div className="lumera-container relative">
                    {gridHeader}

                    <div className={`group relative mt-[10px] mb-0`}>
                        <button
                            onClick={prevSlide}
                            className={`absolute top-1/2 left-[10px] z-20 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full text-white transition-all disabled:opacity-50 ${resolvedArrowTheme === 'gold' ? 'bg-[#E3A651]/70 hover:bg-[#E3A651]' : 'bg-black/50 hover:bg-black/70'}`}
                            aria-label="Previous"
                        >
                            <svg className="h-5 w-5 fill-current" viewBox="0 0 451.847 451.847">
                                <path d="M97.141,225.92c0-8.095,3.091-16.192,9.259-22.366L300.689,9.27c12.359-12.359,32.397-12.359,44.751,0 c12.354,12.354,12.354,32.388,0,44.748L173.525,225.92l171.903,171.909c12.354,12.354,12.354,32.391,0,44.744 c-12.354,12.365-32.386,12.365-44.745,0l-194.29-194.281C100.226,242.115,97.141,234.018,97.141,225.92z" />
                            </svg>
                        </button>

                        <button
                            onClick={nextSlide}
                            className={`absolute top-1/2 right-[10px] z-20 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full text-white transition-all disabled:opacity-50 ${resolvedArrowTheme === 'gold' ? 'bg-[#E3A651]/70 hover:bg-[#E3A651]' : 'bg-black/50 hover:bg-black/70'}`}
                            aria-label="Next"
                        >
                            <svg className="h-5 w-5 fill-current" viewBox="0 0 451.846 451.847">
                                <path d="M345.441,248.292L151.154,442.573c-12.359,12.365-32.397,12.365-44.75,0c-12.354-12.354-12.354-32.391,0-44.744 L278.318,225.92L106.409,54.017c-12.354-12.359-12.354-32.394,0-44.748c12.354-12.359,32.391-12.359,44.75,0l194.287,194.284 c6.177,6.18,9.262,14.271,9.262,22.366C354.708,234.018,351.617,242.115,345.441,248.292z" />
                            </svg>
                        </button>

                        <div className="overflow-hidden">
                            <motion.div
                                animate={{ x: `-${activeIndex * (100 / visibleItems)}%` }}
                                transition={{ type: 'tween', duration: 0.5, ease: 'easeInOut' }}
                                className="flex"
                            >
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className={`min-w-[100%] sm:min-w-[50%] md:min-w-[25%] ${resolvedCardVariant === 'featured' ? 'px-0' : 'px-[10px]'}`}
                                    >
                                        <ProductCard product={product} variant={resolvedCardVariant} />
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>

                    {shopButton}
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white py-12 text-center md:py-[43px]" id="block-5">
            <div className="lumera-container">
                {gridHeader}

                <div className="mt-[30px] mb-0 grid grid-cols-1 gap-[10px] sm:grid-cols-2 md:grid-cols-4">
                    {products.map((product) => (
                        <div key={product.id} className="px-[10px]">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                {shopButton}
            </div>
        </section>
    );
};

export default ProductGrid;
