'use client';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface GeneralInfoLayoutProps {
    title: string;
    children: React.ReactNode;
    heroImageUrl?: string | null;
}

const GeneralInfoLayout = ({ title, children, heroImageUrl }: GeneralInfoLayoutProps) => {
    return (
        <div className="min-h-screen font-sans text-[#111111] bg-white">
            <Header />

            <main>
                <section className="mx-auto max-w-[1140px] px-4 lg:px-0">
                    <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden md:min-h-[220px]">
                        {/* Background Layer */}
                        {heroImageUrl ? (
                            <>
                                <Image
                                    src={heroImageUrl}
                                    alt={title}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40" />
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-[#111111]/60" />
                        )}

                        {/* Content Layer */}
                        <h1
                            className="relative z-10 px-6 text-center font-serif text-[42px] font-bold leading-none text-white md:text-[64px]"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            {title}
                        </h1>
                    </div>
                </section>

                <div className="mx-auto max-w-[1140px] px-4 py-7 md:py-8 lg:px-0">
                    <div className="lumera-info-content">
                        {children}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default GeneralInfoLayout;
