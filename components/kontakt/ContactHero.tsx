'use client';
import Image from 'next/image';

interface ContactHeroProps {
    title: string;
    bgImage: string;
}

const ContactHero = ({ title, bgImage }: ContactHeroProps) => {
    return (
        <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
            <Image
                src={bgImage}
                alt={title}
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 text-center">
                <h1
                    className="text-[60px] md:text-[80px] font-serif font-bold text-white leading-tight"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                    {title}
                </h1>
            </div>
        </section>
    );
};

export default ContactHero;
