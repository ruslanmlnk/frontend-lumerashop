"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return null;
  }

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="w-full">
      <div className="group relative mb-[10px] h-[430px] w-full overflow-hidden bg-transparent lg:h-[654px]">
        <div
          className="flex h-full w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="relative h-full w-full shrink-0">
              <Image
                src={image}
                alt={`${productName} image ${index + 1}`}
                fill
                priority={index === 0}
                className="object-contain"
              />
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
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
