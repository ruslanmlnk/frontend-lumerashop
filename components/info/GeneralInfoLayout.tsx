'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface GeneralInfoLayoutProps {
    title: string;
    children: React.ReactNode;
    heroImageUrl?: string | null;
}

const GeneralInfoLayout = ({ title, children, heroImageUrl }: GeneralInfoLayoutProps) => {
    const heroBackgroundImage = heroImageUrl
        ? `linear-gradient(rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.38)), url("${heroImageUrl.replaceAll('"', '\\"')}")`
        : 'linear-gradient(rgba(17, 17, 17, 0.58), rgba(17, 17, 17, 0.58))';

    return (
        <div className="min-h-screen font-sans text-[#111111] bg-white">
            <Header />

            <main>
                <section className="mx-auto max-w-[1140px] px-4 lg:px-0">
                    <div
                        className="relative flex min-h-[180px] items-center justify-center overflow-hidden md:min-h-[220px]"
                        style={{
                            backgroundImage: heroBackgroundImage,
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                        }}
                    >
                        <h1
                            className="px-6 text-center font-serif text-[42px] font-bold leading-none text-white md:text-[64px]"
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
