import type {
    CatalogCategoryGroupNavItem,
    CatalogCategoryNavItem,
    CatalogSubcategoryNavItem,
    HeaderMenus,
    NavItem,
} from '@/types/site';
import {
    DEFAULT_LOCAL_ASSET_FALLBACK,
    getLocalAssetPath,
    getRenderableAssetPath,
    getRenderablePayloadMediaPath,
} from '@/lib/local-assets';
import { appendPayloadSelectParams, type PayloadSelect } from '@/lib/payload-select';

type PayloadListResponse<T> = {
    docs?: T[];
};

type PayloadMediaDoc = {
    url?: unknown;
};

type PayloadCategoryDoc = {
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    createdAt?: unknown;
    showInMenu?: unknown;
    showInDesktopMenu?: unknown;
    showInDesktopDropdownMenu?: unknown;
    showInMobileMenu?: unknown;
    sortOrder?: unknown;
};

type PayloadCategoryGroupDoc = {
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    createdAt?: unknown;
    showInMenu?: unknown;
    showInDesktopMenu?: unknown;
    showInMobileMenu?: unknown;
    sortOrder?: unknown;
    category?: {
        id?: unknown;
        slug?: unknown;
    } | number | null;
    image?: PayloadMediaDoc | number | null;
};

type PayloadSubcategoryDoc = {
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    createdAt?: unknown;
    showInMenu?: unknown;
    showInDesktopMenu?: unknown;
    showInMobileMenu?: unknown;
    sortOrder?: unknown;
    categoryGroup?: {
        id?: unknown;
        slug?: unknown;
    } | number | null;
    category?: {
        id?: unknown;
        slug?: unknown;
    } | number | null;
    image?: PayloadMediaDoc | number | null;
};

const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001';
const PAYLOAD_CATEGORIES_REVALIDATE_SECONDS = 300;

const CATEGORY_SELECT: PayloadSelect = {
    id: true,
    name: true,
    slug: true,
    createdAt: true,
    showInMenu: true,
    showInDesktopMenu: true,
    showInDesktopDropdownMenu: true,
    showInMobileMenu: true,
    sortOrder: true,
};

const CATEGORY_GROUP_SELECT: PayloadSelect = {
    ...CATEGORY_SELECT,
    category: {
        id: true,
        slug: true,
    },
    image: {
        url: true,
    },
};

const SUBCATEGORY_SELECT: PayloadSelect = {
    ...CATEGORY_SELECT,
    categoryGroup: {
        id: true,
        slug: true,
    },
    category: {
        id: true,
        slug: true,
    },
    image: {
        url: true,
    },
};

const getPayloadBaseUrl = () => (process.env.PAYLOAD_API_URL?.trim() || DEFAULT_PAYLOAD_API_URL).replace(/\/+$/, '');

const getCategoryHref = (slug: string) => `/product-category/${slug}`;

const getCategoryGroupHref = (categorySlug: string, groupSlug: string) =>
    `/product-category/${categorySlug}/${groupSlug}`;

const getSubcategoryHref = (categorySlug: string, groupSlug: string, subcategorySlug: string) =>
    `/product-category/${categorySlug}/${groupSlug}/${subcategorySlug}`;

const resolveCategoryImageUrl = (value: unknown, baseUrl: string): string | undefined => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return undefined;
    }

    const normalizedValue = getLocalAssetPath(value);
    if (!normalizedValue) {
        return undefined;
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

const toSortOrder = (value: unknown) => {
    const numericValue = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numericValue) ? numericValue : Number.MAX_SAFE_INTEGER;
};

const sortByMenuOrderAsc = <T extends { createdAt?: unknown; sortOrder?: unknown }>(docs: T[]) =>
    [...docs].sort((a, b) => {
        const orderDelta = toSortOrder(a.sortOrder) - toSortOrder(b.sortOrder);
        if (orderDelta !== 0) {
            return orderDelta;
        }

        const timestampA = typeof a.createdAt === 'string' ? Date.parse(a.createdAt) : 0;
        const timestampB = typeof b.createdAt === 'string' ? Date.parse(b.createdAt) : 0;
        return timestampA - timestampB;
    });

