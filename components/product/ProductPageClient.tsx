"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import ProductGrid from "@/components/ProductGrid";
import Features from "@/components/Features";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import { useCart } from "@/context/CartContext";
import type { FirstPurchasePromoConfig } from "@/types/commerce";
import type { Product, ProductMedia } from "@/types/site";

type ProductPageClientProps = {
  product: Product;
  recommendedProducts: Product[];
  firstPurchasePromo: FirstPurchasePromoConfig;
  showBonusProgram: boolean;
};

const normalizePrice = (price: string) => {
  const normalized = Number(price.replace(/\s+/g, "").replace(",", ".").replace(/[^\d.]/g, ""));

  if (Number.isFinite(normalized) && normalized > 0) {
    return Math.round(normalized);
  }

  const fallback = Number(price.replace(/[^\d]/g, ""));
  return Number.isFinite(fallback) ? fallback : 0;
};

export default function ProductPageClient({
  product,
  recommendedProducts,
  firstPurchasePromo,
  showBonusProgram,
}: ProductPageClientProps) {
  const { addToCart, cartItems } = useCart();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [lastAddedQuantity, setLastAddedQuantity] = useState(1);
  const galleryItems = useMemo<ProductMedia[]>(() => {
    const fallbackImages = (product.gallery ?? []).map((url) => ({
      type: "image" as const,
      url,
    }));
    const sourceItems = [
      { type: "image" as const, url: product.image, alt: product.name },
      ...(product.mediaGallery?.length ? product.mediaGallery : fallbackImages),
    ];
    const uniqueItems = new Map<string, ProductMedia>();

    for (const item of sourceItems) {
      if (!item?.url) {
        continue;
      }

      uniqueItems.set(`${item.type}:${item.url}`, item);
    }

    return Array.from(uniqueItems.values());
  }, [product.gallery, product.image, product.mediaGallery, product.name]);
  const normalizedPrice = useMemo(() => normalizePrice(product.price), [product.price]);
  const currentCartQuantity = useMemo(
    () => cartItems.find((item) => item.id === product.id)?.quantity ?? 0,
    [cartItems, product.id],
  );
  const addConfirmationCartTotal = useMemo(
    () => normalizedPrice * lastAddedQuantity,
    [lastAddedQuantity, normalizedPrice],
  );
  const hasFreeShippingInAddConfirmation = addConfirmationCartTotal >= 1500;
  const primaryCartImage = product.image;
  const descriptionHtml = product.descriptionHtml || "";
  const specifications = product.specifications;
  const reviews = product.reviews;
  const variants = product.variants ?? [];

  useEffect(() => {
    if (!isAddConfirmationOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAddConfirmationOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAddConfirmationOpen]);

  const handleAddToCart = (quantity: number) => {
    const shouldOpenAddConfirmation = cartItems.length === 0;

    addToCart({
      id: product.id,
      name: product.name,
      price: normalizedPrice,
      image: primaryCartImage,
      quantity,
      slug: product.slug,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
    });

    if (shouldOpenAddConfirmation) {
      setLastAddedQuantity(quantity);
      setIsAddConfirmationOpen(true);
      return;
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lumera:cart-open"));
    }
  };

  const openCartDrawer = () => {
    setIsAddConfirmationOpen(false);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lumera:cart-open"));
    }
  };

  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: "Domů", href: "/" },
      { label: "Obchod", href: "/shop" },
    ];

    if (product.category && product.categorySlug) {
      items.push({
        label: product.category,
        href: `/product-category/${product.categorySlug}`,
      });
    }

    if (product.categoryGroup && product.categoryGroupSlug) {
      items.push({
        label: product.categoryGroup,
        href: `/product-category/${product.categorySlug}/${product.categoryGroupSlug}`,
      });
    }

    return items;
  }, [product.category, product.categoryGroup, product.categoryGroupSlug, product.categorySlug]);

  return (
    <main className="pt-6 pb-16 md:pt-0">
      <div className="mx-auto w-full max-w-[1140px] px-[55px] sm:px-7 lg:px-0">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[13px] text-[#7a7164] md:mb-8 md:mt-8">
          {breadcrumbItems.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <Link href={crumb.href} className="transition hover:text-black hover:underline">
                {crumb.label}
              </Link>
              <span className="text-[#d1cfcd]">&gt;</span>
            </div>
          ))}
          <span className="font-medium text-[#111111]">{product.name}</span>
        </nav>

        <div className="mb-6 md:hidden">
          <h1 className="font-serif text-[34px] font-bold leading-[1.08] text-[#111111]">
            {product.name}
          </h1>
        </div>

        <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-[60px]">
          <div className="w-full">
            <ProductGallery key={product.id} items={galleryItems} productName={product.name} />
          </div>

          <div className="w-full lg:pt-[30px]">
            <ProductInfo
              name={product.name}
              price={product.price}
              oldPrice={product.oldPrice}
              sku={product.sku}
              highlights={product.highlights}
              stockQuantity={product.stockQuantity}
              currentCartQuantity={currentCartQuantity}
              variants={variants}
              onAddToCart={handleAddToCart}
              showTitleOnMobile={false}
              deliveryTime={product.deliveryTime}
              firstPurchasePromo={firstPurchasePromo}
              showBonusProgram={showBonusProgram}
            />
          </div>
        </section>

        <section className="mb-16 mt-[36px]">
          <ProductTabs
            productId={product.id}
            contentHtml={descriptionHtml}
            specifications={specifications}
            reviews={reviews}
          />
        </section>
      </div>

      <div className="mt-[20px]">
        <Features />
      </div>

      {recommendedProducts.length > 0 ? (
        <div className="mt-[35px]">
          <ProductGrid
            title="Novinky"
            products={recommendedProducts}
            description="Podivejte se na nejnovejsi modely, ktere prave dorazily z Italie"
            isSlider={true}
            alignLeft={true}
            variant="novinky"
            autoPlay={false}
          />
        </div>
      ) : null}

      {isAddConfirmationOpen ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 px-4 py-6"
          onClick={() => setIsAddConfirmationOpen(false)}
        >
          <div
            className="w-full max-w-[760px] bg-white px-6 py-10 text-center shadow-[0_24px_80px_rgba(17,17,17,0.2)] sm:px-10"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-to-cart-modal-title"
          >
            <h2
              id="add-to-cart-modal-title"
              className="font-serif text-[34px] font-bold leading-[1.1] text-[#111111] sm:text-[52px]"
            >
              Pridano do kosiku
            </h2>

            <p className="mx-auto mt-6 max-w-[620px] text-[20px] leading-[1.5] text-[#2f2a24] sm:text-[24px]">
              {product.name}
            </p>

            <p className="mt-8 text-[18px] font-semibold text-[#2f2a24] sm:text-[22px]">
              {hasFreeShippingInAddConfirmation ? "Dopravu mate zdarma!" : "Doprava zdarma od 1 500 Kc"}
            </p>

            <p className="mt-5 text-[18px] leading-[1.5] text-[#3f382f] sm:text-[20px]">
              {firstPurchasePromo.modalMessage}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setIsAddConfirmationOpen(false)}
                className="inline-flex min-h-[54px] items-center justify-center rounded-[16px] border border-[#7da07e] px-8 text-[16px] font-medium text-[#628163] transition-colors hover:bg-[#f5faf5]"
              >
                Zpet do obchodu
              </button>

              <button
                type="button"
                onClick={openCartDrawer}
                className="inline-flex min-h-[54px] items-center justify-center rounded-[16px] bg-[#222222] px-8 text-[16px] font-semibold text-white transition-colors hover:bg-black"
              >
                Nakupni kosik
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
