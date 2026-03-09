import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactHero from '@/components/kontakt/ContactHero';
import ContactInfo from '@/components/kontakt/ContactInfo';
import ContactForm from '@/components/kontakt/ContactForm';

export default function KontaktPage() {
    return (
        <div className="min-h-screen font-sans text-[#111111] bg-white">
            <Header />

            <main>
                <ContactHero
                    title="Kontakt"
                    bgImage="/assets/bg/contact-hero.webp"
                />

                <ContactInfo />

                <ContactForm />
            </main>

            <Footer />
        </div>
    );
}
