import 'server-only';

import {
    DEFAULT_LOCAL_ASSET_FALLBACK,
    getRenderablePayloadMediaPath,
    getLocalAssetPath,
    getRenderableAssetPath,
} from '@/lib/local-assets';
import { appendPayloadSelectParams, type PayloadSelect } from '@/lib/payload-select';
import { createLexicalRichTextFromText, renderLexicalToHTML } from '@/lib/payload-richtext';
import { normalizeStockQuantity } from '@/lib/stock';
import type { Product, ProductFilterValue, ProductMedia, ProductReview, ProductVariant } from '@/types/site';

type PayloadListResponse<T> = {
    docs?: T[];
};

type PayloadMediaDoc = {
    url?: unknown;
    mimeType?: unknown;
    alt?: unknown;
};

type PayloadGalleryItem = {
    imageUrl?: unknown;
    image?: PayloadMediaDoc | number | null;
};

type PayloadGalleryEntry = PayloadGalleryItem | PayloadMediaDoc | number | null;

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
    category?: PayloadCategoryRelation | number | null;
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
    gallery?: PayloadGalleryEntry[] | null;
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
    category?: Array<PayloadCategoryRelation | number> | PayloadCategoryRelation | number | null;
    categoryGroup?: Array<PayloadCategoryGroupRelation | number> | PayloadCategoryGroupRelation | number | null;
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
    deliveryTime?: unknown;
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
        category: {
            name: true,
            slug: true,
        },
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
        alt: true,
    },
    gallery: {
        url: true,
        mimeType: true,
        alt: true,
    },
    isFeatured: true,
    isRecommended: true,
    stockQuantity: true,
    deliveryTime: true,
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
            alt: true,
        },
        gallery: {
            url: true,
            mimeType: true,
            alt: true,
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
const VIDEO_FILE_EXTENSION_PATTERN = /\.(mp4|webm|ogg|mov|m4v)(?:$|[?#])/i;

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

const resolveMediaType = (url: string, mimeType?: unknown): ProductMedia['type'] => {
    if (typeof mimeType === 'string' && mimeType.toLowerCase().startsWith('video/')) {
        return 'video';
    }

    return VIDEO_FILE_EXTENSION_PATTERN.test(url) ? 'video' : 'image';
};

const resolveGalleryMedia = (
    gallery: PayloadGalleryEntry[] | null | undefined,
    baseUrl: string,
): ProductMedia[] => {
    if (!Array.isArray(gallery)) {
        return [];
    }

    const resolved = new Map<string, ProductMedia>();

    for (const entry of gallery) {
        if (typeof entry === 'number') {
            continue;
        }

        const directDoc = typeof entry === 'object' && entry && 'url' in entry ? entry : null;
        const item = typeof entry === 'object' && entry ? (entry as PayloadGalleryItem) : null;
        const uploadedDoc = directDoc ?? (typeof item?.image === 'object' && item.image ? item.image : null);
        const uploadedUrl = uploadedDoc ? resolveUrl(uploadedDoc.url, baseUrl) : null;
        const linkedUrl = resolveUrl(item?.imageUrl, baseUrl);
        const url = uploadedUrl || linkedUrl;

        if (!url) {
            continue;
        }

        const type = resolveMediaType(url, uploadedDoc?.mimeType);
        const alt =
            uploadedDoc && typeof uploadedDoc.alt === 'string' && uploadedDoc.alt.trim().length > 0
                ? uploadedDoc.alt.trim()
                : undefined;

        resolved.set(`${type}:${url}`, {
            type,
            url,
            alt,
        });
    }

    return Array.from(resolved.values());
};

const resolveGallery = (gallery: PayloadGalleryEntry[] | null | undefined, baseUrl: string): string[] => {
    return resolveGalleryMedia(gallery, baseUrl)
        .filter((item) => item.type === 'image')
        .map((item) => item.url);
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

const toRelationArray = <T,>(value: T | T[] | null | undefined): T[] => {
    if (Array.isArray(value)) {
        return value;
    }

    return value == null ? [] : [value];
};

const uniqueStrings = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

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
    const resolvedCategories = toRelationArray(doc.category)
        .map((entry) => {
            if (!entry || typeof entry !== 'object') {
                return null;
            }

            const categoryName = typeof entry.name === 'string' ? entry.name.trim() : '';
            const categorySlug = typeof entry.slug === 'string' ? entry.slug.trim() : '';

            if (!categoryName && !categorySlug) {
                return null;
            }

            return {
                name: categoryName,
                slug: categorySlug,
            };
        })
        .filter((entry): entry is { name: string; slug: string } => Boolean(entry));
    const categories = uniqueStrings(resolvedCategories.map((entry) => entry.name));
    const categorySlugs = uniqueStrings(resolvedCategories.map((entry) => entry.slug));
    const resolvedCategoryGroups = toRelationArray(doc.categoryGroup)
        .map((entry) => {
            if (!entry || typeof entry !== 'object') {
                return null;
            }

            const categoryGroupName = typeof entry.name === 'string' ? entry.name.trim() : '';
            const categoryGroupSlug = typeof entry.slug === 'string' ? entry.slug.trim() : '';
            const parentCategoryName =
                entry.category && typeof entry.category === 'object' && typeof entry.category.name === 'string'
                    ? entry.category.name.trim()
                    : '';
            const parentCategorySlug =
                entry.category && typeof entry.category === 'object' && typeof entry.category.slug === 'string'
                    ? entry.category.slug.trim()
                    : '';

            if (!categoryGroupName && !categoryGroupSlug) {
                return null;
            }

            return {
                name: categoryGroupName,
                slug: categoryGroupSlug,
                parentCategoryName,
                parentCategorySlug,
            };
        })
        .filter(
            (
                entry,
            ): entry is {
                name: string;
                slug: string;
                parentCategoryName: string;
                parentCategorySlug: string;
            } => Boolean(entry),
        );
    const categoryGroups = uniqueStrings(resolvedCategoryGroups.map((entry) => entry.name));
    const categoryGroupSlugs = uniqueStrings(resolvedCategoryGroups.map((entry) => entry.slug));
    const primaryCategorySlug =
        resolvedCategoryGroups.find(
            (entry) => entry.parentCategorySlug && categorySlugs.includes(entry.parentCategorySlug),
        )?.parentCategorySlug ||
        categorySlugs[0] ||
        resolvedCategoryGroups.find((entry) => entry.parentCategorySlug)?.parentCategorySlug ||
        undefined;
    const category =
        resolvedCategories.find((entry) => entry.slug === primaryCategorySlug)?.name ||
        resolvedCategoryGroups.find((entry) => entry.parentCategorySlug === primaryCategorySlug)?.parentCategoryName ||
        categories[0] ||
        'Nezařazené';
    const categorySlug = primaryCategorySlug;
    const primaryCategoryGroup =
        resolvedCategoryGroups.find((entry) => !primaryCategorySlug || entry.parentCategorySlug === primaryCategorySlug) ||
        resolvedCategoryGroups[0];
    const categoryGroup = primaryCategoryGroup?.name || undefined;
    const categoryGroupSlug = primaryCategoryGroup?.slug || undefined;
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

    const mediaGallery = resolveGalleryMedia(doc.gallery, baseUrl);
    const gallery = mediaGallery.filter((item) => item.type === 'image').map((item) => item.url);
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
    const stockQuantity = normalizeStockQuantity(doc.stockQuantity);

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
        categories: categories.length ? categories : undefined,
        categorySlug,
        categorySlugs: categorySlugs.length ? categorySlugs : undefined,
        categoryGroup,
        categoryGroups: categoryGroups.length ? categoryGroups : undefined,
        categoryGroupSlug,
        categoryGroupSlugs: categoryGroupSlugs.length ? categoryGroupSlugs : undefined,
        subcategorySlugs: subcategorySlugs?.length ? subcategorySlugs : undefined,
        sku: typeof doc.sku === 'string' ? doc.sku : undefined,
        description,
        descriptionHtml: descriptionHtml || undefined,
        shortDescription,
        gallery: gallery.length ? gallery : [image],
        mediaGallery: mediaGallery.length ? mediaGallery : undefined,
        specifications: includeDetails ? toSpecificationsObject(doc.specifications) : undefined,
        filterValues: toFilterValues(doc.filterOptions),
        highlights: includeDetails ? toHighlights(doc.highlights) : undefined,
        stockQuantity,
        deliveryTime: typeof doc.deliveryTime === 'number' ? doc.deliveryTime : Number(doc.deliveryTime) || undefined,
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
