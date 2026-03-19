'use client';

import { memo, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { CatalogCategoryNavItem } from '@/types/site';
import CategoryFilter from './CategoryFilter';
import PriceFilter from './PriceFilter';
import MultiSelectFilter from './MultiSelectFilter';

interface ActiveFilter {
    id: string;
    label: string;
}

interface SidebarFilterGroup {
    key: string;
    title: string;
    options: string[];
    selected: string[];
}

interface ShopSidebarProps {
    categoryItems: CatalogCategoryNavItem[];
    selectedCategorySlug: string | null;
    selectedCategoryGroupSlug?: string | null;
    selectedSubcategorySlug?: string | null;
    priceRange?: [number, number];
    priceBounds?: [number, number];
    onPriceChange: (range: [number, number]) => void;
    filterGroups?: SidebarFilterGroup[];
    onToggleFilterOption?: (groupKey: string, value: string) => void;
    activeFilters?: ActiveFilter[];
    onRemoveFilter?: (id: string) => void;
    onClearFilters?: () => void;
}

const ShopSidebarComponent = ({
    categoryItems,
    selectedCategorySlug,
    selectedCategoryGroupSlug = null,
    selectedSubcategorySlug = null,
    priceRange = [0, 10000],
    priceBounds = [0, 10000],
    onPriceChange,
    filterGroups = [],
    onToggleFilterOption = () => undefined,
    activeFilters = [],
    onRemoveFilter = () => undefined,
    onClearFilters = () => undefined,
}: ShopSidebarProps) => {
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [expandedMobileSections, setExpandedMobileSections] = useState<string[]>([]);
    const hasCustomPrice = priceRange[0] !== priceBounds[0] || priceRange[1] !== priceBounds[1];

    useEffect(() => {
        setExpandedMobileSections((prev) => {
            const next = new Set(
                prev.filter(
                    (section) => section === 'price' || filterGroups.some((group) => `group:${group.key}` === section),
                ),
            );

            if (hasCustomPrice) {
                next.add('price');
            }

            for (const group of filterGroups) {
                if (group.selected.length > 0) {
                    next.add(`group:${group.key}`);
                }
            }

            return Array.from(next);
        });
    }, [filterGroups, hasCustomPrice]);

    const toggleMobileSection = (sectionKey: string) => {
        setExpandedMobileSections((prev) =>
            prev.includes(sectionKey) ? prev.filter((section) => section !== sectionKey) : [...prev, sectionKey],
        );
    };

    const renderMobileSection = (sectionKey: string, title: string, content: ReactNode, badge?: string) => {
        const isExpanded = expandedMobileSections.includes(sectionKey);

        return (
            <section key={sectionKey} className="overflow-hidden">
                <button
                    type="button"
                    onClick={() => toggleMobileSection(sectionKey)}
                    className="flex w-full items-center justify-between gap-3 py-4 text-left"
                    aria-expanded={isExpanded}
                >
                    <span className="flex items-center gap-2">
                        <span
                            className="text-[18px] font-bold leading-[21.6px] text-[#111111]"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            {title}
                        </span>
                        {badge ? (
                            <span className="rounded-full bg-[#111111] px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                                {badge}
                            </span>
                        ) : null}
                    </span>

                    <ChevronDown
                        size={16}
                        className={`shrink-0 text-[#111111] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </button>

                {isExpanded ? <div className="pb-4">{content}</div> : null}
            </section>
        );
    };

    const filtersBody = useMemo(
        () => (
            <>
                <CategoryFilter
                    title="Kategorie produktu"
                    items={categoryItems}
                    selectedCategorySlug={selectedCategorySlug}
                    selectedCategoryGroupSlug={selectedCategoryGroupSlug}
                    selectedSubcategorySlug={selectedSubcategorySlug}
                />

                <div className="w-full">
                    <div className="mb-[18px] flex items-center justify-between">
                        <h2
                            className="text-[20px] font-bold leading-[24px] text-[#111111]"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            Filtry
                        </h2>

                        <button
                            type="button"
                            onClick={() => setIsMobileFiltersOpen(false)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#111111]/10 text-[#111111] lg:hidden"
                            aria-label={"Zavřít filtry"}
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {activeFilters.length > 0 && (
                        <div className="mb-[18px]">
                            <div className="mb-3 flex flex-wrap gap-[4px] py-[8px]">
                                {activeFilters.map((filter) => (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        onClick={() => onRemoveFilter(filter.id)}
                                        className="inline-flex items-center gap-[6px] rounded-[2px] border border-[#111111]/20 px-[10px] py-[4px] text-[14px] leading-[22px] text-[#111111] transition-colors hover:border-[#111111]/40"
                                    >
                                        <span>{filter.label}</span>
                                        <span className="text-[16px] leading-none">x</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={onClearFilters}
                                className="w-full bg-black px-2 py-[5px] text-[14px] text-white transition-opacity hover:opacity-90"
                            >
                                Vymazat filtry
                            </button>
                        </div>
                    )}

                    <div className="space-y-[18px]">
                        <PriceFilter
                            min={priceBounds[0]}
                            max={priceBounds[1]}
                            value={priceRange}
                            onChange={onPriceChange}
                        />

                        {filterGroups.map((group) => (
                            <MultiSelectFilter
                                key={group.key}
                                title={group.title}
                                options={group.options}
                                selected={group.selected}
                                onToggle={(value) => onToggleFilterOption(group.key, value)}
                            />
                        ))}
                    </div>
                </div>
            </>
        ),
        [
            activeFilters,
            categoryItems,
            onClearFilters,
            onPriceChange,
            onRemoveFilter,
            onToggleFilterOption,
            priceBounds,
            priceRange,
            selectedCategorySlug,
            selectedCategoryGroupSlug,
            selectedSubcategorySlug,
            filterGroups,
        ],
    );

    const mobileFiltersBody = useMemo(
        () => (
            <div className="w-full">
                <div className="mb-[18px] flex items-center justify-between">
                    <h2
                        className="text-[20px] font-bold leading-[24px] text-[#111111]"
                        style={{ fontFamily: '"Cormorant Garamond", serif' }}
                    >
                        Filtry
                    </h2>

                    <button
                        type="button"
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#111111]/10 text-[#111111]"
                        aria-label={"ZavĹ™Ă­t filtry"}
                    >
                        <X size={15} />
                    </button>
                </div>

                {activeFilters.length > 0 && (
                    <div className="mb-[18px]">
                        <div className="mb-3 flex flex-wrap gap-[4px] py-[8px]">
                            {activeFilters.map((filter) => (
                                <button
                                    key={filter.id}
                                    type="button"
                                    onClick={() => onRemoveFilter(filter.id)}
                                    className="inline-flex items-center gap-[6px] rounded-[2px] border border-[#111111]/20 px-[10px] py-[4px] text-[14px] leading-[22px] text-[#111111] transition-colors hover:border-[#111111]/40"
                                >
                                    <span>{filter.label}</span>
                                    <span className="text-[16px] leading-none">x</span>
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={onClearFilters}
                            className="w-full bg-black px-2 py-[5px] text-[14px] text-white transition-opacity hover:opacity-90"
                        >
                            Vymazat filtry
                        </button>
                    </div>
                )}

                <div className="space-y-3">
                    {renderMobileSection(
                        'price',
                        'Cena',
                        <PriceFilter
                            min={priceBounds[0]}
                            max={priceBounds[1]}
                            value={priceRange}
                            onChange={onPriceChange}
                            hideTitle
                        />,
                        hasCustomPrice ? 'aktivni' : undefined,
                    )}

                    {filterGroups.map((group) =>
                        renderMobileSection(
                            `group:${group.key}`,
                            group.title,
                            <MultiSelectFilter
                                title={group.title}
                                options={group.options}
                                selected={group.selected}
                                onToggle={(value) => onToggleFilterOption(group.key, value)}
                                hideTitle
                            />,
                            group.selected.length ? String(group.selected.length) : undefined,
                        ),
                    )}
                </div>
            </div>
        ),
        [
            activeFilters,
            expandedMobileSections,
            filterGroups,
            hasCustomPrice,
            onClearFilters,
            onPriceChange,
            onRemoveFilter,
            onToggleFilterOption,
            priceBounds,
            priceRange,
        ],
    );

    return (
        <aside className="w-full shrink-0 self-stretch lg:w-[270px] lg:pr-[20px]">
            <div className="mb-5 lg:hidden">
                <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen((open) => !open)}
                    className="flex h-[50px] w-[203px] items-center justify-center gap-2 bg-black px-4 text-[15px] font-medium text-white"
                    aria-expanded={isMobileFiltersOpen}
                    aria-controls="mobile-catalog-filters"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                            d="M9.62 16.84h3.85v-1.45H9.62v1.45ZM5.77 5.77v1.45h11.55V5.77H5.77Zm1.93 6.25h7.69v-1.44H7.7v1.44Z"
                            fill="currentColor"
                        />
                    </svg>
                    Filtr produktu
                    <ChevronDown size={15} className={`transition-transform ${isMobileFiltersOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMobileFiltersOpen && (
                    <div
                        id="mobile-catalog-filters"
                        className="mt-4 rounded-[18px] border border-[#111111]/10 bg-white px-4 py-5 shadow-[0_22px_50px_rgba(17,17,17,0.08)]"
                    >
                        <div className="flex flex-col gap-[20px]">{mobileFiltersBody}</div>
                    </div>
                )}
            </div>

            <div className="hidden w-full max-w-[250px] flex-col gap-[42px] bg-white px-[6px] pb-[36px] pt-[26px] lg:flex">
                {filtersBody}
            </div>
        </aside>
    );
};

const ShopSidebar = memo(ShopSidebarComponent);

export default ShopSidebar;
