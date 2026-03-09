import Link from 'next/link';
import Image from 'next/image';

const CTASection = () => {
    return (
        <section className="bg-white py-12 md:py-20" id="cta-section">
            <div className="max-w-[1140px] mx-auto px-4 lg:px-0">
                <div className="relative h-[300px] md:h-[450px] flex flex-col justify-center px-10 md:px-20 lg:px-24 overflow-hidden rounded-sm shadow-2xl shadow-black/10">
                    {/* Background image logic */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/assets/bg/cta-home.webp"
                            alt="Objevte Lumera"
                            fill
                            className="object-cover object-center saturate-[0.8] brightness-[0.6]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-2xl">
                        <h2
                            className="text-[34px] md:text-[50px] lg:text-[62px] font-serif font-bold text-white mb-6 leading-[1.05] tracking-tight drop-shadow-md"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            Objevte eleganci<br className="hidden md:block" /> s italskou kůží
                        </h2>
                        <p
                            className="text-[16px] md:text-[20px] lg:text-[22px] font-normal text-white/90 mb-10 leading-relaxed font-sans max-w-lg drop-shadow-sm"
                            style={{ fontFamily: '"Work Sans", sans-serif' }}
                        >
                            Prémiové kabelky a doplňky, které podtrhnou váš styl. Každý kousek s láskou vybraný v Itálii.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link
                                href="/shop"
                                className="inline-flex items-center justify-center bg-white text-[#111111] px-12 py-4 uppercase tracking-[0.2em] text-[13px] font-bold hover:bg-[#c8a16a] hover:text-white transition-all duration-500 shadow-xl"
                            >
                                Prohlédnout kolekci
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
