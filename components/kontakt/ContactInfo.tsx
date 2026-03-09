'use client';
import Image from 'next/image';

const ContactInfo = () => {
    const contactItems = [
        {
            icon: '/assets/contact/phone.png',
            label: 'Zavolejte nám',
            value: '+420 606 731 316',
            subValue: 'Po-Pá: 9:00-17:00'
        },
        {
            icon: '/assets/contact/email.png',
            label: 'Napište nám',
            value: 'info@lumerashop.cz',
            subValue: 'Odpovíme co nejdříve'
        },
        {
            icon: '/assets/contact/social.png',
            label: 'Sledujte nás',
            value: 'Lumera Shop',
            subValue: 'Instagram & Facebook'
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-[1140px] mx-auto px-4 lg:px-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {contactItems.map((item, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 relative mb-6">
                                <Image
                                    src={item.icon}
                                    alt={item.label}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#111111] mb-2">{item.label}</h3>
                            <p className="text-[20px] font-serif font-bold text-[#111111] mb-1" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                                {item.value}
                            </p>
                            <p className="text-[15px] text-gray-400">{item.subValue}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div>
                        <h2 className="text-[32px] font-serif font-bold mb-8 text-[#111111]" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                            Firemní údaje
                        </h2>
                        <div className="space-y-6 text-[16px] text-gray-500 leading-relaxed">
                            <p className="font-bold text-[#111111]">MAX & VLD s.r.o.</p>
                            <p>
                                IČO: 23254246<br />
                                DIČ: CZ23254246
                            </p>
                            <p>
                                Děčínská 552/1, Střížkov (Praha 8),<br />
                                180 00 Praha (Sídlo firmy)
                            </p>
                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="font-bold text-[#111111] mb-2">Výdejní místo:</h3>
                                <p>Lisabonská 2394, 190 00 Praha 9-Libeň</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px] w-full bg-gray-100 relative grayscale hover:grayscale-0 transition-all duration-700">
                        {/* Embedded Google Maps Placeholder */}
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2558.914282381223!2d14.4925763!3d50.106488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470bec0d3b664319%3A0x6bba52a831e5f8f5!2sLisabonsk%C3%A1%202394%2C%20190%2000%20Praha%209-Libe%C5%88!5e0!3m2!1scs!2scz!4v1700000000000!5m2!1scs!2scz"
                            className="w-full h-full border-0"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactInfo;
