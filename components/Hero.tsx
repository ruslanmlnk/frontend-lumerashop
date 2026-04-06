'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';

import { HERO_CATEGORIES } from '../data/site-data';

type CSSVars = CSSProperties & Record<`--${string}`, string>;

const Hero = () => {
    const [isVideoReady, setIsVideoReady] = useState(false);

    return (
        <section
            className="relative overflow-hidden bg-white pt-0 pb-0 md:mt-1"
            id="block-12"
        >
            <div className="lumera-container">
                <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-6">
                    <div className="relative h-[480px] w-full overflow-hidden bg-[#d9c2b2] group lg:h-[542px] lg:w-[810.2px]">
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/assets/bg/hero-slider-1.webp"
                                alt=""
                                fill
                                priority
                                sizes="(min-width: 1024px) 810px, 100vw"
                                className={`object-cover transition-opacity duration-500 ${isVideoReady ? 'opacity-0' : 'opacity-100'}`}
                            />
                            <video
                                src="/assets/videos/hero.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                className={`h-full w-full object-cover transition-opacity duration-500 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
                                style={{ willChange: 'transform' }}
                                onLoadedData={() => setIsVideoReady(true)}
                            />
                            <div className="absolute inset-0 bg-black/35" />
                        </div>

                        <div className="absolute inset-x-0 top-0 z-10 flex flex-col pt-[119px] pr-6 pl-6 text-white md:pl-[30px] md:pr-0 lg:pt-[47px]">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="w-full"
                            >
                                <h1
                                    className="font-serif text-[36px] leading-[1.1] text-white font-bold lg:mr-[210px] lg:text-[72px] md:ml-[10px]"
                                    style={{
                                        fontFamily: '"Cormorant Garamond", serif',
                                        textShadow: 'rgb(64, 64, 64) 0px 0px 8px',
                                    }}
                                >
                                    {'Elegantní kožené kabelky z Itálie'}
                                </h1>

                                <p
                                    className="mt-[34px] tracking-[0.5px] font-sans text-[16px] leading-[1.6] text-white font-light md:mt-[20px] lg:mr-[113px] md:max-w-[627px] md:leading-[25.6px] md:tracking-[0.4px] md:ml-[10px]"
                                    style={{ fontFamily: '"Work Sans", sans-serif' }}
                                >
                                    Objevte jedinečné modely od malých italských výrobců – kvalita, styl a originalita v každém detailu.
                                </p>

                                <div className="mt-[29px] md:mt-[39px]">
                                    <Link href="/shop" className="lumera-btn lumera-btn--light">
                                        {'Prohlédnout kolekci'}
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="flex h-auto w-full flex-col gap-6 lg:grid lg:h-[542px] lg:w-[305.8px] lg:grid-rows-[126.5fr_126.5fr_110fr_107fr] lg:gap-[24px]">
                        {HERO_CATEGORIES.map((cat, idx) => {
                            const mobileHeights = ['106px', '100px', '96px', '99px'];
                            const pcImgW = ['80px', '88px', '89px', '90px'];
                            const pcImgTop = ['18px', '18px', '14.5px', '35px'];
                            const pcImgRight = ['30px', '26px', '26px', '25px'];
                            const bgScales = ['115%', '115%', '130%', '110%'];
                            const bgPositions = ['100% 18.4%', '56.06% 54.68%', '100% 71.16%', '86.39% 0%'];

                            return (
                                <Link
                                    key={idx}
                                    href={cat.href}
                                    className="relative block h-[var(--h-m)] w-full overflow-hidden border-l border-white/5 bg-[#F5F5F5] group lg:h-full"
                                    style={{
                                        '--h-m': mobileHeights[idx],
                                    } as CSSVars}
                                >
                                    <div className="absolute inset-0 z-0 overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                                            style={{
                                                backgroundImage: `url(${cat.bg})`,
                                                backgroundPosition: bgPositions[idx],
                                                backgroundSize: bgScales[idx],
                                            }}
                                        />
                                    </div>

                                    <div className="pointer-events-none absolute inset-0 z-10">
                                        <h2
                                            className="absolute top-1/2 left-[60px] -translate-y-1/2 font-serif text-[24px] leading-[1.1] text-[#111111] whitespace-pre-line font-bold lg:text-[30px]"
                                            style={{
                                                fontFamily: '"Cormorant Garamond", serif',
                                            } as CSSVars}
                                        >
                                            <span className='md:hidden'>{cat.name}</span>
                                        
                                            <span className='hidden md:block'>{idx < 2 ? cat.name.replace(' ', '\n') : cat.name}</span>
                                        </h2>

                                        {cat.product && (
                                            <div
                                                className="absolute top-[var(--it-m)] right-[16px] h-[var(--hi-m)] w-[86px] transition-transform duration-700 group-hover:scale-110 lg:top-[var(--it-pc)] lg:right-[var(--ir-pc)] lg:h-[var(--hi-pc)] lg:w-[var(--w-pc)]"
                                                style={{
                                                    '--hi-m': ['86px', '79px', '77px', '47px'][idx],
                                                    '--hi-pc': ['80px', '80px', '80px', '50px'][idx],
                                                    '--ir-pc': pcImgRight[idx],
                                                    '--it-m': ['10.4px', '9.4px', '9px', '24px'][idx],
                                                    '--it-pc': pcImgTop[idx],
                                                    '--w-pc': pcImgW[idx],
                                                } as CSSVars}
                                            >
                                                <Image
                                                    src={cat.product}
                                                    alt={cat.name}
                                                    fill
                                                    sizes="90px"
                                                    className="object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
