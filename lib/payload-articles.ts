import 'server-only';
import {
    DEFAULT_LOCAL_ASSET_FALLBACK,
    getLocalAssetPath,
    getPayloadMediaProxyPath,
    getRenderableAssetPath,
} from '@/lib/local-assets';
import { renderLexicalToHTML } from '@/lib/payload-richtext';
import type { BlogPost } from '@/types/site';

const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001';
const PAYLOAD_ARTICLES_REVALIDATE_SECONDS = 300;

type PayloadMediaDoc = {
    url?: unknown;
};

type PayloadArticleDoc = {
    slug?: unknown;
    title?: unknown;
    mainImage?: PayloadMediaDoc | number | null;
    description?: unknown;
    content?: unknown;
    updatedAt?: unknown;
};

type PayloadListResponse<T> = {
    docs?: T[];
};

const resolveUrl = (value: unknown, baseUrl: string): string => {
    if (typeof value !== 'string' || value.length === 0) {
        return DEFAULT_LOCAL_ASSET_FALLBACK;
    }

    const normalizedValue = getLocalAssetPath(value);
    if (!normalizedValue) {
        return DEFAULT_LOCAL_ASSET_FALLBACK;
    }

    if (normalizedValue.startsWith('/assets/')) {
        return normalizedValue;
    }

    if (normalizedValue.startsWith('http://') || normalizedValue.startsWith('https://')) {
        if (normalizedValue.startsWith(baseUrl)) {
            return getPayloadMediaProxyPath(normalizedValue);
        }
        return getRenderableAssetPath(normalizedValue, DEFAULT_LOCAL_ASSET_FALLBACK);
    }

    if (normalizedValue.startsWith('/')) {
        return getPayloadMediaProxyPath(`${baseUrl}${normalizedValue}`);
    }

    return getPayloadMediaProxyPath(`${baseUrl}/${normalizedValue}`);
};

const resolveArticleImage = (doc: PayloadArticleDoc, baseUrl: string): string => {
    if (typeof doc.mainImage === 'object' && doc.mainImage) {
        const url = resolveUrl(doc.mainImage.url, baseUrl);
        return url !== DEFAULT_LOCAL_ASSET_FALLBACK ? url : DEFAULT_LOCAL_ASSET_FALLBACK;
    }
    return DEFAULT_LOCAL_ASSET_FALLBACK;
};

const mapPayloadArticle = (doc: PayloadArticleDoc, baseUrl: string): BlogPost | null => {
    const title = typeof doc.title === 'string' ? doc.title.trim() : '';
    const slug = typeof doc.slug === 'string' ? doc.slug.trim() : '';

    if (!title || !slug) {
        return null;
    }

    const excerpt = typeof doc.description === 'string' ? doc.description : '';
    const image = resolveArticleImage(doc, baseUrl);

    let contentHtml = '';
    if (doc.content) {
        contentHtml = renderLexicalToHTML(doc.content);
    }

    let date = 'Nedatováno';
    if (typeof doc.updatedAt === 'string') {
        const d = new Date(doc.updatedAt);
        if (!isNaN(d.getTime())) {
            date = d.toLocaleDateString('cs-CZ', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }

    return {
        title,
        slug,
        excerpt,
        image,
        content: contentHtml,
        date
    };
};

export async function fetchPayloadArticles(): Promise<BlogPost[]> {
    const baseUrlRaw = process.env.PAYLOAD_API_URL?.trim() || DEFAULT_PAYLOAD_API_URL;
    const baseUrl = baseUrlRaw.replace(/\/+$/, '');

    try {
        const response = await fetch(`${baseUrl}/api/article?limit=100&sort=-updatedAt`, {
            next: { revalidate: PAYLOAD_ARTICLES_REVALIDATE_SECONDS },
        });

        if (!response.ok) {
            return [];
        }

        const payload = (await response.json()) as PayloadListResponse<PayloadArticleDoc>;
        const docs = Array.isArray(payload.docs) ? payload.docs : [];
        const mapped = docs
            .map((doc) => mapPayloadArticle(doc, baseUrl))
            .filter((post): post is BlogPost => Boolean(post));

        return mapped;
    } catch {
        return [];
    }
}
