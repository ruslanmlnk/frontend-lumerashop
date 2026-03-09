import Link from 'next/link';
import LazyAutoplayVideo from './LazyAutoplayVideo';

const AboutSection = () => {
    return (
        <section className="bg-white overflow-hidden flex justify-center py-12 md:py-20" id="about-lumera">
            <div className="max-w-[1140px] mx-auto px-4 lg:px-0">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Left Column: Text */}
                    <div className="w-full lg:w-1/2 flex flex-col">
                        <h2
                            className="text-[32px] md:text-[42px] lg:text-[48px] font-serif font-normal mb-8 text-[#111111] leading-[1.1]"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            O obchodě Lumera
                        </h2>
                        <div className="space-y-6 text-[#111111] text-[16px] md:text-[18px] font-normal leading-relaxed opacity-90" style={{ fontFamily: '"Work Sans", sans-serif' }}>
                            <p>
                                Lumera je český obchod s italskými koženými kabelkami a doplňky.
                            </p>
                            <p>
                                Spolupracujeme s menšími výrobci z Itálie, kteří si zakládají na kvalitě a ručním zpracování. Každý model pečlivě vybíráme tak, aby spojoval eleganci, praktičnost a originalitu. Věříme, že krása je v detailu – stejně jako v každé kabelce, kterou nabízíme.
                            </p>
                        </div>
                        <div className="mt-10">
                            <Link
                                href="/o-nas"
                                className="inline-block bg-[#111111] text-white px-10 py-4 uppercase tracking-[0.2em] text-[13px] font-bold hover:bg-[#c8a16a] transition-all duration-300"
                            >
                                Zjistit více o obchodě
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Video */}
                    <div className="w-full lg:w-1/2 relative min-h-[300px] md:min-h-[450px]">
                        <div className="w-full h-full relative overflow-hidden rounded-sm shadow-xl shadow-black/5">
                            <LazyAutoplayVideo
                                src="/assets/videos/about.mp4"
                                className="w-full h-full object-cover"
                                placeholderClassName="h-full w-full bg-[#f6f3ef]"
                                posterSrc="/assets/bg/about-hero.webp"
                                posterClassName="object-cover"
                                posterSizes="(min-width: 1024px) 570px, 100vw"
                                preload="metadata"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
