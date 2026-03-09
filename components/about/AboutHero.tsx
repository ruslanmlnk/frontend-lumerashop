'use client';
import Image from 'next/image';

interface AboutHeroProps {
    title: string;
    subtitle: string;
    bgImage: string;
}

const AboutHero = ({ title, subtitle, bgImage }: AboutHeroProps) => {
    return (
        <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
            <Image
                src={bgImage}
                alt={title}
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 max-w-[900px] mx-auto px-4 text-center text-white">
                <h1
                    className="text-[48px] md:text-[64px] font-serif font-bold mb-6 leading-tight"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                    {title}
                </h1>
                <p className="text-[18px] md:text-[22px] font-light italic opacity-90 leading-relaxed">
                    {subtitle}
                </p>
            </div>
        </section>
    );
};

export default AboutHero;
