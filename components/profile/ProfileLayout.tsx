'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileNavigation from './ProfileNavigation';
import CatalogHeader from '@/components/catalog/CatalogHeader';

interface ProfileLayoutProps {
    children: React.ReactNode;
    activeSection: string;
}

const ProfileLayout = ({ children, activeSection }: ProfileLayoutProps) => {
    return (
        <div className="min-h-screen font-sans text-[#111111] bg-white">
            <Header />

            <main>
                <CatalogHeader
                    title="Můj účet"
                    breadcrumbs={[{ label: 'Můj účet' }]}
                />

                <div className="max-w-[1140px] mx-auto px-4 lg:px-0 py-16" data-active-section={activeSection}>
                    <div className="flex flex-col lg:flex-row gap-12">
                        <ProfileNavigation />

                        <div className="flex-1 min-w-0">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProfileLayout;
