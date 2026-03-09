'use client';
import Link from 'next/link';

const BlogSidebar = () => {
    return (
        <aside className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-24 space-y-12">
                {/* Search */}
                <div>
                    <h3 className="text-[16px] font-bold uppercase tracking-widest text-[#111111] mb-6">Hledat</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Hledat v blogu..."
                            className="w-full px-4 py-3 border border-gray-200 outline-none focus:border-black transition-colors text-[14px]"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <h3 className="text-[16px] font-bold uppercase tracking-widest text-[#111111] mb-6">Kategorie</h3>
                    <ul className="space-y-3">
                        {['Inspirace', 'Péče o kůži', 'Novinky', 'Styl'].map((cat) => (
                            <li key={cat}>
                                <Link href={`/blog?category=${cat.toLowerCase()}`} className="text-[15px] text-gray-500 hover:text-black transition-colors">
                                    {cat}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recent Posts */}
                <div>
                    <h3 className="text-[16px] font-bold uppercase tracking-widest text-[#111111] mb-6">Nedávné příspěvky</h3>
                    <ul className="space-y-6">
                        {[
                            { title: 'Jak vybrat tu pravou kabelku?', slug: 'jak-vybrat-kabelku' },
                            { title: 'Péče o kožené výrobky', slug: 'pece-o-kuzi' },
                            { title: 'Barvy, které ovládnou sezónu', slug: 'trendy-barvy' }
                        ].map((post) => (
                            <li key={post.slug} className="group">
                                <Link href={`/blog/${post.slug}`} className="block">
                                    <h4 className="text-[16px] font-serif font-bold text-[#111111] group-hover:text-amber-800 transition-colors leading-snug">
                                        {post.title}
                                    </h4>
                                    <span className="text-[12px] text-gray-400 uppercase tracking-tighter">15. Únor 2025</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </aside>
    );
};

export default BlogSidebar;
