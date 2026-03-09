'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

type HeaderSearchFormProps = {
    placeholder: string;
    inputClassName: string;
    wrapperClassName: string;
    iconClassName: string;
    iconSize: number;
    buttonClassName?: string;
    onSubmitComplete?: () => void;
};

export default function HeaderSearchForm({
    placeholder,
    inputClassName,
    wrapperClassName,
    iconClassName,
    iconSize,
    buttonClassName,
    onSubmitComplete,
}: HeaderSearchFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [currentQuery, setCurrentQuery] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const nextQuery = new URLSearchParams(window.location.search).get('q') || '';
        setCurrentQuery(nextQuery);
    }, [pathname]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const normalizedQuery = String(formData.get('q') || '').trim();
        const nextParams = new URLSearchParams();

        if (normalizedQuery) {
            nextParams.set('q', normalizedQuery);
        }

        const nextUrl = nextParams.toString() ? `/shop?${nextParams.toString()}` : '/shop';
        router.push(nextUrl);
        onSubmitComplete?.();
    };

    return (
        <form className={wrapperClassName} onSubmit={handleSubmit} role="search" key={`${pathname}-${currentQuery}`}>
            <input
                type="search"
                name="q"
                value={currentQuery}
                onChange={(event) => setCurrentQuery(event.target.value)}
                placeholder={placeholder}
                className={inputClassName}
                autoComplete="off"
            />
            <button
                type="submit"
                className={buttonClassName || 'absolute right-0 top-0 h-full px-3'}
                aria-label={placeholder}
            >
                <Search size={iconSize} className={iconClassName} />
            </button>
        </form>
    );
}
