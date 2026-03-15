import 'server-only';

const PAYLOAD_REVALIDATE_SECONDS = 300;

export async function getGlobal(slug: string) {
    const baseUrl = process.env.PAYLOAD_API_URL || 'http://127.0.0.1:3001';

    try {
        const res = await fetch(`${baseUrl}/api/globals/${slug}?depth=1`, {
            next: { revalidate: PAYLOAD_REVALIDATE_SECONDS },
        });

        if (!res.ok) {
            console.error(`Failed to fetch global: ${slug}`);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error(`Error fetching global ${slug}:`, error);
        return null;
    }
}
