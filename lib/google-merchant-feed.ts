import 'server-only';

import { unstable_cache } from 'next/cache';

import type { Product } from '../types/site';
import {
    DEFAULT_LOCAL_ASSET_FALLBACK,
    getLocalAssetPath,
    getRenderablePayloadMediaPath,
} from './local-assets';
import { appendPayloadSelectParams, type PayloadSelect } from './payload-select';
import { getSiteUrl, toAbsoluteSiteUrl } from './site-url';

type PayloadListResponse<T> = {
    docs?: T[];
};

type PayloadMediaDoc = {
    url?: unknown;
};

type PayloadGalleryItem = {
    imageUrl?: unknown;
    image?: PayloadMediaDoc | number | null;
};

export type PayloadFeedProductDoc = {
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    price?: unknown;
    oldPrice?: unknown;
    sku?: unknown;
    description?: unknown;
    shortDescription?: unknown;
    stockQuantity?: unknown;
    deliveryTime?: unknown;
    imageUrl?: unknown;
    mainImage?: PayloadMediaDoc | number | null;
    gallery?: PayloadGalleryItem[] | null;
    category?:
        | {
              name?: unknown;
          }
        | number
        | null;
};

const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001';
const DEFAULT_BRAND = 'Lumera';
export const MERCHANT_FEED_REVALIDATE_SECONDS = 3600;
const merchantFeedPriceFormatter = new Intl.NumberFormat('cs-CZ');

const FEED_PRODUCT_SELECT: PayloadSelect = {
    id: true,
    name: true,
    slug: true,
    price: true,
    oldPrice: true,
    sku: true,
    description: true,
    shortDescription: true,
    stockQuantity: true,
    deliveryTime: true,
    mainImage: {
        url: true,
    },
    gallery: {
        image: {
            url: true,
        },
    },
    category: {
        name: true,
    },
};

export const getPayloadApiUrl = () =>
    (process.env.PAYLOAD_API_URL?.trim() || DEFAULT_PAYLOAD_API_URL).replace(/\/+$/, '');

const normalizeText = (value: string | undefined) =>
    (value || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const escapeXml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const toGoogleAvailability = (product: Product) =>
    (product.stockQuantity ?? 0) > 0 || (product.deliveryTime && product.deliveryTime > 0) ? 'in stock' : 'out of stock';

const toGooglePrice = (value: string) => {
    const numeric = Number(value.replace(/\s+/g, '').replace(',', '.').replace(/[^\d.]/g, ''));
    const safe = Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
    return `${safe.toFixed(2)} CZK`;
};

const toNumericPrice = (value: string | undefined) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return 0;
    }

    const numeric = Number(value.replace(/\s+/g, '').replace(',', '.').replace(/[^\d.]/g, ''));
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
};

const resolvePayloadAssetUrl = (value: unknown, baseUrl: string): string | null => {
    if (typeof value !== 'string' || value.length === 0) {
        return null;
    }

    const normalized = getLocalAssetPath(value);
    if (!normalized) {
        return null;
    }

    if (normalized.startsWith('/assets/')) {
        return normalized;
    }

    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
        if (normalized.startsWith(baseUrl)) {
            return getRenderablePayloadMediaPath(normalized, baseUrl);
        }

        return normalized;
    }

    if (normalized.startsWith('/')) {
        return getRenderablePayloadMediaPath(normalized, baseUrl);
    }

    return getRenderablePayloadMediaPath(normalized, baseUrl);
};

const resolvePayloadGallery = (gallery: PayloadGalleryItem[] | null | undefined, baseUrl: string): string[] => {
    if (!Array.isArray(gallery)) {
        return [];
    }

    return gallery
        .map((item) => {
            const uploaded =
                typeof item?.image === 'object' && item.image ? resolvePayloadAssetUrl(item.image.url, baseUrl) : null;
            const linked = resolvePayloadAssetUrl(item?.imageUrl, baseUrl);
            return uploaded || linked;
        })
        .filter((value): value is string => Boolean(value));
};