const isMenuVisible = (value: unknown) => value === true;
const isDesktopOverflowVisible = (value: unknown) => value === true;

type MenuViewport = 'desktop' | 'mobile';

type FetchPayloadCatalogCategoriesOptions = {
    onlyMenuVisible?: boolean;
    viewport?: MenuViewport;
};

type PayloadCatalogDocuments = {
    baseUrl: string;
    categoryDocs: PayloadCategoryDoc[];
    categoryGroupDocs: PayloadCategoryGroupDoc[];
    subcategoryDocs: PayloadSubcategoryDoc[];
};

const isVisibleForViewport = (
    doc: { showInMenu?: unknown; showInDesktopMenu?: unknown; showInMobileMenu?: unknown },
    viewport: MenuViewport,
) => {
    const explicitValue = viewport === 'desktop' ? doc.showInDesktopMenu : doc.showInMobileMenu;

    if (typeof explicitValue === 'boolean') {
        return explicitValue;
    }

    return isMenuVisible(doc.showInMenu);
};

const mapCategoryGroup = (
    doc: PayloadCategoryGroupDoc,
    categorySlug: string,
    baseUrl: string,
): CatalogCategoryGroupNavItem | null => {
    const id = doc.id != null ? String(doc.id) : '';
    const name = typeof doc.name === 'string' ? doc.name.trim() : '';
    const slug = typeof doc.slug === 'string' ? doc.slug.trim() : '';

    if (!id || !name || !slug) {
        return null;
    }

    return {
        id,
        name,
        slug,
        href: getCategoryGroupHref(categorySlug, slug),
        image: typeof doc.image === 'object' && doc.image ? resolveCategoryImageUrl(doc.image.url, baseUrl) : undefined,
    };
};

const mapSubcategory = (
    doc: PayloadSubcategoryDoc,
    categorySlug: string,
    groupSlug: string,
    baseUrl: string,
): CatalogSubcategoryNavItem | null => {
    const id = doc.id != null ? String(doc.id) : '';
    const name = typeof doc.name === 'string' ? doc.name.trim() : '';
    const slug = typeof doc.slug === 'string' ? doc.slug.trim() : '';

    if (!id || !name || !slug) {
        return null;
    }

    return {
        id,
        name,
        slug,
        href: getSubcategoryHref(categorySlug, groupSlug, slug),
        image: typeof doc.image === 'object' && doc.image ? resolveCategoryImageUrl(doc.image.url, baseUrl) : undefined,
    };
};

