'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DEFAULT_LOCAL_ASSET_FALLBACK } from '@/lib/local-assets';

type CatalogChildLinkItem = {
    id: string;
    name: string;
    href: string;
    image?: string;
};

type CatalogChildLinksProps = {
    items: CatalogChildLinkItem[];
};

const CatalogChildLinksComponent = ({ items }: CatalogChildLinksProps) => {
    if (!items.length) {
        return null;
    }

    return (
        <div className="mb-10 flex flex-col gap-2.5 lg:flex-row lg:flex-wrap lg:items-stretch">
            {items.map((item) => {
                const imageSrc = typeof item.image === 'string' && item.image.trim() ? item.image : DEFAULT_LOCAL_ASSET_FALLBACK;

                return (
                    <Link
                        key={item.id}
                        href={item.href}
                        className="group flex min-h-[66px] w-full items-center gap-3 border border-[#111111] px-3 py-2.5 text-[#111111] transition-colors duration-200 hover:border-[#6f5640] hover:text-[#6f5640] lg:w-[calc((100%-1.875rem)/4)]"
                    >
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden lg:h-10 lg:w-10">
                            <Image
                                src={imageSrc}
                                alt={item.name}
                                fill
                                sizes="40px"
                                className="object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                            />
                        </div>

                        <span className="min-w-0 flex-1 text-[14px] leading-[1.2] lg:text-[15px]">{item.name}</span>
                        <ArrowRight size={16} className="ml-auto shrink-0" />
                    </Link>
                );
            })}
        </div>
    );
};

const CatalogChildLinks = memo(CatalogChildLinksComponent);

export default CatalogChildLinks;
