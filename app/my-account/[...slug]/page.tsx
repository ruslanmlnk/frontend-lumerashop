import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import ProfileLayout from '@/components/profile/ProfileLayout';
import Orders from '@/components/profile/Orders';
import Downloads from '@/components/profile/Downloads';
import Addresses from '@/components/profile/Addresses';
import AccountDetails from '@/components/profile/AccountDetails';
import Bonuses from '@/components/profile/Bonuses';
import { getCurrentUser } from '@/lib/auth';
import { fetchLoyaltySettings } from '@/lib/payments/checkout-benefits';

type ParamsShape = {
  slug?: string[];
};

type PageProps = {
  params: ParamsShape | Promise<ParamsShape>;
};

export default async function MyAccountSubPage({ params }: PageProps) {
  const [user, loyaltySettings] = await Promise.all([getCurrentUser(), fetchLoyaltySettings()]);
  if (!user) {
    redirect('/my-account');
  }

  const resolvedParams = await Promise.resolve(params);
  const section = resolvedParams.slug?.[0] || '';

  let content: ReactNode = <div className="text-[16px] text-gray-600">Sekce nenalezena.</div>;

  switch (section) {
    case 'orders':
      content = <Orders showBonusProgram={loyaltySettings.bonusesEnabled} />;
      break;
    case 'bonuses':
      content = <Bonuses user={user} loyaltySettings={loyaltySettings} />;
      break;
    case 'downloads':
      content = <Downloads />;
      break;
    case 'edit-address':
      content = <Addresses user={user} />;
      break;
    case 'edit-account':
      content = <AccountDetails user={user} />;
      break;
    default:
      content = <div className="text-[16px] text-gray-600">Sekce nenalezena.</div>;
  }

  return <ProfileLayout activeSection={section}>{content}</ProfileLayout>;
}
