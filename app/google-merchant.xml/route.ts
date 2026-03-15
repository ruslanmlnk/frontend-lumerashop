import { generateGoogleMerchantXml } from '@/lib/google-merchant-feed';

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function GET() {
    const xml = await generateGoogleMerchantXml();

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
