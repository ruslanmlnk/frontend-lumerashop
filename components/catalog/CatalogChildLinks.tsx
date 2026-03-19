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
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => {
                const imageSrc = typeof item.image === 'string' && item.image.trim() ? item.image : DEFAULT_LOCAL_ASSET_FALLBACK;

                return (
                    <Link
                        key={item.id}
                        href={item.href}
                        className="group flex min-h-[88px] items-center gap-4 border border-[#111111] px-4 py-4 text-[#111111] transition-colors duration-200 hover:border-[#6f5640] hover:text-[#6f5640]"
                    >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden">
                            <Image
                                src={imageSrc}
                                alt={item.name}
                                fill
                                sizes="48px"
                                className="object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                            />
                        </div>

                        <span className="min-w-0 flex-1 text-[18px] leading-[1.25]">{item.name}</span>
                        <ArrowRight size={18} className="shrink-0" />
                    </Link>
                );
            })}
        </div>
    );
};

const CatalogChildLinks = memo(CatalogChildLinksComponent);

export default CatalogChildLinks;
