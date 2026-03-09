'use client';
import Image from 'next/image';

const OurJourney = () => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-[1140px] mx-auto px-4 lg:px-0">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    <div className="w-full lg:w-1/2">
                        <h2
                            className="text-[42px] font-serif font-bold text-[#111111] mb-8 leading-tight"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            Naše cesta
                        </h2>
                        <div className="space-y-6 text-[17px] text-gray-500 leading-relaxed font-light">
                            <p>
                                V roce 2025 jsme založili Lumera s jasnou vizí – vytvořit online obchod, který přinese českým ženám autentické italské kožené kabelky, peněženky a doplňky.
                            </p>
                            <p>
                                Spolupracujeme s italskými výrobci založenými na kvalitě a řemeslné výrobě. Každý model v našem sortimentu je pečlivě vybraný — klademe důraz na styl, trvanlivost a nadčasovost.
                            </p>
                            <p>
                                Věříme, že pravá krása spočívá v autenticitě a poctivém řemesle. Proto pro vás vybíráme jen to nejlepší z italských dílen.
                            </p>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 relative aspect-[4/3] shadow-2xl">
                        <Image
                            src="/assets/about/our-journey.webp"
                            alt="Naše cesta"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OurJourney;
