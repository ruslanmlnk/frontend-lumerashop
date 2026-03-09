import CheckoutPage from '@/components/checkout/CheckoutPage';
import { fetchPayloadShippingMethods } from '@/lib/payload-shipping-methods';

export default async function CheckoutRoute() {
    const shippingMethods = await fetchPayloadShippingMethods();

    return <CheckoutPage variant="minimal" shippingMethods={shippingMethods} />;
}
