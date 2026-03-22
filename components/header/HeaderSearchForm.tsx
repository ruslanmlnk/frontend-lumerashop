'use client';

import { Search } from 'lucide-react';
import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type HeaderSearchFormProps = {
    placeholder: string;
    inputClassName: string;
    wrapperClassName: string;
    iconClassName: string;
    iconSize: number;
    buttonClassName?: string;
    onSubmitComplete?: () => void;
};

type HeaderSearchFormMarkupProps = HeaderSearchFormProps & {
    currentQuery: string;
    pathname?: string;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
};

const HeaderSearchFormMarkup = ({
    placeholder,
    inputClassName,
    wrapperClassName,
    iconClassName,
    iconSize,
    buttonClassName,
    currentQuery,
    pathname,
    onSubmit,
}: HeaderSearchFormMarkupProps) => (
    <form
        className={wrapperClassName}
        onSubmit={onSubmit}
        role="search"
        action="/shop"
        method="get"
        key={pathname ? `${pathname}-${currentQuery}` : undefined}
    >
        <input
            type="search"
            name="q"
            defaultValue={currentQuery}
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

const HeaderSearchFormContent = ({
    onSubmitComplete,
    ...props
}: HeaderSearchFormProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentQuery = searchParams.get('q') || '';

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
        <HeaderSearchFormMarkup
            {...props}
            currentQuery={currentQuery}
            pathname={pathname}
            onSubmit={handleSubmit}
        />
    );
};

const HeaderSearchFormFallback = (props: HeaderSearchFormProps) => (
    <HeaderSearchFormMarkup {...props} currentQuery="" />
);

export default function HeaderSearchForm(props: HeaderSearchFormProps) {
    return (
        <Suspense fallback={<HeaderSearchFormFallback {...props} />}>
            <HeaderSearchFormContent {...props} />
        </Suspense>
    );
}
