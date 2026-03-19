import Link from "next/link";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductPageClient from "@/components/product/ProductPageClient";
import { fetchPayloadProductBySlug, fetchPayloadProducts } from "@/lib/payload-products";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, recommendedProducts] = await Promise.all([
    fetchPayloadProductBySlug(slug),
    fetchPayloadProducts({
      recommendedOnly: true,
      limit: 7,
    }),
  ]);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center p-20 text-center">
          <h1 className="mb-6 font-serif text-[32px]">Produkt nebyl nalezen</h1>
          <Link
            href="/shop"
            className="bg-black px-8 py-3 text-[14px] uppercase tracking-wider text-white"
          >
            Zpet do obchodu
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const recommendedForView = recommendedProducts
    .filter((item) => item.slug !== product.slug)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-white font-sans text-[#111111]">
      <Header />
      <ProductPageClient
        product={product}
        recommendedProducts={recommendedForView}
      />
      <Footer />
    </div>
  );
}
