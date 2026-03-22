import 'server-only';
import {
    DEFAULT_LOCAL_ASSET_FALLBACK,
    getRenderablePayloadMediaPath,
    getLocalAssetPath,
    getRenderableAssetPath,
} from '@/lib/local-assets';
import { appendPayloadSelectParams, type PayloadSelect } from '@/lib/payload-select';
import { renderLexicalToHTML } from '@/lib/payload-richtext';
import type { BlogPost } from '@/types/site';

const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001';
const PAYLOAD_ARTICLES_REVALIDATE_SECONDS = 300;
const payloadArticleDateFormatter = new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const ARTICLE_LIST_SELECT: PayloadSelect = {
    slug: true,
    title: true,
    mainImage: {
        url: true,
    },
    description: true,
    updatedAt: true,
};

const ARTICLE_DETAIL_SELECT: PayloadSelect = {
    ...ARTICLE_LIST_SELECT,
    content: true,
};

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

type FetchPayloadArticlesOptions = {
    includeContent?: boolean;
    limit?: number;
    slug?: string;
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
            return getRenderablePayloadMediaPath(normalizedValue, baseUrl);
        }
        return getRenderableAssetPath(normalizedValue, DEFAULT_LOCAL_ASSET_FALLBACK);
    }

    if (normalizedValue.startsWith('/')) {
        return getRenderablePayloadMediaPath(normalizedValue, baseUrl);
    }

    return getRenderablePayloadMediaPath(normalizedValue, baseUrl);
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
            date = payloadArticleDateFormatter.format(d);
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

export async function fetchPayloadArticles(options: FetchPayloadArticlesOptions = {}): Promise<BlogPost[]> {
    const baseUrlRaw = process.env.PAYLOAD_API_URL?.trim() || DEFAULT_PAYLOAD_API_URL;
    const baseUrl = baseUrlRaw.replace(/\/+$/, '');
    const params = new URLSearchParams({
        limit: String(options.limit ?? 100),
        sort: '-updatedAt',
    });

    if (options.slug) {
        params.set('where[slug][equals]', options.slug);
    }

    appendPayloadSelectParams(
        params,
        'select',
        options.includeContent ? ARTICLE_DETAIL_SELECT : ARTICLE_LIST_SELECT,
    );

    try {
        const response = await fetch(`${baseUrl}/api/article?${params.toString()}`, {
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
