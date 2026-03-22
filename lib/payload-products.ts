import 'server-only';

import {
    DEFAULT_LOCAL_ASSET_FALLBACK,
    getRenderablePayloadMediaPath,
    getLocalAssetPath,
    getRenderableAssetPath,
} from '@/lib/local-assets';
import { appendPayloadSelectParams, type PayloadSelect } from '@/lib/payload-select';
import { createLexicalRichTextFromText, renderLexicalToHTML } from '@/lib/payload-richtext';
import type { Product, ProductFilterValue, ProductReview, ProductVariant } from '@/types/site';

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

type PayloadFilterOption = {
    name?: unknown;
    slug?: unknown;
    group?: {
        name?: unknown;
        slug?: unknown;
    } | null;
};

type PayloadCategoryRelation = {
    name?: unknown;
    slug?: unknown;
};

type PayloadCategoryGroupRelation = {
    name?: unknown;
    slug?: unknown;
};

type PayloadSubcategoryRelation = {
    slug?: unknown;
};

type PayloadVariantDoc = {
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    imageUrl?: unknown;
    mainImage?: PayloadMediaDoc | number | null;
    gallery?: PayloadGalleryItem[] | null;
};

type PayloadReviewItem = {
    id?: unknown;
    authorName?: unknown;
    authorEmail?: unknown;
    rating?: unknown;
    comment?: unknown;
    show?: unknown;
    submittedAt?: unknown;
};

type PayloadProductDoc = PayloadVariantDoc & {
    price?: unknown;
    oldPrice?: unknown;
    purchaseCount?: unknown;
    sku?: unknown;
    description?: unknown;
    descriptionContent?: unknown;
    shortDescription?: unknown;
    category?: PayloadCategoryRelation | number | null;
    categoryGroup?: PayloadCategoryGroupRelation | number | null;
    subcategories?: Array<PayloadSubcategoryRelation | number> | null;
    specifications?: Array<{
        key?: unknown;
        value?: unknown;
    }> | null;
    filterOptions?: Array<PayloadFilterOption | number> | null;
    highlights?: Array<{
        text?: unknown;
    }> | null;
    variantProducts?: Array<PayloadVariantDoc | number> | null;
    isFeatured?: unknown;
    isRecommended?: unknown;
    stockQuantity?: unknown;
    stockStatus?: unknown;
};

const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001';
const PAYLOAD_PRODUCTS_REVALIDATE_SECONDS = 300;
const PRODUCT_LIST_DEPTH = 2;
const PRODUCT_DETAIL_DEPTH = 3;

const PRODUCT_LIST_SELECT: PayloadSelect = {
    id: true,
    name: true,
    slug: true,
    price: true,
    oldPrice: true,
    purchaseCount: true,
    sku: true,
    description: true,
    shortDescription: true,
    category: {
        name: true,
        slug: true,
    },
    categoryGroup: {
        name: true,
        slug: true,
    },
    subcategories: {
        slug: true,
    },
    specifications: {
        key: true,
        value: true,
    },
    filterOptions: {
        name: true,
        slug: true,
        group: {
            name: true,
            slug: true,
        },
    },
    highlights: {
        text: true,
    },
    mainImage: {
        url: true,
    },
    gallery: {
        image: {
            url: true,
        },
    },
    isFeatured: true,
    isRecommended: true,
    stockQuantity: true,
    stockStatus: true,
};

const PRODUCT_DETAIL_SELECT: PayloadSelect = {
    ...PRODUCT_LIST_SELECT,
    descriptionContent: true,
    variantProducts: {
        id: true,
        name: true,
        slug: true,
        mainImage: {
            url: true,
        },
        gallery: {
            image: {
                url: true,
            },
        },
    },
};

const PRODUCT_SLUG_SELECT: PayloadSelect = {
    slug: true,
};

type FetchPayloadProductsOptions = {
    includeDetails?: boolean;
    featuredOnly?: boolean;
    recommendedOnly?: boolean;
    slug?: string;
    limit?: number;
    sort?: string;
    select?: PayloadSelect;
};

type MapPayloadProductOptions = {
    includeDetails?: boolean;
};

const payloadProductPriceFormatter = new Intl.NumberFormat('cs-CZ');
const formatPrice = (value: number) => `${payloadProductPriceFormatter.format(value)} Kč`;

