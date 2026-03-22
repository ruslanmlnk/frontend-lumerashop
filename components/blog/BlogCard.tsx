'use client';
import Image from 'next/image';
import Link from 'next/link';
import { isPayloadMediaProxyPath } from '@/lib/local-assets';
import { BlogPost } from '@/types/site';

const BlogCard = ({ post }: { post: BlogPost }) => {
    return (
        <article className="group flex flex-col bg-white overflow-hidden transition-all duration-300 h-full">
            <div className="flex flex-col h-full">
                {/* Title ABOVE Image - per subagent's analysis of lumerashop.cz blog */}
                <h4
                    className="text-[24px] font-serif font-bold text-[#111111] mb-5 min-h-[64px] group-hover:text-[#c8a16a] transition-colors leading-[1.2] tracking-tight"
                    style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700 }}
                >
                    <Link href={`/blog/${post.slug}`}>
                        {post.title}
                    </Link>
                </h4>

                <Link href={`/blog/${post.slug}`} className="block relative aspect-[14/9] overflow-hidden mb-6 bg-[#f9f9f9]">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        decoding="async"
                        unoptimized={isPayloadMediaProxyPath(post.image)}
                        className="object-cover group-hover:scale-102 transition-transform duration-[1000ms]"
                    />
                </Link>

                <div className="flex flex-col flex-1">
                    <p className="text-[15px] text-gray-400 leading-relaxed line-clamp-3 mb-6 font-sans">
                        {post.excerpt}
                    </p>

                    <div className="mt-auto">
                        <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center text-[13px] font-bold uppercase tracking-[0.2em] text-[#111111] group-hover:text-[#c8a16a] transition-colors border-b border-black/10 pb-1"
                        >
                            Číst více
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default BlogCard;
