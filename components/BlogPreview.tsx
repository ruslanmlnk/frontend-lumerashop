import Link from 'next/link';
import Image from 'next/image';
import { fetchPayloadArticles } from '@/lib/payload-articles';

const BlogPreview = async () => {
    const blogPosts = await fetchPayloadArticles();
    return (
        <section className="bg-white py-12 md:py-20" id="blog-preview">
            <div className="max-w-[1140px] mx-auto px-4 lg:px-0">
                <div className="flex flex-col mb-12 items-center text-center">
                    <h2
                        className="text-[32px] md:text-[42px] lg:text-[48px] font-serif font-bold mb-6 text-[#111111] leading-[1.1] tracking-tight"
                        style={{ fontFamily: '"Cormorant Garamond", serif' }}
                    >
                        Z blogu Lumera
                    </h2>
                    <p className="text-gray-500 max-w-xl text-[16px] md:text-[18px] leading-relaxed italic font-sans" style={{ fontFamily: '"Work Sans", sans-serif' }}>
                        Styl, inspirace a péče o vaše kožené doplňky.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
                    {blogPosts.slice(0, 3).map((post, idx) => (
                        <div key={idx} className="flex flex-col group h-full">
                            <Link href={`/blog/${post.slug}`} className="block relative w-full aspect-[4/3] mb-8 overflow-hidden rounded-sm shadow-sm ring-1 ring-black/5">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </Link>
                            <h3 className="text-[22px] md:text-[26px] font-serif font-bold mb-6 leading-tight flex-1 text-center md:text-left hover:text-[#c8a16a] transition-colors" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                                <Link href={`/blog/${post.slug}`}>
                                    {post.title}
                                </Link>
                            </h3>
                            <p className="text-gray-600 text-[15px] md:text-[16px] leading-relaxed line-clamp-3 text-center md:text-left mb-8 font-sans">
                                {post.excerpt}
                            </p>
                            <Link href={`/blog/${post.slug}`} className="text-[13px] uppercase tracking-[0.2em] font-bold text-[#111111] border-b-[2px] border-[#c8a16a]/30 hover:border-[#c8a16a] pb-1 w-fit mx-auto md:mx-0 transition-all font-sans">
                                Číst více
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href="/blog"
                        className="inline-block bg-[#111111] text-white px-12 py-4 uppercase tracking-[0.2em] text-[13px] font-bold hover:bg-[#c8a16a] transition-all duration-300 shadow-lg shadow-black/5"
                    >
                        Přejít na náš blog
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default BlogPreview;
