'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { isPayloadMediaProxyPath } from '@/lib/local-assets';
import type { Product } from '../types/site';

type ProductCardProps = {
    product: Product;
    variant?: 'default' | 'featured';
    showDiscount?: boolean;
};

const parseFormattedPrice = (value?: string) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return null;
    }

    const normalized = Number(value.replace(/\s+/g, '').replace(',', '.').replace(/[^\d.]/g, ''));
    if (Number.isFinite(normalized)) {
        return normalized;
    }

    const fallback = Number(value.replace(/[^\d]/g, ''));
    return Number.isFinite(fallback) ? fallback : null;
};

const ProductCardComponent = ({ product, variant = 'default', showDiscount = false }: ProductCardProps) => {
    const secondaryImage = product.gallery?.find((image) => image && image !== product.image);
    const hasSecondaryImage = Boolean(secondaryImage);
    const currentPrice = parseFormattedPrice(product.price);
    const previousPrice = parseFormattedPrice(product.oldPrice);
    const hasDiscount = showDiscount && typeof currentPrice === 'number' && typeof previousPrice === 'number' && previousPrice > currentPrice;

    const stock = useMemo(() => {
        if (typeof product.deliveryTime === 'number' && product.deliveryTime > 0) {
            return { label: `Do ${product.deliveryTime} dnů`, color: 'text-[#c9791d]' };
        }

        if (typeof product.stockQuantity === 'number') {
            if (product.stockQuantity <= 0) {
                return { label: 'Vyprodáno', color: 'text-[#c40000]' };
            }
            if (product.stockQuantity === 1) {
                return { label: 'Poslední kus', color: 'text-[#c9791d]' };
            }
            return { label: 'Skladem', color: 'text-[#008000]' };
        }

        return { label: 'Skladem', color: 'text-[#008000]' };
    }, [product.stockQuantity, product.deliveryTime]);

    const primaryImageClasses = hasSecondaryImage
        ? 'object-contain transition-all duration-700 ease-out group-hover:scale-[1.035] group-hover:opacity-0'
        : 'object-contain transition-transform duration-700 ease-out group-hover:scale-[1.035]';

    const secondaryImageClasses =
        'object-contain opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.035] group-hover:opacity-100';

    if (variant === 'featured') {
        return (
            <div className="group flex h-full flex-col bg-transparent px-[18px] pb-[19px] pt-[30px] transition-transform duration-300 ease-out will-change-transform hover:-translate-y-[3px]">
                <Link href={`/product/${product.slug}`} className="relative block h-[194px] w-full overflow-hidden">
                    <div className="absolute inset-0 px-[24px]">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(min-width: 1024px) 240px, (min-width: 768px) 30vw, 50vw"
                            decoding="async"
                            unoptimized={isPayloadMediaProxyPath(product.image)}
                            className={primaryImageClasses}
                        />
                        {secondaryImage ? (
                            <Image
                                src={secondaryImage}
                                alt=""
                                aria-hidden="true"
                                fill
                                sizes="(min-width: 1024px) 240px, (min-width: 768px) 30vw, 50vw"
                                decoding="async"
                                unoptimized={isPayloadMediaProxyPath(secondaryImage)}
                                className={secondaryImageClasses}
                            />
                        ) : null}
                    </div>
                </Link>

                <div className="flex flex-grow flex-col items-center px-[12px] pt-[20px] text-center transition-transform duration-300 ease-out group-hover:-translate-y-[1px]">
                    <h3
                        className="mb-0 font-serif text-[18px] font-bold leading-[1.2] text-[#111111]"
                        style={{ fontFamily: '"Cormorant Garamond", serif' }}
                    >
                        <Link href={`/product/${product.slug}`} className="transition-colors duration-200 hover:text-[#6f5640]">
                            {product.name}
                        </Link>
                    </h3>

                    <div className="mt-[9px] flex items-baseline gap-[8px]">
                        {hasDiscount ? (
                            <span
                                className="text-[14px] font-normal leading-none text-[#9ca3af] line-through"
                                style={{ fontFamily: '"Work Sans", sans-serif' }}
                            >
                                {product.oldPrice}
                            </span>
                        ) : null}
                        <p
                            className="m-0 text-[24px] font-medium leading-[1.6] text-[#111111] transition-colors duration-200 group-hover:text-[#6f5640]"
                            style={{ fontFamily: '"Work Sans", sans-serif' }}
                        >
                            {product.price}
                        </p>
                    </div>

                    <p className={`mt-1 text-[13px] font-bold ${stock.color}`} style={{ fontFamily: '"Work Sans", sans-serif' }}>
                        {stock.label}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="group flex h-full flex-col rounded-[18px] bg-transparent transition-transform duration-300 ease-out will-change-transform hover:-translate-y-[4px] md:p-[10px]">
            <Link
                href={`/product/${product.slug}`}
                className="relative block aspect-[1/1] overflow-hidden rounded-[18px] bg-transparent md:h-[216px]"
            >
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 320px, (min-width: 768px) 33vw, 50vw"
                    decoding="async"
                    unoptimized={isPayloadMediaProxyPath(product.image)}
                    className={
                        hasSecondaryImage
                            ? 'object-contain p-2 transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-0 md:p-0'
                            : 'object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-[1.04] md:p-0'
                    }
                />
                {secondaryImage ? (
                    <Image
                        src={secondaryImage}
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes="(min-width: 1024px) 320px, (min-width: 768px) 33vw, 50vw"
                        decoding="async"
                        unoptimized={isPayloadMediaProxyPath(secondaryImage)}
                        className="object-contain p-2 opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100 md:p-0"
                    />
                ) : null}
            </Link>
            <div className="flex flex-grow flex-col items-center px-1 text-center transition-transform duration-300 ease-out group-hover:-translate-y-[1px]">
                <h3
                    className="mb-0 mt-[10px] font-serif text-[16px] leading-[1.2] text-[#111111] md:mt-[20px] md:text-[20px] font-bold"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                    <Link href={`/product/${product.slug}`} className="transition-colors duration-200 hover:text-[#6f5640]">
                        {product.name}
                    </Link>
                </h3>

                <div className="mb-0 mt-[10px] flex items-baseline gap-[8px]" style={{ fontFamily: '"Work Sans", sans-serif' }}>
                    {hasDiscount ? (
                        <span className="text-[13px] font-normal leading-none text-[#9ca3af] line-through md:text-[16px]">
                            {product.oldPrice}
                        </span>
                    ) : null}
                    <p className="m-0 text-[18px] font-normal leading-[1.2] text-[#111111] transition-colors duration-200 group-hover:text-[#6f5640] md:mt-[20px] md:text-[24px]">
                        {product.price}
                    </p>
                </div>
                
                <p className={`mt-2 text-[13px] font-bold ${stock.color} md:text-[14px]`} style={{ fontFamily: '"Work Sans", sans-serif' }}>
                    {stock.label}
                </p>
            </div>
        </div>
    );
};

const ProductCard = memo(ProductCardComponent);

export default ProductCard;
