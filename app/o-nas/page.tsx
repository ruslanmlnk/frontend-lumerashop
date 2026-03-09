import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutHero from '@/components/about/AboutHero';
import OurJourney from '@/components/about/OurJourney';
import AboutStats from '@/components/about/AboutStats';
import AboutValues from '@/components/about/AboutValues';
import AboutCTA from '@/components/about/AboutCTA';

export default function AboutPage() {
    return (
        <div className="min-h-screen font-sans text-[#111111] bg-white">
            <Header />

            <main>
                <AboutHero
                    title="O obchodě Lumera"
                    subtitle="Nadčasová elegance a poctivé italské řemeslo u vás doma."
                    bgImage="/assets/bg/about-hero.webp"
                />

                <OurJourney />

                <AboutStats />

                <AboutValues />

                <AboutCTA />
            </main>

            <Footer />
        </div>
    );
}
