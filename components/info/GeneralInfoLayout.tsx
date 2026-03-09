'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogHeader from '@/components/catalog/CatalogHeader';

interface GeneralInfoLayoutProps {
    title: string;
    children: React.ReactNode;
    breadcrumbs: { label: string; href?: string }[];
}

const GeneralInfoLayout = ({ title, children, breadcrumbs }: GeneralInfoLayoutProps) => {
    return (
        <div className="min-h-screen font-sans text-[#111111] bg-white">
            <Header />

            <main>
                <CatalogHeader title={title} breadcrumbs={breadcrumbs} />

                <div className="max-w-[800px] mx-auto px-4 py-20">
                    <div className="prose prose-neutral max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#111111] prose-p:text-gray-500 prose-p:leading-relaxed prose-li:text-gray-500">
                        {children}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default GeneralInfoLayout;
