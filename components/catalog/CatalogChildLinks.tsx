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
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-stretch">
            {items.map((item) => {
                const imageSrc = typeof item.image === 'string' && item.image.trim() ? item.image : DEFAULT_LOCAL_ASSET_FALLBACK;

                return (
                    <Link
                        key={item.id}
                        href={item.href}
                        className="group flex min-h-[74px] w-full items-center gap-4 border border-[#111111] px-4 py-3 text-[#111111] transition-colors duration-200 hover:border-[#6f5640] hover:text-[#6f5640] md:w-[310px]"
                    >
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden md:h-12 md:w-12">
                            <Image
                                src={imageSrc}
                                alt={item.name}
                                fill
                                sizes="48px"
                                className="object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                            />
                        </div>

                        <span className="min-w-0 flex-1 text-[16px] leading-[1.25] md:text-[17px]">{item.name}</span>
                        <ArrowRight size={18} className="ml-auto shrink-0" />
                    </Link>
                );
            })}
        </div>
    );
};

const CatalogChildLinks = memo(CatalogChildLinksComponent);

export default CatalogChildLinks;
