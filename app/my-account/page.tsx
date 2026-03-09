import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import LoginForm from '@/components/profile/LoginForm';
import RegisterForm from '@/components/profile/RegisterForm';
import ProfileLayout from '@/components/profile/ProfileLayout';
import { getCurrentUser } from '@/lib/auth';
import type { AuthUser } from '@/lib/payload-auth';

function getDisplayName(user: AuthUser): string {
  if (user.firstName) {
    return user.firstName;
  }

  if (user.name) {
    return user.name;
  }

  return user.email;
}

export default async function MyAccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen font-sans text-[#111111] bg-white">
        <Header />
        <main>
          <CatalogHeader title="Muj ucet" breadcrumbs={[{ label: 'Muj ucet' }]} />

          <div className="max-w-[1140px] mx-auto px-4 lg:px-0 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <LoginForm />
              <RegisterForm />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = getDisplayName(user);

  return (
    <ProfileLayout activeSection="dashboard">
      <div className="space-y-6">
        <p className="text-[16px] leading-relaxed text-gray-700">
          Dobry den, <span className="font-bold text-black">{displayName}</span> (nejste {displayName}?{' '}
          <Link href="/my-account/logout" className="text-[#E1B12C] hover:underline">
            Odhlasit se
          </Link>
          )
        </p>

        <p className="text-[16px] leading-relaxed text-gray-700">
          Na nastence sveho uctu muzete prohlednout sve{' '}
          <Link href="/my-account/orders" className="text-[#E1B12C] hover:underline">
            nedavne objednavky
          </Link>
          , upravit{' '}
          <Link href="/my-account/edit-address" className="text-[#E1B12C] hover:underline">
            fakturacni a dorucovaci adresy
          </Link>{' '}
          a zmenit sve{' '}
          <Link href="/my-account/edit-account" className="text-[#E1B12C] hover:underline">
            heslo a osobni informace
          </Link>
          .
        </p>
      </div>
    </ProfileLayout>
  );
}