const resolveUrl = (value: unknown, baseUrl: string): string | null => {
    if (typeof value !== 'string' || value.length === 0) {
        return null;
    }

    const normalizedValue = getLocalAssetPath(value);
    if (!normalizedValue) {
        return null;
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

const resolveGallery = (gallery: PayloadGalleryItem[] | null | undefined, baseUrl: string): string[] => {
    if (!Array.isArray(gallery)) {
        return [];
    }

    return Array.from(
        new Set(
            gallery
                .map((item) => {
                    const uploaded =
                        typeof item?.image === 'object' && item.image ? resolveUrl(item.image.url, baseUrl) : null;
                    const linked = resolveUrl(item?.imageUrl, baseUrl);
                    return uploaded || linked;
                })
                .filter((value): value is string => Boolean(value)),
        ),
    );
};

const resolvePrimaryImage = (
    doc: PayloadVariantDoc,
    baseUrl: string,
    resolvedGallery: string[] = resolveGallery(doc.gallery, baseUrl),
): string => {
    const mainUploadUrl =
        typeof doc.mainImage === 'object' && doc.mainImage ? resolveUrl(doc.mainImage.url, baseUrl) : null;
    const imageUrl = resolveUrl(doc.imageUrl, baseUrl);
    const galleryImage = resolvedGallery[0];

    return mainUploadUrl || imageUrl || galleryImage || DEFAULT_LOCAL_ASSET_FALLBACK;
};

const normalizeStockStatus = (value: unknown, quantity: unknown): Product['stockStatus'] => {
    if (value === 'in-stock' || value === 'low-stock' || value === 'out-of-stock') {
        return value;
    }

    const numericQuantity = typeof quantity === 'number' ? quantity : Number(quantity);
    if (Number.isFinite(numericQuantity)) {
        if (numericQuantity <= 0) return 'out-of-stock';
        if (numericQuantity <= 3) return 'low-stock';
    }

    return 'in-stock';
};

const toSpecificationsObject = (specs: PayloadProductDoc['specifications']): Record<string, string> | undefined => {
    if (!Array.isArray(specs) || specs.length === 0) {
        return undefined;
    }

    const result: Record<string, string> = {};
    for (const spec of specs) {
        const key = typeof spec?.key === 'string' ? spec.key.trim() : '';
        const value = typeof spec?.value === 'string' ? spec.value.trim() : '';
        if (!key || !value) continue;
        result[key] = value;
    }

    return Object.keys(result).length ? result : undefined;
};

const toFilterValues = (options: PayloadProductDoc['filterOptions']): ProductFilterValue[] | undefined => {
    if (!Array.isArray(options) || options.length === 0) {
        return undefined;
    }

    const result: ProductFilterValue[] = [];
    for (const raw of options) {
        if (!raw || typeof raw !== 'object') continue;

        const option = typeof raw.name === 'string' ? raw.name.trim() : '';
        const optionSlug = typeof raw.slug === 'string' ? raw.slug.trim() : undefined;
        const group = typeof raw.group?.name === 'string' ? raw.group.name.trim() : '';
        const groupSlug = typeof raw.group?.slug === 'string' ? raw.group.slug.trim() : undefined;

        if (!group || !option) continue;

        result.push({ group, option, groupSlug, optionSlug });
    }

    return result.length ? result : undefined;
};

const toHighlights = (highlights: PayloadProductDoc['highlights']): string[] | undefined => {
    if (!Array.isArray(highlights) || highlights.length === 0) {
        return undefined;
    }

    const result = highlights
        .map((entry) => (typeof entry?.text === 'string' ? entry.text.trim() : ''))
        .filter((value): value is string => Boolean(value));

    return result.length ? result : undefined;
};

const mapPayloadReviewDocs = (reviews: PayloadReviewItem[] | undefined): ProductReview[] | undefined => {
    if (!Array.isArray(reviews) || reviews.length === 0) {
        return undefined;
    }

    const mapped: ProductReview[] = [];

    for (const [index, raw] of reviews.entries()) {
        if (!raw || typeof raw !== 'object') {
            continue;
        }

        const rating = typeof raw.rating === 'number' ? raw.rating : Number(raw.rating);
        const comment = typeof raw.comment === 'string' ? raw.comment.trim() : '';
        const authorName = typeof raw.authorName === 'string' ? raw.authorName.trim() : '';
        const authorEmail = typeof raw.authorEmail === 'string' ? raw.authorEmail.trim() : '';
        const submittedAt =
            typeof raw.submittedAt === 'string' && raw.submittedAt.trim().length > 0
                ? raw.submittedAt.trim()
                : undefined;
        const id = raw.id != null ? String(raw.id) : `review-${index}`;

        if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length === 0) {
            continue;
        }

        mapped.push({
            id,
            author: authorName || authorEmail || 'Customer',
            rating,
            comment,
            submittedAt,
        });
    }

    if (mapped.length === 0) {
        return undefined;
    }

    return mapped.sort((left, right) => {
        const leftTime = left.submittedAt ? Date.parse(left.submittedAt) : 0;
        const rightTime = right.submittedAt ? Date.parse(right.submittedAt) : 0;

        return rightTime - leftTime;
    });
};

const mapVariantProduct = (doc: PayloadVariantDoc, baseUrl: string): ProductVariant | null => {
    const id = doc.id != null ? String(doc.id) : '';
    const name = typeof doc.name === 'string' ? doc.name.trim() : '';
    const slug = typeof doc.slug === 'string' ? doc.slug.trim() : '';

    if (!id || !name || !slug) {
        return null;
    }

    const gallery = resolveGallery(doc.gallery, baseUrl);

    return {
        id,
        name,
        slug,
        image: resolvePrimaryImage(doc, baseUrl, gallery),
    };
};

const mapPayloadProduct = (
    doc: PayloadProductDoc,
    baseUrl: string,
    options: MapPayloadProductOptions = {},
): Product | null => {
    const { includeDetails = false } = options;
    const name = typeof doc.name === 'string' ? doc.name.trim() : '';
    const slug = typeof doc.slug === 'string' ? doc.slug.trim() : '';
    const id = doc.id != null ? String(doc.id) : '';
    const category =
        typeof doc.category === 'object' && doc.category && typeof doc.category.name === 'string'
            ? doc.category.name.trim()
            : 'Nezařazené';
    const categorySlug =
        typeof doc.category === 'object' && doc.category && typeof doc.category.slug === 'string'
            ? doc.category.slug.trim()
            : undefined;
    const categoryGroup =
        typeof doc.categoryGroup === 'object' && doc.categoryGroup && typeof doc.categoryGroup.name === 'string'
            ? doc.categoryGroup.name.trim()
            : undefined;
    const categoryGroupSlug =
        typeof doc.categoryGroup === 'object' && doc.categoryGroup && typeof doc.categoryGroup.slug === 'string'
            ? doc.categoryGroup.slug.trim()
            : undefined;
    const subcategorySlugs = Array.isArray(doc.subcategories)
        ? doc.subcategories
              .map((subcategory) =>
                  subcategory && typeof subcategory === 'object' && typeof subcategory.slug === 'string'
                      ? subcategory.slug.trim()
                      : '',
              )
              .filter((value): value is string => Boolean(value))
        : undefined;

    if (!id || !name || !slug) {
        return null;
    }

    const numericPrice = typeof doc.price === 'number' ? doc.price : Number(doc.price);
    const price = Number.isFinite(numericPrice) ? formatPrice(Math.round(numericPrice)) : '0 Kč';

    const numericOldPrice = typeof doc.oldPrice === 'number' ? doc.oldPrice : Number(doc.oldPrice);
    const oldPrice =
        Number.isFinite(numericOldPrice) && numericOldPrice > 0
            ? formatPrice(Math.round(numericOldPrice))
            : undefined;
    const numericPurchaseCount =
        typeof doc.purchaseCount === 'number' ? doc.purchaseCount : Number(doc.purchaseCount);

    const gallery = resolveGallery(doc.gallery, baseUrl);
    const image = resolvePrimaryImage(doc, baseUrl, gallery);
    const description =
        typeof doc.description === 'string' && doc.description.trim().length > 0 ? doc.description : undefined;
    const shortDescription =
        typeof doc.shortDescription === 'string' && doc.shortDescription.trim().length > 0
            ? doc.shortDescription
            : undefined;
    const descriptionHtml = includeDetails
        ? renderLexicalToHTML(doc.descriptionContent) ||
          renderLexicalToHTML(createLexicalRichTextFromText(typeof doc.description === 'string' ? doc.description : ''))
        : undefined;

    const variants =
        includeDetails && Array.isArray(doc.variantProducts)
            ? doc.variantProducts
                  .map((variant) =>
                      variant && typeof variant === 'object' ? mapVariantProduct(variant, baseUrl) : null,
                  )
                  .filter((variant): variant is ProductVariant => Boolean(variant))
            : undefined;

    return {
        id,
        name,
        price,
        oldPrice,
        purchaseCount:
            Number.isFinite(numericPurchaseCount) && numericPurchaseCount > 0
                ? Math.max(0, Math.floor(numericPurchaseCount))
                : 0,
        image,
        slug,
        category,
        categorySlug,
        categoryGroup,
        categoryGroupSlug,
        subcategorySlugs: subcategorySlugs?.length ? subcategorySlugs : undefined,
        sku: typeof doc.sku === 'string' ? doc.sku : undefined,
        description,
        descriptionHtml: descriptionHtml || undefined,
        shortDescription,
        gallery: gallery.length ? gallery : [image],
        specifications: includeDetails ? toSpecificationsObject(doc.specifications) : undefined,
        filterValues: toFilterValues(doc.filterOptions),
        highlights: includeDetails ? toHighlights(doc.highlights) : undefined,
        stockStatus: normalizeStockStatus(doc.stockStatus, doc.stockQuantity),
        variants: variants?.length ? variants : undefined,
        isFeatured: doc.isFeatured === true,
        isRecommended: doc.isRecommended === true,
    };
};

const getPayloadBaseUrl = () => (process.env.PAYLOAD_API_URL?.trim() || DEFAULT_PAYLOAD_API_URL).replace(/\/+$/, '');

const buildProductQuery = ({
    includeDetails = false,
    featuredOnly = false,
    recommendedOnly = false,
    slug,
    limit = 500,
    sort = '-updatedAt',
    select,
}: FetchPayloadProductsOptions = {}) => {
    const params = new URLSearchParams();

    params.set('depth', String(includeDetails ? PRODUCT_DETAIL_DEPTH : PRODUCT_LIST_DEPTH));
    params.set('limit', String(limit));
    params.set('sort', sort);
    params.set('where[status][equals]', 'published');

    if (featuredOnly) {
        params.set('where[isFeatured][equals]', 'true');
    }

    if (recommendedOnly) {
        params.set('where[isRecommended][equals]', 'true');
    }

    if (slug) {
        params.set('where[slug][equals]', slug);
    }

    appendPayloadSelectParams(params, 'select', select || (includeDetails ? PRODUCT_DETAIL_SELECT : PRODUCT_LIST_SELECT));

    return params.toString();
};

export async function fetchPayloadProducts(options: FetchPayloadProductsOptions = {}): Promise<Product[]> {
    const baseUrl = getPayloadBaseUrl();
    const query = buildProductQuery(options);

    try {
        const response = await fetch(`${baseUrl}/api/products?${query}`, {
            next: { revalidate: PAYLOAD_PRODUCTS_REVALIDATE_SECONDS },
        });

        if (!response.ok) {
            return [];
        }

        const payload = (await response.json()) as PayloadListResponse<PayloadProductDoc>;
        const docs = Array.isArray(payload.docs) ? payload.docs : [];
        return docs
            .map((doc) => mapPayloadProduct(doc, baseUrl, { includeDetails: options.includeDetails }))
            .filter((product): product is Product => Boolean(product));
    } catch {
        return [];
    }
}

export async function fetchPayloadProductSlugs(limit = 500): Promise<string[]> {
    const baseUrl = getPayloadBaseUrl();
    const params = new URLSearchParams();
    params.set('depth', '0');
    params.set('limit', String(limit));
    params.set('sort', '-updatedAt');
    params.set('where[status][equals]', 'published');
    appendPayloadSelectParams(params, 'select', PRODUCT_SLUG_SELECT);

    try {
        const response = await fetch(`${baseUrl}/api/products?${params.toString()}`, {
            next: { revalidate: PAYLOAD_PRODUCTS_REVALIDATE_SECONDS },
        });

        if (!response.ok) {
            return [];
        }

        const payload = (await response.json()) as PayloadListResponse<{ slug?: unknown }>;
        const docs = Array.isArray(payload.docs) ? payload.docs : [];

        return docs
            .map((doc) => (typeof doc.slug === 'string' ? doc.slug.trim() : ''))
            .filter((slug): slug is string => Boolean(slug));
    } catch {
        return [];
    }
}

export async function fetchPayloadProductBySlug(slug: string): Promise<Product | null> {
    const normalizedSlug = slug.trim();

    if (!normalizedSlug) {
        return null;
    }

    const [product] = await fetchPayloadProducts({
        includeDetails: true,
        slug: normalizedSlug,
        limit: 1,
    });

    if (!product) {
        return null;
    }

    const baseUrl = getPayloadBaseUrl();

    try {
        const response = await fetch(
            `${baseUrl}/api/product-reviews?depth=0&limit=100&sort=-submittedAt&where[product][equals]=${encodeURIComponent(
                product.id,
            )}&where[show][equals]=true`,
            {
                next: { revalidate: PAYLOAD_PRODUCTS_REVALIDATE_SECONDS },
            },
        );

        if (!response.ok) {
            return product;
        }

        const payload = (await response.json()) as PayloadListResponse<PayloadReviewItem>;
        const reviews = mapPayloadReviewDocs(Array.isArray(payload.docs) ? payload.docs : undefined);

        return {
            ...product,
            reviews,
        };
    } catch {
        return product;
    }
}
