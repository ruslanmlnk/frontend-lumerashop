import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';

import Features from '@/components/Features';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LazyAutoplayVideo from '@/components/LazyAutoplayVideo';
import MarketingSlider from '@/components/MarketingSlider';
import ProductGrid from '@/components/ProductGrid';
import Testimonials from '@/components/Testimonials';
import type { MarketingSlide } from '@/data/marketing-slides';
import { isPayloadMediaProxyPath } from '@/lib/local-assets';
import { fetchPayloadArticles } from '@/lib/payload-articles';
import { getGlobal } from '@/lib/payload-data';
import { fetchPayloadProducts } from '@/lib/payload-products';
import { getProductPurchaseCount, sortProductsByPopularity } from '@/lib/product-sorting';
import type { BlogPost, Testimonial } from '@/types/site';

type HomePageAboutSection = {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
};

type HomePageTestimonialItem = {
  text?: string;
  author?: string;
  location?: string;
};

type HomePageTestimonialsSection = {
  title?: string;
  items?: HomePageTestimonialItem[];
};

type HomePageFeaturedArticle = {
  slug?: string;
};

type HomePageBlogSection = {
  title?: string;
  description?: string;
  featuredArticles?: HomePageFeaturedArticle[];
};

type HomePageGlobal = {
  seo?: {
    title?: string;
    description?: string;
  };
  aboutSection?: HomePageAboutSection;
  testimonialsSection?: HomePageTestimonialsSection;
  blogSection?: HomePageBlogSection;
  marketingSlides?: MarketingSlide[];
};

export async function generateMetadata(): Promise<Metadata> {
  const homePageData = (await getGlobal('home-page')) as HomePageGlobal | null;

  return {
    title: homePageData?.seo?.title || 'Lumera Shop | Italské kožené kabelky',
    description:
      homePageData?.seo?.description ||
      'Objevte eleganci s Lumera. Italské kožené kabelky a doplňky přímo od výrobců.',
  };
}

