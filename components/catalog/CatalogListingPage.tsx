'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import ProductSort from '@/components/catalog/ProductSort';
import ShopSidebar from '@/components/catalog/ShopSidebar';
import { buildFilterGroups, getProductFilterValues, normalizeFilterKey, parseProductPrice } from '@/lib/catalog-filters';
import { compareProductsByPopularity } from '@/lib/product-sorting';
import { matchesProductSearch } from '@/lib/product-search';
import type { CatalogCategoryNavItem, Product } from '@/types/site';

type ActiveChip = {
    id: string;
    label: string;
};

type Breadcrumb = {
    label: string;
    href?: string;
};

type CatalogListingPageProps = {
    title: string;
    breadcrumbs: Breadcrumb[];
    products: Product[];
    categoryItems: CatalogCategoryNavItem[];
    initialCategorySlug?: string | null;
    initialSubcategorySlug?: string | null;
    searchQuery?: string | null;
};

const DEFAULT_RANGE: [number, number] = [0, 10000];

export default function CatalogListingPage({
    title,
    breadcrumbs,
    products,
    categoryItems,
    initialCategorySlug = null,
    initialSubcategorySlug = null,
    searchQuery = null,
}: CatalogListingPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isReady, setIsReady] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_RANGE);
    const [sortOrder, setSortOrder] = useState('popularity');
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    const selectedCategorySlug = initialCategorySlug ?? null;
    const selectedSubcategorySlug = initialSubcategorySlug ?? null;
    const normalizedSearchQuery = searchQuery?.trim() || '';

    useEffect(() => {
        setIsReady(false);
        const frame = window.requestAnimationFrame(() => setIsReady(true));
        return () => window.cancelAnimationFrame(frame);
    }, [title, selectedCategorySlug, selectedSubcategorySlug]);

    const scopedProducts = useMemo(() => {
        return products.filter((product) => {
            if (selectedCategorySlug && product.categorySlug !== selectedCategorySlug) {
                return false;
            }

            if (selectedSubcategorySlug && !product.subcategorySlugs?.includes(selectedSubcategorySlug)) {
                return false;
            }

            return true;
        });
    }, [products, selectedCategorySlug, selectedSubcategorySlug]);

    const searchedProducts = useMemo(
        () => scopedProducts.filter((product) => matchesProductSearch(product, normalizedSearchQuery)),
        [normalizedSearchQuery, scopedProducts],
    );

    const priceBounds = useMemo<[number, number]>(() => {
        const values = searchedProducts.map((product) => parseProductPrice(product.price)).filter((value) => value > 0);
        if (!values.length) return DEFAULT_RANGE;
        return [Math.min(...values), Math.max(...values)];
    }, [searchedProducts]);

    useEffect(() => {
        setPriceRange(priceBounds);
    }, [priceBounds]);

    const filterGroups = useMemo(() => buildFilterGroups(searchedProducts), [searchedProducts]);

    useEffect(() => {
        const validKeys = new Set(filterGroups.map((group) => group.key));
        setSelectedFilters((prev) => {
            const next: Record<string, string[]> = {};
            for (const [key, values] of Object.entries(prev)) {
                if (validKeys.has(key) && values.length > 0) {
                    next[key] = values;
                }
            }
            return next;
        });
    }, [filterGroups]);

    const toggleFilterOption = (groupKey: string, value: string) => {
        setSelectedFilters((prev) => {
            const current = prev[groupKey] ?? [];
            const nextValues = current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value];

            return {
                ...prev,
                [groupKey]: nextValues,
            };
        });
    };

    const clearAllFilters = () => {
        setPriceRange(priceBounds);
        setSelectedFilters({});
    };

    const activeFilters = useMemo<ActiveChip[]>(() => {
        const chips: ActiveChip[] = [];

        if (priceRange[0] !== priceBounds[0] || priceRange[1] !== priceBounds[1]) {
            chips.push({ id: 'price:range', label: `Cena: ${priceRange[0]}-${priceRange[1]} Kč` });
        }

        for (const group of filterGroups) {
            const selectedValues = selectedFilters[group.key] ?? [];
            for (const value of selectedValues) {
                chips.push({
                    id: `filter:${group.key}:${value}`,
                    label: `${group.title}: ${value}`,
                });
            }
        }

        return chips;
    }, [filterGroups, priceBounds, priceRange, selectedFilters]);

    const removeFilter = (id: string) => {
        const [type, groupKey, ...rest] = id.split(':');
        const value = rest.join(':');

        if (type === 'price') {
            setPriceRange(priceBounds);
            return;
        }

        if (type === 'filter' && groupKey) {
            setSelectedFilters((prev) => ({
                ...prev,
                [groupKey]: (prev[groupKey] ?? []).filter((item) => item !== value),
            }));
        }
    };

    const filteredProducts = useMemo(() => {
        const results = searchedProducts.filter((product) => {
            const price = parseProductPrice(product.price);
            if (price < priceRange[0] || price > priceRange[1]) {
                return false;
            }

            const productFilterMap = new Map<string, Set<string>>();
            for (const filter of getProductFilterValues(product)) {
                const key = normalizeFilterKey(filter.group);
                if (!key) continue;

                if (!productFilterMap.has(key)) {
                    productFilterMap.set(key, new Set());
                }
                productFilterMap.get(key)?.add(filter.option);
            }

            for (const [groupKey, selectedValues] of Object.entries(selectedFilters)) {
                if (!selectedValues.length) continue;

                const productValues = productFilterMap.get(groupKey);
                if (!productValues) {
                    return false;
                }

                const matches = selectedValues.some((value) => productValues.has(value));
                if (!matches) {
                    return false;
                }
            }

            return true;
        });

        results.sort((a, b) => {
            const priceA = parseProductPrice(a.price);
            const priceB = parseProductPrice(b.price);
            const idA = Number(a.id);
            const idB = Number(b.id);

            if (sortOrder === 'popularity') return compareProductsByPopularity(a, b);
            if (sortOrder === 'price-low') return priceA - priceB;
            if (sortOrder === 'price-high') return priceB - priceA;
            if (sortOrder === 'newest') return (Number.isFinite(idB) ? idB : 0) - (Number.isFinite(idA) ? idA : 0);
            return 0;
        });

        return results;
    }, [priceRange, searchedProducts, selectedFilters, sortOrder]);

    const sidebarFilterGroups = useMemo(
        () =>
            filterGroups.map((group) => ({
                key: group.key,
                title: group.title,
                options: group.options,
                selected: selectedFilters[group.key] ?? [],
            })),
        [filterGroups, selectedFilters],
    );

    const handleResetListing = () => {
        clearAllFilters();

        if (!normalizedSearchQuery) {
            return;
        }

        const nextParams = new URLSearchParams();
        if (selectedSubcategorySlug) {
            nextParams.set('subcategory', selectedSubcategorySlug);
        }
        const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
        router.push(nextUrl, { scroll: false });
    };

    return (
        <main className="min-h-[calc(100vh-220px)] bg-white font-sans text-[#111111]">
            <div
                className={`transition-all duration-300 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
                    isReady ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                }`}
            >
                <CatalogHeader title={title} breadcrumbs={breadcrumbs} />

                <div className="mx-auto max-w-[1140px] px-4 py-16 lg:px-0">
                    <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
                        <ShopSidebar
                            categoryItems={categoryItems}
                            selectedCategorySlug={selectedCategorySlug}
                            selectedSubcategorySlug={selectedSubcategorySlug}
                            priceRange={priceRange}
                            priceBounds={priceBounds}
                            onPriceChange={setPriceRange}
                            filterGroups={sidebarFilterGroups}
                            onToggleFilterOption={toggleFilterOption}
                            activeFilters={activeFilters}
                            onRemoveFilter={removeFilter}
                            onClearFilters={clearAllFilters}
                        />

                        <div className="min-w-0 flex-1">
                            <ProductSort value={sortOrder} onChange={setSortOrder} totalResults={filteredProducts.length} />

                            {filteredProducts.length > 0 ? (
                                <div className="grid min-h-[780px] grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
                                    {filteredProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex min-h-[320px] flex-col items-center justify-start pt-14 text-center">
                                    {normalizedSearchQuery ? (
                                        <p className="mb-3 text-[13px] uppercase tracking-[0.12em] text-[#8a837a]">
                                            Výsledky pro: <span className="text-[#111111]">{normalizedSearchQuery}</span>
                                        </p>
                                    ) : null}
                                    <p className="text-[18px] text-gray-500">
                                        {normalizedSearchQuery
                                            ? 'Žádné produkty neodpovídají vašemu hledání.'
                                            : 'Žádné produkty neodpovídají vašemu výběru.'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleResetListing}
                                        className="mt-6 border-b border-black font-medium text-black"
                                    >
                                        {normalizedSearchQuery ? 'Vymazat filtry a hledání' : 'Vymazat filtry'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
