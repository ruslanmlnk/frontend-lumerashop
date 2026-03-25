import type {
    CatalogCategoryGroupNavItem,
    CatalogCategoryNavItem,
    CatalogFilterReference,
    CatalogSubcategoryNavItem,
} from '@/types/site';

export type CatalogFilterVisibility = {
    hiddenFilterGroups: CatalogFilterReference[];
    hiddenFilterOptions: CatalogFilterReference[];
};

const appendUniqueReferences = (
    target: Map<string, CatalogFilterReference>,
    values: CatalogFilterReference[] | undefined,
) => {
    if (!Array.isArray(values)) {
        return;
    }

    for (const value of values) {
        const id = typeof value.id === 'string' ? value.id.trim() : '';
        const slug = typeof value.slug === 'string' ? value.slug.trim() : '';
        const name = typeof value.name === 'string' ? value.name.trim() : '';

        if (!id || !slug || !name) {
            continue;
        }

        target.set(slug, { id, slug, name });
    }
};

const appendNodeVisibility = (
    target: CatalogFilterVisibility,
    node: CatalogCategoryNavItem | CatalogCategoryGroupNavItem | CatalogSubcategoryNavItem | undefined,
) => {
    if (!node) {
        return;
    }

    const groupMap = new Map(target.hiddenFilterGroups.map((item) => [item.slug, item]));
    const optionMap = new Map(target.hiddenFilterOptions.map((item) => [item.slug, item]));

    appendUniqueReferences(groupMap, node.hiddenFilterGroups);
    appendUniqueReferences(optionMap, node.hiddenFilterOptions);

    target.hiddenFilterGroups = Array.from(groupMap.values());
    target.hiddenFilterOptions = Array.from(optionMap.values());
};

export const getCatalogFilterVisibility = (
    categoryItems: CatalogCategoryNavItem[],
    categorySlug: string | null | undefined,
    categoryGroupSlug?: string | null,
    subcategorySlug?: string | null,
): CatalogFilterVisibility => {
    const result: CatalogFilterVisibility = {
        hiddenFilterGroups: [],
        hiddenFilterOptions: [],
    };

    if (!categorySlug) {
        return result;
    }

    const category = categoryItems.find((item) => item.slug === categorySlug);
    const categoryGroup = category?.children?.find((item) => item.slug === categoryGroupSlug);
    const subcategory = categoryGroup?.children?.find((item) => item.slug === subcategorySlug);

    appendNodeVisibility(result, category);
    appendNodeVisibility(result, categoryGroup);
    appendNodeVisibility(result, subcategory);

    return result;
};
