import type { CatalogFilterReference, Product, ProductFilterValue } from '@/types/site';

export const normalizeFilterKey = (value: string) =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export const parseProductPrice = (price: string) => {
    const numeric = Number(price.replace(/\s+/g, '').replace(',', '.').replace(/[^\d.]/g, ''));

    if (Number.isFinite(numeric) && numeric > 0) {
        return Math.round(numeric);
    }

    const fallback = Number(price.replace(/[^\d]/g, ''));
    return Number.isFinite(fallback) ? fallback : 0;
};

export type HiddenCatalogFilters = {
    hiddenFilterGroups?: CatalogFilterReference[];
    hiddenFilterOptions?: CatalogFilterReference[];
};

const matchesHiddenReference = (
    label: string,
    slug: string | undefined,
    hiddenReferences: CatalogFilterReference[] | undefined,
) => {
    if (!Array.isArray(hiddenReferences) || hiddenReferences.length === 0) {
        return false;
    }

    const normalizedLabel = normalizeFilterKey(label);

    return hiddenReferences.some((reference) => {
        const normalizedReferenceName = normalizeFilterKey(reference.name);
        return reference.slug === slug || reference.slug === normalizedLabel || normalizedReferenceName === normalizedLabel;
    });
};

const filterHiddenValues = (values: ProductFilterValue[], hiddenFilters?: HiddenCatalogFilters) =>
    values.filter((item) => {
        if (matchesHiddenReference(item.group, item.groupSlug, hiddenFilters?.hiddenFilterGroups)) {
            return false;
        }

        if (matchesHiddenReference(item.option, item.optionSlug, hiddenFilters?.hiddenFilterOptions)) {
            return false;
        }

        return true;
    });

export const getProductFilterValues = (product: Product, hiddenFilters?: HiddenCatalogFilters): ProductFilterValue[] => {
    const values =
        Array.isArray(product.filterValues) && product.filterValues.length > 0
            ? product.filterValues
                  .map((item) => ({
                      group: item.group?.trim() || '',
                      option: item.option?.trim() || '',
                      groupSlug: item.groupSlug,
                      optionSlug: item.optionSlug,
                  }))
                  .filter((item) => item.group.length > 0 && item.option.length > 0)
            : Object.entries(product.specifications ?? {})
                  .map(([group, option]) => ({
                      group: String(group).trim(),
                      option: String(option).trim(),
                  }))
                  .filter((item) => item.group.length > 0 && item.option.length > 0);

    return filterHiddenValues(values, hiddenFilters);
};

export type FilterGroup = {
    key: string;
    title: string;
    options: string[];
};

export const buildFilterGroups = (products: Product[], hiddenFilters?: HiddenCatalogFilters): FilterGroup[] => {
    const groups = new Map<string, { title: string; options: Set<string> }>();

    for (const product of products) {
        const values = getProductFilterValues(product, hiddenFilters);

        for (const value of values) {
            const key = normalizeFilterKey(value.group);
            if (!key) continue;

            if (!groups.has(key)) {
                groups.set(key, { title: value.group, options: new Set<string>() });
            }

            groups.get(key)!.options.add(value.option);
        }
    }

    return Array.from(groups.entries())
        .map(([key, payload]) => ({
            key,
            title: payload.title,
            options: Array.from(payload.options),
        }))
        .filter((group) => group.options.length > 1);
};
