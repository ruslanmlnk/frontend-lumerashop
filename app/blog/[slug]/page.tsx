import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchPayloadArticles } from '@/lib/payload-articles';
import { isPayloadMediaProxyPath } from '@/lib/local-assets';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Calendar, Tag, User } from 'lucide-react';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [post] = await fetchPayloadArticles({ includeContent: true, slug, limit: 1 });

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center p-20">
                    <h1 className="text-[32px] font-serif mb-6">Příspěvek nebyl nalezen</h1>
                    <Link href="/blog" className="px-8 py-3 bg-[#c8a16a] text-white uppercase tracking-wider text-[14px]">
                        Zpět na blog
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans text-[#111111] bg-white">
            <Header />

            <main className="pb-32">
                <div className="max-w-[1140px] mx-auto px-4 lg:px-6">
                    {/* Breadcrumbs */}
                    <nav className="mb-12 text-[11px] text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                        <Link href="/" className="hover:text-[#c8a16a] transition-colors">Domů</Link>
                        <ChevronRight size={10} />
                        <Link href="/blog" className="hover:text-[#c8a16a] transition-colors">Blog</Link>
                        <ChevronRight size={10} />
                        <span className="text-black font-bold truncate max-w-[200px] md:max-w-none">{post.title}</span>
                    </nav>

                    {/* Post Content Area */}
                    <article className="max-w-[1140px] mx-auto">
                        {/* Featured Image - Top (as in original theme) */}
                        <div className="relative aspect-[16/9] mb-10 overflow-hidden bg-gray-50 shadow-sm">
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                sizes="(min-width: 1024px) 1140px, 100vw"
                                className="object-cover"
                                priority
                                unoptimized={isPayloadMediaProxyPath(post.image)}
                            />
                        </div>

                        {/* Title */}
                        <h1
                            className="text-[32px] md:text-[48px] font-serif font-bold text-[#111111] mb-6 leading-[1.1] tracking-tight text-center md:text-left"
                            style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                            {post.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[13px] text-gray-400 uppercase tracking-widest mb-10 border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-[#c8a16a]" />
                                <span>{post.date || 'Nedatováno'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag size={14} className="text-[#c8a16a]" />
                                <span>Inspirace</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={14} className="text-[#c8a16a]" />
                                <span>Admin</span>
                            </div>
                        </div>

                        {/* Main Body */}
                        <div
                            className="lumera-info-content lumera-article-content"
                            dangerouslySetInnerHTML={{ __html: post.content || '' }}
                        />
                    </article>

                    {/* Section 2: CTA (Objevte naši kolekci) */}
                    <section className="mt-32 py-20 bg-gray-50/50 border-t border-b border-gray-100 text-center rounded-sm">
                        <div className="max-w-[1140px] mx-auto px-6">
                            <h2
                                className="text-[28px] md:text-[36px] font-serif font-bold text-[#111111] mb-6 tracking-tight"
                                style={{ fontFamily: '"Cormorant Garamond", serif' }}
                            >
                                Objevte naši kolekci kožených kabelek z Itálie
                            </h2>
                            <p className="text-gray-500 text-[16px] md:text-[18px] mb-8 leading-relaxed italic">
                                Hledáte kvalitní kabelku, peněženku nebo stylový doplněk? V našem obchodě najdete pečlivě vybrané modely z pravé kůže – nadčasové, elegantní a ručně vyráběné v Itálii.
                            </p>
                            <Link
                                href="/shop"
                                className="inline-block bg-[#111111] text-white px-10 py-4 uppercase tracking-[0.2em] text-[13px] font-bold hover:bg-[#c8a16a] transition-all duration-300"
                            >
                                Navštívit e-shop Lumera
                            </Link>
                        </div>
                    </section>

                    {/* Simple Bottom Navigation - "Předchozí / Následující" placeholder */}
                    <div className="mt-20 mx-auto max-w-[1140px] border-t border-gray-100 pt-10 flex justify-between items-center text-[12px] uppercase tracking-widest font-bold">
                        <Link href="/blog" className="text-gray-400 hover:text-[#c8a16a] transition-colors">
                            ← Předchozi
                        </Link>
                        <Link href="/blog" className="text-gray-400 hover:text-[#c8a16a] transition-colors">
                            Všechny příspěvky
                        </Link>
                        <Link href="/blog" className="text-gray-400 hover:text-[#c8a16a] transition-colors">
                            Následující →
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
