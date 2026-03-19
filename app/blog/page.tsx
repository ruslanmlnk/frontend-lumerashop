import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogHero from '@/components/blog/BlogHero';
import BlogCard from '@/components/blog/BlogCard';
import { fetchPayloadArticles } from '@/lib/payload-articles';

export default async function BlogPage() {
    const posts = await fetchPayloadArticles();
    return (
        <div className="min-h-screen font-sans text-[#111111] bg-white">
            <Header />

            <main>
                <BlogHero />

                <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-20 md:py-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {posts.map((post, idx) => (
                            <BlogCard key={idx} post={post} />
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
