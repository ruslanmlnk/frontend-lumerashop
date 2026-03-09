'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

type CategoryProps = {
    title: string;
    description: string;
    image: string;
    link: string;
    linkText: string;
    reversed?: boolean;
};

const CategorySection = ({ title, description, image, link, linkText, reversed }: CategoryProps) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <section ref={ref} className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16`}>
                    {/* Image Container */}
                    <motion.div
                        initial={{ opacity: 0, x: reversed ? 50 : -50 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2 h-[600px] relative group"
                    >
                        <div className="absolute inset-0 border-2 border-amber-900/10 -m-4 translate-x-2 translate-y-2 z-0 hidden md:block"></div>
                        <div className="relative z-10 w-full h-full overflow-hidden shadow-2xl">
                            <Image
                                src={image}
                                alt={title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
                        </div>
                    </motion.div>

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: reversed ? -50 : 50 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full md:w-1/2 text-center md:text-left px-4 md:px-8"
                    >
                        <h3 className="text-amber-800 text-sm italic font-serif mb-4">Kolekce 2026</h3>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-gray-900 leading-tight">
                            {title}
                        </h2>
                        <div className="w-20 h-0.5 bg-amber-800/20 mb-8 mx-auto md:mx-0"></div>
                        <p className="text-gray-600 mb-10 leading-relaxed text-lg font-light">
                            {description}
                        </p>
                        <Link href={link} className="inline-block">
                            <motion.div
                                whileHover={{ x: 10 }}
                                className="inline-flex items-center space-x-3 text-sm uppercase tracking-[0.2em] font-bold text-gray-900 hover:text-amber-800 transition-colors"
                            >
                                <span>{linkText}</span>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </motion.div>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