export default async function Home() {
  const [homePageData, products] = await Promise.all([
    getGlobal('home-page') as Promise<HomePageGlobal | null>,
    fetchPayloadProducts(),
  ]);
  const featuredProducts = products.filter((product) => product.isFeatured);
  const recommendedProducts = products.filter((product) => product.isRecommended);
  const popularProducts = sortProductsByPopularity(products);
  const productsWithPurchases = popularProducts.filter((product) => getProductPurchaseCount(product) > 0);
  const featuredForView = (productsWithPurchases.length ? productsWithPurchases : featuredProducts).slice(0, 8);

  const aboutSection = homePageData?.aboutSection;
  const aboutTitle =
    typeof aboutSection?.title === 'string' && aboutSection.title.length > 0
      ? aboutSection.title
      : 'O obchodě Lumera';
  const aboutDescription =
    typeof aboutSection?.description === 'string' && aboutSection.description.length > 0
      ? aboutSection.description
      : 'Lumera je český obchod s italskými koženými kabelkami a doplňky.\nSpolupracujeme s menšími výrobci z Itálie, kteří si zakládají na kvalitě a ručním zpracování. Každý model pečlivě vybíráme tak, aby spojoval eleganci, praktičnost a originalitu. Věříme, že krása je v detailu - stejně jako v každé kabelce, kterou nabízíme.';
  const aboutButtonText =
    typeof aboutSection?.buttonText === 'string' && aboutSection.buttonText.length > 0
      ? aboutSection.buttonText
      : 'Zjistit více o obchodě';
  const aboutButtonLink =
    typeof aboutSection?.buttonLink === 'string' && aboutSection.buttonLink.length > 0
      ? aboutSection.buttonLink
      : '/o-nas';
  const testimonialsSection =
    typeof homePageData?.testimonialsSection === 'object' && homePageData.testimonialsSection
      ? homePageData.testimonialsSection
      : null;
  const testimonialsTitle =
    typeof testimonialsSection?.title === 'string' && testimonialsSection.title.length > 0
      ? testimonialsSection.title
      : 'Co o nás říkají naše zákaznice';
  const testimonials: Testimonial[] = Array.isArray(testimonialsSection?.items)
    ? testimonialsSection.items
      .filter(
        (item): item is { text: string; author: string; location?: string } =>
          typeof item?.text === 'string' &&
          item.text.trim().length > 0 &&
          typeof item?.author === 'string' &&
          item.author.trim().length > 0,
      )
      .map((item: { text: string; author: string; location?: string }) => ({
        text: item.text.trim(),
        author: item.author.trim(),
        location: typeof item.location === 'string' ? item.location.trim() : '',
      }))
    : [];
  const blogSection = typeof homePageData?.blogSection === 'object' && homePageData.blogSection ? homePageData.blogSection : null;
  const blogSectionTitle =
    typeof blogSection?.title === 'string' && blogSection.title.trim().length > 0
      ? blogSection.title.trim()
      : 'Z blogu Lumera';
  const blogSectionDescription =
    typeof blogSection?.description === 'string' && blogSection.description.trim().length > 0
      ? blogSection.description.trim()
      : 'Styl, inspirace a péče o vaše kožené doplňky.';
  const selectedBlogSlugs = Array.isArray(blogSection?.featuredArticles)
    ? blogSection.featuredArticles
      .map((item: HomePageFeaturedArticle) => {
        if (typeof item === 'object' && item && typeof item.slug === 'string') {
          return item.slug.trim();
        }

        return '';
      })
      .filter((slug: string): slug is string => slug.length > 0)
    : [];
  const blogPosts: BlogPost[] = selectedBlogSlugs.length > 0 ? await fetchPayloadArticles() : [];
  const blogPostMap = new Map<string, BlogPost>(blogPosts.map((post: BlogPost) => [post.slug, post] as const));
  const selectedBlogPosts = selectedBlogSlugs
    .map((slug: string) => blogPostMap.get(slug))
    .filter((post): post is BlogPost => Boolean(post));

  return (
    <div className="min-h-screen bg-white font-sans text-[#111111] selection:bg-amber-100 italic-selection">
      <Header />
      <main>
        <Hero />

        <div className="mt-10 md:mt-[23px]">
          <MarketingSlider slides={homePageData?.marketingSlides} />
        </div>
<div className='md:mt-15'>
        {featuredForView.length > 0 && (
            <ProductGrid
              title={'Oblíbené modely'}
              products={featuredForView}
              description={
                'Nejoblíbenější kožené kabelky, peněženky a doplňky od italských výrobců.'
              }
              isSlider={true}
              autoPlay={false}
              cardVariant="featured"
              arrowTheme="gold"
              showShopButton={true}
            />
        )}
</div>
        <section className="flex justify-center overflow-hidden bg-white" id="block-6">
          <div className="lumera-container">
            <div className="relative mb-0 flex flex-col lg:flex-row tracking-[0.1px]">
              <div className="flex min-h-[100px] w-full flex-col p-[10px] md:min-h-[396px] md:p-[30px] lg:w-1/2">
                <h2
                  className="mb-0 font-serif text-[30px] leading-[1.1] font-bold text-[#111111] md:text-[36px] lg:text-[48px]"
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                  {aboutTitle}
                </h2>
                <p
                  className="mt-[20px] mb-0 whitespace-pre-line text-[14px] font-normal leading-[1.6] text-[#111111] md:text-[16px]"
                  style={{ fontFamily: '"Work Sans", sans-serif' }}
                >
                  {aboutDescription}
                </p>
                <div className="mt-[33px]">
                  <Link href={aboutButtonLink} className="lumera-btn">
                    {aboutButtonText}
                  </Link>
                </div>
              </div>

              <div className="relative flex min-h-[100px] mt-[50px] md:mt-[0px] w-full items-end justify-center p-0 md:min-h-[396px] md:items-center md:p-[30px] lg:w-1/2">
                <div className="relative h-[339px] w-full overflow-hidden bg-transparent md:h-[336px]">
                  <LazyAutoplayVideo
                    src="/assets/videos/about.mp4"
                    className="h-full w-full object-cover md:object-cover"
                    placeholderClassName="h-full w-full bg-[#f6f3ef]"
                    posterSrc="/assets/bg/about-hero.webp"
                    posterClassName="object-cover"
                    posterSizes="(min-width: 1024px) 570px, 100vw"
                    preload="metadata"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className='mt-[70px]'>
          <Features />
        </div>

        {recommendedProducts.length > 0 && (
          <div>
            <ProductGrid
              title="Naše doporučení"
              alignLeft={true}
              products={recommendedProducts}
              description="Vybrali jsme pro vás několik oblíbených modelů z Itálie. Každý z nich spojuje kvalitu, styl a poctivou ruční práci."
            />
          </div>
        )}

        {testimonials.length > 0 && <Testimonials title={testimonialsTitle} testimonials={testimonials} />}

        {selectedBlogPosts.length > 0 && (
          <section className="bg-white py-[23px] md:py-[40px]" id="block-9">
            <div className="lumera-container">
              <h2
                className="mb-[13px] font-serif text-[30px] font-bold text-[#111111] md:text-[36px]"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                {blogSectionTitle}
              </h2>
              <p
                className="mb-[52px] text-[16px] leading-[1.6] text-[#111111] tracking-[0.07px]"
                style={{ fontFamily: '"Work Sans", sans-serif' }}
              >
                {blogSectionDescription}
              </p>

              <div className="mb-[51px] grid grid-cols-1 gap-[85px] md:gap-[10px] md:grid-cols-3 px-[10px]">
                {selectedBlogPosts.map((post: BlogPost, idx: number) => (
                  <div key={idx} className="flex flex-col">
                    <h3 className="mb-[40.5px] font-serif text-[24px] tracking-[0.1px] leading-[1.2] font-normal">
                      <Link href={`/blog/${post.slug}`} className="text-[#111111] hover:text-[#111111]">
                        {post.title}
                      </Link>
                    </h3>
                    <Link href={`/blog/${post.slug}`} className="relative block h-[142px] w-full">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        decoding="async"
                        unoptimized={isPayloadMediaProxyPath(post.image)}
                        className="object-cover"
                      />
                    </Link>
                    <p
                      className="text-[16px] leading-[1.6] text-[#111111] tracking-[0.1px]"
                      style={{ fontFamily: '"Work Sans", sans-serif' }}
                    >
                      {post.excerpt}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/blog" className="lumera-btn">
                  Objevte více inspirace
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white py-0 mt-[17px] md:mt-0" id="block-10">
          <div className="lumera-container">
            <div className="relative flex h-[343px] w-full flex-col justify-center px-[20px] md:h-[340px] md:px-[40px] lg:px-[40px] lg:pr-[129.1px]">
              <div className="absolute inset-0 z-0">
                <Image
                  src="/assets/bg/cta-home.webp"
                  alt="Objevte Lumera"
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/50" />
              </div>

              <div className="relative z-10 flex w-full flex-col md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl text-left">
                  <h2
                    className="mb-[0px] font-serif text-[30px] leading-[1.1] font-bold text-white md:text-[40px] lg:text-[48px]"
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      textShadow: '2px 2px 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    Objevte eleganci s Lumera
                  </h2>
                  <p
                    className="mt-[15px] mb-0 text-[14px] font-normal text-white md:mt-[20px] md:text-[16px] lg:text-[18px]"
                    style={{ fontFamily: '"Work Sans", sans-serif', textShadow: '2px 2px 8px rgba(0,0,0,0.4)' }}
                  >
                    Najděte svůj dokonalý doplněk ještě dnes.
                  </p>
                </div>

                <div className="mt-[30px] flex-shrink-0 md:mt-0">
                  <Link href="/shop" className="lumera-btn lumera-btn--light inline-flex">
                    Prohlédnout kolekci
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
