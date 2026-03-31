import { fetchFirstPurchasePromo } from '@/lib/first-purchase-promo';
import type { AuthUser } from '@/lib/payload-auth';
import type { LoyaltySettings } from '@/lib/payments/checkout-benefits';

interface BonusesProps {
    user: AuthUser;
    loyaltySettings: LoyaltySettings;
}

export default async function Bonuses({ user, loyaltySettings }: BonusesProps) {
    const firstPurchasePromo = await fetchFirstPurchasePromo();

    const bonusBalance = user.bonusBalance ?? 0;
    const firstPurchaseUsed = user.firstPurchaseDiscountUsed ?? false;
    const discountAmount = firstPurchasePromo.amount;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-[24px] font-semibold text-[#111111] mb-4">Bonusy</h2>

                {/* Current Bonus Balance - only show if bonuses are enabled */}
                {loyaltySettings.bonusesEnabled && (
                    <div className="rounded-[18px] border border-[#111111]/10 bg-white p-6 shadow-sm">
                        <h3 className="text-[18px] font-semibold text-[#111111] mb-2">Aktuální zůstatek bonusů</h3>
                        <p className="text-[16px] text-[#6b6257]">{bonusBalance} bonusů</p>
                    </div>
                )}
            </div>

            {/* First Purchase Bonus */}
            <div className="rounded-[18px] border border-[#111111]/10 bg-white p-6 shadow-sm">
                <h3 className="text-[18px] font-semibold text-[#111111] mb-2">Bonus na první nákup</h3>
                <p className="text-[16px] text-[#6b6257] mb-4">
                    Získejte slevu {discountAmount} Kč na svůj první nákup.
                </p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    firstPurchaseUsed
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-green-100 text-green-700'
                }`}>
                    <span>{firstPurchaseUsed ? 'Použito' : 'Aktivní'}</span>
                </div>
            </div>
        </div>
    );
}