"use client";

import ProductGrid from "@/components/ProductGrid";
import Features from "@/components/Features";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
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
  const { addToCart } = useCart();
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const descriptionHtml = product.descriptionHtml || "";
  const specifications = product.specifications;
  const reviews = product.reviews;
  const variants = product.variants ?? [];

  const handleAddToCart = (quantity: number) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: normalizePrice(product.price),
      image: gallery[0] || product.image,
      quantity,
      slug: product.slug,
      sku: product.sku,
    });
  };

  return (
    <main className="pt-6 pb-16 md:pt-0">
      <div className="mx-auto w-full max-w-[1140px] px-[55px] sm:px-7 lg:px-0">
        <div className="mb-6 md:hidden">
          <h1 className="font-serif text-[34px] font-bold leading-[1.08] text-[#111111]">
            {product.name}
          </h1>
        </div>

        <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-[60px]">
          <div className="w-full">
            <ProductGallery images={gallery} productName={product.name} />
          </div>

          <div className="w-full lg:pt-[30px]">
            <ProductInfo
              name={product.name}
              price={product.price}
              oldPrice={product.oldPrice}
              sku={product.sku}
              highlights={product.highlights}
              stockStatus={product.stockStatus || "in-stock"}
              variants={variants}
              onAddToCart={handleAddToCart}
              showTitleOnMobile={false}
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
