'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DEFAULT_LOCAL_ASSET_FALLBACK, isPayloadMediaProxyPath } from '@/lib/local-assets';

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
                        className="group flex w-full items-center gap-3 border border-[#111111] px-3 py-[7px] text-[#111111] transition-colors duration-200 hover:border-[#6f5640] hover:text-[#6f5640] lg:w-[calc((100%-1.875rem)/4)]"
                    >
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden lg:h-9 lg:w-9">
                            <Image
                                src={imageSrc}
                                alt={item.name}
                                fill
                                sizes="26px"
                                decoding="async"
                                unoptimized={isPayloadMediaProxyPath(imageSrc)}
                                className="object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                            />
                        </div>

                        <span className="min-w-0 flex-1 text-[13px] leading-[1.15] lg:text-[14px]">{item.name}</span>
                        <ArrowRight size={15} className="ml-auto shrink-0" />
                    </Link>
                );
            })}
        </div>
    );
};

const CatalogChildLinks = memo(CatalogChildLinksComponent);

export default CatalogChildLinks;
