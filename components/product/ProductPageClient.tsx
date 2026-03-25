"use client";

import { useMemo } from "react";
import Link from "next/link";

import ProductGrid from "@/components/ProductGrid";
import Features from "@/components/Features";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/site";

type ProductPageClientProps = {
  product: Product;
  recommendedProducts: Product[];
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
}: ProductPageClientProps) {
  const { addToCart, cartItems } = useCart();
  const gallery = useMemo(() => {
    const sourceImages = product.gallery?.length ? product.gallery : [product.image];
    return Array.from(new Set(sourceImages.filter(Boolean)));
  }, [product.gallery, product.image]);
  const normalizedPrice = useMemo(() => normalizePrice(product.price), [product.price]);
  const currentCartQuantity = useMemo(
    () => cartItems.find((item) => item.id === product.id)?.quantity ?? 0,
    [cartItems, product.id],
  );
  const primaryCartImage = gallery[0] || product.image;
  const descriptionHtml = product.descriptionHtml || "";
  const specifications = product.specifications;
  const reviews = product.reviews;
  const variants = product.variants ?? [];

  const handleAddToCart = (quantity: number) => {
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
            <ProductGallery key={product.id} images={gallery} productName={product.name} />
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
    </main>
  );
}
