'use client';

import { use } from 'react';
import Link from 'next/link';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import Features from '@/components/Features';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductTabs from '@/components/product/ProductTabs';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/lib/use-products';

const normalizePrice = (price: string) => {
  const normalized = Number(price.replace(/\s+/g, '').replace(',', '.').replace(/[^\d.]/g, ''));

  if (Number.isFinite(normalized) && normalized > 0) {
    return Math.round(normalized);
  }

  const fallback = Number(price.replace(/[^\d]/g, ''));
  return Number.isFinite(fallback) ? fallback : 0;
};

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addToCart } = useCart();
  const { products, loading } = useProducts();

  const product = products.find((item) => item.slug === slug);

  if (!product && loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center p-20">
          <p className="text-[18px] text-gray-500">Nacitam produkt...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center p-20">
          <h1 className="mb-6 font-serif text-[32px]">Produkt nebyl nalezen</h1>
          <Link href="/shop" className="bg-black px-8 py-3 text-[14px] uppercase tracking-wider text-white">
            Zpet do obchodu
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const descriptionHtml = product.descriptionHtml || '';
  const specifications = product.specifications;
  const reviews = product.reviews;
  const variants = product.variants ?? [];
  const recommendedProducts = products
    .filter((item) => item.isRecommended && item.slug !== product.slug)
    .slice(0, 6);

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
    <div className="min-h-screen bg-white font-sans text-[#111111]">
      <Header />

      <main className="pb-16 pt-[148px] lg:pt-[164px]">
        <div className="lumera-container">
          <div className="mb-6 md:hidden">
            <h1 className="font-serif text-[34px] font-normal leading-[1.08] text-[#111111]">
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
                stockStatus={product.stockStatus || 'in-stock'}
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

          <div className="mt-[20px] hidden md:block">
            <Features />
          </div>

          {recommendedProducts.length > 0 && (
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
