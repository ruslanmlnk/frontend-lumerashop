"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const isPayloadMediaProxyPath = (value: string) => value.startsWith("/api/payload-media/");

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const shouldRenderSlideImage = (index: number) => {
    const distance = Math.abs(index - activeIndex);
    return index === 0 || distance <= 1 || distance === images.length - 1;
  };

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  useEffect(() => {
    if (!isLightboxOpen) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isLightboxOpen]);

  const onLightboxKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      goToPrevious();
      return;
    }

    if (event.key === "ArrowRight") {
      goToNext();
    }
  });

  useEffect(() => {
    if (!isLightboxOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      onLightboxKeyDown(event);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen]);

  if (!images.length) {
    return null;
  }

  const lightbox =
    typeof document !== "undefined" && isLightboxOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[120] bg-black/95 px-4 py-4 sm:px-6 sm:py-6"
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} gallery`}
            onClick={closeLightbox}
          >
            <div
              className="mx-auto flex h-full w-full max-w-[1400px] flex-col gap-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 text-white">
                <div className="min-w-0">
                  <p className="truncate text-[11px] uppercase tracking-[0.28em] text-white/[0.65]">
                    Produktova galerie
                  </p>
                  <p className="truncate font-serif text-[24px] leading-none sm:text-[30px]">
                    {productName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/[0.7]">
                    {activeIndex + 1} / {images.length}
                  </span>
                  <button
                    type="button"
                    onClick={closeLightbox}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.08] text-white transition hover:bg-white/[0.16]"
                    aria-label="Close gallery"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.41L10.59 13.4 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.3z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="relative min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/[0.1] bg-white/[0.04]">
                <div
                  className="flex h-full w-full transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                  {images.map((image, index) => (
                    <div key={`${image}-lightbox-${index}`} className="relative h-full w-full shrink-0">
                      {shouldRenderSlideImage(index) ? (
                        <Image
                          src={image}
                          alt={`${productName} image ${index + 1}`}
                          fill
                          loading={index === activeIndex ? "eager" : "lazy"}
                          decoding="async"
                          sizes="100vw"
                          unoptimized={isPayloadMediaProxyPath(image)}
                          className="object-contain p-4 sm:p-6 lg:p-10"
                        />
                      ) : null}
                    </div>
                  ))}
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goToPrevious}
                      className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.15] bg-black/[0.45] text-white transition hover:bg-black/[0.65] sm:left-5 sm:h-14 sm:w-14"
                      aria-label="Previous image"
                    >
                      <svg
                        className="h-[18px] w-[18px] fill-current"
                        viewBox="0 0 451.847 451.847"
                        aria-hidden="true"
                      >
                        <path d="M97.141,225.92c0-8.095,3.091-16.192,9.259-22.366L300.689,9.27c12.359-12.359,32.397-12.359,44.751,0c12.354,12.354,12.354,32.388,0,44.748L173.525,225.92l171.903,171.909c12.354,12.354,12.354,32.391,0,44.744c-12.354,12.365-32.386,12.365-44.745,0l-194.29-194.281C100.226,242.115,97.141,234.018,97.141,225.92z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={goToNext}
                      className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.15] bg-black/[0.45] text-white transition hover:bg-black/[0.65] sm:right-5 sm:h-14 sm:w-14"
                      aria-label="Next image"
                    >
                      <svg
                        className="h-[18px] w-[18px] fill-current"
                        viewBox="0 0 451.846 451.847"
                        aria-hidden="true"
                      >
                        <path d="M345.441,248.292L151.154,442.573c-12.359,12.365-32.397,12.365-44.75,0c-12.354-12.354-12.354-32.391,0-44.744L278.318,225.92L106.409,54.017c-12.354-12.359-12.354-32.394,0-44.748c12.354-12.359,32.391-12.359,44.75,0l194.287,194.284c6.177,6.18,9.262,14.271,9.262,22.366C354.708,234.018,351.617,242.115,345.441,248.292z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-lightbox-thumb-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[18px] border transition sm:h-[96px] sm:w-[96px] ${
                        activeIndex === index
                          ? "border-white bg-white/[0.12] opacity-100"
                          : "border-white/[0.1] bg-white/[0.04] opacity-[0.65] hover:opacity-100"
                      }`}
                      aria-label={`Open image ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`${productName} thumbnail ${index + 1}`}
                        fill
                        loading="lazy"
                        decoding="async"
                        sizes="96px"
                        unoptimized={isPayloadMediaProxyPath(image)}
                        className="object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="w-full">
        <div className="group relative mb-[10px] h-[430px] w-full overflow-hidden bg-transparent lg:h-[654px]">
          <div
            className="flex h-full w-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="relative h-full w-full shrink-0">
                {shouldRenderSlideImage(index) ? (
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="relative block h-full w-full cursor-zoom-in"
                    aria-label={`Open larger image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${productName} image ${index + 1}`}
                      fill
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "low"}
                      decoding="async"
                      sizes="(min-width: 1024px) 540px, calc(100vw - 110px)"
                      unoptimized={isPayloadMediaProxyPath(image)}
                      className="object-contain"
                    />
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                className="absolute left-[10px] top-1/2 z-10 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full bg-[#c8a16a]/80 text-white transition hover:bg-[#c8a16a]"
                aria-label="Previous image"
              >
                <svg className="h-[16px] w-[16px] fill-current" viewBox="0 0 451.847 451.847">
                  <path d="M97.141,225.92c0-8.095,3.091-16.192,9.259-22.366L300.689,9.27c12.359-12.359,32.397-12.359,44.751,0c12.354,12.354,12.354,32.388,0,44.748L173.525,225.92l171.903,171.909c12.354,12.354,12.354,32.391,0,44.744c-12.354,12.365-32.386,12.365-44.745,0l-194.29-194.281C100.226,242.115,97.141,234.018,97.141,225.92z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={goToNext}
                className="absolute right-[10px] top-1/2 z-10 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full bg-[#c8a16a]/80 text-white transition hover:bg-[#c8a16a]"
                aria-label="Next image"
              >
                <svg className="h-[16px] w-[16px] fill-current" viewBox="0 0 451.846 451.847">
                  <path d="M345.441,248.292L151.154,442.573c-12.359,12.365-32.397,12.365-44.75,0c-12.354-12.354-12.354-32.391,0-44.744L278.318,225.92L106.409,54.017c-12.354-12.359-12.354-32.394,0-44.748c12.354-12.359,32.391-12.359,44.75,0l194.287,194.284c6.177,6.18,9.262,14.271,9.262,22.366C354.708,234.018,351.617,242.115,345.441,248.292z" />
                </svg>
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="no-scrollbar flex gap-[10px] overflow-x-auto pb-[6px]">
            {images.map((image, index) => (
              <button
                key={`${image}-thumb-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-[86px] w-[86px] shrink-0 border transition lg:h-[100px] lg:w-[100px] ${
                  activeIndex === index
                    ? "border-[#111111] opacity-100"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label={`Open image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="100px"
                  unoptimized={isPayloadMediaProxyPath(image)}
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox}
    </>
  );
};

export default ProductGallery;
