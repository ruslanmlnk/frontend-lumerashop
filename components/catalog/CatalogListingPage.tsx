'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import CatalogChildLinks from '@/components/catalog/CatalogChildLinks';
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
    initialCategoryGroupSlug?: string | null;
    initialSubcategorySlug?: string | null;
    searchQuery?: string | null;
};

const DEFAULT_RANGE: [number, number] = [0, 10000];
const PRODUCTS_PER_PAGE = 12;

const buildVisiblePages = (currentPage: number, totalPages: number) => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

    if (currentPage <= 3) {
        pages.add(2);
        pages.add(3);
        pages.add(4);
    }

    if (currentPage >= totalPages - 2) {
        pages.add(totalPages - 1);
        pages.add(totalPages - 2);
        pages.add(totalPages - 3);
    }

    const sortedPages = Array.from(pages)
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((left, right) => left - right);

    const visiblePages: Array<number | string> = [];

    for (let index = 0; index < sortedPages.length; index += 1) {
        const current = sortedPages[index];
        const previous = sortedPages[index - 1];

        if (index > 0 && previous != null && current - previous > 1) {
            visiblePages.push(`ellipsis-${previous}-${current}`);
        }

        visiblePages.push(current);
    }

    return visiblePages;
};

export default function CatalogListingPage({
    title,
    breadcrumbs,
    products,
    categoryItems,
    initialCategorySlug = null,
    initialCategoryGroupSlug = null,
    initialSubcategorySlug = null,
    searchQuery = null,
}: CatalogListingPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const listingTopRef = useRef<HTMLDivElement | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_RANGE);
    const [sortOrder, setSortOrder] = useState('popularity');
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const selectedCategorySlug = initialCategorySlug ?? null;
    const selectedCategoryGroupSlug = initialCategoryGroupSlug ?? null;
    const selectedSubcategorySlug = initialSubcategorySlug ?? null;
    const normalizedSearchQuery = searchQuery?.trim() || '';
    const selectedFiltersKey = useMemo(() => JSON.stringify(selectedFilters), [selectedFilters]);

    useEffect(() => {
        setIsReady(false);
        const frame = window.requestAnimationFrame(() => setIsReady(true));
        return () => window.cancelAnimationFrame(frame);
    }, [title, selectedCategoryGroupSlug, selectedCategorySlug, selectedSubcategorySlug]);

    const scopedProducts = useMemo(() => {
        return products.filter((product) => {
            if (selectedCategorySlug && product.categorySlug !== selectedCategorySlug) {
                return false;
            }

            if (selectedCategoryGroupSlug && product.categoryGroupSlug !== selectedCategoryGroupSlug) {
                return false;
            }

            if (selectedSubcategorySlug && !product.subcategorySlugs?.includes(selectedSubcategorySlug)) {
                return false;
            }

            return true;
        });
    }, [products, selectedCategoryGroupSlug, selectedCategorySlug, selectedSubcategorySlug]);

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

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

    useEffect(() => {
        setCurrentPage(1);
    }, [
        normalizedSearchQuery,
        priceRange,
        selectedCategoryGroupSlug,
        selectedCategorySlug,
        selectedSubcategorySlug,
        selectedFiltersKey,
        sortOrder,
    ]);

    useEffect(() => {
        setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
    }, [totalPages]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
    }, [currentPage, filteredProducts]);

    const paginationItems = useMemo(() => buildVisiblePages(currentPage, totalPages), [currentPage, totalPages]);

    const visibleRangeStart = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
    const visibleRangeEnd = Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length);

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
    const visibleChildLinks = useMemo(() => {
        if (!selectedCategorySlug || selectedSubcategorySlug) {
            return [];
        }

        const selectedCategory = categoryItems.find((category) => category.slug === selectedCategorySlug);
        if (!selectedCategory) {
            return [];
        }

        if (selectedCategoryGroupSlug) {
            const selectedCategoryGroup = selectedCategory.children?.find((group) => group.slug === selectedCategoryGroupSlug);
            return selectedCategoryGroup?.children ?? [];
        }

        return selectedCategory.children ?? [];
    }, [categoryItems, selectedCategoryGroupSlug, selectedCategorySlug, selectedSubcategorySlug]);

    const changePage = (page: number) => {
        const nextPage = Math.max(1, Math.min(page, totalPages));

        if (nextPage === currentPage) {
            return;
        }

        setCurrentPage(nextPage);

        window.requestAnimationFrame(() => {
            const top = listingTopRef.current?.getBoundingClientRect().top ?? 0;
            if (top < 0) {
                listingTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    };

    const handleResetListing = () => {
        clearAllFilters();

        if (!normalizedSearchQuery) {
            return;
        }

        router.push(pathname, { scroll: false });
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
                            selectedCategoryGroupSlug={selectedCategoryGroupSlug}
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
                            <div ref={listingTopRef} />
                            <CatalogChildLinks items={visibleChildLinks} />
                            <ProductSort value={sortOrder} onChange={setSortOrder} totalResults={filteredProducts.length} />

                            {filteredProducts.length > 0 ? (
                                <>
                                    <div className="mb-6 flex flex-col gap-3 text-[13px] text-[#6f675d] sm:flex-row sm:items-center sm:justify-between">
                                        <p>
                                            Zobrazeno {visibleRangeStart}-{visibleRangeEnd} z {filteredProducts.length} produktů
                                        </p>
                                        {totalPages > 1 ? (
                                            <p>
                                                Strana {currentPage} z {totalPages}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="grid min-h-[780px] grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
                                    {paginatedProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                    </div>

                                    {totalPages > 1 ? (
                                        <nav
                                            className="mt-12 flex flex-wrap items-center justify-center gap-2"
                                            aria-label="Catalog pagination"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => changePage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#111111]/10 px-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#111111] transition hover:border-[#c8a16a] hover:text-[#c8a16a] disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Předchozí
                                            </button>

                                            {paginationItems.map((item) =>
                                                typeof item === 'number' ? (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() => changePage(item)}
                                                        aria-current={item === currentPage ? 'page' : undefined}
                                                        className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-[14px] font-semibold transition ${
                                                            item === currentPage
                                                                ? 'bg-[#111111] text-white'
                                                                : 'border border-[#111111]/10 text-[#111111] hover:border-[#c8a16a] hover:text-[#c8a16a]'
                                                        }`}
                                                    >
                                                        {item}
                                                    </button>
                                                ) : (
                                                    <span
                                                        key={item}
                                                        className="inline-flex h-11 min-w-11 items-center justify-center text-[14px] text-[#8a837a]"
                                                    >
                                                        …
                                                    </span>
                                                ),
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => changePage(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#111111]/10 px-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#111111] transition hover:border-[#c8a16a] hover:text-[#c8a16a] disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Další
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </nav>
                                    ) : null}
                                </>
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
