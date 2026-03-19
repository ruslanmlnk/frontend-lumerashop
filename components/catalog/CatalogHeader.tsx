'use client';

import Link from 'next/link';

interface Breadcrumb {
    label: string;
    href?: string;
}

interface CatalogHeaderProps {
    title: string;
    breadcrumbs: Breadcrumb[];
    variant?: 'page' | 'inline';
}

const CatalogHeader = ({ title, breadcrumbs, variant = 'page' }: CatalogHeaderProps) => {
    const isInline = variant === 'inline';

    return (
        <div className={isInline ? 'mb-8' : 'border-b border-neutral-100 bg-[#f9f9f9] py-8'}>
            <div className={isInline ? '' : 'mx-auto max-w-[1140px] px-4 lg:px-0'}>
                <nav className="mb-4 flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 font-sans text-[13px] text-gray-400">
                        <li>
                            <Link href="/" className="uppercase tracking-wider transition-colors hover:text-black">
                                {'Dom\u016F'}
                            </Link>
                        </li>
                        {breadcrumbs.map((crumb, index) => (
                            <li key={`${crumb.label}-${index}`} className="flex items-center space-x-2">
                                <span className="text-gray-300">/</span>
                                {crumb.href ? (
                                    <Link
                                        href={crumb.href}
                                        className="uppercase tracking-wider transition-colors hover:text-black"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="font-medium uppercase tracking-wider text-black">{crumb.label}</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
                <h1
                    className={`font-serif font-bold leading-tight text-[#111111] ${
                        isInline ? 'text-[38px] xl:text-[42px]' : 'text-[42px]'
                    }`}
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                    {title}
                </h1>
            </div>
        </div>
    );
};

export default CatalogHeader;
