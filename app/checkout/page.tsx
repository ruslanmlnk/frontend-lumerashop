import CheckoutPage from '@/components/checkout/CheckoutPage';
import { getCurrentUser } from '@/lib/auth';
import { fetchLoyaltySettings } from '@/lib/payments/checkout-benefits';
import { fetchPayloadShippingMethods } from '@/lib/payload-shipping-methods';

export default async function CheckoutRoute() {
    const [shippingMethods, currentUser, loyaltySettings] = await Promise.all([
        fetchPayloadShippingMethods(),
        getCurrentUser(),
        fetchLoyaltySettings(),
    ]);

    return (
        <CheckoutPage
            variant="minimal"
            shippingMethods={shippingMethods}
            currentUser={currentUser}
            loyaltySettings={loyaltySettings}
        />
    );
}