const fetchPayloadCatalogDocuments = async (): Promise<PayloadCatalogDocuments | null> => {
    const baseUrl = getPayloadBaseUrl();
    const categoriesParams = new URLSearchParams({ depth: '0', limit: '200', sort: 'sortOrder' });
    const categoryGroupsParams = new URLSearchParams({ depth: '1', limit: '500', sort: 'sortOrder' });
    const subcategoriesParams = new URLSearchParams({ depth: '1', limit: '1000', sort: 'sortOrder' });

    appendPayloadSelectParams(categoriesParams, 'select', CATEGORY_SELECT);
    appendPayloadSelectParams(categoryGroupsParams, 'select', CATEGORY_GROUP_SELECT);
    appendPayloadSelectParams(subcategoriesParams, 'select', SUBCATEGORY_SELECT);

    try {
        const [categoriesResponse, categoryGroupsResponse, subcategoriesResponse] = await Promise.all([
            fetch(`${baseUrl}/api/categories?${categoriesParams.toString()}`, {
                next: { revalidate: PAYLOAD_CATEGORIES_REVALIDATE_SECONDS },
            }),
            fetch(`${baseUrl}/api/category-groups?${categoryGroupsParams.toString()}`, {
                next: { revalidate: PAYLOAD_CATEGORIES_REVALIDATE_SECONDS },
            }),
            fetch(`${baseUrl}/api/subcategories?${subcategoriesParams.toString()}`, {
                next: { revalidate: PAYLOAD_CATEGORIES_REVALIDATE_SECONDS },
            }),
        ]);

        if (!categoriesResponse.ok || !categoryGroupsResponse.ok || !subcategoriesResponse.ok) {
            return null;
        }

        const categoriesPayload = (await categoriesResponse.json()) as PayloadListResponse<PayloadCategoryDoc>;
        const categoryGroupsPayload = (await categoryGroupsResponse.json()) as PayloadListResponse<PayloadCategoryGroupDoc>;
        const subcategoriesPayload = (await subcategoriesResponse.json()) as PayloadListResponse<PayloadSubcategoryDoc>;

        const categoryDocs = sortByMenuOrderAsc(Array.isArray(categoriesPayload.docs) ? categoriesPayload.docs : []);
        const categoryGroupDocs = sortByMenuOrderAsc(
            Array.isArray(categoryGroupsPayload.docs) ? categoryGroupsPayload.docs : [],
        );
        const subcategoryDocs = sortByMenuOrderAsc(Array.isArray(subcategoriesPayload.docs) ? subcategoriesPayload.docs : []);

        return {
            baseUrl,
            categoryDocs,
            categoryGroupDocs,
            subcategoryDocs,
        };
    } catch {
        return null;
    }
};

const mapPayloadCatalogCategories = (
    documents: PayloadCatalogDocuments,
    options?: FetchPayloadCatalogCategoriesOptions,
): CatalogCategoryNavItem[] => {
    const { baseUrl, categoryDocs, categoryGroupDocs, subcategoryDocs } = documents;
    const viewport = options?.viewport ?? 'desktop';
    const subcategoriesByGroup = new Map<string, CatalogSubcategoryNavItem[]>();

    for (const doc of subcategoryDocs) {
        if (options?.onlyMenuVisible && !isVisibleForViewport(doc, viewport)) {
            continue;
        }

        const parentGroupSlug =
            typeof doc.categoryGroup === 'object' && doc.categoryGroup && typeof doc.categoryGroup.slug === 'string'
                ? doc.categoryGroup.slug.trim()
                : '';
        const categorySlug =
            typeof doc.category === 'object' && doc.category && typeof doc.category.slug === 'string'
                ? doc.category.slug.trim()
                : '';

        if (!parentGroupSlug || !categorySlug) {
            continue;
        }

        const mapped = mapSubcategory(doc, categorySlug, parentGroupSlug, baseUrl);
        if (!mapped) {
            continue;
        }

        const items = subcategoriesByGroup.get(parentGroupSlug) ?? [];
        items.push(mapped);
        subcategoriesByGroup.set(parentGroupSlug, items);
    }

    const groupsByCategory = new Map<string, CatalogCategoryGroupNavItem[]>();
    for (const doc of categoryGroupDocs) {
        if (options?.onlyMenuVisible && !isVisibleForViewport(doc, viewport)) {
            continue;
        }

        const parentSlug =
            typeof doc.category === 'object' && doc.category && typeof doc.category.slug === 'string'
                ? doc.category.slug.trim()
                : '';

        if (!parentSlug) {
            continue;
        }

        const mapped = mapCategoryGroup(doc, parentSlug, baseUrl);
        if (!mapped) {
            continue;
        }

        const children = subcategoriesByGroup.get(mapped.slug) ?? [];
        const items = groupsByCategory.get(parentSlug) ?? [];
        items.push({
            ...mapped,
            children: children.length ? children : undefined,
        });
        groupsByCategory.set(parentSlug, items);
    }

    return categoryDocs.reduce<CatalogCategoryNavItem[]>((items, doc) => {
        if (options?.onlyMenuVisible && !isVisibleForViewport(doc, viewport)) {
            return items;
        }

        const id = doc.id != null ? String(doc.id) : '';
        const name = typeof doc.name === 'string' ? doc.name.trim() : '';
        const slug = typeof doc.slug === 'string' ? doc.slug.trim() : '';

        if (!id || !name || !slug) {
            return items;
        }

        const children = groupsByCategory.get(slug) ?? [];

        items.push({
            id,
            name,
            slug,
            href: getCategoryHref(slug),
            children: children.length ? children : undefined,
        });

        return items;
    }, []);
};

