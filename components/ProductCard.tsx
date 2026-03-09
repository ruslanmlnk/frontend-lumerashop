'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '../types/site';

type ProductCardProps = {
    product: Product;
    variant?: 'default' | 'featured';
};

const ProductCardComponent = ({ product, variant = 'default' }: ProductCardProps) => {
    if (variant === 'featured') {
        return (
            <div className="group flex h-full flex-col bg-transparent px-[18px] pb-[19px] pt-[30px] transition-transform duration-300 ease-out will-change-transform hover:-translate-y-[3px]">
                <Link href={`/product/${product.slug}`} className="relative block h-[194px] w-full overflow-hidden">
                    <div className="absolute inset-0 px-[24px]">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                        />
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

                    <div className="mt-[9px]">
                        <p
                            className="m-0 text-[24px] font-medium leading-[1.6] text-[#111111] transition-colors duration-200 group-hover:text-[#6f5640]"
                            style={{ fontFamily: '"Work Sans", sans-serif' }}
                        >
                            {product.price}
                        </p>
                    </div>
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
                    className="object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-[1.04] md:p-0"
                />
            </Link>
            <div className="flex flex-grow flex-col items-center px-1 text-center transition-transform duration-300 ease-out group-hover:-translate-y-[1px]">
                <h3
                    className="mb-0 mt-[10px] font-serif text-[16px] font-normal leading-[1.2] text-[#111111] md:mt-[20px] md:text-[20px]"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                    <Link href={`/product/${product.slug}`} className="transition-colors duration-200 hover:text-[#6f5640]">
                        {product.name}
                    </Link>
                </h3>

                <div className="mb-0 mt-[10px]" style={{ fontFamily: '"Work Sans", sans-serif' }}>
                    <p className="m-0 text-[18px] font-normal leading-[1.2] text-[#111111] transition-colors duration-200 group-hover:text-[#6f5640] md:mt-[20px] md:text-[24px]">
                        {product.price}
                    </p>
                </div>
            </div>
        </div>
    );
};

const ProductCard = memo(ProductCardComponent);

export default ProductCard;
