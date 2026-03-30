import 'server-only';

const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001';

export const getPayloadGlobalsBaseUrl = (): string =>
    (process.env.PAYLOAD_API_URL?.trim() || DEFAULT_PAYLOAD_API_URL).replace(/\/+$/, '');

export async function fetchPayloadGlobal<T = unknown>(slug: string): Promise<T | null> {
    const baseUrl = getPayloadGlobalsBaseUrl();

    try {
        const response = await fetch(`${baseUrl}/api/globals/${slug}?depth=1`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error(`Failed to fetch storefront global: ${slug}`);
            return null;
        }

        return (await response.json()) as T;
    } catch (error) {
        console.error(`Error fetching storefront global ${slug}:`, error);
        return null;
    }
}
