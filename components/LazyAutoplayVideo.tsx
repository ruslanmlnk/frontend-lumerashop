'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type LazyAutoplayVideoProps = {
    className?: string;
    posterClassName?: string;
    posterSizes?: string;
    posterSrc?: string;
    placeholderClassName?: string;
    preload?: 'auto' | 'metadata' | 'none';
    rootMargin?: string;
    src: string;
};

const LazyAutoplayVideo = ({
    className,
    posterClassName = 'object-cover',
    posterSizes = '100vw',
    posterSrc,
    placeholderClassName = 'h-full w-full bg-[#f5f5f5]',
    preload = 'metadata',
    rootMargin = '240px',
    src,
}: LazyAutoplayVideoProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [shouldLoad, setShouldLoad] = useState(
        () => typeof window !== 'undefined' && typeof IntersectionObserver === 'undefined'
    );

    useEffect(() => {
        const node = containerRef.current;

        if (!node || shouldLoad) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [rootMargin, shouldLoad]);

    return (
        <div ref={containerRef} className="h-full w-full">
            {shouldLoad ? (
                <video
                    className={className}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload={preload}
                    src={src}
                />
            ) : posterSrc ? (
                <div aria-hidden="true" className={`relative h-full w-full overflow-hidden ${placeholderClassName}`}>
                    <Image
                        src={posterSrc}
                        alt=""
                        fill
                        sizes={posterSizes}
                        className={posterClassName}
                    />
                </div>
            ) : (
                <div aria-hidden="true" className={placeholderClassName} />
            )}
        </div>
    );
};

export default LazyAutoplayVideo;