export async function fetchPayloadCatalogCategories(
    options?: FetchPayloadCatalogCategoriesOptions,
): Promise<CatalogCategoryNavItem[]> {
    const documents = await fetchPayloadCatalogDocuments();

    if (!documents) {
        return [];
    }

    return mapPayloadCatalogCategories(documents, options);
}

const mapCategoriesToHeaderItems = (categories: CatalogCategoryNavItem[]): NavItem[] =>
    categories.map((category) => ({
        label: category.name,
        href: category.href,
        children: category.children?.length
            ? category.children.map((group) => ({
                  label: group.name,
                  href: group.href,
                  children: group.children?.length
                      ? group.children.map((subcategory) => ({
                            label: subcategory.name,
                            href: subcategory.href,
                        }))
                      : undefined,
              }))
            : undefined,
    }));

export async function fetchPayloadHeaderMenus(): Promise<HeaderMenus> {
    const documents = await fetchPayloadCatalogDocuments();

    if (!documents) {
        return {
            desktopMenuItems: [],
            desktopOverflowMenuItems: [],
            mobileMenuItems: [],
        };
    }

    const desktopCategories = mapPayloadCatalogCategories(documents, {
        onlyMenuVisible: true,
        viewport: 'desktop',
    });
    const mobileCategories = mapPayloadCatalogCategories(documents, {
        onlyMenuVisible: true,
        viewport: 'mobile',
    });
    const desktopOverflowCategorySlugs = new Set(
        documents.categoryDocs
            .filter(
                (doc) =>
                    isVisibleForViewport(doc, 'desktop') &&
                    isDesktopOverflowVisible(doc.showInDesktopDropdownMenu) &&
                    typeof doc.slug === 'string' &&
                    doc.slug.trim().length > 0,
            )
            .map((doc) => (typeof doc.slug === 'string' ? doc.slug.trim() : ''))
            .filter((slug): slug is string => slug.length > 0),
    );
    const desktopPrimaryCategories = desktopCategories.filter(
        (category) => !desktopOverflowCategorySlugs.has(category.slug),
    );
    const desktopOverflowCategories = desktopCategories.filter((category) =>
        desktopOverflowCategorySlugs.has(category.slug),
    );

    return {
        desktopMenuItems: mapCategoriesToHeaderItems(desktopPrimaryCategories),
        desktopOverflowMenuItems: mapCategoriesToHeaderItems(desktopOverflowCategories),
        mobileMenuItems: mapCategoriesToHeaderItems(mobileCategories),
    };
}

export const findCatalogCategoryBySlug = (
    categories: CatalogCategoryNavItem[],
    slug: string,
) => categories.find((category) => category.slug === slug);

export const findCatalogSubcategoryBySlug = (
    categories: CatalogCategoryNavItem[],
    categorySlug: string,
    categoryGroupSlug: string | null | undefined,
    subcategorySlug: string | null | undefined,
) => {
    if (!categoryGroupSlug || !subcategorySlug) {
        return undefined;
    }

    return categories
        .find((category) => category.slug === categorySlug)
        ?.children?.find((group) => group.slug === categoryGroupSlug)
        ?.children?.find((subcategory) => subcategory.slug === subcategorySlug);
};

export const findCatalogCategoryGroupBySlug = (
    categories: CatalogCategoryNavItem[],
    categorySlug: string,
    categoryGroupSlug: string | null | undefined,
) => {
    if (!categoryGroupSlug) {
        return undefined;
    }

    return categories
        .find((category) => category.slug === categorySlug)
        ?.children?.find((group) => group.slug === categoryGroupSlug);
};
