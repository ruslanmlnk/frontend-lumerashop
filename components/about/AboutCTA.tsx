'use client';
import Image from 'next/image';
import Link from 'next/link';

const AboutCTA = () => {
    return (
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
            <Image
                src="/assets/about/cta.webp"
                alt="Objevte Lumera"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 max-w-[800px] mx-auto px-4 text-center text-white">
                <h2
                    className="text-[42px] md:text-[56px] font-serif font-bold mb-8 leading-tight drop-shadow-lg"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                    Přidejte se k skupině žen, které vědí, že styl je i volba.
                </h2>
                <Link
                    href="/shop"
                    className="inline-block px-12 py-5 bg-white text-black text-[14px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all shadow-2xl"
                >
                    Prohlédnout kolekci
                </Link>
            </div>
        </section>
    );
};

export default AboutCTA;
