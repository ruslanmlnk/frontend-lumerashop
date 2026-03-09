'use client';

import { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import type { CatalogCategoryNavItem } from '@/types/site';

interface CategoryFilterProps {
    title?: string;
    items: CatalogCategoryNavItem[];
    selectedCategorySlug: string | null;
    selectedSubcategorySlug?: string | null;
}

const STORAGE_KEY = 'lumera:catalog-expanded-categories';

const readExpandedState = (): string[] => {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch {
        return [];
    }
};

const CategoryFilterComponent = ({
    title = 'Kategorie produktu',
    items,
    selectedCategorySlug,
    selectedSubcategorySlug = null,
}: CategoryFilterProps) => {
    const [expanded, setExpanded] = useState<string[]>(readExpandedState);

    useEffect(() => {
        try {
            window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(expanded));
        } catch {
            // Ignore storage failures. The filter still works without persisted state.
        }
    }, [expanded]);

    const toggleExpand = (slug: string) => {
        setExpanded((prev) => (prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]));
    };

    return (
        <div className="w-full">
            <h3
                className="mb-[20px] text-[20px] font-bold leading-[24px] text-[#111111]"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
                {title}
            </h3>

            <ul className="space-y-[6px]">
                {items.map((item) => {
                    const hasChildren = Boolean(item.children?.length);
                    const hasActiveChild = item.children?.some((child) => child.slug === selectedSubcategorySlug) ?? false;
                    const isExpanded = expanded.includes(item.slug) || selectedCategorySlug === item.slug || hasActiveChild;
                    const isActive = selectedCategorySlug === item.slug;

                    return (
                        <li key={item.id}>
                            <div className="flex items-center gap-[5px] py-[10px]">
                                {hasChildren ? (
                                    <button
                                        type="button"
                                        aria-label={`Toggle ${item.name}`}
                                        onClick={() => toggleExpand(item.slug)}
                                        className="flex h-[14px] w-[14px] items-center justify-center"
                                    >
                                        <svg
                                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                            width="10"
                                            height="10"
                                            viewBox="0 0 10 10"
                                            fill="none"
                                            aria-hidden="true"
                                        >
                                            <path d="M3 2 7 5 3 8V2Z" fill={isActive || hasActiveChild ? '#111111' : '#777777'} />
                                        </svg>
                                    </button>
                                ) : (
                                    <span className="h-[14px] w-[14px]" />
                                )}

                                <Link
                                    href={item.href}
                                    scroll={false}
                                    className={`text-[14px] leading-[14px] transition-colors duration-200 ${
                                        isActive ? 'font-medium text-black' : 'font-normal text-black hover:text-[#6f5640]'
                                    }`}
                                    style={{ fontFamily: '"Work Sans", sans-serif' }}
                                >
                                    {item.name}
                                </Link>
                            </div>

                            {hasChildren && isExpanded && (
                                <ul className="ml-[19px] space-y-[2px] pb-[6px]">
                                    {item.children?.map((child) => {
                                        const isChildActive = child.slug === selectedSubcategorySlug;

                                        return (
                                            <li key={child.id}>
                                                <Link
                                                    href={child.href}
                                                    scroll={false}
                                                    className={`block py-[6px] text-[13px] leading-[18px] transition-colors duration-200 ${
                                                        isChildActive
                                                            ? 'font-medium text-black'
                                                            : 'text-[#3f3f3f] hover:text-[#6f5640]'
                                                    }`}
                                                >
                                                    {child.name}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

const CategoryFilter = memo(CategoryFilterComponent);

export default CategoryFilter;
