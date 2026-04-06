'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import type { Testimonial } from '@/types/site';

type TestimonialsProps = {
  title: string;
  testimonials: Testimonial[];
};

const Testimonials = ({ title, testimonials }: TestimonialsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  if (testimonials.length === 0) {
    return null;
  }

  const activeTestimonial = testimonials[activeIndex] ?? testimonials[0];

  const handlePrev = () => {
    setDirection('prev');
    setActiveIndex((current) => (current === 0 ? testimonials.length - 1 : current - 1));
  };

  const handleNext = () => {
    setDirection('next');
    setActiveIndex((current) => (current === testimonials.length - 1 ? 0 : current + 1));
  };

  const handleSelect = (index: number) => {
    if (index === activeIndex) {
      return;
    }

    setDirection(index > activeIndex ? 'next' : 'prev');
    setActiveIndex(index);
  };

  return (
    <section className="bg-white py-[60px]" id="block-8">
      <div className="lumera-container">
        <div className="mx-auto max-w-[1140px]">
          <h2
            className="mx-auto max-w-[900px] text-center font-serif text-[30px] leading-[34px] font-bold text-[#111111] md:text-[42px] lg:text-[48px]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            {title}
          </h2>

          <div className="relative mt-[22px] md:mt-[26px]">
            {testimonials.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-[6px] items-center justify-center rounded-full border-2 border-[#666666] bg-white text-[#666666] transition-colors hover:border-[#111111] hover:text-[#111111] md:inline-flex"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-[18px] w-[18px] stroke-[1.6]" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-[6px] items-center justify-center rounded-full border-2 border-[#666666] bg-white text-[#666666] transition-colors hover:border-[#111111] hover:text-[#111111] md:inline-flex"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-[18px] w-[18px] stroke-[1.6]" />
                </button>
              </>
            )}

            <div className="relative mx-auto flex min-h-[238px] max-w-[760px] flex-col items-center justify-start px-6 pt-[34px] pb-[28px] text-center md:min-h-[285px] md:max-w-[820px] md:px-[72px] md:pt-[30px] md:pb-[44px]">
              <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[30px] h-[160px] w-[160px] -translate-x-1/2 md:top-[2px] md:h-[160px] md:w-[160px]">
                <Image
                  src="/assets/icons/testimonials-quotes.svg"
                  alt=""
                  fill
                  sizes="(min-width: 768px) 160px, 116px"
                  className="object-contain"
                />
              </div>

              <div
                key={`${activeIndex}-${direction}`}
                className={`testimonial-motion relative flex w-full flex-col items-center ${
                  direction === 'next' ? 'testimonial-motion--next' : 'testimonial-motion--prev'
                }`}
              >
                <p
                  className="relative mt-[54px] max-w-[504px] text-[15px] leading-[1.7] font-normal text-[#111111] md:mt-[66px] md:text-[16px] md:leading-[1.6]"
                  style={{ fontFamily: '"Work Sans", sans-serif' }}
                >
                  {`"${activeTestimonial.text}"`}
                </p>

                <p
                  className="relative mt-[42px] text-[19px] leading-[1.35] font-bold text-[#111111] md:text-[20px] md:leading-[1.6]"
                  style={{ fontFamily: '"Work Sans", sans-serif' }}
                >
                  {activeTestimonial.author}
                  {activeTestimonial.location ? `, ${activeTestimonial.location}` : ''}
                </p>
              </div>
            </div>

            {testimonials.length > 1 && (
              <>
                <div className="mt-1 flex items-center justify-center gap-3 md:hidden">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#666666] bg-white text-[#666666] transition-colors hover:border-[#111111] hover:text-[#111111]"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-[18px] w-[18px] stroke-[1.6]" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#666666] bg-white text-[#666666] transition-colors hover:border-[#111111] hover:text-[#111111]"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-[18px] w-[18px] stroke-[1.6]" />
                  </button>
                </div>

                <div className="mt-[14px] flex items-center justify-center gap-0">
                  {testimonials.map((testimonial, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={`${testimonial.author}-${testimonial.location}-${index}`}
                        type="button"
                        onClick={() => handleSelect(index)}
                        className={`mx-[3px] h-[3px] rounded-none transition-colors ${
                          isActive ? 'w-[30px] bg-[#8f8f8f]' : 'w-[30px] bg-[#b3b3b3]'
                        }`}
                        aria-label={`Show testimonial ${index + 1}`}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .testimonial-motion {
          animation-duration: 360ms;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-fill-mode: both;
        }

        .testimonial-motion--next {
          animation-name: testimonial-slide-next;
        }

        .testimonial-motion--prev {
          animation-name: testimonial-slide-prev;
        }

        @keyframes testimonial-slide-next {
          0% {
            opacity: 0;
            transform: translate3d(28px, 0, 0);
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes testimonial-slide-prev {
          0% {
            opacity: 0;
            transform: translate3d(-28px, 0, 0);
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