const resolvePrimaryImage = (doc: PayloadFeedProductDoc, baseUrl: string) => {
    const mainUploadUrl =
        typeof doc.mainImage === 'object' && doc.mainImage ? resolvePayloadAssetUrl(doc.mainImage.url, baseUrl) : null;
    const imageUrl = resolvePayloadAssetUrl(doc.imageUrl, baseUrl);
    const galleryImage = resolvePayloadGallery(doc.gallery, baseUrl)[0];

    return mainUploadUrl || imageUrl || galleryImage || DEFAULT_LOCAL_ASSET_FALLBACK;
};

export const mapPayloadFeedProduct = (doc: PayloadFeedProductDoc, baseUrl: string): Product | null => {
    const id = doc.id != null ? String(doc.id) : '';
    const name = typeof doc.name === 'string' ? doc.name.trim() : '';
    const slug = typeof doc.slug === 'string' ? doc.slug.trim() : '';

    if (!id || !name || !slug) {
        return null;
    }

    const numericPrice = typeof doc.price === 'number' ? doc.price : Number(doc.price);
    const safePrice = Number.isFinite(numericPrice) ? numericPrice : 0;
    const category =
        typeof doc.category === 'object' && doc.category && typeof doc.category.name === 'string'
            ? doc.category.name
            : 'Uncategorized';

    return {
        id,
        name,
        slug,
        image: resolvePrimaryImage(doc, baseUrl),
        price: `${merchantFeedPriceFormatter.format(Math.max(0, Math.round(safePrice)))} Kc`,
        oldPrice:
            (() => {
                const numericOldPrice = typeof doc.oldPrice === 'number' ? doc.oldPrice : Number(doc.oldPrice);
                return Number.isFinite(numericOldPrice) && numericOldPrice > 0
                    ? `${merchantFeedPriceFormatter.format(Math.max(0, Math.round(numericOldPrice)))} Kc`
                    : undefined;
            })(),
        category,
        sku: typeof doc.sku === 'string' ? doc.sku : undefined,
        description: typeof doc.description === 'string' ? doc.description : undefined,
        shortDescription: typeof doc.shortDescription === 'string' ? doc.shortDescription : undefined,
        gallery: resolvePayloadGallery(doc.gallery, baseUrl),
        stockQuantity: typeof doc.stockQuantity === 'number' ? doc.stockQuantity : Number(doc.stockQuantity) || 0,
        deliveryTime: typeof doc.deliveryTime === 'number' ? doc.deliveryTime : Number(doc.deliveryTime) || undefined,
    };
};

export const mapPayloadFeedProducts = (docs: PayloadFeedProductDoc[], baseUrl: string) =>
    docs.map((doc) => mapPayloadFeedProduct(doc, baseUrl)).filter((product): product is Product => Boolean(product));

const fetchMerchantProducts = async (): Promise<Product[]> => {
    const payloadApiUrl = getPayloadApiUrl();
    const params = new URLSearchParams({
        'where[status][equals]': 'published',
        depth: '2',
        limit: '500',
        sort: '-updatedAt',
    });
    appendPayloadSelectParams(params, 'select', FEED_PRODUCT_SELECT);

    try {
        const response = await fetch(`${payloadApiUrl}/api/products?${params.toString()}`, {
            next: { revalidate: MERCHANT_FEED_REVALIDATE_SECONDS },
        });

        if (!response.ok) {
            return [];
        }

        const payload = (await response.json()) as PayloadListResponse<PayloadFeedProductDoc>;
        const docs = Array.isArray(payload.docs) ? payload.docs : [];
        const mapped = mapPayloadFeedProducts(docs, payloadApiUrl);

        return mapped;
    } catch {
        return [];
    }
};

