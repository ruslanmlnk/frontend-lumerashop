import type { CatalogCategoryNavItem, CatalogSubcategoryNavItem, NavItem } from '@/types/site';

type PayloadListResponse<T> = {
    docs?: T[];
};

type PayloadCategoryDoc = {
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    createdAt?: unknown;
    showInMenu?: unknown;
};

type PayloadSubcategoryDoc = {
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    createdAt?: unknown;
    showInMenu?: unknown;
    category?: {
        id?: unknown;
        slug?: unknown;
    } | number | null;
};

const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001';

const getPayloadBaseUrl = () => (process.env.PAYLOAD_API_URL?.trim() || DEFAULT_PAYLOAD_API_URL).replace(/\/+$/, '');

const getCategoryHref = (slug: string) => `/product-category/${slug}`;

const getSubcategoryHref = (categorySlug: string, subcategorySlug: string) =>
    `/product-category/${categorySlug}?subcategory=${subcategorySlug}`;

const sortByCreatedAtAsc = <T extends { createdAt?: unknown }>(docs: T[]) =>
    [...docs].sort((a, b) => {
        const timestampA = typeof a.createdAt === 'string' ? Date.parse(a.createdAt) : 0;
        const timestampB = typeof b.createdAt === 'string' ? Date.parse(b.createdAt) : 0;
        return timestampA - timestampB;
    });

const isMenuVisible = (value: unknown) => value === true;

const mapSubcategory = (
    doc: PayloadSubcategoryDoc,
    categorySlug: string,
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
        href: getSubcategoryHref(categorySlug, slug),
    };
};

export async function fetchPayloadCatalogCategories(options?: { onlyMenuVisible?: boolean }): Promise<CatalogCategoryNavItem[]> {
    const baseUrl = getPayloadBaseUrl();

    try {
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
            fetch(`${baseUrl}/api/categories?depth=0&limit=200&sort=createdAt`, {
                cache: 'no-store',
                next: { revalidate: 0 },
            }),
            fetch(`${baseUrl}/api/subcategories?depth=1&limit=500&sort=createdAt`, {
                cache: 'no-store',
                next: { revalidate: 0 },
            }),
        ]);

        if (!categoriesResponse.ok || !subcategoriesResponse.ok) {
            return [];
        }

        const categoriesPayload = (await categoriesResponse.json()) as PayloadListResponse<PayloadCategoryDoc>;
        const subcategoriesPayload = (await subcategoriesResponse.json()) as PayloadListResponse<PayloadSubcategoryDoc>;

        const categoryDocs = sortByCreatedAtAsc(Array.isArray(categoriesPayload.docs) ? categoriesPayload.docs : []);
        const subcategoryDocs = sortByCreatedAtAsc(Array.isArray(subcategoriesPayload.docs) ? subcategoriesPayload.docs : []);

        const subcategoriesByCategory = new Map<string, CatalogSubcategoryNavItem[]>();
        for (const doc of subcategoryDocs) {
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

            const mapped = mapSubcategory(doc, parentSlug);
            if (!mapped) {
                continue;
            }

            const items = subcategoriesByCategory.get(parentSlug) ?? [];
            items.push(mapped);
            subcategoriesByCategory.set(parentSlug, items);
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

            const children = subcategoriesByCategory.get(slug) ?? [];

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
        dropdown: category.children?.length
            ? category.children.map((subcategory) => ({
                  label: subcategory.name,
                  href: subcategory.href,
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
    subcategorySlug: string | null | undefined,
) => {
    if (!subcategorySlug) {
        return undefined;
    }

    return categories
        .find((category) => category.slug === categorySlug)
        ?.children?.find((subcategory) => subcategory.slug === subcategorySlug);
};
