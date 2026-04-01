import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-[#e8dfd5] bg-white pt-14 pb-8 md:pt-16 md:pb-10">
            <div className="mx-auto max-w-[1140px] px-4 lg:px-0">
                <div className="grid grid-cols-1 gap-12 text-[#111111] md:grid-cols-2 lg:grid-cols-[1.25fr_0.95fr_1fr_1.1fr] lg:gap-14">
                    <div className="flex flex-col">
                        <div className="relative mb-5 h-[112px] w-[180px] md:h-[96.64px] md:w-[144.98px]">
                            <Image
                                src="/assets/logo-new.webp"
                                alt="LVR Lumera"
                                fill
                                sizes="196px"
                                className="object-contain object-left"
                            />
                        </div>

                        <p className="max-w-[285px] text-[14px] leading-[1.65] text-[#111111]">
                            LumeraShop.cz – Prémiové kožené kabelky, peněženky a doplňky přímo z Itálie.
                        </p>
                    </div>

                    <div>
                        <h3
                            className="mb-3 font-serif text-[18px] font-bold leading-none text-[#111111]"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            Nákup   
                        </h3>

                        <ul className="space-y-1.5 text-[14px] leading-[1.55] text-[#4c4c4c]">
                            <li>
                                <Link href="/doprava-a-platba" className="transition-colors hover:text-[#c8a16a]">
                                    Doprava a platba
                                </Link>
                            </li>
                            <li>
                                <Link href="/reklamace-a-vraceni" className="transition-colors hover:text-[#c8a16a]">
                                    Reklamace a vrácení
                                </Link>
                            </li>
                            <li>
                                <Link href="/obchodni-podminky" className="transition-colors hover:text-[#c8a16a]">
                                    Obchodní podmínky
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/ochrana-osobnich-udaju"
                                    className="transition-colors hover:text-[#c8a16a]"
                                >
                                    Ochrana osobních údajů
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="transition-colors hover:text-[#c8a16a]">
                                    Cookies
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3
                            className="mb-5 font-serif text-[18px] font-bold leading-none text-[#111111]"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            Platby & Doprava
                        </h3>

                        <div className="grid max-w-[198px] grid-cols-2 gap-x-4 gap-y-5">
                            <div className="flex h-[30.98] items-center justify-center border border-[#eee6db] bg-white shadow-[0_2px_10px_rgba(17,17,17,0.05)]">
                                <Image src="/assets/icons/mastercard.png" alt="Mastercard" width={53} height={23} className="object-contain" />
                            </div>
                            <div className="flex h-[30.98] items-center justify-center border border-[#eee6db] bg-white shadow-[0_2px_10px_rgba(17,17,17,0.05)]">
                                <Image src="/assets/icons/visa.png" alt="Visa" width={56} height={22} className="object-contain" />
                            </div>
                            <div className="flex h-[30.98] items-center justify-center border border-[#eee6db] bg-white shadow-[0_2px_10px_rgba(17,17,17,0.05)]">
                                <Image src="/assets/icons/apple-pay.png" alt="Apple Pay" width={58} height={22} className="object-contain" />
                            </div>
                            <div className="flex h-[30.98] items-center justify-center border border-[#eee6db] bg-white shadow-[0_2px_10px_rgba(17,17,17,0.05)]">
                                <Image src="/assets/icons/google-pay.png" alt="Google Pay" width={58} height={22} className="object-contain" />
                            </div>
                            <div className="flex h-[30.98] items-center justify-center border border-[#eee6db] bg-white px-1 shadow-[0_2px_10px_rgba(17,17,17,0.05)]">
                                <Image src="/assets/icons/ppl.png" alt="PPL" width={62} height={22} className="object-contain" />
                            </div>
                            <div className="flex h-[30.98] items-center justify-center border border-[#eee6db] bg-white px-1 shadow-[0_2px_10px_rgba(17,17,17,0.05)]">
                                <Image src="/assets/icons/zasilkovna.png" alt="Zasilkovna" width={64} height={20} className="object-contain" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3
                            className="mb-3 font-serif text-[18px] font-bold leading-none text-[#111111]"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            Kontakt
                        </h3>

                        <ul className="space-y-4 text-[15px] leading-[1.5] text-[#6c625d]">
                            <li className="flex items-center gap-2.5">
                                <Image src="/assets/icons/footer-phone.png" alt="Phone" width={17} height={17} className="object-contain" />
                                <a href="tel:+420606731316" className="transition-colors hover:text-[#c8a16a]">
                                    +420 606 731 316
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Image src="/assets/icons/footer-email.png" alt="Email" width={17} height={17} className="object-contain" />
                                <a href="mailto:info@lumerashop.cz" className="transition-colors hover:text-[#c8a16a]">
                                    info@lumerashop.cz
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Image src="/assets/icons/footer-whatsapp.png" alt="WhatsApp" width={17} height={17} className="object-contain" />
                                <a href="https://wa.me/420606731316" className="transition-colors hover:text-[#c8a16a]">
                                    WhatsApp
                                </a>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <Image
                                    src="/assets/icons/footer-location.png"
                                    alt="Address"
                                    width={17}
                                    height={17}
                                    className="mt-0.5 object-contain shrink-0"
                                />
                                <span>Lisabonska 2394, 190 00 Praha</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 flex flex-col gap-6 text-[14px] leading-[1.5] text-[#3f3530] md:mt-24">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <p>Copyright © 2025 LumeraShop.cz | Vsechna prava vyhrazena</p>

                        <div className="flex items-center gap-12 md:gap-6">
                            <Link
                                href="https://facebook.com/lumerashop.cz"
                                className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#4a3c37] text-white transition-colors hover:bg-[#c8a16a]"
                            >
                                <Facebook size={16} />
                            </Link>
                            <Link
                                href="https://instagram.com/lumerashop.cz"
                                className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#4a3c37] text-white transition-colors hover:bg-[#c8a16a]"
                            >
                                <Instagram size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 text-[15px] text-[#7a6f67] md:flex-row md:items-center md:justify-between">
                        <p>Tvorba webovych stranek Taras Snitynskyi</p>
                        <p>Agentura digitalniho marketingu Whowhere.online</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
