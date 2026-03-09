import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white font-sans text-[#111111]">
            <Header />
            {children}
            <Footer />
        </div>
    );
}
