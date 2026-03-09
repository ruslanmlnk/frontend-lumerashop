'use client';
import Image from 'next/image';

const AboutValues = () => {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-[1140px] mx-auto px-4 lg:px-0">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    <div className="w-full lg:w-1/3 relative aspect-[3/4] shadow-xl">
                        <Image
                            src="/assets/about/values.jpg"
                            alt="Naše hodnoty"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="w-full lg:w-2/3">
                        <h2
                            className="text-[42px] font-serif font-bold text-[#111111] mb-8 leading-tight"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            Naše hodnoty
                        </h2>
                        <div className="space-y-6 text-[17px] text-gray-500 leading-relaxed font-light">
                            <p>
                                Věříme v nadčasovost, přírodní materiály a jednoduchý design, který hovoří sám za sebe. Vážnost pro životní prostředí a fér podmínky výroby jsou pro nás samozřejmostí.
                            </p>
                            <p>
                                U nás nekupujete jen kabelku — vybíráte styl, kvalitu a smysl věcí. Naším cílem je, aby vám produkty Lumera dělaly radost po mnoho let a staly se nedílnou součástí vašeho šatníku.
                            </p>
                            <div className="pt-8 grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-black font-bold uppercase text-[13px] tracking-widest mb-3">Materiály</h4>
                                    <p className="text-[14px]">Výhradně pravá italská kůže prvotřídní kvality.</p>
                                </div>
                                <div>
                                    <h4 className="text-black font-bold uppercase text-[13px] tracking-widest mb-3">Design</h4>
                                    <p className="text-[14px]">Nadčasové střihy, které nepodléhají krátkodobým trendům.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutValues;
