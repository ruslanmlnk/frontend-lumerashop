"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRemainingStock } from "@/lib/stock";
import type { ProductVariant } from "@/types/site";

interface ProductInfoProps {
  name: string;
  price: string;
  oldPrice?: string;
  sku?: string;
  highlights?: string[];
  stockQuantity?: number;
  currentCartQuantity?: number;
  variants?: ProductVariant[];
  onAddToCart?: (quantity: number) => void;
  showTitleOnMobile?: boolean;
  deliveryTime?: number;
}

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, "").trim();
const isPayloadMediaProxyPath = (value: string) => value.startsWith("/api/payload-media/");

const ProductInfo = ({
  name,
  price,
  oldPrice,
  sku,
  highlights,
  stockQuantity,
  currentCartQuantity = 0,
  variants,
  onAddToCart,
  showTitleOnMobile = true,
  deliveryTime,
}: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);
  const availableToAdd = useMemo(
    () => getRemainingStock(stockQuantity, currentCartQuantity),
    [currentCartQuantity, stockQuantity],
  );
  const isAddToCartDisabled = availableToAdd === 0;
  const canIncreaseQuantity = typeof availableToAdd === "number" ? quantity < availableToAdd : true;

  const stock = useMemo(() => {
    if (typeof deliveryTime === "number" && deliveryTime > 0) {
      return { label: `Do ${deliveryTime} dnů`, color: "text-[#c9791d]" };
    }

    if (typeof stockQuantity === "number") {
      if (stockQuantity <= 0) {
        return { label: "Vyprodáno", color: "text-[#c40000]" };
      }

      if (stockQuantity === 1) {
        return { label: "Poslední kus", color: "text-[#c9791d]" };
      }

      return { label: "Skladem", color: "text-[#008000]" };
    }

    return { label: "Skladem", color: "text-[#008000]" };
  }, [stockQuantity, deliveryTime]);

  const summaryItems = useMemo(() => {
    const items: string[] = [];

    if (Array.isArray(highlights) && highlights.length > 0) {
      highlights.forEach((highlight) => {
        const cleanHighlight = stripHtml(highlight);
        if (cleanHighlight) {
          items.push(cleanHighlight);
        }
      });
    }

    return Array.from(new Set(items));
  }, [highlights]);

  useEffect(() => {
    if (typeof availableToAdd !== "number") {
      return;
    }

    setQuantity((prev) => Math.min(prev, Math.max(1, availableToAdd)));
  }, [availableToAdd]);

  return (
    <div className="w-full pb-[36px] text-[#111111]">
      <h1
        className={`${showTitleOnMobile ? "block" : "hidden md:block"} mb-[20px] font-serif text-[36px] font-bold leading-[1.1] lg:text-[48px] lg:leading-[52.8px]`}
      >
        {name}
      </h1>

      <p className={`mb-[14px] mt-[-8px] text-[15px] font-bold ${stock.color}`}>{stock.label}</p>

      {sku && <p className="mb-[20px] mt-[10px] text-[14px] text-[#999999]">{sku}</p>}

      <div className="mb-[20px] flex items-baseline gap-[10px]">
        <span className="text-[20px] font-bold leading-[1.3]">{price}</span>
        {oldPrice && <span className="text-[16px] text-[#9ca3af] line-through">{oldPrice}</span>}
      </div>

      <div className="mb-[26px] mt-[20px] flex flex-col gap-[12px] sm:flex-row sm:items-center sm:gap-[15px]">
        <div className="flex h-[42px] w-[125px] items-center justify-between border border-[#e5e5e5] bg-white">
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className="flex h-full w-[32px] items-center justify-center text-[#111111] transition hover:bg-[#f9f9f9]"
            aria-label="Decrease quantity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
              <path d="m 4 8 h 8" fill="none" stroke="currentColor" strokeWidth="1" fillRule="evenodd" />
            </svg>
          </button>

          <input
            type="text"
            value={quantity}
            readOnly
            className="w-[59px] border-none bg-transparent text-center text-[16px] outline-none"
            aria-label="Quantity"
          />

          <button
            type="button"
            onClick={() =>
              setQuantity((prev) => {
                if (typeof availableToAdd === "number") {
                  return Math.min(prev + 1, availableToAdd);
                }

                return prev + 1;
              })
            }
            className="flex h-full w-[32px] items-center justify-center text-[#111111] transition hover:bg-[#f9f9f9] disabled:cursor-not-allowed disabled:text-[#d0cbc4]"
            aria-label="Increase quantity"
            disabled={!canIncreaseQuantity}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
              <path d="m 4 8 h 8 M 8 4 v 8" fill="none" stroke="currentColor" strokeWidth="1" fillRule="evenodd" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onAddToCart?.(quantity);
            if (onAddToCart && typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("lumera:cart-open"));
            }
          }}
          disabled={isAddToCartDisabled}
          className="inline-flex h-[42px] w-full items-center justify-center whitespace-nowrap bg-black px-[30px] text-[15px] font-bold uppercase tracking-[0.02em] text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:bg-[#8e8e8e] sm:w-auto"
        >
          Přidat do košíku
        </button>
      </div>

      {/* {availableToAdd === 0 && stockStatus !== "out-of-stock" ? (
        <p className="mb-[16px] mt-[-10px] text-[13px] leading-[1.5] text-[#6b6257]">
          V koĹˇĂ­ku uĹľ mĂˇte maximĂˇlnĂ­ dostupnĂ© mnoĹľstvĂ­ tohoto produktu.
        </p>
      ) : null} */}

      {variants && variants.length > 0 && (
        <div className="mb-[14px]">
          <p className="mb-[10px] text-[14px] font-bold">Barevné varianty:</p>
          <div className="flex flex-wrap gap-[8px]">
            {variants.map((variant) => (
              <Link
                key={variant.id}
                href={`/product/${variant.slug}`}
                title={variant.name}
                className="relative block h-[70px] w-[70px] overflow-hidden border border-transparent transition hover:border-[#111111]"
              >
                <Image
                  src={variant.image}
                  alt={variant.name}
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="70px"
                  unoptimized={isPayloadMediaProxyPath(variant.image)}
                  className="object-contain p-[2px]"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-[20px] space-y-[8px]">
        <div className="flex items-center gap-[10px]">
          <Image
            src="/images/icons/truck.png"
            alt="Truck icon"
            width={22}
            height={22}
            className="object-contain"
          />
          <span className="text-[14px] leading-[1.6] text-[#111111]">
            Doprava zdarma při nákupu nad 1500 Kč
          </span>
        </div>

        <div className="flex items-center gap-[10px]">
          <Image
            src="/images/icons/return.png"
            alt="Return icon"
            width={22}
            height={22}
            className="object-contain"
          />
          <span className="text-[14px] leading-[1.6] text-[#111111]">14 dní na vrácení</span>
        </div>

        <div className="flex items-center gap-[10px]">
          <Image
            src="/discount.png"
            alt="Discount icon"
            width={22}
            height={22}
            className="object-contain"
          />
          <span className="text-[14px] leading-[1.6] text-[#111111]">100 Kč sleva na první nákup</span>
        </div>

        <div className="flex items-center gap-[10px]">
          <Image
            src="/coin.png"
            alt="Coin icon"
            width={22}
            height={22}
            className="object-contain"
          />
          <span className="text-[14px] leading-[1.6] text-[#111111]">Věrnostní program plný odměn</span>
        </div>
      </div>

      {summaryItems.length > 0 && (
        <div className="mt-[20px] text-[16px] leading-[1.6] text-[#111111]">
          <ul className="list-disc space-y-[2px] pl-[20px]">
            {summaryItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
