import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t-[0.8px] border-[#808080] pt-12 pb-8">
            <div className="max-w-[1140px] mx-auto px-4 lg:px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-[#111111]">
                    {/* Brand Column */}
                    <div className="flex flex-col">
                        <div className="relative w-[180px] h-[120px] mb-6">
                            <Image
                                src="/assets/logo-new.webp"
                                alt="LVR LUMERA"
                                fill
                                className="object-contain object-left"
                            />
                        </div>
                        <p className="text-gray-600 text-[15px] leading-relaxed font-sans max-w-[280px]">
                            LumeraShop.cz – prémiový svět italské módy, kožených kabelek і doplňků pro ty, kteří hledají kvalitu.
                        </p>
                    </div>

                    {/* Shop Column */}
                    <div>
                        <h3 className="text-[18px] font-serif font-medium mb-8 uppercase tracking-wide" style={{ fontFamily: '"Cormorant Garamond", serif' }}>Nákup</h3>
                        <ul className="space-y-3.5 text-[16px] text-[#111111] font-sans">
                            <li><Link href="/doprava-a-platba" className="hover:text-[#c8a16a] transition-colors underline-offset-4">Doprava a platba</Link></li>
                            <li><Link href="/reklamace-a-vraceni" className="hover:text-[#c8a16a] transition-colors underline-offset-4">Reklamace a vrácení</Link></li>
                            <li><Link href="/obchodni-podminky" className="hover:text-[#c8a16a] transition-colors underline-offset-4">Obchodní podmínky</Link></li>
                            <li><Link href="/ochrana-osobnich-udaju" className="hover:text-[#c8a16a] transition-colors underline-offset-4">Ochrana osobních údajů</Link></li>
                            <li><Link href="/cookies" className="hover:text-[#c8a16a] transition-colors underline-offset-4">Cookies</Link></li>
                        </ul>
                    </div>

                    {/* Payment & Shipping Column */}
                    <div>
                        <h3 className="text-[18px] font-serif font-medium mb-8 uppercase tracking-wide" style={{ fontFamily: '"Cormorant Garamond", serif' }}>Platby & Doprava</h3>
                        <div className="grid grid-cols-2 gap-3 max-w-[220px]">
                            {/* Mastercard */}
                            <div className="h-[45px] relative border border-gray-100 flex items-center justify-center bg-gray-50/30">
                                <Image src="/assets/icons/mastercard.png" alt="MasterCard" width={50} height={30} className="object-contain" />
                            </div>
                            {/* Visa */}
                            <div className="h-[45px] relative border border-gray-100 flex items-center justify-center bg-gray-50/30">
                                <Image src="/assets/icons/visa.png" alt="VISA" width={50} height={30} className="object-contain" />
                            </div>
                            {/* Apple Pay */}
                            <div className="h-[45px] relative border border-gray-100 flex items-center justify-center bg-gray-50/30">
                                <Image src="/assets/icons/apple-pay.png" alt="Apple Pay" width={50} height={30} className="object-contain" />
                            </div>
                            {/* Google Pay */}
                            <div className="h-[45px] relative border border-gray-100 flex items-center justify-center bg-gray-50/30">
                                <Image src="/assets/icons/google-pay.png" alt="Google Pay" width={50} height={30} className="object-contain" />
                            </div>
                            {/* PPL */}
                            <div className="h-[45px] relative border border-gray-100 flex items-center justify-center bg-gray-50/30 p-1">
                                <Image src="/assets/icons/ppl.png" alt="PPL" width={60} height={30} className="object-contain" />
                            </div>
                            {/* Zásilkovna */}
                            <div className="h-[45px] relative border border-gray-100 flex items-center justify-center bg-gray-50/30 p-1">
                                <Image src="/assets/icons/zasilkovna.png" alt="Zásilkovna" width={60} height={30} className="object-contain" />
                            </div>
                        </div>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="text-[18px] font-serif font-medium mb-8 uppercase tracking-wide" style={{ fontFamily: '"Cormorant Garamond", serif' }}>Kontakt</h3>
                        <ul className="space-y-4 text-[16px] text-[#111111] font-sans">
                            <li className="flex items-center gap-3">
                                <Image src="/assets/icons/footer-phone.png" alt="Phone" width={18} height={18} className="object-contain" />
                                <a href="tel:+420606731316" className="hover:text-[#c8a16a] transition-colors font-medium">+420 606 731 316</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Image src="/assets/icons/footer-email.png" alt="Email" width={18} height={18} className="object-contain" />
                                <a href="mailto:info@lumerashop.cz" className="hover:text-[#c8a16a] transition-colors font-medium">info@lumerashop.cz</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Image src="/assets/icons/footer-whatsapp.png" alt="WhatsApp" width={18} height={18} className="object-contain" />
                                <a href="https://wa.me/420606731316" className="hover:text-[#c8a16a] transition-colors font-medium">WhatsApp</a>
                            </li>
                            <li className="flex items-start gap-3">
                                <Image src="/assets/icons/footer-location.png" alt="Address" width={18} height={18} className="object-contain mt-1 shrink-0" />
                                <span className="text-gray-600 leading-tight">Lisabonská 2394, 190 00 Praha</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-[13px] text-gray-500">
                    <div className="mb-4 md:mb-0 italic">
                        Copyright © 2025 LumeraShop.cz | Všechna práva vyhrazena
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="https://facebook.com/lumerashop.cz" className="w-[30px] h-[30px] rounded-full bg-[#111111] text-white flex items-center justify-center hover:bg-[#c8a16a] transition-colors">
                            <Facebook size={14} />
                        </Link>
                        <Link href="https://instagram.com/lumerashop.cz" className="w-[30px] h-[30px] rounded-full bg-[#111111] text-white flex items-center justify-center hover:bg-[#c8a16a] transition-colors">
                            <Instagram size={14} />
                        </Link>
                    </div>
                </div>

                {/* Credits */}
                <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-300 gap-4 font-light">
                    <p>Tvorba webových stránek Taras Snitynskyi</p>
                    <p>Agentura digitálního marketingu Whowhere.online</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
