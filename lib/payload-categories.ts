import type {
    CatalogCategoryGroupNavItem,
    CatalogCategoryNavItem,
    CatalogSubcategoryNavItem,
    NavItem,
} from '@/types/site';

type PayloadListResponse<T> = {
    docs?: T[];
};

type PayloadCategoryDoc = {
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    createdAt?: unknown;
    showInMenu?: unknown;
    sortOrder?: unknown;
};

type PayloadCategoryGroupDoc = {
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    createdAt?: unknown;
    showInMenu?: unknown;
    sortOrder?: unknown;
    category?: {
        id?: unknown;
        slug?: unknown;
    } | number | null;
};

type PayloadSubcategoryDoc = {
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    createdAt?: unknown;
    showInMenu?: unknown;
    sortOrder?: unknown;
    categoryGroup?: {
        id?: unknown;
        slug?: unknown;
    } | number | null;
    category?: {
        id?: unknown;
        slug?: unknown;
    } | number | null;
};

const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001';

const getPayloadBaseUrl = () => (process.env.PAYLOAD_API_URL?.trim() || DEFAULT_PAYLOAD_API_URL).replace(/\/+$/, '');

const getCategoryHref = (slug: string) => `/product-category/${slug}`;

const getCategoryGroupHref = (categorySlug: string, groupSlug: string) =>
    `/product-category/${categorySlug}/${groupSlug}`;

const getSubcategoryHref = (categorySlug: string, groupSlug: string, subcategorySlug: string) =>
    `/product-category/${categorySlug}/${groupSlug}/${subcategorySlug}`;

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

const mapCategoryGroup = (
    doc: PayloadCategoryGroupDoc,
    categorySlug: string,
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
    };
};

const mapSubcategory = (
    doc: PayloadSubcategoryDoc,
    categorySlug: string,
    groupSlug: string,
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
    };
};

export async function fetchPayloadCatalogCategories(options?: { onlyMenuVisible?: boolean }): Promise<CatalogCategoryNavItem[]> {
    const baseUrl = getPayloadBaseUrl();

    try {
        const [categoriesResponse, categoryGroupsResponse, subcategoriesResponse] = await Promise.all([
            fetch(`${baseUrl}/api/categories?depth=0&limit=200&sort=sortOrder`, {
                cache: 'no-store',
                next: { revalidate: 0 },
            }),
            fetch(`${baseUrl}/api/category-groups?depth=1&limit=500&sort=sortOrder`, {
                cache: 'no-store',
                next: { revalidate: 0 },
            }),
            fetch(`${baseUrl}/api/subcategories?depth=1&limit=1000&sort=sortOrder`, {
                cache: 'no-store',
                next: { revalidate: 0 },
            }),
        ]);

        if (!categoriesResponse.ok || !categoryGroupsResponse.ok || !subcategoriesResponse.ok) {
            return [];
        }

        const categoriesPayload = (await categoriesResponse.json()) as PayloadListResponse<PayloadCategoryDoc>;
        const categoryGroupsPayload = (await categoryGroupsResponse.json()) as PayloadListResponse<PayloadCategoryGroupDoc>;
        const subcategoriesPayload = (await subcategoriesResponse.json()) as PayloadListResponse<PayloadSubcategoryDoc>;

        const categoryDocs = sortByMenuOrderAsc(Array.isArray(categoriesPayload.docs) ? categoriesPayload.docs : []);
        const categoryGroupDocs = sortByMenuOrderAsc(
            Array.isArray(categoryGroupsPayload.docs) ? categoryGroupsPayload.docs : [],
        );
        const subcategoryDocs = sortByMenuOrderAsc(Array.isArray(subcategoriesPayload.docs) ? subcategoriesPayload.docs : []);

        const subcategoriesByGroup = new Map<string, CatalogSubcategoryNavItem[]>();
        for (const doc of subcategoryDocs) {
            if (options?.onlyMenuVisible && !isMenuVisible(doc.showInMenu)) {
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

            const mapped = mapSubcategory(doc, categorySlug, parentGroupSlug);
            if (!mapped) {
                continue;
            }

            const items = subcategoriesByGroup.get(parentGroupSlug) ?? [];
            items.push(mapped);
            subcategoriesByGroup.set(parentGroupSlug, items);
        }

        const groupsByCategory = new Map<string, CatalogCategoryGroupNavItem[]>();
        for (const doc of categoryGroupDocs) {
            if (options?.onlyMenuVisible && !isMenuVisible(doc.showInMenu)) {
                continue;
            }

            const parentSlug =
                typeof doc.category === 'object' && doc.category && typeof doc.category.slug === 'string'
                    ? doc.category.slug.trim()
                    : '';

            if (!parentSlug) {
                continue;
            }

            const mapped = mapCategoryGroup(doc, parentSlug);
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
            if (options?.onlyMenuVisible && !isMenuVisible(doc.showInMenu)) {
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
    } catch {
        return [];
    }
}

export async function fetchPayloadHeaderMenuItems(): Promise<NavItem[]> {
    const categories = await fetchPayloadCatalogCategories({ onlyMenuVisible: true });

    return categories.map((category) => ({
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
