'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { DEFAULT_MARKETING_SLIDES, type MarketingSlide } from '@/data/marketing-slides';
import { getLocalAssetPath } from '@/lib/local-assets';

interface MarketingSliderProps {
    slides?: MarketingSlide[];
}

const slideVariants: Variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 1,
        zIndex: 1,
    }),
    center: {
        x: 0,
        opacity: 1,
        zIndex: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? '-100%' : '100%',
        opacity: 1,
        zIndex: 0,
    }),
};

const getContentVariants = (enterX: number, centerDelay: number, exitDuration: number = 0.5): Variants => ({
    enter: {
        opacity: 0,
        x: enterX,
    },
    center: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 1.0,
            delay: centerDelay,
            ease: [0.33, 1, 0.68, 1],
        },
    },
    exit: {
        opacity: 0,
        x: enterX,
        transition: {
            duration: exitDuration,
            ease: 'easeIn',
        },
    },
});

const MarketingSlider = ({ slides }: MarketingSliderProps) => {
    const sliderSlides = useMemo(
        () =>
            (slides && slides.length > 0 ? slides : DEFAULT_MARKETING_SLIDES).map((slide) => ({
                ...slide,
                bg: getLocalAssetPath(slide.bg) ?? slide.bg,
                overlayImage: getLocalAssetPath(slide.overlayImage) ?? slide.overlayImage,
            })),
        [slides],
    );
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isInitialSlideReady, setIsInitialSlideReady] = useState(false);
    const autoplayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const slideCount = sliderSlides.length;
    const activeIndex = current % slideCount;

    const clearAutoplay = useCallback(() => {
        if (autoplayTimeoutRef.current !== null) {
            clearTimeout(autoplayTimeoutRef.current);
            autoplayTimeoutRef.current = null;
        }
    }, []);

    const advanceToNextSlide = useCallback(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slideCount);
    }, [slideCount]);

    const scheduleAutoplay = useCallback(() => {
        clearAutoplay();

        if (slideCount <= 1) {
            return;
        }

        autoplayTimeoutRef.current = setTimeout(() => {
            advanceToNextSlide();
        }, 7000);
    }, [advanceToNextSlide, clearAutoplay, slideCount]);

    const paginate = (newDirection: number) => {
        clearAutoplay();
        setDirection(newDirection);
        setCurrent((prev) => (prev + newDirection + slideCount) % slideCount);
    };

    useEffect(() => {
        scheduleAutoplay();

        return clearAutoplay;
    }, [clearAutoplay, current, scheduleAutoplay]);

    const goToSlide = (nextIndex: number) => {
        clearAutoplay();

        if (nextIndex === activeIndex) {
            scheduleAutoplay();
            return;
        }

        setDirection(nextIndex > activeIndex ? 1 : -1);
        setCurrent(nextIndex);
    };

    return (
        <section className="hidden lg:block bg-white overflow-hidden py-0" id="block-4">
            <div className="lumera-container">
                <div className="relative h-[380px] md:h-[644px] overflow-hidden bg-[#dcc7b9]">
                    {!isInitialSlideReady && (
                        <div
                            className="absolute inset-0 z-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url(${sliderSlides[0].bg})`,
                            }}
                        />
                    )}

                    {/* Slides Container */}
                    <div className="relative h-full w-full">
                        <AnimatePresence custom={direction} initial={false}>
                            <motion.div
                                key={current}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "tween", duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }
                                }}
                                className="absolute inset-0 w-full h-full"
                            >
                                {/* Background Image */}
                                <Image
                                    src={sliderSlides[activeIndex].bg}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    priority={activeIndex === 0}
                                    sizes="(min-width: 1024px) 1140px, 100vw"
                                    onLoad={() => {
                                        if (activeIndex === 0) {
                                            setIsInitialSlideReady(true);
                                        }
                                    }}
                                />
                                {/* Overlay Shading */}
                                <div className="absolute inset-0 bg-black/25" />

                                {/* Content Layout */}
                                <div className="absolute inset-x-0 inset-y-0 w-full max-w-[1140px] mx-auto px-6 md:px-[50px] z-10 flex flex-col justify-center lg:block">
                                    <div
                                        className="text-left text-white relative flex flex-col w-full lg:w-[60%] z-20"
                                        style={{
                                            marginTop: `${sliderSlides[activeIndex].layout.paddingTop}px`,
                                            textShadow: '0 2px 10px rgba(0,0,0,0.2)' // Subtle shadow for readability without darkening the image
                                        }}
                                    >
                                        <motion.h2
                                            variants={getContentVariants(-200, 1.0)}
                                            className="text-[34px] md:text-[48px] font-serif font-bold leading-[1.1] mb-5"
                                            style={{
                                                fontFamily: '"Cormorant Garamond", serif',
                                                maxWidth: `${sliderSlides[activeIndex].layout.titleMaxWidth}px`
                                            }}
                                        >
                                            {sliderSlides[activeIndex].title}
                                        </motion.h2>
                                        <motion.p
                                            variants={getContentVariants(-200, 1.2)}
                                            className="text-[14px] md:text-[16px] font-sans font-normal leading-[1.6] mb-8"
                                            style={{
                                                fontFamily: '"Work Sans", sans-serif',
                                                maxWidth: `${sliderSlides[activeIndex].layout.descMaxWidth}px`
                                            }}
                                        >
                                            {sliderSlides[activeIndex].description}
                                        </motion.p>
                                        <motion.div
                                            variants={getContentVariants(-200, 1.4)}
                                        >
                                            <Link
                                                href={sliderSlides[activeIndex].link}
                                                className="lumera-btn lumera-btn--light w-fit shadow-lg shadow-black/10"
                                            >
                                                {sliderSlides[activeIndex].button}
                                            </Link>
                                        </motion.div>
                                    </div>

                                    {/* Right Overlay Image */}
                                    <div className="hidden lg:block">
                                        <motion.div
                                            variants={getContentVariants(300, 0.8, 0.7)}
                                            className="absolute z-10"
                                            style={{
                                                width: `${sliderSlides[activeIndex].layout.img.w}px`,
                                                height: `${sliderSlides[activeIndex].layout.img.h}px`,
                                                top: `${sliderSlides[activeIndex].layout.img.top}px`,
                                                right: `${sliderSlides[activeIndex].layout.img.right}px`
                                            }}
                                        >
                                            <Image
                                                src={sliderSlides[activeIndex].overlayImage}
                                                alt=""
                                                fill
                                                className="object-contain"
                                                priority={activeIndex === 0}
                                                sizes="(min-width: 1024px) 343px, 0px"
                                            />
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>





                        {/* Custom Navigation Arrows */}
                        <button
                            onClick={() => paginate(-1)}
                            className="absolute left-2 md:left-[10px] top-1/2 -translate-y-1/2 z-20 w-[32px] h-[32px] md:w-[36px] md:h-[36px] rounded-full border-[1.6px] border-white/50 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-all group"
                            aria-label="Previous"
                        >
                            <svg className="w-4 h-4 md:w-[18px] md:h-[18px] fill-current" viewBox="0 0 477.175 477.175">
                                <path d="M145.188,238.575l215.5-215.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0l-225.1,225.1c-5.3,5.3-5.3,13.8,0,19.1l225.1,225
                            c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L145.188,238.575z"></path>
                            </svg>
                        </button>
                        <button
                            onClick={() => paginate(1)}
                            className="absolute right-2 md:right-[10px] top-1/2 -translate-y-1/2 z-20 w-[32px] h-[32px] md:w-[36px] md:h-[36px] rounded-full border-[1.6px] border-white/50 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-all group"
                            aria-label="Next"
                        >
                            <svg className="w-4 h-4 md:w-[18px] md:h-[18px] fill-current" viewBox="0 0 477.175 477.175">
                                <path d="M360.731,229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1,0s-5.3,13.8,0,19.1l215.5,215.5l-215.5,215.5
                            c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-4l225.1-225.1C365.931,242.875,365.931,234.275,360.731,229.075z"></path>
                            </svg>
                        </button>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-4 md:bottom-[10px] left-1/2 -translate-x-1/2 flex gap-[6px] z-20">
                            {sliderSlides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => goToSlide(idx)}
                                    className={`w-[10px] h-[10px] rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MarketingSlider;

