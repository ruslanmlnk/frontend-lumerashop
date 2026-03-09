'use client';
import { useState } from 'react';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        consent: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Děkujeme za vaši zprávu. Budeme vás kontaktovat co nejdříve.');
    };

    return (
        <section className="py-24 bg-[#f9f9f9]">
            <div className="max-w-[800px] mx-auto px-4 text-center">
                <h2
                    className="text-[42px] font-serif font-bold mb-4 text-[#111111]"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                    Napište nám
                </h2>
                <p className="text-gray-500 mb-12 italic">
                    Máte dotaz k produktu nebo objednávce? Neváhejte nás kontaktovat prostřednictvím formuláře níže.
                </p>

                <form onSubmit={handleSubmit} className="text-left space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[13px] font-bold uppercase tracking-wider text-[#111111] mb-2">
                                Jméno
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-5 py-4 bg-white border border-gray-200 outline-none focus:border-black transition-colors"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold uppercase tracking-wider text-[#111111] mb-2">
                                E-mailová adresa *
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-5 py-4 bg-white border border-gray-200 outline-none focus:border-black transition-colors"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[13px] font-bold uppercase tracking-wider text-[#111111] mb-2">
                            Zpráva *
                        </label>
                        <textarea
                            required
                            rows={6}
                            className="w-full px-5 py-4 bg-white border border-gray-200 outline-none focus:border-black transition-colors resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="consent"
                            required
                            className="mt-1.5 w-4 h-4 accent-black cursor-pointer"
                            checked={formData.consent}
                            onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                        />
                        <label htmlFor="consent" className="text-[14px] text-gray-500 leading-relaxed cursor-pointer">
                            Souhlasím se zpracováním osobních údajů pro účely zpracování mého dotazu. *
                        </label>
                    </div>

                    <div className="text-center pt-6">
                        <button
                            type="submit"
                            className="px-16 py-5 bg-black text-white text-[14px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-lg"
                        >
                            Odeslat zprávu
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