const buildProductItemXml = (product: Product, siteUrl: string, populatedCategories: Set<string>) => {
    const descriptionSource = normalizeText(product.description || product.shortDescription || product.name);
    const description = descriptionSource || product.name;
    const category = typeof product.category === 'string' ? product.category.trim() : '';
    const productType = populatedCategories.has(category) ? category : '';
    const currentPrice = toNumericPrice(product.price);
    const compareAtPrice = toNumericPrice(product.oldPrice);
    const hasSalePrice = compareAtPrice > currentPrice && currentPrice > 0;
    const price = hasSalePrice ? product.oldPrice || product.price : product.price;
    const salePrice = hasSalePrice ? product.price : '';
    const gallery = Array.isArray(product.gallery) ? product.gallery.filter(Boolean) : [];
    const additionalImages = gallery
        .filter((image) => image !== product.image)
        .slice(0, 10)
        .map(
            (image) =>
                `    <g:additional_image_link>${escapeXml(toAbsoluteSiteUrl(image, siteUrl))}</g:additional_image_link>`,
        )
        .join('\n');
    const mpn = product.sku ? `    <g:mpn>${escapeXml(product.sku)}</g:mpn>` : '';

    return [
        '  <item>',
        `    <g:id>${escapeXml(String(product.id))}</g:id>`,
        `    <g:title>${escapeXml(product.name)}</g:title>`,
        `    <g:description>${escapeXml(description)}</g:description>`,
        `    <g:link>${escapeXml(`${siteUrl}/product/${product.slug}`)}</g:link>`,
        `    <g:image_link>${escapeXml(toAbsoluteSiteUrl(product.image, siteUrl))}</g:image_link>`,
        additionalImages,
        `    <g:availability>${toGoogleAvailability(product)}</g:availability>`,
        '    <g:condition>new</g:condition>',
        `    <g:price>${toGooglePrice(price)}</g:price>`,
        salePrice ? `    <g:sale_price>${toGooglePrice(salePrice)}</g:sale_price>` : '',
        `    <g:brand>${DEFAULT_BRAND}</g:brand>`,
        `    <g:identifier_exists>${product.sku ? 'yes' : 'no'}</g:identifier_exists>`,
        productType ? `    <g:product_type>${escapeXml(productType)}</g:product_type>` : '',
        mpn,
        '  </item>',
    ]
        .filter(Boolean)
        .join('\n');
};

export const buildGoogleMerchantXml = (products: Product[], siteUrl = getSiteUrl()) => {
    const feedProducts = products.filter(
        (product) =>
            Boolean(product.slug) &&
            Boolean(product.image) &&
            Boolean(product.name) &&
            typeof product.price === 'string' &&
            product.price.trim().length > 0,
    );

    // Feed is generated from actual products only, so empty categories are skipped automatically.
    const populatedCategories = new Set(
        feedProducts
            .map((product) => (typeof product.category === 'string' ? product.category.trim() : ''))
            .filter(Boolean),
    );

    const items = feedProducts.map((product) => buildProductItemXml(product, siteUrl, populatedCategories)).join('\n');

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
        '  <channel>',
        `    <title>${escapeXml(DEFAULT_BRAND)}</title>`,
        `    <link>${escapeXml(siteUrl)}</link>`,
        `    <description>${escapeXml('Google Merchant feed for Lumera')}</description>`,
        items,
        '  </channel>',
        '</rss>',
        '',
    ].join('\n');
};

const getCachedGoogleMerchantXml = unstable_cache(
    async (siteUrl: string) => {
        const products = await fetchMerchantProducts();
        return buildGoogleMerchantXml(products, siteUrl);
    },
    ['google-merchant-xml'],
    { revalidate: MERCHANT_FEED_REVALIDATE_SECONDS },
);

export const generateGoogleMerchantXml = async (siteUrl = getSiteUrl()) => {
    return getCachedGoogleMerchantXml(siteUrl);
};

export const generateFreshGoogleMerchantXml = async (siteUrl = getSiteUrl()) => {
    const products = await fetchMerchantProducts();
    return buildGoogleMerchantXml(products, siteUrl);
};
