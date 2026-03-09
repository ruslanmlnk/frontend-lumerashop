import type { Product } from '@/types/site';

const normalizeSearchValue = (value: string) =>
    value
        .toLocaleLowerCase('cs-CZ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const getSearchTerms = (query: string) => normalizeSearchValue(query).split(' ').filter(Boolean);

const getProductSearchIndex = (product: Product) =>
    normalizeSearchValue(
        [
            product.name,
            product.category,
            product.slug,
            product.sku,
            product.description,
            product.shortDescription,
            ...(product.highlights || []),
            ...Object.keys(product.specifications || {}),
            ...Object.values(product.specifications || {}),
            ...(product.filterValues || []).flatMap((item) => [item.group, item.option]),
        ]
            .filter(Boolean)
            .join(' '),
    );

export const matchesProductSearch = (product: Product, query?: string | null) => {
    const terms = getSearchTerms(query || '');
    if (!terms.length) {
        return true;
    }

    const searchIndex = getProductSearchIndex(product);
    return terms.every((term) => searchIndex.includes(term));
};
